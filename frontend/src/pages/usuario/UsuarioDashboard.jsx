import {
  Camera,
  Car,
  LogOut,
  History,
  ShieldCheck,
  ArrowRight,
  ScanLine,
  Clock3,
  CreditCard,
  MessageSquare,
} from "lucide-react";

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

        {/* HEADER */}
        <header className="user-main-header">
          <div className="user-brand">
            <div className="user-brand-icon">
              <img src="/favicon-32x32.png" alt="" />
            </div>

            <div>
              <strong>ParkCar</strong>
              <span>Smart Parking</span>
            </div>
          </div>

          <button
            className="user-logout-button"
            onClick={cerrarSesion}
          >
            <LogOut size={17} />
            Cerrar sesión
          </button>
        </header>

        {/* HERO */}
        <section className="user-parking-hero">
          <img
            src="/parking-dashboard.jpg"
            alt="Estacionamiento ParkCar"
          />

          <div className="user-parking-overlay">
            <div className="user-parking-hero-content">
              <span className="user-hero-label">
                PARKCAR
              </span>

              <h1>
                Controla tu estacionamiento
                de forma simple y eficiente.
              </h1>

              <p>
                Registra vehículos, controla entradas y salidas
                y administra todo desde un solo lugar.
              </p>

            </div>
          </div>
        </section>

        {/* ACCIONES */}
        <section className="user-actions-section">
          <div className="user-section-heading">
            <span>ACCESOS</span>
            <h2>¿Qué deseas hacer?</h2>
          </div>

          <div className="user-action-grid">

            {/* REGISTRAR */}
            <button
              type="button"
              className="user-action-card"
              onClick={() =>
                navigate("/usuario/ia")
              }
            >
              <div className="user-action-top">
                <div className="user-action-icon">
                  <Camera size={25} />
                </div>

                <ArrowRight
                  className="user-action-arrow"
                  size={21}
                />
              </div>

              <div>
                <h3>Registrar vehículo</h3>

                <p>
                  Utiliza la cámara o una imagen para
                  detectar automáticamente el vehículo.
                </p>
              </div>
            </button>

            {/* REGISTROS */}
            <button
              type="button"
              className="user-action-card"
              onClick={() =>
                navigate("/usuario/pruebas")
              }
            >
              <div className="user-action-top">
                <div className="user-action-icon">
                  <History size={25} />
                </div>

                <ArrowRight
                  className="user-action-arrow"
                  size={21}
                />
              </div>

              <div>
                <h3>Mis registros</h3>

                <p>
                  Consulta las detecciones realizadas
                  anteriormente con ParkCar.
                </p>
              </div>
            </button>

            {/* ADMIN */}
            <button
              type="button"
              className="user-action-card"
              onClick={() =>
                navigate("/admin")
              }
            >
              <div className="user-action-top">
                <div className="user-action-icon">
                  <ShieldCheck size={25} />
                </div>

                <ArrowRight
                  className="user-action-arrow"
                  size={21}
                />
              </div>

              <div>
                <h3>
                  Administrar estacionamiento
                </h3>

                <p>
                  Gestiona vehículos, tiempos,
                  salidas, tarifas y pagos.
                </p>
              </div>
            </button>
          </div>
        </section>

        {/* CÓMO FUNCIONA */}
        <section className="user-how-section">
          <div className="user-how-intro">
            <span className="user-section-label">
              CÓMO FUNCIONA
            </span>

            <h2>
              De una imagen al control completo
              del estacionamiento.
            </h2>

            <p>
              ParkCar conecta el reconocimiento
              inteligente con la gestión del
              estacionamiento. El proceso comienza
              registrando un vehículo y continúa
              automáticamente en el panel
              administrativo.
            </p>
          </div>

          <div className="user-process">

            <div className="user-process-item">
              <span className="user-process-number">
                01
              </span>

              <ScanLine size={23} />

              <div>
                <h3>Prueba la IA</h3>

                <p>
                  Entra a Registrar vehículo y utiliza
                  una fotografía o la cámara.
                </p>
              </div>
            </div>

            <div className="user-process-item">
              <span className="user-process-number">
                02
              </span>

              <Car size={23} />

              <div>
                <h3>ParkCar lo registra</h3>

                <p>
                  La placa, color y tipo de vehículo
                  se detectan y su entrada queda
                  registrada automáticamente.
                </p>
              </div>
            </div>

            <div className="user-process-item">
              <span className="user-process-number">
                03
              </span>

              <Clock3 size={23} />

              <div>
                <h3>Administra su estancia</h3>

                <p>
                  En el panel administrativo podrás
                  verlo dentro y controlar el tiempo
                  hasta registrar su salida.
                </p>
              </div>
            </div>

            <div className="user-process-item">
              <span className="user-process-number">
                04
              </span>

              <CreditCard size={23} />

              <div>
                <h3>Finaliza y cobra</h3>

                <p>
                  Al registrar la salida, ParkCar
                  calcula el tiempo y el importe según
                  la tarifa configurada.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FEEDBACK */}
        <section className="user-feedback-section">
          <div className="user-feedback-icon">
            <MessageSquare size={24} />
          </div>

          <div className="user-feedback-content">
            <span>AYÚDAME A MEJORAR PARKCAR</span>

            <h2>
              ¿Qué te pareció la experiencia?
            </h2>

            <p>
              Tu opinión es importante para seguir
              mejorando el proyecto. Si algo te gustó,
              no funcionó como esperabas o simplemente
              cambiarías alguna parte, déjame un
              comentario. Toda experiencia, buena o
              mala, ayuda a mejorar ParkCar.
            </p>
          </div>

          <button
            className="primary-button"
            onClick={() =>
              navigate("/usuario/pruebas")
            }
          >
            Dejar comentario
            <ArrowRight size={17} />
          </button>
        </section>

      </div>
    </div>
  );
}

export default UsuarioDashboard;
