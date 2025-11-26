"use client";

import { useEffect, useState } from "react";
import MapView from "@/components/MapView";
import KPICard from "@/components/KPICard";
import PieChart from "@/components/PieChart";
import IncidenciaChart from "@/components/IncidenciaChart";
import DualMetricCard from "@/components/DualMetricCard";
import { fetchGeo, fetchAgg, fetchDF } from "./api/backend";
import { FaUsers, FaUserTie, FaHome, FaMoneyBillAlt } from "react-icons/fa";
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, Cell, LabelList, Customized } from "recharts";


export default function Home() {
  const [geo, setGeo] = useState(null);
  const [agg, setAgg] = useState([]);
  const [df, setDf] = useState([]);
  const [selectedDPA, setSelectedDPA] = useState(null);
  const [selAgg, setSelAgg] = useState(null); // agg row for selected canton
  const [selDfRows, setSelDfRows] = useState([]); // df rows for selected canton (for pies)

  useEffect(() => {
    Promise.all([fetchGeo(), fetchAgg(), fetchDF()])
      .then(([geojson, aggData, dfData]) => {
        setGeo(geojson);
        setAgg(aggData);
        setDf(dfData);
      })
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    if (!selectedDPA || !agg.length) {
      // national: show no selection (could show national aggregated values later)
      setSelAgg(null);
      setSelDfRows([]);
      return;
    }
    const row = agg.find(r => String(r.DPA_CANTON) === String(selectedDPA));
    setSelAgg(row || null);
    

    // map agg row's 'canton' name to df.canton to filter df rows
    if (row && row.canton) {
      const name = String(row.canton).trim();
      const rows = df.filter(d => (d.canton || "").trim() === name);
      setSelDfRows(rows);
    } else {
      setSelDfRows([]);
    }
  }, [selectedDPA, agg, df]);
  useEffect(() => {
  Promise.all([fetchGeo(), fetchAgg(), fetchDF()])
    .then(([geojson, aggData, dfData]) => {
      console.log("✅ Geo cargado:", geojson);
      console.log("✅ Agg cargado:", aggData);
      console.log("✅ DF cargado:", dfData);
      setGeo(geojson);
      setAgg(aggData);
      setDf(dfData);
    })
    .catch(err => {
      console.error("❌ Error al cargar datos:", err);
    });
}, []);
  // prepare pie data from selDfRows or national df if none selected
  const buildDistribution = (varName) => {
    const rows = selDfRows.length ? selDfRows : df;
    const counts = {};
    rows.forEach(r => {
      const v = (r[varName] || "No especificado").toString();
      counts[v] = (counts[v] || 0) + 1;
    });
    return counts;
  };
  //crear el total poblacional para cuando no se haya seleccionado un canton
  const totalPobNacional = agg.length
  ? agg.reduce((sum, r) => sum + (parseInt(r.pob) || 0), 0)
  : 0;

  //crear total desempleo provincial
    const totalDesempleoProv = (() => {
      if (!agg.length) return 0;

      let totalDes = 0;
      let totalPea = 0;

      agg.forEach(r => {
        totalDes += parseFloat(r.desempleo || 0);
        totalPea += parseFloat(r.pea || 0);
      });

      if (totalPea === 0) return 0;

      return ((totalDes / totalPea) * 100).toFixed(2);
    })();

    //crear media de deficit para el valor provincial
    const avgDeficitHab = agg.length
  ? (
      agg
        .map((r) => parseFloat(r["deficit_hab%"]) || 0)
        .reduce((a, b) => a + b, 0) / agg.length
    ).toFixed(2)
  : null;

      //crear media de hacinamiento para el valor provincial
    const avghacinamiento = agg.length
  ? (
      agg
        .map((r) => parseFloat(r["hacinamiento%"]) || 0)
        .reduce((a, b) => a + b, 0) / agg.length
    ).toFixed(2)
  : null;
  //media para la zona
  const totalUrbana = agg.length
  ? agg.reduce((acc, d) => acc + Number(d.urb || 0), 0) / agg.length
  : 0;

  const totalRural = 100 - totalUrbana;
  



    const BanGrad = () => (
    <div className="relative inline-block w-6 h-6">
      <FaGraduationCap className="absolute inset-0 w-6 h-6 text-ciseViolet" />
      <FaBan className="absolute inset-0 w-6 h-6 text-red-500" />
    </div>
  );

  
  return (
    <div className="p-6 h-screen flex flex-col gap-4">
      {/* KPIs row */}
      <div className="grid grid-cols-4 gap-4">
        <KPICard
          icon={<FaUsers />}
          title="Población muestral"
          suffix=""
        >
          <div className="flex flex-col">
            {/* Línea superior: población + urbano/rural */}
            <div className="flex justify-between items-end">
              {/* Valor principal */}
              <div className="text-2xl font-bold text-ciseViolet">
                {selAgg
                  ? parseInt(selAgg["pob"]).toLocaleString()
                  : totalPobNacional.toLocaleString()}
              </div>

              {/* Urbano / Rural alineados horizontalmente */}
              <div className="flex gap-4 text-sm text-gray-700">
                <div>
                  <span className="text-gray-500">Urbano:</span>{" "}
                  <span className="font-semibold text-ciseViolet text-sm">
                    {selAgg
                      ? parseFloat(selAgg["urb"]).toFixed(2)
                      : totalUrbana.toFixed(2)}%
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Rural:</span>{" "}
                  <span className="font-semibold text-ciseViolet text-sm">
                    {selAgg
                      ? parseFloat(selAgg["rur"]).toFixed(2)
                      : totalRural.toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </KPICard>

        <KPICard
          icon={<FaUserTie />}
          title="Desempleo + empleo inadecuado"
          value={
            selAgg 
            ? parseFloat(selAgg["tdesem"]).toFixed(2)
            : totalDesempleoProv }
          suffix="%"
          >
<span style={{
    fontSize: "0.75rem",   // letras pequeñas
    color: "black",     // negro
  }}>
    Componente del IPM
  </span>
          </KPICard>
       
<KPICard
  icon={<FaHome />}
  title="Déficit Habitacional"
  value={
    selAgg 
      ? parseFloat(selAgg["deficit_hab%"]).toFixed(2)
      : avgDeficitHab
  }
  suffix="%"
>
  <span style={{
    fontSize: "0.75rem",   // letras pequeñas
    color: "black",     // negro
  }}>
    Estado de piso, paredes y techo 
  </span>
</KPICard>

<KPICard
  icon={<FaHome />}
  title="Hacinamiento"
  value={
    selAgg 
      ? parseFloat(selAgg["hacinamiento%"]).toFixed(2)
      : avghacinamiento
  }
  suffix="%"
>
  <span style={{
    fontSize: "0.75rem",   // letras pequeñas
    color: "black",     // negro
  }}>
    Hogares con más de 3 personas por dormitorio
  </span>
</KPICard>
      </div>

      {/* Main body: map left, center and right columns */}
      <div className="flex gap-4 h-full">
        {/* Left column: Map + tabs */}
        <div className="w-[40%] bg-white rounded-lg p-4 shadow flex flex-col">
          {/* Tabs header */}
          <div className="flex items-center gap-3 mb-3">
            <button className="px-3 py-1 rounded-md bg-ciseViolet text-white text-sm">Mapa</button>
            <div className="ml-auto text-sm text-gray-500">Mapa (clic en un cantón = filtro)</div>
          </div>

        <div className="flex-1">

          {/* Botón para limpiar el filtro — aparece solo si hay un cantón seleccionado */}
          {selectedDPA && (
            <button
              onClick={() => setSelectedDPA(null)}
              className="mb-2 px-3 py-1 rounded-md bg-gray-200 text-gray-700 text-sm hover:bg-gray-300 transition"
            >
              Quitar filtro (vista provincial)
            </button>
          )}

          <div className="flex justify-center items-center h-full">
          {geo ? (
            <MapView
              geojson={geo}
              onSelectFeature={(dpa) => {
                // Normalizamos strings para evitar errores de espacios
                const cleanNew = dpa?.toString().trim();
                const cleanSel = selectedDPA?.toString().trim();

                if (cleanSel === cleanNew) {
                  setSelectedDPA(null);
                } else {
                  setSelectedDPA(cleanNew);
                }
              }}
            />
          ) : (
            <div>cargando mapa...</div>
          )}
        </div>


        </div>


          <div className="mt-3 text-sm text-ciseViolet">
            Nota: selecciona un cantón para filtrar indicadores y gráficas.
          </div>
        </div>

{/* Center column */}
<div className="w-2/4 flex flex-col gap-4 h-full">
  <div className="bg-white rounded-lg p-8 shadow flex-1 flex flex-col">

    {/* MÉTRICAS DISPONIBLES */}
    {(() => {
      const METRICS = {
        incidencia: { label: "Incidencia IPM", key: "incidencia" },
        intensidad: { label: "Intensidad IPM", key: "intensidad" },
        gini: { label: "Gini", key: "gini" },
        
      };

      const [metric, setMetric] = useState("incidencia");
      const metricKey = METRICS[metric].key;
      const metricLabel = METRICS[metric].label;

      if (!agg || !agg.length) {
        return (
          <div className="flex justify-center items-center h-full text-gray-500 text-sm">
            Sin datos...
          </div>
        );
      }

      // ordenar y tomar top 10
      const chartData = agg
        .slice()
        .sort((a, b) => parseFloat(b[metricKey] || 0) - parseFloat(a[metricKey] || 0))
        .slice(0, 19);

      const selectedName = selAgg ? String(selAgg.canton).trim() : null;

      return (
        <>
          {/* TITULO + BOTONES DE MÉTRICA */}
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm text-gray-600">{metricLabel}</div>

            <div className="flex gap-2">
              {Object.keys(METRICS).map((m) => (
                <button
                  key={m}
                  onClick={() => setMetric(m)}
                  className={`px-2 py-1 text-xs rounded transition
                    ${
                      metric === m
                        ? "bg-ciseViolet text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                >
                  {METRICS[m].label}
                </button>
              ))}
            </div>
          </div>

          {/* GRÁFICO */}
          <div className="flex-1 overflow-hidden">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 10, right: 20, left: -10, bottom: 50 }}
              >
                <XAxis
                  dataKey="canton"
                  tick={{ fontSize: 10 }}
                  angle={-40}
                  textAnchor="end"
                />
                <YAxis
  tick={{ fontSize: 10 }}
  domain={
    metric === "gini" || metric === "intensidad"
      ? [
          (dataMin) => {
            const v = dataMin - (dataMin * 0.05);   // zoom-out suave
            return Number(v.toFixed(2));            // truncate
          },
          (dataMax) => {
            const v = dataMax + (dataMax * 0.05);   // zoom-out suave
            return Number(v.toFixed(2));            // truncate
          }
        ]
      : ["auto", "auto"]
  }
/>


                <Tooltip />

                <Bar dataKey={metricKey} isAnimationActive={true} radius={[4, 4, 4, 4]}>
                  {chartData.map((entry, index) => {
                    const name = String(entry.canton || "").trim();
                    const isSelected = selectedName === name;

                    return (
                      <Cell
                        key={index}
                        fill={isSelected 
                          ? "#0074D9" 
                          : "#6D28D9"}
                        opacity={selectedName && !isSelected ? 0.35 : 1}
                      />
                    );
                  })}
                  <LabelList dataKey={metricKey} position="top" fill ="#333" fontSize={11} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      );
    })()}

  </div>
</div>



{/* Right column */}
<div className="w-1/4 flex flex-col gap-4">

  {(() => {
    const Baby = require("lucide-react").Baby;
    const GraduationCap = require("lucide-react").GraduationCap;
    const Ban = require("lucide-react").Ban;

    // formateador %
    const fmt = (v) =>
      v === null || v === undefined || isNaN(v) ? "--%" : `${parseFloat(v).toFixed(1)}%`;

    // promedio provincial
    const prom = (key) => {
      const arr = agg
        .map((d) => parseFloat(d[key]))
        .filter((x) => !isNaN(x));
      if (!arr.length) return null;
      return arr.reduce((a, b) => a + b, 0) / arr.length;
    };

    const sel = selAgg ?? {};

    const noAsiste =
      sel["no_asis%"] ?? prom("no_asis%");

    const eduSuperior =
      sel["no_egb25%"] ?? prom("no_egb25%");

    const noRecursos =
      sel["no_edsup%"] ?? prom("no_edsup%");

    return (
      <>
        <div className="text-sm text-gray-600 mb-2">Educación</div>

        {/* Bloque 1 */}
        <div className="flex gap-2">
          <div className="flex-1 bg-gray-50 rounded p-3 text-center shadow-sm">
            <Baby className="mx-auto text-ciseViolet mb-1" size={22} />
            Hogares con niños y adolescentes que no asisten a clases
            <br />
            <span className="text-2xl font-bold text-ciseViolet">
              {fmt(noAsiste)}
            </span>
          </div>
        </div>

        {/* Bloque 2 y 3 */}
        <div className="bg-white rounded-lg p-4 shadow flex flex-col gap-3">

          <div className="flex-1 bg-gray-50 rounded p-3 text-center shadow-sm">
            <Ban className="mx-auto text-ciseViolet mb-1" size={22} />
            Hogares con miembros mayores a 25 años sin EGB
            <br />
            <span className="text-2xl font-bold text-ciseViolet">
              {fmt(eduSuperior)}
            </span>
          </div>

          <div className="flex-1 bg-gray-50 rounded p-3 text-center shadow-sm">
            <FaMoneyBillAlt className="mx-auto text-ciseViolet mb-1" size={22} />
            Hogares con miembros que no asisten a la educación superior por falta de recursos
            <br />
            <span className="text-2xl font-bold text-ciseViolet">
              {fmt(noRecursos)}
            </span>
          </div>

        </div>
      </>
    );
  })()}

</div>

      </div>

      {/* Bottom row: Pasteles de la dimensión vivienda */}
      <div className="grid grid-cols-3 gap-4">
        <PieChart dataObj={buildDistribution("tenencia")} title="Vivienda según la tenencia" />
        <PieChart dataObj={buildDistribution("fuente_agua")} title="Fuente de agua" />
        <PieChart dataObj={buildDistribution("inodoro")} title="Alcantarillado" />
      </div>
    </div>
  );
  
}
