import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [modoRegistro, setModoRegistro] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [mostrarPassword, setMostrarPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMensaje("");

    try {
      if (modoRegistro) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) throw error;

        setMensaje(
          "Cuenta creada. Revisa tu correo para confirmar tu registro."
        );
      } else {
        const { data, error } =
          await supabase.auth.signInWithPassword({
            email,
            password,
          });

        if (error) throw error;

        if (data.user) {
          navigate("/usuario");
        }
      }
    } catch (error) {
      setMensaje(error.message);
    } finally {
      setLoading(false);
    }
  };

  const entrarVisitante = () => {
    navigate("/usuario");
  };

  return (
    <main className="login-page">
      <section className="login-image" aria-hidden="true">
        <div className="login-image-fade" />
      </section>

      <section className="login-content">
        <div className="login-box">
          <div className="login-brand">
            <div className="login-logo">E</div>
            <div className="login-brand-name">ESTACIONAMIENTO</div>
          </div>

          <div className="login-heading">
            <h1>
              {modoRegistro
                ? "Crea tu cuenta"
                : "Bienvenido de nuevo"}
            </h1>

            <p>
              {modoRegistro
                ? "Regístrate para comenzar"
                : "Inicia sesión para continuar"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="login-input">
              <span className="login-input-icon">✉</span>

              <input
                type="email"
                placeholder="Correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="login-input">
              <span className="login-input-icon">⌑</span>

              <input
                type={mostrarPassword ? "text" : "password"}
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() =>
                  setMostrarPassword((actual) => !actual)
                }
                aria-label={
                  mostrarPassword
                    ? "Ocultar contraseña"
                    : "Mostrar contraseña"
                }
              >
                {mostrarPassword ? "◉" : "○"}
              </button>
            </div>

            {mensaje && (
              <div className="login-message">{mensaje}</div>
            )}

            <button
              type="submit"
              className="login-primary"
              disabled={loading}
            >
              {loading
                ? "Procesando..."
                : modoRegistro
                  ? "Crear cuenta"
                  : "Iniciar sesión"}
            </button>
          </form>

          <button
            type="button"
            className="change-mode"
            onClick={() => {
              setModoRegistro((actual) => !actual);
              setMensaje("");
            }}
          >
            {modoRegistro
              ? "¿Ya tienes una cuenta? Inicia sesión"
              : "¿No tienes una cuenta? Regístrate"}
          </button>

          <div className="login-divider">
            <span />
            <p>o continúa como</p>
            <span />
          </div>

          <button
            type="button"
            className="login-guest"
            onClick={entrarVisitante}
          >
            Ingresar como visitante
          </button>

          <footer className="login-footer">
            <div>
              <strong>Tu información está protegida</strong>
              <span>ParkCar · Acceso seguro</span>
            </div>
          </footer>
        </div>
      </section>
    </main>
  );
}