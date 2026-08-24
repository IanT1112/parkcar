import { Camera, Car, LogOut, History } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";

function UsuarioDashboard() {
  const navigate = useNavigate();

  const cerrarSesion = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <div className="user-dashboard-page">
      <div className="user-dashboard-container">
        <header className="user-dashboard-header">
          <div>
            <p className="page-label">Demo ParkCar</p>
            <h1>Bienvenido a ParkCar</h1>
            <p>
              Prueba el reconocimiento de vehículos, placas y colores.
            </p>
          </div>

          <button
            className="secondary-button"
            onClick={cerrarSesion}
          >
            <LogOut size={18} />
            Cerrar sesión
          </button>
        </header>

        <section className="user-action-grid">
          <article className="user-action-card">
            <div className="user-action-icon">
              <Camera size={30} />
            </div>

            <h2>Probar la IA</h2>

            <p>
              Usa la cámara de tu dispositivo o una imagen para
              detectar un vehículo, su placa y color.
            </p>

            <button
              className="primary-button"
              onClick={() => navigate("/usuario/ia")}
            >
              <Camera size={18} />
              Probar reconocimiento
            </button>
          </article>

          <article className="user-action-card">
            <div className="user-action-icon">
              <History size={30} />
            </div>

            <h2>Mis pruebas</h2>

            <p>
              Consulta los vehículos que hayas analizado durante
              tus pruebas de ParkCar.
            </p>

            <button
              className="secondary-button"
              onClick={() => navigate("/usuario/pruebas")}
            >
              Ver mis pruebas
            </button>
          </article>

          <article className="user-action-card">
            <div className="user-action-icon">
              <Car size={30} />
            </div>

            <h2>¿Cómo funciona?</h2>

            <p>
              ParkCar identifica vehículos, registra su entrada,
              calcula el tiempo y prepara el cobro al salir.
            </p>
          </article>
        </section>
      </div>
    </div>
  );
}

export default UsuarioDashboard;