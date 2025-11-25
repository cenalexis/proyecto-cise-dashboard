"use client";

import { useState, useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  CartesianGrid
} from "recharts";

export default function IncidenciaChart({
  agg = [],
  selectedCanton = null,
  showAll = true,
  topN = 10
}) {
  const [metric, setMetric] = useState("incidencia");

  const METRICS = {
    incidencia: { label: "Incidencia", key: "incidencia" },
    gini: { label: "Gini", key: "gini" },
    intensidad: { label: "Intensidad", key: "intensidad" }
  };

  const metricKey = METRICS[metric].key;
  const metricLabel = METRICS[metric].label;

  const chartData = useMemo(() => {
    if (!agg || !agg.length) return [];

    const processed = agg.map((r) => {
      const val = parseFloat(r[metricKey]);
      return { ...r, __metricVal: Number.isFinite(val) ? val : 0 };
    });

    processed.sort((a, b) => b.__metricVal - a.__metricVal);

    return showAll ? processed : processed.slice(0, topN);
  }, [agg, metricKey, showAll, topN]);

  const cleanedSelected = selectedCanton ? String(selectedCanton).trim() : null;

  if (!agg || !agg.length) {
    return (
      <div className="bg-white rounded-lg p-8 shadow flex-1">
        <div className="text-sm text-gray-600 mb-2">Incidencia</div>
        <div className="flex justify-center items-center h-40 text-gray-500">Sin datos…</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-6 shadow flex flex-col flex-none">
      {/* encabezado */}
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm text-gray-600">{metricLabel}</div>
        <div className="flex gap-2">
          {Object.keys(METRICS).map((m) => (
            <button
              key={m}
              onClick={() => setMetric(m)}
              className={`px-2 py-1 text-xs rounded transition
                ${metric === m ? "bg-ciseViolet text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
            >
              {METRICS[m].label}
            </button>
          ))}
        </div>
      </div>

      {/* gráfico: tamaño original (≈260px) */}
      <div className="w-full h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={chartData}
            margin={{ top: 5, right: 20, bottom: 5, left: 100 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
            <XAxis type="number" tick={{ fontSize: 11 }} />
            <YAxis
              type="category"
              dataKey="canton"
              width={100}
              tick={{ fontSize: 11 }}
            />
            <Tooltip formatter={(v) => (typeof v === "number" ? v.toFixed(2) : v)} />

            <Bar dataKey="__metricVal" radius={[6, 6, 6, 6]}>
              {chartData.map((row, idx) => {
                const name = String(row.canton || "").trim();
                const isSelected = cleanedSelected === name;

                return (
                  <Cell
                    key={`c-${idx}`}
                    fill={isSelected ? "#6D28D9" : "#C4B5FD"}
                    opacity={cleanedSelected && !isSelected ? 0.35 : 1}
                  />
                );
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
