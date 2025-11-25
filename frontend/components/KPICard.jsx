export default function KPICard({ icon, title, value, suffix, children }) {
  return (
    <div className="bg-white rounded-lg p-4 shadow flex flex-col justify-between">
      <div className="flex items-center gap-2 mb-2">
        <div className="text-ciseViolet text-xl">{icon}</div>
        <div className="text-sm font-semibold">{title}</div>
      </div>
      <div className="text-2xl font-bold text-ciseViolet">
        {value}{suffix}
      </div>

      {/* Contenido adicional */}
      {children && (
        <div className="mt-2 text-sm text-gray-600">
          {children}
        </div>
      )}
    </div>
  );
}