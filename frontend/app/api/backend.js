// frontend/app/api/backend.js
import Papa from "papaparse";

// --- GEOJSON ---
export async function fetchGeo() {
  const res = await fetch("/data/loja.geojson");
  if (!res.ok) throw new Error("Error fetching local geojson");
  return res.json();
}

// --- CSV: AGG ---
export async function fetchAgg() {
  const res = await fetch("/data/agg_df.csv");
  if (!res.ok) throw new Error("Error fetching local agg csv");
  const text = await res.text();

  const parsed = Papa.parse(text, {
    header: true,
    skipEmptyLines: true,
  });

  return parsed.data; // array de objetos
}

// --- CSV: DF ---
export async function fetchDF() {
  const res = await fetch("/data/df.csv");
  if (!res.ok) throw new Error("Error fetching local df csv");
  const text = await res.text();

  const parsed = Papa.parse(text, {
    header: true,
    skipEmptyLines: true,
  });

  return parsed.data;
}

// --- AGG POR ID ---
export async function fetchAggById(dpa) {
  const agg = await fetchAgg();
  return agg.find(
    (row) => String(row.DPA_CANTON).trim() === String(dpa).trim()
  );
}

