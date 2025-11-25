"use client";

import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
ChartJS.register(ArcElement, Tooltip, Legend);

export default function PieChart({ dataObj, title }) {
  // dataObj: { label1: count1, label2: count2, ... }
  const labels = Object.keys(dataObj || {});
  const values = labels.map((k) => dataObj[k] || 0);

const palette = [
  "#6f42c1", // Violeta principal (CISE)
  "#f3e8ff", // Fondo lavanda pastel
  "#f59e0b", // Acento cálido (ámbar)
  "#10b981", // Acento verde (éxito)
  "#f43f5e", // Acento rojo (alerta)
  "#64748b", // Neutro gris azulado
];

  const data = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: palette.slice(0, labels.length),
        hoverOffset: 6
      }
    ]
  };

  return (
    <div className="bg-white rounded-lg p-3 shadow">
      <div className="text-sm text-gray-600 mb-2">{title}</div>
      <Pie data={data} />
    </div>
  );
}
