export default function DualMetricCard({
  title,
  leftLabel,
  rightLabel,
  leftValue,
  rightValue,
  suffix = "%"
}) {
  return (
    <div className="bg-white rounded-lg p-4 shadow">
      <div className="text-sm text-gray-600 mb-2">{title}</div>

      <div className="flex gap-2">
        <div className="flex-1 bg-gray-50 rounded p-3 text-center">
          {leftLabel}<br />
          <span className="text-2xl font-bold text-ciseViolet">{leftValue}{suffix}</span>
        </div>

        <div className="flex-1 bg-gray-50 rounded p-3 text-center">
          {rightLabel}<br />
          <span className="text-2xl font-bold text-ciseViolet">{rightValue}{suffix}</span>
        </div>
      </div>
    </div>
  );
}
