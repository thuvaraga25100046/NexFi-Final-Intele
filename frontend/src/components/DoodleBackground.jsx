import { useMemo } from 'react'

// Size of one repeating tile (px). Items are spread irregularly so the repeat is hard to notice.
const TILE = 520

const EMOJI_FONT = "'Segoe UI Emoji','Apple Color Emoji','Noto Color Emoji',sans-serif"
const SYMBOL_FONT = "Georgia,'Times New Roman',serif"

// [glyph, x, y, fontSize, rotation, kind]  kind: 'emoji' | 'symbol'
const DOODLES = [
    ['💵', 44, 70, 34, -14, 'emoji'],
    ['💰', 200, 42, 38, 10, 'emoji'],
    ['💳', 362, 92, 32, -8, 'emoji'],
    ['🪙', 98, 200, 30, 18, 'emoji'],
    ['📈', 268, 182, 34, -6, 'emoji'],
    ['💸', 450, 226, 34, 12, 'emoji'],
    ['🏦', 36, 344, 36, -10, 'emoji'],
    ['🧾', 184, 322, 30, 14, 'emoji'],
    ['💶', 346, 366, 32, -16, 'emoji'],
    ['💹', 466, 468, 32, 8, 'emoji'],
    ['💷', 118, 480, 30, 6, 'emoji'],
    ['🤝', 282, 482, 30, -12, 'emoji'],
    ['💴', 480, 70, 28, 10, 'emoji'],
    ['$', 150, 128, 42, -12, 'symbol'],
    ['€', 410, 28, 36, 14, 'symbol'],
    ['£', 322, 270, 38, -10, 'symbol'],
    ['¥', 62, 268, 36, 12, 'symbol'],
    ['₹', 238, 410, 34, -14, 'symbol'],
    ['Rs', 462, 346, 24, 10, 'symbol'],
    ['%', 16, 440, 30, -8, 'symbol'],
    ['$', 392, 170, 30, 16, 'symbol'],
]

// Hand-drawn style dashed coin circles
const COINS = [
    [120, 40, 14],
    [330, 196, 11],
    [20, 150, 10],
    [220, 250, 12],
    [430, 400, 13],
    [150, 372, 9],
]

function buildTileSvg() {
    const items = DOODLES.map(([glyph, x, y, size, rotate, kind]) => {
        const isEmoji = kind === 'emoji'
        return (
            `<text x="${x}" y="${y}" font-size="${size}" text-anchor="middle" dominant-baseline="central" ` +
            `transform="rotate(${rotate} ${x} ${y})" ` +
            (isEmoji
                ? `font-family="${EMOJI_FONT}">`
                : `font-family="${SYMBOL_FONT}" font-weight="700" fill="#818cf8">`) +
            `${glyph}</text>`
        )
    })

    const coins = COINS.map(
        ([x, y, r]) =>
            `<circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="#818cf8" stroke-width="2" stroke-dasharray="3 4" />`,
    )

    return (
        `<svg xmlns="http://www.w3.org/2000/svg" width="${TILE}" height="${TILE}" viewBox="0 0 ${TILE} ${TILE}">` +
        coins.join('') +
        items.join('') +
        `</svg>`
    )
}

export default function DoodleBackground() {
    const backgroundImage = useMemo(() => `url("data:image/svg+xml,${encodeURIComponent(buildTileSvg())}")`, [])

    return (
        <div
            aria-hidden="true"
            className="fixed inset-0 z-0 pointer-events-none select-none opacity-[0.06] dark:opacity-[0.07]"
            style={{ backgroundImage, backgroundSize: `${TILE}px ${TILE}px` }}
        />
    )
}