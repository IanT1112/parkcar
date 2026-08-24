import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";

function Login() {
  const navigate = useNavigate();

  const [modo, setModo] = useState("login");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);

  const iniciarSesion = async (e) => {
    e.preventDefault();

    setCargando(true);
    setMensaje("");

    const { data, error } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    setCargando(false);

    if (error) {
      setMensaje(error.message);
      return;
    }

    if (data.user) {
      navigate("/usuario");
    }
  };

  const registrarse = async (e) => {
    e.preventDefault();

    setCargando(true);
    setMensaje("");

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    setCargando(false);

    if (error) {
      setMensaje(error.message);
      return;
    }

    setMensaje(
      "Registro realizado. Revisa tu correo para confirmar tu cuenta."
    );
  };

  const handleSubmit = (e) => {
    if (modo === "login") {
      iniciarSesion(e);
    } else {
      registrarse(e);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <h1>ParkCar</h1>

          <p>
            Sistema inteligente de estacionamiento
          </p>
        </div>

        <div className="auth-tabs">
          <button
            type="button"
            className={
              modo === "login"
                ? "auth-tab active"
                : "auth-tab"
            }
            onClick={() => {
              setModo("login");
              setMensaje("");
            }}
          >
            Iniciar sesión
          </button>

          <button
            type="button"
            className={
              modo === "registro"
                ? "auth-tab active"
                : "auth-tab"
            }
            onClick={() => {
              setModo("registro");
              setMensaje("");
            }}
          >
            Crear cuenta
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Correo electrónico</label>

            <input
              type="email"
              placeholder="correo@ejemplo.com"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              required
            />
          </div>

          <div className="form-group">
            <label>Contraseña</label>

            <input
              type="password"
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              minLength={6}
              required
            />
          </div>

          <button
            type="submit"
            className="login-button"
            disabled={cargando}
          >
            {cargando
              ? "Procesando..."
              : modo === "login"
              ? "Iniciar sesión"
              : "Crear cuenta"}
          </button>
        </form>

        {mensaje && (
          <div className="auth-message">
            {mensaje}
          </div>
        )}
      </div>
    </div>
  );
}

export default Login;