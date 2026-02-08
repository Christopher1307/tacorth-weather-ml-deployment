import os
import numpy as np
import pandas as pd

import mlflow
import mlflow.sklearn
from mlflow.models.signature import infer_signature

from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

DATA_PATH = os.getenv("DATA_PATH", "dataset_limpio.csv")
EXPERIMENT_NAME = os.getenv("MLFLOW_EXPERIMENT_NAME", "/Shared/tacorth_tempmax")
REGISTERED_MODEL_NAME = os.getenv("REGISTERED_MODEL_NAME", "tacorth_tempmax")

# Para loguear en Databricks (tracking remoto) define:
#   MLFLOW_TRACKING_URI=databricks
# y exporta:
#   DATABRICKS_HOST=...
#   DATABRICKS_TOKEN=...
# Alternativa: usar un tracking server local (MLFLOW_TRACKING_URI=http://127.0.0.1:5000)
TRACKING_URI = os.getenv("MLFLOW_TRACKING_URI", "databricks")
mlflow.set_tracking_uri(TRACKING_URI)


def main():
    df = pd.read_csv(DATA_PATH)

    target = "temp_maximo"
    X = df.drop(columns=[target, "fecha_observacion"])
    y = df[target]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    num_cols = X.columns.tolist()

    preprocess = ColumnTransformer([
        ("num", Pipeline([
            ("imputer", SimpleImputer(strategy="median")),
            ("scaler", StandardScaler()),
        ]), num_cols)
    ])

    model = Pipeline([
        ("prep", preprocess),
        ("lr", LinearRegression())
    ])

    mlflow.set_experiment(EXPERIMENT_NAME)

    with mlflow.start_run(run_name="LinearRegression_Tacorth_TempMax") as run:
        model.fit(X_train, y_train)

        pred_test = model.predict(X_test)

        mae = mean_absolute_error(y_test, pred_test)
        mse = mean_squared_error(y_test, pred_test)
        rmse = float(np.sqrt(mse))
        r2 = r2_score(y_test, pred_test)

        mlflow.log_metric("mae", float(mae))
        mlflow.log_metric("mse", float(mse))
        mlflow.log_metric("rmse", rmse)
        mlflow.log_metric("r2", float(r2))

        signature = infer_signature(X_test, pred_test)
        input_example = X_test.iloc[:1].copy()

        # 1) Log del modelo como artefacto del RUN (siempre funciona)
        model_info = mlflow.sklearn.log_model(
            sk_model=model,
            artifact_path="model",
            signature=signature,
            input_example=input_example,
        )

        print("✅ Run:", run.info.run_id)
        print("✅ Metrics:", {"mae": float(mae), "rmse": float(rmse), "r2": float(r2)})
        print("✅ Model URI (para FastAPI):", model_info.model_uri)

        # 2) Intento opcional de registro en Model Registry (puede fallar por permisos)
        try:
            if REGISTERED_MODEL_NAME:
                mlflow.register_model(model_info.model_uri, REGISTERED_MODEL_NAME)
                print("✅ Registered model:", REGISTERED_MODEL_NAME)
        except Exception as e:
            print("⚠️ No se pudo registrar en Model Registry (permisos). Continuamos.")
            print("   Motivo:", type(e).__name__, str(e))


if __name__ == "__main__":
    main()
