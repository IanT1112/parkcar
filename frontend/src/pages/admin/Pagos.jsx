import { useEffect, useMemo, useState } from "react";
import {
  CreditCard,
  Banknote,
  Search,
  CheckCircle2,
} from "lucide-react";

function Pagos() {
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
      "parkcar_historial",
      JSON.stringify(historial)
    );
  }, [historial]);

  const pagosFiltrados = useMemo(() => {
    return historial.filter((item) =>
      item.placa
        .toLowerCase()
        .includes(busqueda.toLowerCase())
    );
  }, [historial, busqueda]);

  const pendientes = historial.filter(
    (item) => item.estadoPago !== "Pagado"
  );

  const pagados = historial.filter(
    (item) => item.estadoPago === "Pagado"
  );

  const totalCobrado = pagados.reduce(
    (total, item) =>
      total + Number(item.precioTotal || 0),
    0
  );

  const registrarPagoEfectivo = (id) => {
    const fechaPago = new Date().toISOString();

    setHistorial((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              estadoPago: "Pagado",
              metodoPago: "Efectivo",
              fechaPago,
            }
          : item
      )
    );
  };

  const formatearFechaHora = (fecha) => {
    if (!fecha) return "-";

    return new Date(fecha).toLocaleString("es-PE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <p className="page-label">Finanzas</p>

          <h1>Pagos</h1>

          <p className="page-description">
            Gestiona los pagos pendientes y cobrados.
          </p>
        </div>
      </header>

      <section className="payment-summary-grid">
        <article className="payment-summary-card">
          <div className="payment-summary-icon">
            <CreditCard size={22} />
          </div>

          <div>
            <span>Pagos pendientes</span>
            <strong>{pendientes.length}</strong>
          </div>
        </article>

        <article className="payment-summary-card">
          <div className="payment-summary-icon">
            <CheckCircle2 size={22} />
          </div>

          <div>
            <span>Pagos realizados</span>
            <strong>{pagados.length}</strong>
          </div>
        </article>

        <article className="payment-summary-card">
          <div className="payment-summary-icon">
            <Banknote size={22} />
          </div>

          <div>
            <span>Total cobrado</span>
            <strong>
              S/ {totalCobrado.toFixed(2)}
            </strong>
          </div>
        </article>
      </section>

      <section className="dashboard-panel">
        <div className="vehicles-toolbar">
          <div>
            <h3>Movimientos de pago</h3>

            <p>
              Registros pendientes y pagos realizados.
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

        {pagosFiltrados.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <CreditCard size={28} />
            </div>

            <h3>No hay pagos registrados</h3>

            <p>
              Los vehículos que registren salida aparecerán aquí.
            </p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Placa</th>
                  <th>Salida</th>
                  <th>Total</th>
                  <th>Estado</th>
                  <th>Método</th>
                  <th>Acción</th>
                </tr>
              </thead>

              <tbody>
                {pagosFiltrados.map((pago) => (
                  <tr key={pago.id}>
                    <td>
                      <div className="vehicle-plate">
                        {pago.placa}
                      </div>
                    </td>

                    <td>
                      {formatearFechaHora(pago.salida)}
                    </td>

                    <td>
                      <strong>
                        S/{" "}
                        {Number(
                          pago.precioTotal || 0
                        ).toFixed(2)}
                      </strong>
                    </td>

                    <td>
                      {pago.estadoPago === "Pagado" ? (
                        <span className="payment-paid-badge">
                          Pagado
                        </span>
                      ) : (
                        <span className="payment-pending-badge">
                          Pendiente
                        </span>
                      )}
                    </td>

                    <td>
                      {pago.metodoPago || "-"}
                    </td>

                    <td>
                      {pago.estadoPago === "Pagado" ? (
                        <span className="payment-date">
                          {formatearFechaHora(
                            pago.fechaPago
                          )}
                        </span>
                      ) : (
                        <button
                          className="cash-button"
                          onClick={() =>
                            registrarPagoEfectivo(
                              pago.id
                            )
                          }
                        >
                          <Banknote size={17} />
                          Cobrar efectivo
                        </button>
                      )}
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

export default Pagos;