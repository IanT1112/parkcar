import { useEffect, useRef, useState } from "react";
import {
  Camera,
  Upload,
  ScanLine,
  CircleDot,
  Image as ImageIcon,
} from "lucide-react";

import { supabase } from "../../lib/supabase";
import { authenticatedFetch } from "../../lib/api";

function ProbarIA() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const ultimaPlacaGuardadaRef = useRef(null);
  const requestInFlightRef = useRef(false);

  const [stream, setStream] = useState(null);
  const [imagen, setImagen] = useState(null);
  const [error, setError] = useState("");
  const [estado, setEstado] = useState(
    "Solicitando acceso a la cámara..."
  );

  const [, setHistorialPlacas] = useState([]);

  const [guardandoPrueba, setGuardandoPrueba] =
    useState(false);

  const [resultadoIA, setResultadoIA] = useState({
    vehiculo_detectado: false,
    tipo_vehiculo: null,
    confianza: 0,
    placa_detectada: false,
    placa: null,
    color: null,
    placa_confirmada: false,
  });

  useEffect(() => {
    iniciarCamara();

    return () => {
      detenerCamara();
    };
  }, []);

  useEffect(() => {
    if (!stream) return;

    const intervalo = setInterval(() => {
      enviarFrame();
    }, 2000);

    return () => clearInterval(intervalo);
  }, [stream]);

  const guardarPrueba = async (resultado) => {
    try {
      setGuardandoPrueba(true);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error(
          "No hay usuario autenticado:",
          userError
        );

        return;
      }

      const { error: insertError } = await supabase
        .from("pruebas")
        .insert({
          user_id: user.id,
          placa: resultado.placa,
          color: resultado.color || null,
          tipo_vehiculo:
            resultado.tipo_vehiculo || null,
          confianza:
            resultado.confianza ?? null,
        });

      if (insertError) {
        console.error(
          "Error guardando prueba:",
          insertError
        );

        return;
      }

      console.log(
        "Prueba guardada en Supabase:",
        resultado.placa
      );
    } catch (err) {
      console.error(
        "Error inesperado guardando prueba:",
        err
      );
    } finally {
      setGuardandoPrueba(false);
    }
  };

  async function iniciarCamara() {
    try {
      setError("");
      setImagen(null);
      setEstado(
        "Solicitando acceso a la cámara..."
      );

      const mediaStream =
        await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: {
              ideal: "environment",
            },
          },
          audio: false,
        });

      setStream(mediaStream);
      setEstado("Buscando vehículo...");

      if (videoRef.current) {
        videoRef.current.srcObject =
          mediaStream;
      }
    } catch (err) {
      console.error(err);

      setEstado("Cámara no disponible");

      setError(
        "No se pudo acceder a la cámara. Puedes habilitar el permiso del navegador o usar una imagen."
      );
    }
  }

  function detenerCamara() {
    if (stream) {
      stream.getTracks().forEach((track) => {
        track.stop();
      });
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setStream(null);
  }

  const procesarResultadoCamara = (data) => {
    setResultadoIA((actual) => ({
      ...actual,
      ...data,
      placa_confirmada: false,
    }));

    if (
      data.placa_detectada &&
      data.placa
    ) {
      setHistorialPlacas((prev) => {
        const nuevo = [
          ...prev,
          data.placa,
        ].slice(-5);

        const conteo = {};

        for (const placa of nuevo) {
          conteo[placa] =
            (conteo[placa] || 0) + 1;
        }

        let placaMasRepetida = null;
        let repeticiones = 0;

        for (const [
          placa,
          cantidad,
        ] of Object.entries(conteo)) {
          if (cantidad > repeticiones) {
            placaMasRepetida = placa;
            repeticiones = cantidad;
          }
        }

        if (
          placaMasRepetida &&
          repeticiones >= 3
        ) {
          setResultadoIA((actual) => ({
            ...actual,
            placa: placaMasRepetida,
            placa_detectada: true,
            placa_confirmada: true,
          }));

          setEstado("Placa confirmada");

          if (
            ultimaPlacaGuardadaRef.current !==
            placaMasRepetida
          ) {
            ultimaPlacaGuardadaRef.current =
              placaMasRepetida;

            guardarPrueba({
              ...data,
              placa: placaMasRepetida,
            });
          }
        }

        return nuevo;
      });
    }

    if (!data.vehiculo_detectado) {
      setEstado("Buscando vehículo...");
      return;
    }

    if (
      !data.placa_detectada
    ) {
      setEstado(
        "Vehículo detectado. Buscando placa..."
      );
    }
  };

  async function enviarFrame() {
    if (requestInFlightRef.current) return;
    if (
      !videoRef.current ||
      !canvasRef.current
    ) {
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (
      video.videoWidth === 0 ||
      video.videoHeight === 0
    ) {
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx =
      canvas.getContext("2d");

    ctx.drawImage(
      video,
      0,
      0,
      canvas.width,
      canvas.height
    );

    canvas.toBlob(
      async (blob) => {
        if (!blob) return;

        const formData = new FormData();

        formData.append(
          "imagen",
          blob,
          "frame.jpg"
        );

        try {
          requestInFlightRef.current = true;
          const response = await authenticatedFetch(
            "/api/ia/analizar",
            {
              method: "POST",
              body: formData,
            }
          );

          if (!response.ok) {
            throw new Error(
              `Error HTTP: ${response.status}`
            );
          }

          const data =
            await response.json();

          console.log(
            "Respuesta ParkCar IA:",
            data
          );

          console.log(
            "Placa detectada:",
            data.placa_detectada
          );

          console.log(
            "Placa:",
            data.placa
          );

          console.log(
            "Confianza placa:",
            data.confianza_placa
          );

          procesarResultadoCamara(
            data
          );
        } catch (err) {
          console.error(
            "Error enviando frame:",
            err
          );

          setError(
            "No se pudo conectar con el backend de ParkCar."
          );
        } finally {
          requestInFlightRef.current = false;
        }
      },
      "image/jpeg",
      0.8
    );
  }

  const seleccionarImagen = async (
    e
  ) => {
    const archivo =
      e.target.files?.[0];

    if (!archivo) return;

    detenerCamara();

    if (imagen) {
      URL.revokeObjectURL(
        imagen
      );
    }

    ultimaPlacaGuardadaRef.current =
      null;

    setHistorialPlacas([]);

    const nuevaImagen =
      URL.createObjectURL(
        archivo
      );

    setImagen(nuevaImagen);

    setEstado(
      "Analizando imagen..."
    );

    setError("");

    setResultadoIA({
      vehiculo_detectado: false,
      tipo_vehiculo: null,
      confianza: 0,
      placa_detectada: false,
      placa: null,
      color: null,
      placa_confirmada: false,
    });

    const formData =
      new FormData();

    formData.append(
      "imagen",
      archivo,
      archivo.name
    );

    try {
      const response = await authenticatedFetch(
        "/api/ia/analizar",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(
          `Error HTTP: ${response.status}`
        );
      }

      const data =
        await response.json();

      console.log(
        "Respuesta ParkCar IA imagen:",
        data
      );

      setResultadoIA({
        ...data,
        placa_confirmada:
          Boolean(
            data.placa_detectada &&
              data.placa
          ),
      });

      if (
        !data.vehiculo_detectado
      ) {
        setEstado(
          "No se detectó un vehículo"
        );

        return;
      }

      if (
        data.placa_detectada &&
        data.placa
      ) {
        setEstado(
          "Placa detectada"
        );

        if (
          ultimaPlacaGuardadaRef.current !==
          data.placa
        ) {
          ultimaPlacaGuardadaRef.current =
            data.placa;

          await guardarPrueba(
            data
          );
        }
      } else {
        setEstado(
          "Vehículo detectado, pero no se pudo leer la placa"
        );
      }
    } catch (err) {
      console.error(
        "Error analizando imagen:",
        err
      );

      setEstado(
        "Error al analizar imagen"
      );

      setError(
        "No se pudo analizar la imagen."
      );
    }
  };

  const volverACamara = async () => {
    if (imagen) {
      URL.revokeObjectURL(
        imagen
      );
    }

    setImagen(null);

    setHistorialPlacas([]);

    ultimaPlacaGuardadaRef.current =
      null;

    setResultadoIA({
      vehiculo_detectado: false,
      tipo_vehiculo: null,
      confianza: 0,
      placa_detectada: false,
      placa: null,
      color: null,
      placa_confirmada: false,
    });

    await iniciarCamara();
  };

  const nombreVehiculo = () => {
    if (
      !resultadoIA.vehiculo_detectado
    ) {
      return "—";
    }

    switch (
      resultadoIA.tipo_vehiculo
    ) {
      case "car":
        return "Carro";

      case "motorcycle":
        return "Moto";

      case "truck":
        return "Camión";

      case "bus":
        return "Bus";

      default:
        return (
          resultadoIA.tipo_vehiculo ||
          "—"
        );
    }
  };

  return (
    <div className="user-dashboard-page">
      <div className="user-dashboard-container">
        <header className="user-dashboard-header">
          <div>
            <p className="page-label">
              Inteligencia Artificial
            </p>

            <h1>
              Reconocimiento en tiempo real
            </h1>

            <p>
              Apunta la cámara hacia un
              vehículo procurando que la
              placa sea visible.
            </p>
          </div>
        </header>

        <section className="ai-live-layout">
          <div className="ai-camera-panel">
            <div className="ai-camera-header">
              <div className="ai-live-status">
                <CircleDot
                  size={16}
                />

                <span>
                  {estado}
                </span>
              </div>

              {!imagen && (
                <span className="ai-live-label">
                  Cámara en vivo
                </span>
              )}
            </div>

            <div className="ai-camera-frame">
              {!imagen ? (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="ai-live-video"
                  />

                  <canvas
                    ref={canvasRef}
                    style={{
                      display: "none",
                    }}
                  />

                  <div className="scan-overlay">
                    <div className="scan-corner top-left" />
                    <div className="scan-corner top-right" />
                    <div className="scan-corner bottom-left" />
                    <div className="scan-corner bottom-right" />

                    <div className="scan-line" />

                    <div className="scan-instruction">
                      <ScanLine
                        size={20}
                      />

                      Coloca el vehículo
                      dentro del recuadro
                    </div>
                  </div>
                </>
              ) : (
                <img
                  src={imagen}
                  alt="Vehículo seleccionado"
                  className="ai-live-video"
                />
              )}
            </div>

            {error && (
              <div className="ai-error-message">
                {error}
              </div>
            )}

            <div className="ai-secondary-actions">
              {!imagen ? (
                <label className="secondary-button upload-button">
                  <Upload
                    size={18}
                  />

                  Usar una imagen

                  <input
                    type="file"
                    accept="image/*"
                    onChange={
                      seleccionarImagen
                    }
                    hidden
                  />
                </label>
              ) : (
                <button
                  className="secondary-button"
                  onClick={
                    volverACamara
                  }
                >
                  <Camera
                    size={18}
                  />

                  Volver a cámara
                </button>
              )}
            </div>
          </div>

          <aside className="ai-result-panel">
            <div className="ai-result-icon">
              <ImageIcon
                size={26}
              />
            </div>

            <p className="page-label">
              Resultado de IA
            </p>

            <h2>
              {resultadoIA.vehiculo_detectado
                ? "Vehículo detectado"
                : "Esperando detección"}
            </h2>

            <p className="ai-result-description">
              ParkCar analiza la cámara
              automáticamente y actualiza
              los resultados en tiempo real.
            </p>

            <div className="ai-result-placeholder">
              <div>
                <span>
                  Vehículo
                </span>

                <strong>
                  {nombreVehiculo()}
                </strong>
              </div>

              <div>
                <span>
                  Placa
                </span>

                <strong>
                  {resultadoIA.placa_detectada
                    ? resultadoIA.placa
                    : "—"}
                </strong>

                {resultadoIA.placa_confirmada && (
                  <small className="plate-confirmed">
                    Confirmada
                  </small>
                )}
              </div>

              <div>
                <span>
                  Color
                </span>

                <strong>
                  {resultadoIA.vehiculo_detectado
                    ? resultadoIA.color ||
                      "—"
                    : "—"}
                </strong>
              </div>

              <div>
                <span>
                  Confianza
                </span>

                <strong>
                  {resultadoIA.vehiculo_detectado
                    ? `${Math.round(
                        resultadoIA.confianza *
                          100
                      )}%`
                    : "—"}
                </strong>
              </div>
            </div>

            {guardandoPrueba && (
              <div
                style={{
                  marginTop:
                    "16px",
                  fontSize:
                    "12px",
                  color:
                    "#6b7280",
                }}
              >
                Guardando prueba...
              </div>
            )}
          </aside>
        </section>
      </div>
    </div>
  );
}

export default ProbarIA;
