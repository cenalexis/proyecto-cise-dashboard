# backend/app/routers/data.py
from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from app.services.loader import (
    df, agg_df, geojson_raw,
    agg_index, df_grouped_index,
    parse_percent_value, NUMERIC_KPIS
)

router = APIRouter()

# ---- Endpoints ----

@router.get("/cantones")
def listar_cantones():
    """
    Devuelve lista de cantones con nombre y canton_norm (útil para seleccionar)
    Ordena por nombre.
    """
    cantones = []
    # Preferimos agg_df para la lista (si existe)
    if "canton" in agg_df.columns:
        for _, row in agg_df.iterrows():
            cantones.append({
                "canton": row.get("canton"),
                "canton_norm": row.get("canton_norm")
            })
    else:
        # fallback desde geojson
        seen = set()
        for feat in geojson_raw.get("features", []):
            props = feat.get("properties", {})
            cn = props.get("canton_norm")
            name = props.get("DPA_DESCAN") or props.get("DPA_DESPRO") or props.get("CANTON")
            if cn and cn not in seen:
                seen.add(cn)
                cantones.append({"canton": name, "canton_norm": cn})
    # ordenar
    cantones = sorted(cantones, key=lambda x: (x["canton"] or "").upper())
    return JSONResponse(content=cantones)


@router.get("/mapa")
def mapa_geojson():
    """
    Devuelve el GeoJSON original (loja.geojson) SIN sobrescribir las propiedades
    pero cada feature ya tiene 'canton_norm' en properties (preparado en loader).
    """
    return JSONResponse(content=geojson_raw)


@router.get("/agg")
def obtener_agg():
    """
    Devuelve agg_df tal cual (útil para debug).
    """
    return JSONResponse(content=agg_df.to_dict(orient="records"))


@router.get("/agg/canton/{canton_norm}")
def agg_por_canton(canton_norm: str):
    """
    Devuelve la fila agregada para un canton_norm (normalizado)
    """
    key = canton_norm.strip().upper()
    row = agg_index.get(key)
    if not row:
        raise HTTPException(status_code=404, detail="Canton no encontrado en agg_df")
    return JSONResponse(content=row)


@router.get("/detalle/{variable}/canton/{canton_norm}")
def detalle_categorica(variable: str, canton_norm: str):
    """
    Devuelve conteos y porcentajes para variables categóricas en df:
      tenencia, fuente_agua, inodoro

    canton_norm: "ALL" o "0" o "nacional" -> devuelve nacional (todo df)
    """
    var = variable.strip()
    if var not in {"tenencia", "fuente_agua", "inodoro"}:
        raise HTTPException(status_code=400, detail=f"Variable no soportada. Usa: tenencia, fuente_agua, inodoro")

    key = canton_norm.strip().upper()
    if key in ("ALL", "0", "NACIONAL"):
        rows = [r for r in df.to_dict(orient="records")]
    else:
        rows = df_grouped_index.get(key, [])

    if not rows:
        # devolver estructura vacía con total 0
        return {"variable": var, "canton_norm": key, "total": 0, "conteos": {}, "porcentajes": {}}

    # conteos
    from collections import Counter
    vals = [r.get(var) or "No especificado" for r in rows]
    c = Counter(vals)
    total = sum(c.values())
    porcentajes = {k: round(v / total * 100, 2) for k, v in c.items()}
    return {"variable": var, "canton_norm": key, "total": total, "conteos": dict(c), "porcentajes": porcentajes}


@router.get("/kpis/canton/{canton_norm}")
def kpis_por_canton(canton_norm: str):
    """
    Devuelve los KPIs por las 3 dimensiones organizadas como solicitaste.
    Toma los valores desde agg_df usando las columnas EXACTAS que dijiste
    (incluyen % en los nombres).
    """
    key = canton_norm.strip().upper()
    # soporta nacional
    if key in ("ALL", "0", "NACIONAL"):
        # intentar encontrar fila nacional en agg_df
        row = None
        for _, r in agg_df.iterrows():
            if str(r.get("canton")).strip().upper() in ("NACIONAL", "PAIS", "ECUADOR", "0"):
                row = r.to_dict()
                break
        if row is None:
            # fallback: retornar promedios/None
            row = {}
    else:
        row = agg_index.get(key)
        if not row:
            raise HTTPException(status_code=404, detail="Canton no encontrado en agg_df")

    # Extraer KPIs usando los nombres exactos en agg_df
    def get_raw(col_name):
        # devuelve raw string si existe, o None
        return row.get(col_name) if row else None

    def get_num(col_name):
        # devuelve float si convertible
        raw = get_raw(col_name)
        return parse_percent_value(raw)

    vivienda = {
        "hacinamiento%": get_raw("hacinamiento%"),
        "deficit_hab%": get_raw("deficit_hab%"),
        "basura": get_raw("basura")
    }

    trabajo = {
        "desempleo%": get_raw("desempleo%"),
        "seguro%": get_raw("seguro%")
    }

    educacion = {
        "no_asis%": get_raw("no_asis%"),
        "prom_ed_sup": get_raw("prom_ed_sup"),
        "no_egb25%": get_raw("no_egb25%"),
        "no_edsup%": get_raw("no_edsup%")
    }

    # También entregamos versiones numéricas (float) en caso de que frontend quiera usar cálculos
    vivienda_num = {k: (get_num(k) if "%" in k or k in NUMERIC_KPIS else None) for k in vivienda.keys()}
    trabajo_num = {k: get_num(k) for k in trabajo.keys()}
    educacion_num = {k: get_num(k) for k in educacion.keys()}

    return {
        "canton_norm": key,
        "vivienda": vivienda,
        "vivienda_num": vivienda_num,
        "trabajo": trabajo,
        "trabajo_num": trabajo_num,
        "educacion": educacion,
        "educacion_num": educacion_num
    }
