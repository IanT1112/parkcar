import re
import easyocr


reader = easyocr.Reader(
    ["en"],
    gpu=False
)


IGNORAR_TEXTOS = {
    "PERU",
    "PERÚ",
}


def normalizar_fragmento(texto: str) -> str:
    texto = texto.upper().strip()

    if texto in IGNORAR_TEXTOS:
        return ""

    texto = texto.replace("[", "I")
    texto = texto.replace("]", "I")
    texto = texto.replace("|", "I")

    texto = re.sub(
        r"[^A-Z0-9-]",
        "",
        texto
    )

    return texto


def extraer_placa_valida(texto: str):
    texto = texto.upper()

    # Formatos comunes que queremos aceptar:
    # ABC-123
    # A1B-234
    # D9F-620
    patrones = [
        r"[A-Z0-9]{3}-[0-9]{3}",
        r"[A-Z]{3}[0-9]{3}",
        r"[A-Z0-9]{6}",
    ]

    for patron in patrones:
        coincidencia = re.search(
            patron,
            texto
        )

        if coincidencia:
            placa = coincidencia.group()

            # Si viene sin guion, lo agregamos
            if "-" not in placa and len(placa) == 6:
                placa = (
                    placa[:3]
                    + "-"
                    + placa[3:]
                )

            return placa

    return None


def leer_placa(imagen):
    resultados = reader.readtext(
        imagen,
        detail=1,
        paragraph=False
    )

    fragmentos = []
    confianzas = []

    for resultado in resultados:
        texto = resultado[1]
        confianza = float(resultado[2])

        fragmento = normalizar_fragmento(
            texto
        )

        if not fragmento:
            continue

        fragmentos.append(fragmento)
        confianzas.append(confianza)

    if not fragmentos:
        return {
            "placa_detectada": False,
            "placa": None,
            "confianza_placa": 0,
        }

    texto_completo = "".join(
        fragmentos
    )

    texto_completo = re.sub(
        r"-+",
        "-",
        texto_completo
    )

    placa = extraer_placa_valida(
        texto_completo
    )

    if placa is None:
        return {
            "placa_detectada": False,
            "placa": None,
            "confianza_placa": 0,
        }

    confianza_promedio = (
        sum(confianzas) / len(confianzas)
        if confianzas
        else 0
    )

    return {
        "placa_detectada": True,
        "placa": placa,
        "confianza_placa": round(
            confianza_promedio,
            2
        ),
    }