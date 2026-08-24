from ultralytics import YOLO
import cv2

model = YOLO(
    "models/license_plate_detector.pt"
)

imagen = cv2.imread(
    "placa_test.jpg"
)

if imagen is None:
    raise FileNotFoundError(
        "No se encontró placa_test.jpg"
    )

resultados = model(
    imagen,
    verbose=False,
    conf=0.25
)

print("\n--- PLACAS DETECTADAS ---")

cantidad = 0

for resultado in resultados:
    for box in resultado.boxes:
        cantidad += 1

        confianza = float(
            box.conf[0]
        )

        x1, y1, x2, y2 = map(
            int,
            box.xyxy[0].tolist()
        )

        print(
            f"Placa {cantidad} | "
            f"Confianza: {confianza:.2f} | "
            f"Coordenadas: "
            f"{x1}, {y1}, {x2}, {y2}"
        )

if cantidad == 0:
    print("No se detectó ninguna placa.")