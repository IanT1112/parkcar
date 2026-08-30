import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeftRight,
  Car,
  Clock3,
  LogOut,
  Search,
} from "lucide-react";

import { supabase } from "../../lib/supabase";

function Movimientos() {
  const [vehiculosDentro, setVehiculosDentro] = useState([]);
  const [historial, setHistorial] = useState([]);
  const [tarifa, setTarifa] = useState(null);

  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);
  const [procesandoSalida, setProcesandoSalida] = useState(null);
  const [error, setError] = useState("");

  async function cargarDatos() {
    try {
      setCargando(true);
      setError("");

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error("No hay usuario autenticado.");
      }

      const [
        { data: dentroData, error: dentroError },
        { data: historialData, error: historialError },
        { data: tarifaData, error: tarifaError },
      ] = await Promise.all([
        supabase
          .from("estancias")
          .select("*")
          .eq("user_id", user.id)
          .eq("estado", "dentro")
          .order("hora_entrada", {
            ascending: false,
          }),

        supabase
          .from("estancias")
          .select("*")
          .eq("user_id", user.id)
          .eq("estado", "finalizado")
          .order("hora_salida", {
            ascending: false,
          }),

        supabase
          .from("tarifas")
          .select(
            "tipo_cobro, precio, tolerancia, tarifa_minima"
          )
          .eq("user_id", user.id)
          .maybeSingle(),
      ]);

      if (dentroError) {
        throw dentroError;
      }

      if (historialError) {
        throw historialError;
      }

      if (tarifaError) {
        throw tarifaError;
      }

      setVehiculosDentro(dentroData || []);
      setHistorial(historialData || []);
      setTarifa(tarifaData || null);
    } catch (err) {
      console.error("Error cargando movimientos:", err);

      setError(
        "No se pudieron cargar los movimientos."
      );
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    const inicioCarga = setTimeout(cargarDatos, 0);
    return () => clearTimeout(inicioCarga);
  }, []);

  const vehiculosFiltrados = useMemo(() => {
    return vehiculosDentro.filter((vehiculo) =>
      vehiculo.placa
        ?.toLowerCase()
        .includes(busqueda.toLowerCase())
    );
  }, [vehiculosDentro, busqueda]);

  const calcularPrecio = (minutos) => {
    if (!tarifa) {
      return 0;
    }

    const tipoTarifa = tarifa.tipo_cobro;
    const precioTarifa = Number(tarifa.precio) || 0;
    const tolerancia =
      Number(tarifa.tolerancia) || 0;
    const tarifaMinima =
      Number(tarifa.tarifa_minima) || 0;

    let precioTotal = 0;

    if (minutos > tolerancia) {
      const minutosCobrables =
        minutos - tolerancia;

      if (tipoTarifa === "minuto") {
        precioTotal =
          minutosCobrables * precioTarifa;
      }

      if (tipoTarifa === "hora") {
        precioTotal =
          (minutosCobrables / 60) *
          precioTarifa;
      }

      if (tipoTarifa === "hora_iniciada") {
        const horasCobrables = Math.ceil(
          minutosCobrables / 60
        );

        precioTotal =
          horasCobrables * precioTarifa;
      }

      if (
        precioTotal < tarifaMinima
      ) {
        precioTotal = tarifaMinima;
      }
    }

    return Number(precioTotal.toFixed(2));
  };

  const registrarSalida = async (vehiculo) => {
    try {
      setProcesandoSalida(vehiculo.id);
      setError("");

      if (!tarifa) {
        setError(
          "Primero debes configurar una tarifa."
        );
        return;
      }

      const ahora = new Date();
      const entrada = new Date(
        vehiculo.hora_entrada
      );

      const diferenciaMs =
        ahora.getTime() - entrada.getTime();

      const minutos = Math.max(
        1,
        Math.floor(
          diferenciaMs / 60000
        )
      );

      const precioTotal =
        calcularPrecio(minutos);

      const confirmar = window.confirm(
        `Registrar salida de ${vehiculo.placa}?\n\n` +
          `Tiempo: ${formatearDuracion(minutos)}\n` +
          `Total: S/ ${precioTotal.toFixed(2)}`
      );

      if (!confirmar) {
        return;
      }

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error(
          "No hay usuario autenticado."
        );
      }

      const {
        data: estanciaActualizada,
        error: salidaError,
      } = await supabase
        .from("estancias")
        .update({
          hora_salida:
            ahora.toISOString(),
          duracion_minutos: minutos,
          precio_total: precioTotal,
          estado_pago: "pendiente",
          estado: "finalizado",
        })
        .eq("id", vehiculo.id)
        .eq("user_id", user.id)
        .select()
        .single();

      if (salidaError) {
        throw salidaError;
      }

      setVehiculosDentro((prev) =>
        prev.filter(
          (item) =>
            item.id !== vehiculo.id
        )
      );

      setHistorial((prev) => [
        estanciaActualizada,
        ...prev,
      ]);
    } catch (err) {
      console.error(
        "Error registrando salida:",
        err
      );

      setError(
        "No se pudo registrar la salida."
      );
    } finally {
      setProcesandoSalida(null);
    }
  };

  const formatearFechaHora = (fecha) => {
    if (!fecha) {
      return "-";
    }

    return new Date(fecha).toLocaleString(
      "es-PE",
      {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  const formatearDuracion = (minutos) => {
    const totalMinutos =
      Number(minutos) || 0;

    const horas = Math.floor(
      totalMinutos / 60
    );

    const minutosRestantes =
      totalMinutos % 60;

    if (horas === 0) {
      return `${minutosRestantes} min`;
    }

    return `${horas} h ${minutosRestantes} min`;
  };

  const textoTarifa = () => {
    if (!tarifa) {
      return "Sin tarifa configurada";
    }

    const precio = Number(
      tarifa.precio || 0
    ).toFixed(2);

    if (
      tarifa.tipo_cobro === "minuto"
    ) {
      return `S/ ${precio} por minuto`;
    }

    if (
      tarifa.tipo_cobro === "hora"
    ) {
      return `S/ ${precio} por hora proporcional`;
    }

    if (
      tarifa.tipo_cobro ===
      "hora_iniciada"
    ) {
      return `S/ ${precio} por hora iniciada`;
    }

    return "-";
  };

  if (cargando) {
    return (
      <div className="dashboard-page">
        <section className="dashboard-panel">
          <p>
            Cargando entradas y salidas...
          </p>
        </section>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <p className="page-label">
            Control
          </p>

          <h1>
            Entradas y salidas
          </h1>

          <p className="page-description">
            Gestiona los vehículos actualmente
            dentro y revisa el historial.
          </p>

          <p className="page-description">
            Tarifa actual:{" "}
            <strong>
              {textoTarifa()}
            </strong>
          </p>
        </div>
      </header>

      {error && (
        <div className="ai-error-message">
          {error}
        </div>
      )}

      <section className="movement-summary-grid">
        <article className="movement-summary-card">
          <div className="movement-summary-icon">
            <Car size={22} />
          </div>

          <div>
            <span>
              Vehículos dentro
            </span>

            <strong>
              {vehiculosDentro.length}
            </strong>
          </div>
        </article>

        <article className="movement-summary-card">
          <div className="movement-summary-icon">
            <ArrowLeftRight size={22} />
          </div>

          <div>
            <span>
              Salidas registradas
            </span>

            <strong>
              {historial.length}
            </strong>
          </div>
        </article>
      </section>

      <section className="dashboard-panel movement-panel">
        <div className="vehicles-toolbar">
          <div>
            <h3>
              Vehículos dentro
            </h3>

            <p>
              Selecciona un vehículo para
              registrar su salida.
            </p>
          </div>

          <div className="search-box">
            <Search size={18} />

            <input
              type="text"
              placeholder="Buscar por placa..."
              value={busqueda}
              onChange={(e) =>
                setBusqueda(
                  e.target.value
                )
              }
            />
          </div>
        </div>

        {vehiculosFiltrados.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <Car size={28} />
            </div>

            <h3>
              No hay vehículos dentro
            </h3>

            <p>
              Los vehículos registrados
              mediante IA aparecerán aquí.
            </p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Placa</th>
                  <th>Color</th>
                  <th>Tipo</th>
                  <th>Entrada</th>
                  <th>Estado</th>
                  <th>Acción</th>
                </tr>
              </thead>

              <tbody>
                {vehiculosFiltrados.map(
                  (vehiculo) => (
                    <tr key={vehiculo.id}>
                      <td>
                        <div className="vehicle-plate">
                          {
                            vehiculo.placa
                          }
                        </div>
                      </td>

                      <td>
                        {vehiculo.color ||
                          "-"}
                      </td>

                      <td>
                        {vehiculo.tipo_vehiculo ||
                          "-"}
                      </td>

                      <td>
                        <div className="time-cell">
                          <Clock3
                            size={15}
                          />

                          {formatearFechaHora(
                            vehiculo.hora_entrada
                          )}
                        </div>
                      </td>

                      <td>
                        <span className="status-badge">
                          Dentro
                        </span>
                      </td>

                      <td>
                        <button
                          className="exit-button"
                          disabled={
                            procesandoSalida ===
                            vehiculo.id
                          }
                          onClick={() =>
                            registrarSalida(
                              vehiculo
                            )
                          }
                        >
                          <LogOut
                            size={17}
                          />

                          {procesandoSalida ===
                          vehiculo.id
                            ? "Procesando..."
                            : "Registrar salida"}
                        </button>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="dashboard-panel movement-history">
        <div className="panel-header">
          <div>
            <h3>
              Historial de salidas
            </h3>

            <p>
              Vehículos que ya finalizaron
              su estancia.
            </p>
          </div>
        </div>

        {historial.length === 0 ? (
          <div className="empty-state compact-empty">
            <p>
              Todavía no hay salidas
              registradas.
            </p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Placa</th>
                  <th>Color</th>
                  <th>Entrada</th>
                  <th>Salida</th>
                  <th>Tiempo</th>
                  <th>Total</th>
                  <th>Pago</th>
                </tr>
              </thead>

              <tbody>
                {historial.map(
                  (movimiento) => (
                    <tr
                      key={
                        movimiento.id
                      }
                    >
                      <td>
                        <div className="vehicle-plate">
                          {
                            movimiento.placa
                          }
                        </div>
                      </td>

                      <td>
                        {movimiento.color ||
                          "-"}
                      </td>

                      <td>
                        {formatearFechaHora(
                          movimiento.hora_entrada
                        )}
                      </td>

                      <td>
                        {formatearFechaHora(
                          movimiento.hora_salida
                        )}
                      </td>

                      <td>
                        <strong>
                          {formatearDuracion(
                            movimiento.duracion_minutos
                          )}
                        </strong>
                      </td>

                      <td>
                        <strong>
                          S/{" "}
                          {Number(
                            movimiento.precio_total ||
                              0
                          ).toFixed(2)}
                        </strong>
                      </td>

                      <td>
                        <span className="payment-pending-badge">
                          {movimiento.estado_pago ===
                          "pagado"
                            ? "Pagado"
                            : "Pendiente"}
                        </span>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default Movimientos;
