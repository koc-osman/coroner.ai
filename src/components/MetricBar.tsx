import type { ForensicFinding } from '@/lib/types';

interface MetricBarProps {
  finding: ForensicFinding;
}

const COLOR_MAP: Record<ForensicFinding['color'], string> = {
  red: '#E24B4A',
  amber: '#ef9f27',
  green: '#1D9E75',
};

export default function MetricBar({ finding }: MetricBarProps) {
  const barColor = COLOR_MAP[finding.color];

  return (
    <div className="flex items-center gap-3">
      {/* Label */}
      <div className="w-[45%] text-xs text-gray-600 leading-tight shrink-0">
        {finding.metric_name}
      </div>

      {/* Bar + score */}
      <div className="flex-1 flex items-center gap-2">
        <div className="flex-1 h-2.5 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${finding.score}%`, backgroundColor: barColor }}
          />
        </div>
        <div
          className="text-xs font-semibold tabular-nums w-6 text-right shrink-0"
          style={{ color: barColor }}
        >
          {finding.score}
        </div>
      </div>
    </div>
  );
}
