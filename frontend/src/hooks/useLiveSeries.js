import { useEffect, useRef, useState } from 'react'

export const POINTS = 14
export const MAX_VALUE = 30000 // top of the chart ($30k line)
const BASELINE = 22700 // "start of month" balance used for the % change pill

// Starting shape of the line (dollars), ends at $24,560.80
const INITIAL = [6200, 8600, 9400, 8300, 10800, 11600, 14300, 13100, 16800, 19200, 18600, 22400, 21800, 24560.8]

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v))

// A new random "target" shape: sometimes the line ends higher, sometimes lower
function makeTarget() {
    const goingUp = Math.random() > 0.38
    const endValue = goingUp ? 24500 + Math.random() * 4000 : 19500 + Math.random() * 4000
    const startValue = 4500 + Math.random() * 2500
    const phase = Math.random() * 6

    const values = Array.from({ length: POINTS }, (_, i) => {
        const t = i / (POINTS - 1)
        const trend = startValue + (endValue - startValue) * t ** 1.15
        const wave = Math.sin(t * Math.PI * 3 + phase) * 1500 * (1 - t * 0.6)
        return clamp(trend + wave, 1500, 29000)
    })
    values[POINTS - 1] = endValue
    return values
}

export default function useLiveSeries({ intervalMs = 2800, easeMs = 450 } = {}) {
    const reduceMotion =
        typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

    const [values, setValues] = useState(INITIAL)
    const [balance, setBalance] = useState(INITIAL[POINTS - 1])
    const current = useRef(INITIAL.slice())
    const target = useRef(INITIAL.slice())

    useEffect(() => {
        if (reduceMotion) return undefined

        let raf = 0
        let last = performance.now()
        let nextTargetAt = last + 1800
        let lastLabelAt = 0

        const frame = (now) => {
            const dt = Math.min(now - last, 50)
            last = now

            if (now >= nextTargetAt) {
                target.current = makeTarget()
                nextTargetAt = now + intervalMs
            }

            // Exponential easing: every point glides towards its target
            const k = 1 - Math.exp(-dt / easeMs)
            const cur = current.current
            const tgt = target.current
            for (let i = 0; i < POINTS; i += 1) cur[i] += (tgt[i] - cur[i]) * k

            setValues(cur.slice())

            // The number label updates a bit slower so the digits stay readable
            if (now - lastLabelAt > 120) {
                lastLabelAt = now
                setBalance(cur[POINTS - 1])
            }

            raf = requestAnimationFrame(frame)
        }

        raf = requestAnimationFrame(frame)
        return () => cancelAnimationFrame(raf)
    }, [reduceMotion, intervalMs, easeMs])

    const change = ((balance - BASELINE) / BASELINE) * 100
    return { values, balance, change }
}