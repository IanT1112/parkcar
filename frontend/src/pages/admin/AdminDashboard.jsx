import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Car,
  CircleDollarSign,
  Clock3,
  ParkingCircle,
  ArrowUpRight,
} from "lucide-react";

import { supabase } from "../../lib/supabase";

function AdminDashboard() {
  const navigate = useNavigate();

  const [estancias, setEstancias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  async function cargarDashboard() {
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
            hora_entrada,
            hora_salida,
            duracion_minutos,
            precio_total,
            estado_pago,
            fecha_pago,
            estado
          `)
          .eq("user_id", user.id)
          .order("hora_entrada", {
            ascending: false,
          });

      if (estanciasError) {
        throw estanciasError;
      }

      setEstancias(data || []);
    } catch (err) {
      console.error(
        "Error cargando dashboard:",
        err
      );

      setError(
        "No se pudo cargar la información del dashboard."
      );
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    const inicioCarga = setTimeout(cargarDashboard, 0);
    return () => clearTimeout(inicioCarga);
  }, []);

  const esHoy = (fecha) => {
    if (!fecha) return false;

    const fechaRegistro = new Date(fecha);
    const hoy = new Date();

    return (
      fechaRegistro.getFullYear() ===
        hoy.getFullYear() &&
      fechaRegistro.getMonth() ===
        hoy.getMonth() &&
      fechaRegistro.getDate() ===
        hoy.getDate()
    );
  };

  const vehiculosDentro = useMemo(() => {
    return estancias.filter(
      (item) => item.estado === "dentro"
    );
  }, [estancias]);

  const vehiculosAtendidosHoy = useMemo(() => {
    return estancias.filter((item) =>
      esHoy(item.hora_entrada)
    );
  }, [estancias]);

  const ingresosHoy = useMemo(() => {
    return estancias
      .filter(
        (item) =>
          item.estado_pago === "pagado" &&
          esHoy(item.fecha_pago)
      )
      .reduce(
        (total, item) =>
          total +
          Number(item.precio_total || 0),
        0
      );
  }, [estancias]);

  const tiempoPromedio = useMemo(() => {
    const finalizadas = estancias.filter(
      (item) =>
        item.estado === "finalizado" &&
        item.duracion_minutos !== null
    );

    if (finalizadas.length === 0) {
      return 0;
    }

    const totalMinutos =
      finalizadas.reduce(
        (total, item) =>
          total +
          Number(item.duracion_minutos || 0),
        0
      );

    return Math.round(
      totalMinutos / finalizadas.length
    );
  }, [estancias]);

  const vehiculosRecientes = useMemo(() => {
    return estancias.slice(0, 5);
  }, [estancias]);

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

  const formatearTiempo = (minutos) => {
    const totalMinutos = Number(minutos) || 0;

    if (totalMinutos === 0) {
      return "0 min";
    }

    const horas = Math.floor(
      totalMinutos / 60
    );

    const minutosRestantes =
      totalMinutos % 60;

    if (horas === 0) {
      return `${minutosRestantes} min`;
    }

    return `${horas}h ${minutosRestantes}m`;
  };

  const stats = [
    {
      title: "Vehículos dentro",
      value: String(vehiculosDentro.length),
      description: "Actualmente estacionados",
      icon: ParkingCircle,
    },
    {
      title: "Ingresos de hoy",
      value: `S/ ${ingresosHoy.toFixed(2)}`,
      description: "Pagos cobrados hoy",
      icon: CircleDollarSign,
    },
    {
      title: "Vehículos atendidos",
      value: String(vehiculosAtendidosHoy.length),
      description: "Ingresaron durante el día",
      icon: Car,
    },
    {
      title: "Tiempo promedio",
      value: formatearTiempo(tiempoPromedio),
      description: "Permanencia promedio",
      icon: Clock3,
    },
  ];

  if (cargando) {
    return (
      <div className="dashboard-page">
        <section className="dashboard-panel">
          <p>Cargando dashboard...</p>
        </section>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <p className="page-label">
            Resumen
          </p>

          <h1>Dashboard</h1>

          <p className="page-description">
            Control general de tu estacionamiento ParkCar.
          </p>
        </div>

        <div className="parking-status">
          <span className="status-dot"></span>
          Sistema operativo
        </div>
      </header>

      {error && (
        <div className="ai-error-message">
          {error}
        </div>
      )}

      <section className="stats-grid">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <article
              className="stat-card"
              key={stat.title}
            >
              <div className="stat-top">
                <div className="stat-icon">
                  <Icon size={22} />
                </div>

                <ArrowUpRight
                  size={18}
                  className="stat-arrow"
                />
              </div>

              <div className="stat-content">
                <p>{stat.title}</p>

                <h2>{stat.value}</h2>

                <span>
                  {stat.description}
                </span>
              </div>
            </article>
          );
        })}
      </section>

      <section className="dashboard-grid">
        <div className="dashboard-panel">
          <div className="panel-header">
            <div>
              <h3>
                Vehículos recientes
              </h3>

              <p>
                Últimos ingresos registrados
              </p>
            </div>

            <button
              className="secondary-button"
              onClick={() =>
                navigate("/admin/vehiculos")
              }
            >
              Ver todos
            </button>
          </div>

          {vehiculosRecientes.length === 0 ? (
            <div className="empty-state compact-empty">
              <p>
                Todavía no hay vehículos registrados.
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
                  </tr>
                </thead>

                <tbody>
                  {vehiculosRecientes.map(
                    (vehicle) => (
                      <tr key={vehicle.id}>
                        <td className="plate-cell">
                          {vehicle.placa}
                        </td>

                        <td>
                          {vehicle.color || "-"}
                        </td>

                        <td>
                          {formatearHora(
                            vehicle.hora_entrada
                          )}
                        </td>

                        <td>
                          {vehicle.estado ===
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
        </div>

        <div className="dashboard-panel quick-panel">
          <div className="panel-header">
            <div>
              <h3>
                Estado del estacionamiento
              </h3>

              <p>
                Ocupación actual
              </p>
            </div>
          </div>

          <div className="capacity-number">
            <span>
              {vehiculosDentro.length}
            </span>

            <small>
              vehículos actualmente
            </small>
          </div>

          <div className="capacity-details">
            <div>
              <strong>
                {vehiculosDentro.length}
              </strong>

              <span>
                Ocupados
              </span>
            </div>

            <div>
              <strong>
                {vehiculosAtendidosHoy.length}
              </strong>

              <span>
                Atendidos hoy
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default AdminDashboard;
