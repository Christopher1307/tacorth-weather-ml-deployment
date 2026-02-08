# ETAPA 6 — FastAPI + MLflow (Databricks) + Render

## 1) Entrenar local y loguear en MLflow (Databricks)
### Requisitos
- Tener un workspace de Databricks y un token personal.
- Variables de entorno:
  - `MLFLOW_TRACKING_URI=databricks`
  - `DATABRICKS_HOST=https://<tu-workspace>.cloud.databricks.com`
  - `DATABRICKS_TOKEN=<tu_token>`
  - (Opcional) `MLFLOW_EXPERIMENT_NAME=/Shared/tacorth_tempmax`
  - (Opcional) `REGISTERED_MODEL_NAME=tacorth_tempmax`

### Ejecutar
```bash
pip install -r requirements.txt
python train_and_log_mlflow.py
```

Esto:
- entrena **localmente**
- loguea métricas en MLflow
- registra el modelo con nombre `tacorth_tempmax`

> En MLflow/Databricks, pon el stage a **Production** (o usa la versión que prefieras).

## 2) API FastAPI
### Variables
- `MODEL_URI` (por defecto `models:/tacorth_tempmax/Production`)
- Para que la API pueda cargar desde Databricks, Render necesita:
  - `MLFLOW_TRACKING_URI=databricks`
  - `DATABRICKS_HOST=...`
  - `DATABRICKS_TOKEN=...`

### Ejecutar local
```bash
uvicorn app.main:app --reload
```
- Docs: `http://127.0.0.1:8000/docs`
- Health: `http://127.0.0.1:8000/health`

## 3) Despliegue en Render (Free)
- Crea un repo con estos archivos.
- En Render → New → Web Service:
  - Build Command: `pip install -r requirements.txt`
  - Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- Añade Environment Variables:
  - `MODEL_URI=models:/tacorth_tempmax/Production`
  - `MLFLOW_TRACKING_URI=databricks`
  - `DATABRICKS_HOST=...`
  - `DATABRICKS_TOKEN=...`

## 4) Cliente simple (Gradio)
```bash
export API_URL="https://<tu-app>.onrender.com"
python gradio_client.py
```
