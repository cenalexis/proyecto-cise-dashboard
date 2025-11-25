# backend/app/services/loader.py
from pathlib import Path
import pandas as pd
import json
import re

BASE = Path(__file__).resolve().parent.parent
DATA_DIR = BASE / "data"

# --- Helpers ---
def normalize_name(s):
    if s is None:
        return None
    return str(s).strip().upper()

def parse_percent_value(x):
    """
    Convierte valores que pueden ser:
      - número (float/int)
      - string "12.34" -> 12.34
      - string "12.34%" -> 12.34
    Retorna float o None si no convertible.
    """
    if x is None:
        return None
    try:
        if isinstance(x, (int, float)):
            return float(x)
        s = str(x).strip()
        # quitar espacios, comas de miles y %
        s = s.replace(",", "")
        if s.endswith("%"):
            s = s[:-1].strip()
        if s == "":
            return None
        return float(s)
    except Exception:
        return None

# --- Cargar df (detalle) ---
DF_PATH = DATA_DIR / "df.csv"
df = pd.read_csv(DF_PATH, dtype=str)  # cargamos como strings y procesamos según se necesite
# Normalizar nombres de canton en df
if "canton" in df.columns:
    df["canton_norm"] = df["canton"].apply(normalize_name)
else:
    df["canton_norm"] = None

# --- Cargar agg_df (agregado) ---
AGG_PATH = DATA_DIR / "agg_df.csv"
agg_df = pd.read_csv(AGG_PATH, dtype=str)  # mantenemos nombres exactos (incluyen %)

# Normalizar canton y preparar columnas numéricas para KPIs
if "canton" in agg_df.columns:
    agg_df["canton_norm"] = agg_df["canton"].apply(normalize_name)
else:
    agg_df["canton_norm"] = None

# Intentar parsear valores porcentuales (si los valores en agg_df usan % en la celda)
# Creamos una copia numérica para uso interno (no cambiar nombres originales)
NUMERIC_KPIS = [
    "hacinamiento%", "deficit_hab%", "basura",
    "desempleo%", "seguro%", "no_asis%",
    "prom_ed_sup", "no_egb25%", "no_edsup%"
]

for col in NUMERIC_KPIS:
    if col in agg_df.columns:
        agg_df[f"_num__{col}"] = agg_df[col].apply(parse_percent_value)
    else:
        agg_df[f"_num__{col}"] = None

# --- Cargar GeoJSON ---
GEO_PATH = DATA_DIR / "loja.geojson"
with open(GEO_PATH, "r", encoding="utf-8") as f:
    geojson_raw = json.load(f)

# Normalizar nombres dentro de geojson features for join:
# Se espera que en properties exista DPA_DESCAN o DPA_DESPRO o similar (nombre del cantón)
# Generamos para cada feature una clave 'canton_norm' con nombre normalizado
for feat in geojson_raw.get("features", []):
    props = feat.get("properties", {})
    # intentar varios campos de nombre (según ejemplos previos)
    name_candidates = [
        props.get("DPA_DESCAN"),
        props.get("DPA_DESPRO"),
        props.get("DPA_DESCA"),
        props.get("CANTON"),
        props.get("NOM_CAN")  # fallback
    ]
    chosen = None
    for c in name_candidates:
        if c:
            chosen = c
            break
    feat_props_norm = normalize_name(chosen)
    # guardamos normalizado para join con agg_df/df
    props["canton_norm"] = feat_props_norm
    feat["properties"] = props

# --- Índices para búsquedas rápidas ---
# Map: canton_norm -> agg row (dict)
agg_index = {}
for _, row in agg_df.iterrows():
    key = row.get("canton_norm")
    if key:
        agg_index[key] = row.to_dict()

# Map: canton_norm -> list of rows (for df)
df_grouped_index = {}
if "canton_norm" in df.columns:
    for _, row in df.iterrows():
        key = row.get("canton_norm")
        df_grouped_index.setdefault(key, []).append(row.to_dict())

# Exportar
__all__ = [
    "df", "agg_df", "geojson_raw",
    "agg_index", "df_grouped_index",
    "parse_percent_value", "NUMERIC_KPIS"
]
