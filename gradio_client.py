import os
import requests
import gradio as gr

API_URL = os.getenv("API_URL", "http://127.0.0.1:8000")

def call_predict(fecha_observacion, hum_maximo, hum_media, hum_minimo,
                 rad_maximo, rad_total, rain_total,
                 temp_media, temp_minimo,
                 wsp_maximo, wsp_media, wsp_minimo):
    payload = {
        "fecha_observacion": str(fecha_observacion),
        "hum_maximo": hum_maximo,
        "hum_media": hum_media,
        "hum_minimo": hum_minimo,
        "rad_maximo": rad_maximo,
        "rad_total": rad_total,
        "rain_total": rain_total,
        "temp_media": temp_media,
        "temp_minimo": temp_minimo,
        "wsp_maximo": wsp_maximo,
        "wsp_media": wsp_media,
        "wsp_minimo": wsp_minimo,
    }
    r = requests.post(f"{API_URL.rstrip('/')}/predict", json=payload, timeout=15)
    if r.status_code != 200:
        return f"Error {r.status_code}: {r.text}"
    data = r.json()
    return f"temp_maximo_pred: {data['temp_maximo_pred']:.2f} °C  |  model_uri: {data.get('model_uri','')}"

with gr.Blocks(title="Cliente Tacorth TempMax") as demo:
    gr.Markdown("# Cliente simple (Gradio) — /predict")
    gr.Markdown("Introduce la fecha y variables meteorológicas y consulta la predicción al endpoint `/predict`.")

    with gr.Row():
        fecha_observacion = gr.Date(label="fecha_observacion")
        hum_maximo = gr.Number(label="hum_maximo")
        hum_media = gr.Number(label="hum_media")
        hum_minimo = gr.Number(label="hum_minimo")

    with gr.Row():
        rad_maximo = gr.Number(label="rad_maximo")
        rad_total = gr.Number(label="rad_total")
        rain_total = gr.Number(label="rain_total")

    with gr.Row():
        temp_media = gr.Number(label="temp_media")
        temp_minimo = gr.Number(label="temp_minimo")
        wsp_maximo = gr.Number(label="wsp_maximo")
        wsp_media = gr.Number(label="wsp_media")
        wsp_minimo = gr.Number(label="wsp_minimo")

    btn = gr.Button("Predecir")
    out = gr.Textbox(label="Respuesta")
    btn.click(call_predict, inputs=[fecha_observacion, hum_maximo, hum_media, hum_minimo,
                                   rad_maximo, rad_total, rain_total,
                                   temp_media, temp_minimo,
                                   wsp_maximo, wsp_media, wsp_minimo], outputs=out)

demo.launch()
