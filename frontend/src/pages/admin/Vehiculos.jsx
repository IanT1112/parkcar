import { useEffect, useMemo, useState } from "react";
import {
  Car,
  Search,
  Clock3,
  CircleCheck,
} from "lucide-react";

import { supabase } from "../../lib/supabase";

function Vehiculos() {
  const [vehiculos, setVehiculos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [actualizacionTiempo, setActualizacionTiempo] = useState(
    () => Date.now()
  );

  // Actualiza visualmente los cronómetros cada minuto.
  useEffect(() => {
    const intervalo = setInterval(() => {
      setActualizacionTiempo(Date.now());
    }, 60000);

    return () => clearInterval(intervalo);
  }, []);

  async function cargarVehiculos() {
    try {
      setCargando(true);
      setError("");

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error("No hay una sesión activa.");
      }

      const { data, error: estanciasError } =
        await supabase
          .from("estancias")
          .select(`
            id,
            placa,
            color,
            tipo_vehiculo,
            confianza,
            hora_entrada,
            hora_salida,
            duracion_minutos,
            precio_total,
            estado_pago,
            estado,
            created_at
          `)
          .eq("user_id", user.id)
          .order("hora_entrada", {
            ascending: false,
          });

      if (estanciasError) {
        throw estanciasError;
      }

      setVehiculos(data || []);
    } catch (err) {
      console.error(
        "Error cargando vehículos:",
        err
      );

      setError(
        "No se pudieron cargar los vehículos."
      );
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    const inicioCarga = setTimeout(cargarVehiculos, 0);
    return () => clearTimeout(inicioCarga);
  }, []);

  const vehiculosFiltrados = useMemo(() => {
    return vehiculos.filter((vehiculo) =>
      vehiculo.placa
        ?.toLowerCase()
        .includes(busqueda.toLowerCase())
    );
  }, [vehiculos, busqueda]);

  const vehiculosDentro = useMemo(() => {
    return vehiculos.filter(
      (vehiculo) =>
        vehiculo.estado === "dentro"
    );
  }, [vehiculos]);

  const vehiculosFinalizados = useMemo(() => {
    return vehiculos.filter(
      (vehiculo) =>
        vehiculo.estado === "finalizado"
    );
  }, [vehiculos]);

  const formatearHora = (fecha) => {
    if (!fecha) return "-";

    return new Date(fecha).toLocaleTimeString(
      "es-PE",
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return "-";

    return new Date(fecha).toLocaleDateString(
      "es-PE",
      {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }
    );
  };

  const formatearDuracion = (minutos) => {
    const totalMinutos = Number(minutos) || 0;

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

  const calcularTiempo = (vehiculo) => {
    // Si el vehículo ya salió, usamos la duración
    // guardada al registrar la salida.
    if (vehiculo.estado === "finalizado") {
      return formatearDuracion(
        vehiculo.duracion_minutos
      );
    }

    // Si sigue dentro, calculamos desde hora_entrada
    // hasta el momento actual.
    const inicio = new Date(
      vehiculo.hora_entrada
    ).getTime();

    const ahora = actualizacionTiempo;

    const diferencia = Math.max(
      0,
      ahora - inicio
    );

    const minutosTotales = Math.floor(
      diferencia / 60000
    );

    return formatearDuracion(
      minutosTotales
    );
  };

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <p className="page-label">
            Gestión
          </p>

          <h1>Vehículos</h1>

          <p className="page-description">
            Controla los vehículos registrados
            en tu estacionamiento.
          </p>
        </div>
      </header>

      <section className="vehicle-summary-grid">
        <article className="vehicle-summary-card">
          <div className="vehicle-summary-icon">
            <Car size={22} />
          </div>

          <div>
            <span>Vehículos dentro</span>

            <strong>
              {vehiculosDentro.length}
            </strong>
          </div>
        </article>

        <article className="vehicle-summary-card">
          <div className="vehicle-summary-icon">
            <CircleCheck size={22} />
          </div>

          <div>
            <span>Estancias finalizadas</span>

            <strong>
              {vehiculosFinalizados.length}
            </strong>
          </div>
        </article>
      </section>

      <section className="dashboard-panel">
        <div className="vehicles-toolbar">
          <div>
            <h3>
              Vehículos registrados
            </h3>

            <p>
              Historial de vehículos registrados
              mediante ParkCar.
            </p>
          </div>

          <div className="search-box">
            <Search size={18} />

            <input
              type="text"
              placeholder="Buscar por placa..."
              value={busqueda}
              onChange={(e) =>
                setBusqueda(e.target.value)
              }
            />
          </div>
        </div>

        {cargando ? (
          <div className="empty-state">
            <p>
              Cargando vehículos...
            </p>
          </div>
        ) : error ? (
          <div className="empty-state">
            <p>{error}</p>
          </div>
        ) : vehiculosFiltrados.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <Car size={28} />
            </div>

            <h3>
              No hay vehículos registrados
            </h3>

            <p>
              Registra un vehículo con la IA
              para comenzar.
            </p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Placa</th>
                  <th>Vehículo</th>
                  <th>Color</th>
                  <th>Fecha</th>
                  <th>Hora entrada</th>
                  <th>Hora salida</th>
                  <th>Tiempo</th>
                  <th>Estado</th>
                </tr>
              </thead>

              <tbody>
                {vehiculosFiltrados.map(
                  (vehiculo) => (
                    <tr key={vehiculo.id}>
                      <td>
                        <div className="vehicle-plate">
                          {vehiculo.placa}
                        </div>
                      </td>

                      <td>
                        {vehiculo.tipo_vehiculo ||
                          "-"}
                      </td>

                      <td>
                        {vehiculo.color ||
                          "-"}
                      </td>

                      <td>
                        {formatearFecha(
                          vehiculo.hora_entrada
                        )}
                      </td>

                      <td>
                        <div className="time-cell">
                          <Clock3 size={15} />

                          {formatearHora(
                            vehiculo.hora_entrada
                          )}
                        </div>
                      </td>

                      <td>
                        {vehiculo.hora_salida
                          ? formatearHora(
                              vehiculo.hora_salida
                            )
                          : "-"}
                      </td>

                      <td>
                        {calcularTiempo(
                          vehiculo
                        )}
                      </td>

                      <td>
                        {vehiculo.estado ===
                        "dentro" ? (
                          <span className="status-badge">
                            Dentro
                          </span>
                        ) : (
                          <span className="payment-paid-badge">
                            Finalizado
                          </span>
                        )}
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

export default Vehiculos;
