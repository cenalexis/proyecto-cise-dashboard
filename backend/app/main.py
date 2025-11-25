# backend/main.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import json
from pathlib import Path

app = FastAPI()

# ----------------------------------------------------
#   CORS PARA QUE EL FRONTEND SE PUEDA CONECTAR
# ----------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # en producción puedes restringir el dominio
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------------------------------------------
#   RUTAS DE ARCHIVOS
# ----------------------------------------------------
BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"

DF_PATH = DATA_DIR / "df.csv"
AGG_PATH = DATA_DIR / "agg_df.csv"
GEO_PATH = DATA_DIR / "loja.geojson"

# ----------------------------------------------------
#   CARGA DE ARCHIVOS
# ----------------------------------------------------
try:
    df = pd.read_csv(DF_PATH, dtype=str)
    agg_df = pd.read_csv(AGG_PATH, dtype=str)
except Exception as e:
    raise RuntimeError(f"Error cargando CSV: {e}")

try:
    with open(GEO_PATH, "r", encoding="utf-8") as f:
        geojson = json.load(f)
except Exception as e:
    raise RuntimeError(f"Error cargando GeoJSON: {e}")


# ----------------------------------------------------
#   ENDPOINT: GEOJSON (mapa)
# ----------------------------------------------------
@app.get("/geo")
def get_geojson():
    return geojson


# ----------------------------------------------------
#   ENDPOINT: DF INDIVIDUAL (para pie charts)
# ----------------------------------------------------
@app.get("/df")
def get_df():
    try:
        # Reemplaza todos los NaN reales (float) y NaN como string por None
        clean_df = df.where(pd.notna(df), None).replace({"nan": None, "NaN": None})
        return clean_df.to_dict(orient="records")
    except Exception as e:
        print("❌ Error en /df:", e)
        raise HTTPException(status_code=500, detail="Error interno en /df")

# ----------------------------------------------------
#   ENDPOINT: AGG_DF (para KPIs y porcentajes)
# ----------------------------------------------------
@app.get("/agg")
def get_agg():
    return agg_df.to_dict(orient="records")


# ----------------------------------------------------
#   ENDPOINT: OBTENER INDICADORES POR CANTÓN
# ----------------------------------------------------
@app.get("/agg/{canton_id}")
def get_agg_by_canton(canton_id: str):
    row = agg_df[agg_df["DPA_CANTON"] == canton_id]

    if row.empty:
        raise HTTPException(status_code=404, detail="Cantón no encontrado")

    return row.iloc[0].to_dict()


# ----------------------------------------------------
#   ENDPOINT: LISTA DE CANTONES (para dropdowns, etc.)
# ----------------------------------------------------
@app.get("/cantones")
def listar_cantones():
    return sorted(agg_df["DPA_CANTON"].unique().tolist())
