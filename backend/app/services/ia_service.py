from ultralytics import YOLO
import cv2
import numpy as np

from .ocr_service import leer_placa


vehicle_model = YOLO("yolo11n.pt")

plate_model = YOLO(
    "models/license_plate_detector.pt"
)


VEHICLE_CLASSES = {
    "car",
    "motorcycle",
    "bus",
    "truck",
}

def detectar_color_vehiculo(imagen):
    if imagen is None or imagen.size == 0:
        return "Desconocido"

    imagen_pequena = cv2.resize(
        imagen,
        (120, 120)
    )

    hsv = cv2.cvtColor(
        imagen_pequena,
        cv2.COLOR_BGR2HSV
    )

    h = hsv[:, :, 0]
    s = hsv[:, :, 1]
    v = hsv[:, :, 2]

    brillo_promedio = float(np.mean(v))
    saturacion_promedio = float(np.mean(s))

    if brillo_promedio < 55:
        return "Negro"

    if saturacion_promedio < 35:
        if brillo_promedio > 190:
            return "Blanco"

        if brillo_promedio > 115:
            return "Plata"

        return "Gris"

    mascara_valida = (s > 50) & (v > 50)

    if not np.any(mascara_valida):
        return "Gris"

    hue_promedio = float(
        np.mean(h[mascara_valida])
    )

    if hue_promedio < 10 or hue_promedio >= 170:
        return "Rojo"

    if 10 <= hue_promedio < 25:
        return "Naranja"

    if 25 <= hue_promedio < 35:
        return "Amarillo"

    if 35 <= hue_promedio < 85:
        return "Verde"

    if 85 <= hue_promedio < 135:
        return "Azul"

    if 135 <= hue_promedio < 170:
        return "Morado"

    return "Otro"

def detectar_vehiculo(image_bytes):
    np_array = np.frombuffer(
        image_bytes,
        np.uint8
    )

    image = cv2.imdecode(
        np_array,
        cv2.IMREAD_COLOR
    )

    if image is None:
        return {
            "vehiculo_detectado": False,
            "error": "No se pudo leer la imagen"
        }

    vehicle_results = vehicle_model(
        image,
        verbose=False,
        conf=0.40
    )

    mejor_deteccion = None

    for result in vehicle_results:
        for box in result.boxes:
            class_id = int(box.cls[0])
            confidence = float(box.conf[0])

            class_name = vehicle_model.names[class_id]

            if class_name not in VEHICLE_CLASSES:
                continue

            if (
                mejor_deteccion is None
                or confidence > mejor_deteccion["confianza"]
            ):
                x1, y1, x2, y2 = map(
                    int,
                    box.xyxy[0].tolist()
                )

                mejor_deteccion = {
                    "tipo_vehiculo": class_name,
                    "confianza": confidence,
                    "coordenadas": (x1, y1, x2, y2),
                }

    if mejor_deteccion is None:
        return {
            "vehiculo_detectado": False,
            "tipo_vehiculo": None,
            "confianza": 0
        }

    x1, y1, x2, y2 = mejor_deteccion["coordenadas"]

    alto, ancho = image.shape[:2]

    x1 = max(0, min(x1, ancho))
    x2 = max(0, min(x2, ancho))
    y1 = max(0, min(y1, alto))
    y2 = max(0, min(y2, alto))

    recorte_vehiculo = image[
        y1:y2,
        x1:x2
    ]

    color_vehiculo = detectar_color_vehiculo(
    recorte_vehiculo
        )

    plate_results = plate_model(
        recorte_vehiculo,
        verbose=False,
        conf=0.25
    )

    mejor_placa = None

    for result in plate_results:
        for box in result.boxes:
            confianza_placa = float(
                box.conf[0]
            )

            px1, py1, px2, py2 = map(
                int,
                box.xyxy[0].tolist()
            )

            if (
                mejor_placa is None
                or confianza_placa
                > mejor_placa["confianza"]
            ):
                mejor_placa = {
                    "confianza": confianza_placa,
                    "coordenadas": (
                        px1,
                        py1,
                        px2,
                        py2
                    )
                }

    if mejor_placa is None:
        return {
            "vehiculo_detectado": True,
            "tipo_vehiculo":
                mejor_deteccion["tipo_vehiculo"],
            "confianza": round(
                mejor_deteccion["confianza"],
                2
            ),
            "color": color_vehiculo,
            "placa_detectada": False,
            "placa": None,
            "confianza_placa": 0
        }

    px1, py1, px2, py2 = mejor_placa["coordenadas"]

    alto_v, ancho_v = recorte_vehiculo.shape[:2]

    px1 = max(0, min(px1, ancho_v))
    px2 = max(0, min(px2, ancho_v))
    py1 = max(0, min(py1, alto_v))
    py2 = max(0, min(py2, alto_v))

    recorte_placa = recorte_vehiculo[
        py1:py2,
        px1:px2
    ]

    if recorte_placa.size == 0:
        return {
            "vehiculo_detectado": True,
            "tipo_vehiculo":
                mejor_deteccion["tipo_vehiculo"],
            "confianza": round(
                mejor_deteccion["confianza"],
                2
            ),
            "placa_detectada": False,
            "placa": None,
            "confianza_placa": 0
        }

    gris = cv2.cvtColor(
        recorte_placa,
        cv2.COLOR_BGR2GRAY
    )

    gris = cv2.resize(
        gris,
        None,
        fx=2,
        fy=2,
        interpolation=cv2.INTER_CUBIC
    )

    gris = cv2.equalizeHist(gris)

    resultado_ocr = leer_placa(gris)

    return {
        "vehiculo_detectado": True,
        "tipo_vehiculo":
            mejor_deteccion["tipo_vehiculo"],
        "confianza": round(
            mejor_deteccion["confianza"],
            2
        ),
        "color": color_vehiculo,
        "confianza_detector_placa": round(
            mejor_placa["confianza"],
            2
        ),
        **resultado_ocr
    }