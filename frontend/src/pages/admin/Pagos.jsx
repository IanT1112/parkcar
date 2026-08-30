import { useEffect, useMemo, useState } from "react";
import {
  CreditCard,
  Banknote,
  Search,
  CheckCircle2,
} from "lucide-react";

import { supabase } from "../../lib/supabase";

function Pagos() {
  const [pagos, setPagos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);
  const [procesandoPago, setProcesandoPago] = useState(null);
  const [error, setError] = useState("");

  async function cargarPagos() {
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

      const { data, error: pagosError } = await supabase
        .from("estancias")
        .select(
          `
            id,
            placa,
            color,
            hora_entrada,
            hora_salida,
            duracion_minutos,
            precio_total,
            estado_pago,
            metodo_pago,
            fecha_pago,
            estado
          `
        )
        .eq("user_id", user.id)
        .eq("estado", "finalizado")
        .order("hora_salida", {
          ascending: false,
        });

      if (pagosError) {
        throw pagosError;
      }

      setPagos(data || []);
    } catch (err) {
      console.error("Error cargando pagos:", err);

      setError(
        "No se pudieron cargar los pagos."
      );
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    const inicioCarga = setTimeout(cargarPagos, 0);
    return () => clearTimeout(inicioCarga);
  }, []);

  const pagosFiltrados = useMemo(() => {
    return pagos.filter((item) =>
      item.placa
        ?.toLowerCase()
        .includes(busqueda.toLowerCase())
    );
  }, [pagos, busqueda]);

  const pendientes = pagos.filter(
    (item) => item.estado_pago !== "pagado"
  );

  const pagados = pagos.filter(
    (item) => item.estado_pago === "pagado"
  );

  const totalCobrado = pagados.reduce(
    (total, item) =>
      total + Number(item.precio_total || 0),
    0
  );

  const registrarPagoEfectivo = async (pago) => {
    try {
      setProcesandoPago(pago.id);
      setError("");

      const confirmar = window.confirm(
        `Registrar pago de ${pago.placa}?\n\n` +
          `Total: S/ ${Number(
            pago.precio_total || 0
          ).toFixed(2)}\n` +
          `Método: Efectivo`
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

      const fechaPago = new Date().toISOString();

      const {
        data: pagoActualizado,
        error: pagoError,
      } = await supabase
        .from("estancias")
        .update({
          estado_pago: "pagado",
          metodo_pago: "Efectivo",
          fecha_pago: fechaPago,
        })
        .eq("id", pago.id)
        .eq("user_id", user.id)
        .select()
        .single();

      if (pagoError) {
        throw pagoError;
      }

      setPagos((prev) =>
        prev.map((item) =>
          item.id === pago.id
            ? pagoActualizado
            : item
        )
      );
    } catch (err) {
      console.error(
        "Error registrando pago:",
        err
      );

      setError(
        "No se pudo registrar el pago."
      );
    } finally {
      setProcesandoPago(null);
    }
  };

  const formatearFechaHora = (fecha) => {
    if (!fecha) return "-";

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

  if (cargando) {
    return (
      <div className="dashboard-page">
        <section className="dashboard-panel">
          <p>Cargando pagos...</p>
        </section>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <p className="page-label">
            Finanzas
          </p>

          <h1>Pagos</h1>

          <p className="page-description">
            Gestiona los pagos pendientes y cobrados.
          </p>
        </div>
      </header>

      {error && (
        <div className="ai-error-message">
          {error}
        </div>
      )}

      <section className="payment-summary-grid">
        <article className="payment-summary-card">
          <div className="payment-summary-icon">
            <CreditCard size={22} />
          </div>

          <div>
            <span>Pagos pendientes</span>
            <strong>
              {pendientes.length}
            </strong>
          </div>
        </article>

        <article className="payment-summary-card">
          <div className="payment-summary-icon">
            <CheckCircle2 size={22} />
          </div>

          <div>
            <span>Pagos realizados</span>
            <strong>
              {pagados.length}
            </strong>
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
            <h3>
              Movimientos de pago
            </h3>

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

            <h3>
              No hay pagos registrados
            </h3>

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
                {pagosFiltrados.map(
                  (pago) => (
                    <tr key={pago.id}>
                      <td>
                        <div className="vehicle-plate">
                          {pago.placa}
                        </div>
                      </td>

                      <td>
                        {formatearFechaHora(
                          pago.hora_salida
                        )}
                      </td>

                      <td>
                        <strong>
                          S/{" "}
                          {Number(
                            pago.precio_total || 0
                          ).toFixed(2)}
                        </strong>
                      </td>

                      <td>
                        {pago.estado_pago ===
                        "pagado" ? (
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
                        {pago.metodo_pago || "-"}
                      </td>

                      <td>
                        {pago.estado_pago ===
                        "pagado" ? (
                          <span className="payment-date">
                            {formatearFechaHora(
                              pago.fecha_pago
                            )}
                          </span>
                        ) : (
                          <button
                            className="cash-button"
                            disabled={
                              procesandoPago === pago.id
                            }
                            onClick={() =>
                              registrarPagoEfectivo(
                                pago
                              )
                            }
                          >
                            <Banknote size={17} />

                            {procesandoPago ===
                            pago.id
                              ? "Procesando..."
                              : "Cobrar efectivo"}
                          </button>
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

export default Pagos;
