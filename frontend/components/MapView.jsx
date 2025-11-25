"use client";

import { useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";

const L = typeof window !== "undefined" ? require("leaflet") : null;

export default function MapView({ geojson, onSelectFeature }) {
  const mapRef = useRef(null);
  const layerRef = useRef(null);

  useEffect(() => {
    if (!geojson || !L) return;

    // create map once
    if (!mapRef.current) {
      mapRef.current = L.map("map", {
        center: [-4.0, -79.2],
        zoom: 9,
        minZoom: 8,
        zoomControl: false,
        attributionControl: false,
        boxZoom: false,
        doubleClickZoom: false,
        dragging: true,
        scrollWheelZoom: false,
      });

      // ❌ NO tileLayer
      // ✅ Set background color manually
      const container = document.getElementById("map");
      if (container) {
        container.style.backgroundColor = "#f3e8ff"; // lila pastel
      }
    }

    // remove previous layer
    if (layerRef.current) {
      layerRef.current.remove();
      layerRef.current = null;
    }

    function highlightFeature(e) {
      const layer = e.target;
      layer.setStyle({
        weight: 2,
        color: "#444",
        fillOpacity: 0.2,
      });
    }

    function resetHighlight(e) {
      layerRef.current.resetStyle(e.target);
    }

    function onEachFeature(feature, layer) {
      layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: () => {
          onSelectFeature && onSelectFeature(feature.properties.DPA_CANTON);
        },
      });

      if (feature.properties) {
        const name =
          feature.properties.DPA_DESCAN ||
          feature.properties.DPA_DESPRO ||
          feature.properties.CANTON ||
          "";
        layer.bindTooltip(name, { direction: "center", permanent: false });
      }
    }

    function style(feature) {
      return {
        fillColor: "#c4b5fd", // lila claro
        weight: 1,
        opacity: 1,
        color: "#6f42c1", // borde violeta
        dashArray: "",
        fillOpacity: 0.7,
      };
    }

    layerRef.current = L.geoJSON(geojson, {
      style,
      onEachFeature,
    }).addTo(mapRef.current);

    try {
      mapRef.current.fitBounds(layerRef.current.getBounds(), {
        padding: [20, 20],
      });
    } catch (err) {}

    return () => {
      if (layerRef.current) {
        layerRef.current.remove();
        layerRef.current = null;
      }
    };
  }, [geojson]);

  return (
    <div
      id="map"
      className="w-full h-full rounded-lg shadow"
      style={{
        backgroundColor: "#f3e8ff", // lila pastel
        position: "relative",
        zIndex: 0,
      }}
    />
  );
}