import {
  Car,
  CircleDollarSign,
  Clock3,
  ParkingCircle,
  ArrowUpRight,
} from "lucide-react";

function AdminDashboard() {
  const stats = [
    {
      title: "Vehículos dentro",
      value: "18",
      description: "Actualmente estacionados",
      icon: ParkingCircle,
    },
    {
      title: "Ingresos de hoy",
      value: "S/ 486.50",
      description: "+12% respecto a ayer",
      icon: CircleDollarSign,
    },
    {
      title: "Vehículos atendidos",
      value: "76",
      description: "Durante el día",
      icon: Car,
    },
    {
      title: "Tiempo promedio",
      value: "1h 42m",
      description: "Permanencia promedio",
      icon: Clock3,
    },
  ];

  const recentVehicles = [
    {
      plate: "T4P-381",
      color: "Negro",
      entry: "09:42 p. m.",
      status: "Dentro",
    },
    {
      plate: "BRG-921",
      color: "Blanco",
      entry: "09:31 p. m.",
      status: "Dentro",
    },
    {
      plate: "A8F-172",
      color: "Gris",
      entry: "09:10 p. m.",
      status: "Dentro",
    },
    {
      plate: "T3X-514",
      color: "Rojo",
      entry: "08:54 p. m.",
      status: "Dentro",
    },
  ];

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <p className="page-label">Resumen</p>
          <h1>Dashboard</h1>
          <p className="page-description">
            Control general del estacionamiento ParkCar.
          </p>
        </div>

        <div className="parking-status">
          <span className="status-dot"></span>
          Sistema operativo
        </div>
      </header>

      <section className="stats-grid">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <article className="stat-card" key={stat.title}>
              <div className="stat-top">
                <div className="stat-icon">
                  <Icon size={22} />
                </div>

                <ArrowUpRight size={18} className="stat-arrow" />
              </div>

              <div className="stat-content">
                <p>{stat.title}</p>
                <h2>{stat.value}</h2>
                <span>{stat.description}</span>
              </div>
            </article>
          );
        })}
      </section>

      <section className="dashboard-grid">
        <div className="dashboard-panel">
          <div className="panel-header">
            <div>
              <h3>Vehículos recientes</h3>
              <p>Últimos ingresos registrados</p>
            </div>

            <button className="secondary-button">
              Ver todos
            </button>
          </div>

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
                {recentVehicles.map((vehicle) => (
                  <tr key={vehicle.plate}>
                    <td className="plate-cell">
                      {vehicle.plate}
                    </td>

                    <td>{vehicle.color}</td>

                    <td>{vehicle.entry}</td>

                    <td>
                      <span className="status-badge">
                        {vehicle.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="dashboard-panel quick-panel">
          <div className="panel-header">
            <div>
              <h3>Estado del estacionamiento</h3>
              <p>Capacidad actual</p>
            </div>
          </div>

          <div className="capacity-number">
            <span>18</span>
            <small>/ 30 espacios</small>
          </div>

          <div className="capacity-bar">
            <div className="capacity-progress"></div>
          </div>

          <div className="capacity-details">
            <div>
              <strong>12</strong>
              <span>Disponibles</span>
            </div>

            <div>
              <strong>18</strong>
              <span>Ocupados</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default AdminDashboard;