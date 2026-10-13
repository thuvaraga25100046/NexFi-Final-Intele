import { MAX_VALUE } from '../hooks/useLiveSeries.js'

const WIDTH = 520
const HEIGHT = 170

// Smooth curve through the points (Catmull-Rom converted to cubic Beziers)
function smoothPath(points) {
    let d = `M${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`
    for (let i = 0; i < points.length - 1; i += 1) {
        const p0 = points[i - 1] || points[i]
        const p1 = points[i]
        const p2 = points[i + 1]
        const p3 = points[i + 2] || p2
        const c1x = p1.x + (p2.x - p0.x) / 6
        const c1y = p1.y + (p2.y - p0.y) / 6
        const c2x = p2.x - (p3.x - p1.x) / 6
        const c2y = p2.y - (p3.y - p1.y) / 6
        d += ` C${c1x.toFixed(1)} ${c1y.toFixed(1)} ${c2x.toFixed(1)} ${c2y.toFixed(1)} ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`
    }
    return d
}

export default function LiveHeroChart({ values }) {
    const step = WIDTH / (values.length - 1)
    const points = values.map((v, i) => ({
        x: i * step,
        y: Math.min(HEIGHT - 2, Math.max(2, HEIGHT - (v / MAX_VALUE) * HEIGHT)),
    }))
    const line = smoothPath(points)
    const area = `${line} V${HEIGHT} H0Z`
    const last = points[points.length - 1]

    return (
        <div className="preview-chart" aria-hidden="true">
            <div className="chart-y-labels"><span>$30k</span><span>$20k</span><span>$10k</span><span>$0</span></div>
            <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} preserveAspectRatio="none">
                <defs>
                    <linearGradient id="chart-fill" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#8B5CF6" stopOpacity=".28" />
                        <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0" />
                    </linearGradient>
                </defs>
                <path d={area} fill="url(#chart-fill)" />
                <path
                    d={line}
                    fill="none"
                    stroke="#A78BFA"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="3"
                    vectorEffect="non-scaling-stroke"
                />
            </svg>

            {/* End dot with a pulsing ring (HTML so it never gets stretched by the SVG) */}
            <span
                className="absolute w-3 h-3 -translate-x-1/2 -translate-y-1/2"
                style={{ left: '100%', top: `${(last.y / HEIGHT) * 100}%` }}
            >
        <span className="absolute inset-0 rounded-full bg-violet-400/60 animate-ping" />
        <span className="absolute inset-0 rounded-full bg-violet-300 border-2 border-white" />
      </span>
        </div>
    )
}