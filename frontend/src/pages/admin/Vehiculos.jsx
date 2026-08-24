import { useEffect, useMemo, useState } from "react";
import {
  Car,
  Search,
  Plus,
  X,
  Clock3,
  CircleCheck,
} from "lucide-react";

function Vehiculos() {
  const [vehiculos, setVehiculos] = useState(() => {
    const guardados = localStorage.getItem("parkcar_vehiculos");

    return guardados ? JSON.parse(guardados) : [];
  });

  const [busqueda, setBusqueda] = useState("");
  const [mostrarModal, setMostrarModal] = useState(false);

  const [placa, setPlaca] = useState("");
  const [color, setColor] = useState("");

  useEffect(() => {
    localStorage.setItem(
      "parkcar_vehiculos",
      JSON.stringify(vehiculos)
    );
  }, [vehiculos]);

  const registrarVehiculo = (e) => {
    e.preventDefault();

    const placaNormalizada = placa
      .trim()
      .toUpperCase();

    if (!placaNormalizada || !color) {
      return;
    }

    const yaEstaDentro = vehiculos.some(
      (vehiculo) =>
        vehiculo.placa === placaNormalizada &&
        vehiculo.estado === "Dentro"
    );

    if (yaEstaDentro) {
      alert("Este vehículo ya está registrado dentro del estacionamiento.");
      return;
    }

    const ahora = new Date();

    const nuevoVehiculo = {
      id: crypto.randomUUID(),
      placa: placaNormalizada,
      color,
      entrada: ahora.toISOString(),
      estado: "Dentro",
    };

    setVehiculos((prev) => [
      nuevoVehiculo,
      ...prev,
    ]);

    setPlaca("");
    setColor("");
    setMostrarModal(false);
  };

  const vehiculosFiltrados = useMemo(() => {
    return vehiculos.filter((vehiculo) =>
      vehiculo.placa
        .toLowerCase()
        .includes(busqueda.toLowerCase())
    );
  }, [vehiculos, busqueda]);

  const formatearHora = (fecha) => {
    return new Date(fecha).toLocaleTimeString(
      "es-PE",
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString(
      "es-PE",
      {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }
    );
  };

  const totalDentro = vehiculos.filter(
    (vehiculo) => vehiculo.estado === "Dentro"
  ).length;

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
            actualmente en ParkCar.
          </p>
        </div>

        <button
          className="primary-button"
          onClick={() => setMostrarModal(true)}
        >
          <Plus size={18} />
          Registrar entrada
        </button>
      </header>

      <section className="vehicle-summary-grid">
        <article className="vehicle-summary-card">
          <div className="vehicle-summary-icon">
            <Car size={22} />
          </div>

          <div>
            <span>Vehículos dentro</span>
            <strong>{totalDentro}</strong>
          </div>
        </article>

        <article className="vehicle-summary-card">
          <div className="vehicle-summary-icon">
            <CircleCheck size={22} />
          </div>

          <div>
            <span>Registros totales</span>
            <strong>{vehiculos.length}</strong>
          </div>
        </article>
      </section>

      <section className="dashboard-panel">
        <div className="vehicles-toolbar">
          <div>
            <h3>Vehículos registrados</h3>

            <p>
              Vehículos detectados o registrados manualmente.
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

        {vehiculosFiltrados.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <Car size={28} />
            </div>

            <h3>No hay vehículos registrados</h3>

            <p>
              Registra una entrada para comenzar.
            </p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Placa</th>
                  <th>Color</th>
                  <th>Fecha</th>
                  <th>Hora entrada</th>
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
                        {vehiculo.color}
                      </td>

                      <td>
                        {formatearFecha(
                          vehiculo.entrada
                        )}
                      </td>

                      <td>
                        <div className="time-cell">
                          <Clock3 size={15} />

                          {formatearHora(
                            vehiculo.entrada
                          )}
                        </div>
                      </td>

                      <td>
                        <span className="status-badge">
                          {vehiculo.estado}
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

      {mostrarModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <div>
                <p className="page-label">
                  Nueva entrada
                </p>

                <h2>
                  Registrar vehículo
                </h2>
              </div>

              <button
                className="close-button"
                onClick={() =>
                  setMostrarModal(false)
                }
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={registrarVehiculo}
              className="vehicle-form"
            >
              <div className="form-group">
                <label>Placa</label>

                <input
                  type="text"
                  placeholder="Ej. T4P-381"
                  value={placa}
                  onChange={(e) =>
                    setPlaca(e.target.value)
                  }
                  maxLength={10}
                  required
                />
              </div>

              <div className="form-group">
                <label>
                  Color del vehículo
                </label>

                <select
                  value={color}
                  onChange={(e) =>
                    setColor(e.target.value)
                  }
                  required
                >
                  <option value="">
                    Selecciona un color
                  </option>

                  <option value="Negro">
                    Negro
                  </option>

                  <option value="Blanco">
                    Blanco
                  </option>

                  <option value="Gris">
                    Gris
                  </option>

                  <option value="Plata">
                    Plata
                  </option>

                  <option value="Rojo">
                    Rojo
                  </option>

                  <option value="Azul">
                    Azul
                  </option>

                  <option value="Verde">
                    Verde
                  </option>

                  <option value="Amarillo">
                    Amarillo
                  </option>

                  <option value="Otro">
                    Otro
                  </option>
                </select>
              </div>

              <div className="modal-info">
                La fecha y hora de entrada se
                registrarán automáticamente.
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() =>
                    setMostrarModal(false)
                  }
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="primary-button"
                >
                  <Plus size={18} />
                  Registrar entrada
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Vehiculos;