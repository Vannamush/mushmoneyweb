import React from 'react';

export default function DonutChart({ data, size = 176, stroke = 24, centerTop, centerLabel }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  const radius = (size - stroke) / 2;
  const circ = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="hsl(var(--muted))" strokeWidth={stroke} />
        {total > 0 &&
          data.map((d, i) => {
            const len = (d.value / total) * circ;
            const seg = (
              <circle
                key={i}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={d.color}
                strokeWidth={stroke}
                strokeDasharray={`${len} ${circ - len}`}
                strokeDashoffset={-offset}
              />
            );
            offset += len;
            return seg;
          })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {centerTop && <span className="text-xl font-bold">{centerTop}</span>}
        {centerLabel && <span className="text-[10px] text-muted-foreground">{centerLabel}</span>}
      </div>
    </div>
  );
}