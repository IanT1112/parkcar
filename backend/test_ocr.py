import re
import easyocr

print("Cargando EasyOCR...")

reader = easyocr.Reader(
    ["en"],
    gpu=False
)

print("Analizando imagen...")

resultados = reader.readtext(
    "placa_test.jpg"
)

print("\n--- TEXTOS DETECTADOS ---")

fragmentos = []

for resultado in resultados:
    texto = resultado[1].upper().strip()
    confianza = resultado[2]

    print(
        f"Texto: {texto} | "
        f"Confianza: {confianza:.2f}"
    )

    # Importante: para ignorar palabras que no forman parte de la placa
    if texto in {"PERU", "PERÚ"}:
        continue

    # Correcciones comunes de OCR - Posible mejora, a evaluar
    texto = texto.replace("[", "I")
    texto = texto.replace("]", "I")
    texto = texto.replace("|", "I")

    # Dejar solo letras, números y guiones
    texto = re.sub(
        r"[^A-Z0-9-]",
        "",
        texto
    )

    if texto:
        fragmentos.append(texto)


placa = "".join(fragmentos)

# Limpiar guiones duplicados
placa = re.sub(r"-+", "-", placa)

print("\n--- PLACA RECONSTRUIDA ---")
print(placa)