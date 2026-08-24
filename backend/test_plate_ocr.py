from ultralytics import YOLO
import cv2
import easyocr
import re

# Cargar detector de placas
plate_model = YOLO(
    "models/license_plate_detector.pt"
)

# Cargar OCR
reader = easyocr.Reader(
    ["en"],
    gpu=False
)

# Leer imagen
imagen = cv2.imread(
    "placa_test.jpg"
)

if imagen is None:
    raise FileNotFoundError(
        "No se encontró placa_test.jpg"
    )

# Detectar placa
resultados = plate_model(
    imagen,
    verbose=False,
    conf=0.25
)

mejor_placa = None

for resultado in resultados:
    for box in resultado.boxes:
        confianza = float(box.conf[0])

        x1, y1, x2, y2 = map(
            int,
            box.xyxy[0].tolist()
        )

        if (
            mejor_placa is None
            or confianza > mejor_placa["confianza"]
        ):
            mejor_placa = {
                "confianza": confianza,
                "coords": (x1, y1, x2, y2),
            }

if mejor_placa is None:
    print("No se detectó ninguna placa.")
    raise SystemExit

x1, y1, x2, y2 = mejor_placa["coords"]

recorte = imagen[
    y1:y2,
    x1:x2
]

# Mejorar un poco el recorte
gris = cv2.cvtColor(
    recorte,
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

# OCR
textos = reader.readtext(gris)

print("\n--- OCR DE PLACA ---")

fragmentos = []

for item in textos:
    texto = item[1].upper().strip()
    confianza = float(item[2])

    print(
        f"Texto: {texto} | "
        f"Confianza: {confianza:.2f}"
    )

    if texto in {"PERU", "PERÚ"}:
        continue

    texto = texto.replace("[", "I")
    texto = texto.replace("]", "I")
    texto = texto.replace("|", "I")

    texto = re.sub(
        r"[^A-Z0-9-]",
        "",
        texto
    )

    if texto:
        fragmentos.append(texto)

placa = "".join(fragmentos)

placa = re.sub(
    r"-+",
    "-",
    placa
)

print("\n--- PLACA FINAL ---")
print(placa)