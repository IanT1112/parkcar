import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeftRight,
  Car,
  Clock3,
  LogOut,
  Search,
} from "lucide-react";

function Movimientos() {
  const [vehiculos, setVehiculos] = useState(() => {
    try {
      const guardados = localStorage.getItem("parkcar_vehiculos");
      return guardados ? JSON.parse(guardados) : [];
    } catch {
      return [];
    }
  });

  const [historial, setHistorial] = useState(() => {
    try {
      const guardados = localStorage.getItem("parkcar_historial");
      return guardados ? JSON.parse(guardados) : [];
    } catch {
      return [];
    }
  });

  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    localStorage.setItem(
      "parkcar_vehiculos",
      JSON.stringify(vehiculos)
    );
  }, [vehiculos]);

  useEffect(() => {
    localStorage.setItem(
      "parkcar_historial",
      JSON.stringify(historial)
    );
  }, [historial]);

  const vehiculosDentro = useMemo(() => {
    return vehiculos.filter(
      (vehiculo) =>
        vehiculo.estado === "Dentro" &&
        vehiculo.placa
          .toLowerCase()
          .includes(busqueda.toLowerCase())
    );
  }, [vehiculos, busqueda]);

  const registrarSalida = (vehiculo) => {
    const ahora = new Date();
    const entrada = new Date(vehiculo.entrada);

    const diferenciaMs = ahora - entrada;
    const minutos = Math.max(
      1,
      Math.floor(diferenciaMs / 60000)
    );

    const tipoTarifa =
    localStorage.getItem("parkcar_tipo_tarifa") || "minuto";

    const precioTarifa =
    Number(localStorage.getItem("parkcar_precio_tarifa")) || 0;

    const tolerancia =
    Number(localStorage.getItem("parkcar_tolerancia")) || 0;

    const tarifaMinima =
    Number(localStorage.getItem("parkcar_tarifa_minima")) || 0;

    let precioTotal = 0;

    if (minutos > tolerancia) {
    const minutosCobrables = minutos - tolerancia;

    if (tipoTarifa === "minuto") {
        precioTotal = minutosCobrables * precioTarifa;
    }

    if (tipoTarifa === "hora") {
        precioTotal = (minutosCobrables / 60) * precioTarifa;
    }

    if (tipoTarifa === "hora_iniciada") {
        const horasCobrables = Math.ceil(minutosCobrables / 60);
        precioTotal = horasCobrables * precioTarifa;
    }

    if (precioTotal < tarifaMinima) {
        precioTotal = tarifaMinima;
    }
    }

    precioTotal = Number(precioTotal.toFixed(2));

    const registroSalida = {
    id: crypto.randomUUID(),
    vehiculoId: vehiculo.id,
    placa: vehiculo.placa,
    color: vehiculo.color,
    entrada: vehiculo.entrada,
    salida: ahora.toISOString(),
    duracionMinutos: minutos,
    precioTotal,
    estadoPago: "Pendiente",
    estado: "Finalizado",
    };

    setHistorial((prev) => [
      registroSalida,
      ...prev,
    ]);

    setVehiculos((prev) =>
      prev.map((item) =>
        item.id === vehiculo.id
          ? {
              ...item,
              estado: "Fuera",
              salida: ahora.toISOString(),
            }
          : item
      )
    );
  };

  const formatearFechaHora = (fecha) => {
    return new Date(fecha).toLocaleString("es-PE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatearDuracion = (minutos) => {
    const horas = Math.floor(minutos / 60);
    const minutosRestantes = minutos % 60;

    if (horas === 0) {
      return `${minutosRestantes} min`;
    }

    return `${horas} h ${minutosRestantes} min`;
  };

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <p className="page-label">Control</p>
          <h1>Entradas y salidas</h1>
          <p className="page-description">
            Gestiona los vehículos actualmente dentro y revisa el historial.
          </p>
        </div>
      </header>

      <section className="movement-summary-grid">
        <article className="movement-summary-card">
          <div className="movement-summary-icon">
            <Car size={22} />
          </div>

          <div>
            <span>Vehículos dentro</span>
            <strong>{vehiculosDentro.length}</strong>
          </div>
        </article>

        <article className="movement-summary-card">
          <div className="movement-summary-icon">
            <ArrowLeftRight size={22} />
          </div>

          <div>
            <span>Salidas registradas</span>
            <strong>{historial.length}</strong>
          </div>
        </article>
      </section>

      <section className="dashboard-panel movement-panel">
        <div className="vehicles-toolbar">
          <div>
            <h3>Vehículos dentro</h3>
            <p>
              Selecciona un vehículo para registrar su salida.
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

        {vehiculosDentro.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <Car size={28} />
            </div>

            <h3>No hay vehículos dentro</h3>
            <p>
              Los vehículos registrados como entrada aparecerán aquí.
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
                  <th>Estado</th>
                  <th>Acción</th>
                </tr>
              </thead>

              <tbody>
                {vehiculosDentro.map(
                  (vehiculo) => (
                    <tr key={vehiculo.id}>
                      <td>
                        <div className="vehicle-plate">
                          {vehiculo.placa}
                        </div>
                      </td>

                      <td>{vehiculo.color}</td>

                      <td>
                        <div className="time-cell">
                          <Clock3 size={15} />
                          {formatearFechaHora(
                            vehiculo.entrada
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
                          onClick={() =>
                            registrarSalida(vehiculo)
                          }
                        >
                          <LogOut size={17} />
                          Registrar salida
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
            <h3>Historial de salidas</h3>
            <p>
              Vehículos que ya finalizaron su estancia.
            </p>
          </div>
        </div>

        {historial.length === 0 ? (
          <div className="empty-state compact-empty">
            <p>
              Todavía no hay salidas registradas.
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
                {historial.map((movimiento) => (
                    <tr key={movimiento.id}>
                    <td>
                        <div className="vehicle-plate">
                        {movimiento.placa}
                        </div>
                    </td>

                    <td>{movimiento.color}</td>

                    <td>
                        {formatearFechaHora(movimiento.entrada)}
                    </td>

                    <td>
                        {formatearFechaHora(movimiento.salida)}
                    </td>

                    <td>
                        <strong>
                        {formatearDuracion(movimiento.duracionMinutos)}
                        </strong>
                    </td>

                    <td>
                        <strong>
                        S/ {Number(movimiento.precioTotal || 0).toFixed(2)}
                        </strong>
                    </td>

                    <td>
                        <span className="payment-pending-badge">
                        {movimiento.estadoPago || "Pendiente"}
                        </span>
                    </td>
                    </tr>
                ))}
                </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default Movimientos;