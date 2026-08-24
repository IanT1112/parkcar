import asyncio
import os

import cv2
import numpy as np
from fastapi import Depends, FastAPI, File, HTTPException, UploadFile, status
from fastapi.middleware.cors import CORSMiddleware
from .services.ia_service import detectar_vehiculo
from .security import AuthenticatedUser, enforce_rate_limit

app = FastAPI(
    title="ParkCar API",
    version="1.0.0"
)

allowed_origins = [
    origin.strip()
    for origin in os.environ.get("ALLOWED_ORIGINS", "http://localhost:5173").split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["Authorization", "Content-Type"],
)

analysis_semaphore = asyncio.Semaphore(
    int(os.environ.get("MAX_CONCURRENT_ANALYSES", "2"))
)


@app.get("/")
def root():
    return {
        "message": "ParkCar API funcionando correctamente"
    }


@app.get("/health")
def health():
    return {
        "status": "ok"
    }


@app.post("/api/ia/analizar")
async def analizar_imagen(
    imagen: UploadFile = File(...),
    _user: AuthenticatedUser = Depends(enforce_rate_limit),
):
    allowed_types = {"image/jpeg", "image/png", "image/webp"}
    if imagen.content_type not in allowed_types:
        raise HTTPException(status.HTTP_415_UNSUPPORTED_MEDIA_TYPE, "Formato no permitido")

    max_bytes = int(os.environ.get("MAX_IMAGE_BYTES", str(5 * 1024 * 1024)))
    contenido = await imagen.read(max_bytes + 1)
    if not contenido or len(contenido) > max_bytes:
        raise HTTPException(status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, "Imagen demasiado grande")

    decoded = cv2.imdecode(np.frombuffer(contenido, np.uint8), cv2.IMREAD_COLOR)
    if decoded is None:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "El archivo no es una imagen válida")
    height, width = decoded.shape[:2]
    max_pixels = int(os.environ.get("MAX_IMAGE_PIXELS", "12000000"))
    if height * width > max_pixels:
        raise HTTPException(status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, "Dimensiones excesivas")

    try:
        await asyncio.wait_for(analysis_semaphore.acquire(), timeout=2)
    except TimeoutError as exc:
        raise HTTPException(status.HTTP_503_SERVICE_UNAVAILABLE, "Servidor ocupado") from exc
    try:
        resultado = await asyncio.to_thread(detectar_vehiculo, contenido)
    finally:
        analysis_semaphore.release()

    return {
        "ok": True,
        **resultado
    }
