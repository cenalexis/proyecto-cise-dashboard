const BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export async function fetchGeo() {
  const res = await fetch(`${BASE}/geo`);
  if (!res.ok) throw new Error("Error fetching geo");
  return res.json();
}

export async function fetchAgg() {
  const res = await fetch(`${BASE}/agg`);
  if (!res.ok) throw new Error("Error fetching agg");
  return res.json();
}

export async function fetchDF() {
  const res = await fetch(`${BASE}/df`);
  if (!res.ok) throw new Error("Error fetching df");
  return res.json();
}

export async function fetchAggById(dpa) {
  const res = await fetch(`${BASE}/agg/${dpa}`);
  if (!res.ok) throw new Error("No agg canton");
  return res.json();
}
