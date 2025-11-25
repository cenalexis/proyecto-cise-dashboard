"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell
} from "recharts";

export default function SmallBarChart({
  data,
  selectedCanton,
  selectedMetric
}) {
  const HEIGHT = 200; // altura compacta

  return (
    <div className="w-full overflow-x-auto p-2 border rounded-xl bg-white shadow-sm">
      <div style={{ width: `${data.length * 70}px`, height: HEIGHT }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 10, right: 10, left: 0, bottom: 40 }}
          >
            <XAxis
              dataKey="canton"
              angle={-45}
              textAnchor="end"
              interval={0}
              height={50}
              style={{ fontSize: "10px" }}
            />
            <YAxis
              width={40}
              style={{ fontSize: "11px" }}
            />
            <Tooltip />

            <Bar dataKey={selectedMetric} radius={[6, 6, 0, 0]}>
              {data.map((item, index) => (
                <Cell
                  key={index}
                  fill={
                    item.canton === selectedCanton
                      ? "#2563eb" // azul destacado
                      : "rgba(37, 99, 235, 0.3)"
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
