import { useEffect, useState } from "react";
import {
  History,
  ScanLine,
  MessageSquare,
  Star,
  Send,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";

function MisPruebas() {
  const navigate = useNavigate();

  const [pruebas, setPruebas] = useState([]);
  const [cargandoPruebas, setCargandoPruebas] = useState(true);
  const [errorPruebas, setErrorPruebas] = useState("");

  const [comentario, setComentario] = useState("");
  const [valoracion, setValoracion] = useState("5");
  const [mensaje, setMensaje] = useState("");
  const [enviandoComentario, setEnviandoComentario] =
    useState(false);

  async function cargarPruebas() {
    try {
      setCargandoPruebas(true);
      setErrorPruebas("");

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setErrorPruebas(
          "No se pudo identificar al usuario."
        );
        return;
      }

      const { data, error } = await supabase
        .from("pruebas")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", {
          ascending: false,
        });

      if (error) {
        console.error(
          "Error cargando pruebas:",
          error
        );

        setErrorPruebas(
          "No se pudo cargar el historial."
        );

        return;
      }

      setPruebas(data || []);
    } catch (error) {
      console.error(
        "Error inesperado:",
        error
      );

      setErrorPruebas(
        "Ocurrió un error cargando las pruebas."
      );
    } finally {
      setCargandoPruebas(false);
    }
  }

  useEffect(() => {
    const iniciarCarga = setTimeout(cargarPruebas, 0);
    return () => clearTimeout(iniciarCarga);
  }, []);

  const formatearFecha = (fecha) => {
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

  const nombreVehiculo = (tipo) => {
    switch (tipo) {
      case "car":
        return "Carro";

      case "motorcycle":
        return "Moto";

      case "truck":
        return "Camión";

      case "bus":
        return "Bus";

      default:
        return tipo || "—";
    }
  };

  const enviarComentario = async (e) => {
    e.preventDefault();

    if (!comentario.trim() || comentario.trim().length > 1000) {
      setMensaje(
        "El comentario debe contener entre 1 y 1000 caracteres."
      );
      return;
    }

    try {
      setEnviandoComentario(true);
      setMensaje("");

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setMensaje(
          "No se pudo identificar al usuario."
        );
        return;
      }

      const { error } = await supabase
        .from("comentarios")
        .insert({
            user_id: user.id,
            email: user.email,
            comentario: comentario.trim(),
            valoracion: Number(valoracion),
        });

      if (error) {
        console.error(
          "Error guardando comentario:",
          error
        );

        setMensaje(
          "No se pudo enviar el comentario."
        );

        return;
      }

      setMensaje(
        "Comentario enviado correctamente."
      );

      setComentario("");
      setValoracion("5");

      setTimeout(() => {
        setMensaje("");
      }, 2500);
    } catch (error) {
      console.error(
        "Error inesperado:",
        error
      );

      setMensaje(
        "Ocurrió un error al enviar el comentario."
      );
    } finally {
      setEnviandoComentario(false);
    }
  };

  return (
    <div className="user-dashboard-page">
      <div className="user-dashboard-container">
        <header className="user-dashboard-header">
          <div>
            <p className="page-label">
              Historial
            </p>

            <h1>Mis pruebas</h1>

            <p>
              Consulta los vehículos que hayas analizado
              con ParkCar y comparte tu experiencia.
            </p>
          </div>

          <button
            className="secondary-button"
            onClick={() =>
              navigate("/usuario")
            }
          >
            Volver
          </button>
        </header>

        <div className="my-tests-layout">
          {/* HISTORIAL */}
          <section className="dashboard-panel my-tests-history">
            <div className="panel-header">
              <div>
                <h3>
                  Historial de detecciones
                </h3>

                <p>
                  Vehículos analizados con la
                  inteligencia artificial de ParkCar.
                </p>
              </div>

              <button
                className="primary-button"
                onClick={() =>
                  navigate("/usuario/ia")
                }
              >
                <ScanLine size={18} />
                Nueva prueba
              </button>
            </div>

            {cargandoPruebas && (
              <div className="empty-state tests-empty-state">
                <p>
                  Cargando pruebas...
                </p>
              </div>
            )}

            {!cargandoPruebas &&
              errorPruebas && (
                <div className="empty-state tests-empty-state">
                  <h3>
                    No se pudo cargar el historial
                  </h3>

                  <p>
                    {errorPruebas}
                  </p>
                </div>
              )}

            {!cargandoPruebas &&
              !errorPruebas &&
              pruebas.length === 0 && (
                <div className="empty-state tests-empty-state">
                  <div className="empty-icon">
                    <History size={30} />
                  </div>

                  <h3>
                    Aún no tienes pruebas guardadas
                  </h3>

                  <p>
                    Cuando ParkCar confirme una placa,
                    aparecerá automáticamente en este
                    historial.
                  </p>

                  <button
                    className="primary-button"
                    onClick={() =>
                      navigate("/usuario/ia")
                    }
                  >
                    <ScanLine size={18} />
                    Probar la IA
                  </button>
                </div>
              )}

            {!cargandoPruebas &&
              !errorPruebas &&
              pruebas.length > 0 && (
                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>
                          Placa
                        </th>

                        <th>
                          Vehículo
                        </th>

                        <th>
                          Color
                        </th>

                        <th>
                          Confianza
                        </th>

                        <th>
                          Fecha
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {pruebas.map(
                        (prueba) => (
                          <tr
                            key={prueba.id}
                          >
                            <td>
                              <div className="vehicle-plate">
                                {prueba.placa ||
                                  "—"}
                              </div>
                            </td>

                            <td>
                              {nombreVehiculo(
                                prueba.tipo_vehiculo
                              )}
                            </td>

                            <td>
                              {prueba.color ||
                                "—"}
                            </td>

                            <td>
                              {prueba.confianza !==
                                null &&
                              prueba.confianza !==
                                undefined
                                ? `${Math.round(
                                    prueba.confianza *
                                      100
                                  )}%`
                                : "—"}
                            </td>

                            <td>
                              {formatearFecha(
                                prueba.created_at
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

          {/* FEEDBACK */}
          <aside className="feedback-card">
            <div className="feedback-card-header">
              <div className="feedback-icon">
                <MessageSquare
                  size={24}
                />
              </div>

              <div>
                <p className="page-label">
                  Feedback
                </p>

                <h2>
                  ¿Qué te pareció?
                </h2>
              </div>
            </div>

            <p className="feedback-description">
              Tu comentario ayudará a evaluar la
              experiencia de ParkCar y detectar mejoras
              para futuras versiones.
            </p>

            <form
              className="feedback-form"
              onSubmit={
                enviarComentario
              }
            >
              <div className="form-group">
                <label>
                  Comentario
                </label>

                <textarea
                  placeholder="Ej. La detección fue rápida, pero mejoraría..."
                  rows="6"
                  value={comentario}
                  maxLength={1000}
                  onChange={(e) =>
                    setComentario(
                      e.target.value
                    )
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label>
                  Valoración
                </label>

                <div className="feedback-rating-select">
                  <Star size={18} />

                  <select
                    value={
                      valoracion
                    }
                    onChange={(e) =>
                      setValoracion(
                        e.target.value
                      )
                    }
                  >
                    <option value="5">
                      5 - Excelente
                    </option>

                    <option value="4">
                      4 - Muy bueno
                    </option>

                    <option value="3">
                      3 - Bueno
                    </option>

                    <option value="2">
                      2 - Regular
                    </option>

                    <option value="1">
                      1 - Malo
                    </option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="primary-button feedback-submit"
                disabled={
                  enviandoComentario
                }
              >
                <Send size={17} />

                {enviandoComentario
                  ? "Enviando..."
                  : "Enviar comentario"}
              </button>

              {mensaje && (
                <div className="feedback-message">
                  {mensaje}
                </div>
              )}
            </form>

            <div className="feedback-note">
              <strong>
                Nota
              </strong>

              <p>
                Tu comentario se utilizará para evaluar
                mejoras de ParkCar.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default MisPruebas;
