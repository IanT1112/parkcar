import {
  Car,
  CircleDollarSign,
  Clock3,
  ParkingCircle,
} from "lucide-react";

function OperadorDashboard() {
  const vehiculos = (() => {
    try {
      const guardados = localStorage.getItem("parkcar_vehiculos");
      return guardados ? JSON.parse(guardados) : [];
    } catch {
      return [];
    }
  })();

  const historial = (() => {
    try {
      const guardados = localStorage.getItem("parkcar_historial");
      return guardados ? JSON.parse(guardados) : [];
    } catch {
      return [];
    }
  })();

  const dentro = vehiculos.filter(
    (vehiculo) => vehiculo.estado === "Dentro"
  );

  const pendientes = historial.filter(
    (item) => item.estadoPago !== "Pagado"
  );

  const pagados = historial.filter(
    (item) => item.estadoPago === "Pagado"
  );

  const totalCobrado = pagados.reduce(
    (total, item) => total + Number(item.precioTotal || 0),
    0
  );

  const stats = [
    {
      title: "Vehículos dentro",
      value: dentro.length,
      icon: ParkingCircle,
    },
    {
      title: "Pagos pendientes",
      value: pendientes.length,
      icon: Clock3,
    },
    {
      title: "Salidas registradas",
      value: historial.length,
      icon: Car,
    },
    {
      title: "Total cobrado",
      value: `S/ ${totalCobrado.toFixed(2)}`,
      icon: CircleDollarSign,
    },
  ];

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <p className="page-label">Operación</p>
          <h1>Panel del operador</h1>
          <p className="page-description">
            Control diario de entradas, salidas y cobros.
          </p>
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
              </div>

              <div className="stat-content">
                <p>{stat.title}</p>
                <h2>{stat.value}</h2>
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
}

export default OperadorDashboard;