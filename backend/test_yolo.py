from ultralytics import YOLO

model = YOLO("yolo11n.pt")

results = model(
    "https://ultralytics.com/images/bus.jpg",
    verbose=False
)

for result in results:
    for box in result.boxes:
        class_id = int(box.cls[0])
        confidence = float(box.conf[0])

        class_name = model.names[class_id]

        print(
            f"Detectado: {class_name} | "
            f"Confianza: {confidence:.2f}"
        )