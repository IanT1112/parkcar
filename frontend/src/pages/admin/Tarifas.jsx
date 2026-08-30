import { useEffect, useState } from "react";
import {
  BadgeDollarSign,
  Clock3,
  Save,
} from "lucide-react";
import { supabase } from "../../lib/supabase";

function Tarifas() {
  const [tipoCobro, setTipoCobro] = useState("minuto");
  const [precio, setPrecio] = useState("0.10");
  const [tolerancia, setTolerancia] = useState("0");
  const [tarifaMinima, setTarifaMinima] = useState("0");

  const [guardado, setGuardado] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!guardado) return;

    const timer = setTimeout(() => {
      setGuardado(false);
    }, 1800);

    return () => clearTimeout(timer);
  }, [guardado]);

  async function cargarTarifa() {
    try {
      setCargando(true);
      setError("");

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error(
          "No se pudo obtener el usuario autenticado."
        );
      }

      const { data, error: tarifaError } = await supabase
        .from("tarifas")
        .select(
          "tipo_cobro, precio, tolerancia, tarifa_minima"
        )
        .eq("user_id", user.id)
        .maybeSingle();

      if (tarifaError) {
        throw tarifaError;
      }

      // Si el usuario ya configuró una tarifa,
      // cargamos sus valores.
      if (data) {
        setTipoCobro(data.tipo_cobro);
        setPrecio(String(data.precio));
        setTolerancia(String(data.tolerancia));
        setTarifaMinima(String(data.tarifa_minima));
      }
    } catch (err) {
      console.error("Error cargando tarifa:", err);
      setError("No se pudo cargar la configuración de tarifa.");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    const inicioCarga = setTimeout(cargarTarifa, 0);
    return () => clearTimeout(inicioCarga);
  }, []);

  const guardarTarifa = async (e) => {
    e.preventDefault();

    try {
      setGuardando(true);
      setGuardado(false);
      setError("");

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error(
          "No se pudo obtener el usuario autenticado."
        );
      }

      const nuevaTarifa = {
        user_id: user.id,
        tipo_cobro: tipoCobro,
        precio: Number(precio),
        tolerancia: Number(tolerancia),
        tarifa_minima: Number(tarifaMinima),
        updated_at: new Date().toISOString(),
      };

      const { error: guardarError } = await supabase
        .from("tarifas")
        .upsert(nuevaTarifa, {
          onConflict: "user_id",
        });

      if (guardarError) {
        throw guardarError;
      }

      setGuardado(true);
    } catch (err) {
      console.error("Error guardando tarifa:", err);
      setError("No se pudo guardar la tarifa.");
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) {
    return (
      <div className="dashboard-page">
        <section className="dashboard-panel">
          <p>Cargando configuración de tarifa...</p>
        </section>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <p className="page-label">Configuración</p>

          <h1>Tarifas</h1>

          <p className="page-description">
            Define cómo se calculará el cobro de tu estacionamiento.
          </p>
        </div>
      </header>

      <section className="tariff-grid">
        <div className="dashboard-panel">
          <div className="panel-header">
            <div>
              <h3>Configuración de cobro</h3>

              <p>
                Esta tarifa se aplicará automáticamente a los
                vehículos registrados en esta cuenta.
              </p>
            </div>
          </div>

          <form
            onSubmit={guardarTarifa}
            className="tariff-form"
          >
            <div className="form-group">
              <label>Tipo de cobro</label>

              <select
                value={tipoCobro}
                onChange={(e) =>
                  setTipoCobro(e.target.value)
                }
              >
                <option value="minuto">
                  Por minuto
                </option>

                <option value="hora">
                  Por hora proporcional
                </option>

                <option value="hora_iniciada">
                  Por hora iniciada
                </option>
              </select>
            </div>

            <div className="form-group">
              <label>
                {tipoCobro === "minuto"
                  ? "Precio por minuto"
                  : "Precio por hora"}
              </label>

              <div className="money-input">
                <span>S/</span>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={precio}
                  onChange={(e) =>
                    setPrecio(e.target.value)
                  }
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>
                Minutos de tolerancia
              </label>

              <input
                type="number"
                min="0"
                step="1"
                value={tolerancia}
                onChange={(e) =>
                  setTolerancia(e.target.value)
                }
              />

              <small className="form-help">
                Durante este tiempo el sistema no realizará
                cobro.
              </small>
            </div>

            <div className="form-group">
              <label>Tarifa mínima</label>

              <div className="money-input">
                <span>S/</span>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={tarifaMinima}
                  onChange={(e) =>
                    setTarifaMinima(e.target.value)
                  }
                />
              </div>
            </div>

            <button
              type="submit"
              className="primary-button"
              disabled={guardando}
            >
              <Save size={18} />

              {guardando
                ? "Guardando..."
                : "Guardar tarifa"}
            </button>

            {guardado && (
              <div className="saved-message">
                Tarifa guardada correctamente.
              </div>
            )}

            {error && (
              <div className="ai-error-message">
                {error}
              </div>
            )}
          </form>
        </div>

        <div className="dashboard-panel tariff-preview">
          <div className="tariff-preview-icon">
            <BadgeDollarSign size={28} />
          </div>

          <p>Tarifa actual</p>

          <h2>
            S/ {Number(precio || 0).toFixed(2)}
          </h2>

          <span>
            {tipoCobro === "minuto" && "por minuto"}

            {tipoCobro === "hora" &&
              "por hora proporcional"}

            {tipoCobro === "hora_iniciada" &&
              "por hora iniciada"}
          </span>

          <div className="tariff-example">
            <Clock3 size={18} />

            <div>
              <strong>Ejemplo</strong>

              <p>
                {tipoCobro === "minuto" &&
                  `30 minutos = S/ ${(
                    Number(precio || 0) * 30
                  ).toFixed(2)}`}

                {tipoCobro === "hora" &&
                  `90 minutos = S/ ${(
                    Number(precio || 0) * 1.5
                  ).toFixed(2)}`}

                {tipoCobro === "hora_iniciada" &&
                  `90 minutos = S/ ${(
                    Number(precio || 0) * 2
                  ).toFixed(2)}`}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Tarifas;
