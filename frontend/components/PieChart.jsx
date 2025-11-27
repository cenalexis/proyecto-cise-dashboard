"use client";

import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";

ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

export default function PieChart({ dataObj, title }) {
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
        hoverOffset: 6,
      },
    ],
  };

  const options = {
    plugins: {
      datalabels: {
        display: false, // 👈 esto oculta las etiquetas dentro del pastel
      },
      legend: {
        labels: {
          generateLabels: (chart) => {
            const dataset = chart.data.datasets[0];
            const total = dataset.data.reduce((a, b) => a + b, 0);
            return chart.data.labels.map((label, i) => {
              const value = dataset.data[i];
              const percentage = ((value / total) * 100).toFixed(1);
              return {
                text: `${label} (${percentage}%)`,
                fillStyle: dataset.backgroundColor[i],
                strokeStyle: "#fff",
                lineWidth: 1,
                hidden: false,
                index: i,
              };
            });
          },
        },
      },
    },
  };

  return (
    <div className="bg-white rounded-lg p-3 shadow">
      <div className="text-sm text-gray-600 mb-2">{title}</div>
      <Pie data={data} options={options} />
    </div>
  );
}