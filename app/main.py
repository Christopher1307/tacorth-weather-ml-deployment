import os
from datetime import date, datetime
from typing import Optional, Dict, Any

import numpy as np
import pandas as pd
import mlflow.pyfunc
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

APP_NAME = "tacorth-tempmax-api"

def season_from_month(m: int) -> str:
    if m in (12, 1, 2):
        return "invierno"
    if m in (3, 4, 5):
        return "primavera"
    if m in (6, 7, 8):
        return "verano"
    return "otono"

class PredictRequest(BaseModel):
    fecha_observacion: date = Field(..., description="Fecha de la observación (YYYY-MM-DD)")

    hum_maximo: float
    hum_media: float
    hum_minimo: float

    rad_maximo: float
    rad_total: float

    rain_total: float

    temp_media: float
    temp_minimo: float

    wsp_maximo: float
    wsp_media: float
    wsp_minimo: float

class PredictResponse(BaseModel):
    temp_maximo_pred: float
    model_uri: str

app = FastAPI(
    title="Tacoronte (TACORTH) — Predicción de Temperatura Máxima",
    version="1.0.0",
    description="API REST (FastAPI) para predecir temp_maximo (°C) con un modelo registrado en MLflow.",
)

MODEL_URI = os.getenv("MODEL_URI", "models:/tacorth_tempmax/Production")

_model = None
_model_error: Optional[str] = None

def build_features(req: PredictRequest) -> pd.DataFrame:
    dt = req.fecha_observacion
    anio = dt.year
    mes = dt.month
    dia = dt.day
    dia_semana = datetime(dt.year, dt.month, dt.day).weekday()  # 0=Lunes
    dia_del_anyo = int(datetime(dt.year, dt.month, dt.day).strftime("%j"))

    est = season_from_month(mes)

    # IMPORTANTE: el modelo espera boolean (no 0/1 int)
    estacion_invierno = (est == "invierno")
    estacion_primavera = (est == "primavera")
    estacion_verano = (est == "verano")
    estacion_otono = (est == "otono")

    row = {
        "hum_maximo": req.hum_maximo,
        "hum_media": req.hum_media,
        "hum_minimo": req.hum_minimo,
        "rad_maximo": req.rad_maximo,
        "rad_total": req.rad_total,
        "rain_total": req.rain_total,
        "temp_media": req.temp_media,
        "temp_minimo": req.temp_minimo,
        "wsp_maximo": req.wsp_maximo,
        "wsp_media": req.wsp_media,
        "wsp_minimo": req.wsp_minimo,
        "anio": anio,
        "mes": mes,
        "dia": dia,
        "dia_semana": dia_semana,
        "dia_del_anyo": dia_del_anyo,
        "estacion_invierno": estacion_invierno,
        "estacion_otono": estacion_otono,
        "estacion_primavera": estacion_primavera,
        "estacion_verano": estacion_verano,
    }

    ordered_cols = [
        "hum_maximo","hum_media","hum_minimo",
        "rad_maximo","rad_total","rain_total",
        "temp_media","temp_minimo",
        "wsp_maximo","wsp_media","wsp_minimo",
        "anio","mes","dia","dia_semana","dia_del_anyo",
        "estacion_invierno","estacion_otono","estacion_primavera","estacion_verano"
    ]

    df = pd.DataFrame([[row[c] for c in ordered_cols]], columns=ordered_cols)

    # Forzar dtypes exactamente como los espera MLflow (evita el error int64 -> bool)
    FLOAT_COLS = [
        "hum_maximo","hum_media","hum_minimo",
        "rad_maximo","rad_total","rain_total",
        "temp_media","temp_minimo",
        "wsp_maximo","wsp_media","wsp_minimo",
    ]
    INT_COLS = ["anio", "mes", "dia", "dia_semana", "dia_del_anyo"]
    BOOL_COLS = ["estacion_invierno", "estacion_otono", "estacion_primavera", "estacion_verano"]

    for c in FLOAT_COLS:
        df[c] = df[c].astype(float)

    for c in INT_COLS:
        df[c] = df[c].astype(int)

    for c in BOOL_COLS:
        df[c] = df[c].astype(bool)

    return df

@app.on_event("startup")
def load_model() -> None:
    global _model, _model_error
    try:
        _model = mlflow.pyfunc.load_model(MODEL_URI)
        _model_error = None
    except Exception as e:
        _model = None
        _model_error = f"{type(e).__name__}: {e}"

@app.get("/")
def root() -> Dict[str, Any]:
    return {"status": "ok", "docs": "/docs", "health": "/health", "model_uri": MODEL_URI}

@app.get("/health")
def health() -> Dict[str, Any]:
    if _model is None:
        return {"status": "ko", "model_uri": MODEL_URI, "error": _model_error}
    return {"status": "ok", "model_uri": MODEL_URI}

@app.post("/predict", response_model=PredictResponse)
def predict(req: PredictRequest) -> PredictResponse:
    if _model is None:
        raise HTTPException(
            status_code=503,
            detail={"status": "ko", "error": _model_error, "model_uri": MODEL_URI},
        )

    X = build_features(req)

    try:
        y_pred = _model.predict(X)
        if isinstance(y_pred, (list, tuple, np.ndarray)):
            pred_val = float(np.array(y_pred).ravel()[0])
        else:
            pred_val = float(y_pred.iloc[0])

        return PredictResponse(temp_maximo_pred=pred_val, model_uri=MODEL_URI)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"{type(e).__name__}: {e}")
