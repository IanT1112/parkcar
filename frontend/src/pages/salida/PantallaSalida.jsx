import { useEffect, useState } from "react";
import {
  Car,
  Clock3,
  CreditCard,
  CheckCircle2,
} from "lucide-react";

function PantallaSalida() {
  const leerUltimoMovimiento = () => {
    try {
      const guardados = localStorage.getItem("parkcar_historial");
      const historial = guardados ? JSON.parse(guardados) : [];
      return historial.length > 0 ? historial[0] : null;
    } catch {
      return null;
    }
  };

  const [ultimoMovimiento, setUltimoMovimiento] = useState(leerUltimoMovimiento);

  const cargarUltimoMovimiento = () => {
    try {
      const guardados = localStorage.getItem("parkcar_historial");
      const historial = guardados ? JSON.parse(guardados) : [];

      if (historial.length > 0) {
        setUltimoMovimiento(historial[0]);
      } else {
        setUltimoMovimiento(null);
      }
    } catch {
      setUltimoMovimiento(null);
    }
  };

  useEffect(() => {
    const intervalo = setInterval(() => {
      cargarUltimoMovimiento();
    }, 1000);

    return () => clearInterval(intervalo);
  }, []);

  const formatearDuracion = (minutos = 0) => {
    const horas = Math.floor(minutos / 60);
    const minutosRestantes = minutos % 60;

    if (horas === 0) {
      return `${minutosRestantes} min`;
    }

    return `${horas} h ${minutosRestantes} min`;
  };

  if (!ultimoMovimiento) {
    return (
      <div className="exit-screen empty-exit-screen">
        <Car size={64} />

        <h1>ParkCar</h1>

        <p>Esperando vehículo...</p>
      </div>
    );
  }

  const pagado = ultimoMovimiento.estadoPago === "Pagado";

  return (
    <div className="exit-screen">
      <div className="exit-container">
        <div className="exit-brand">
          <Car size={32} />
          <span>ParkCar</span>
        </div>

        <div className="exit-status">
          {pagado ? (
            <>
              <CheckCircle2 size={30} />
              <span>Pago realizado</span>
            </>
          ) : (
            <>
              <CreditCard size={30} />
              <span>Pago pendiente</span>
            </>
          )}
        </div>

        <div className="exit-plate">
          {ultimoMovimiento.placa}
        </div>

        <p className="exit-color">
          Vehículo {ultimoMovimiento.color}
        </p>

        <div className="exit-information">
          <div className="exit-info-card">
            <Clock3 size={24} />

            <span>Tiempo estacionado</span>

            <strong>
              {formatearDuracion(
                ultimoMovimiento.duracionMinutos
              )}
            </strong>
          </div>

          <div className="exit-info-card">
            <CreditCard size={24} />

            <span>Total a pagar</span>

            <strong>
              S/{" "}
              {Number(
                ultimoMovimiento.precioTotal || 0
              ).toFixed(2)}
            </strong>
          </div>
        </div>

        <div
          className={
            pagado
              ? "exit-payment-message paid"
              : "exit-payment-message pending"
          }
        >
          {pagado ? (
            <>
              <h2>Pago confirmado</h2>
              <p>Puede retirarse. Gracias por su visita.</p>
            </>
          ) : (
            <>
              <h2>Pago pendiente</h2>
              <p>
                Realice el pago para completar la salida.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default PantallaSalida;
