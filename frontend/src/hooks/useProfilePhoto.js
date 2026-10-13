import { useCallback, useEffect, useState } from 'react'
export const PROFILE_PHOTO_KEY = 'nexfi.profile-photo'
const PROFILE_PHOTO_EVENT = 'nexfi:profile-photo'
const OUTPUT_SIZE = 320

// A real saved photo is an image data URL. Anything else (empty, damaged, or left over from something else) is ignored.
function isValidPhoto(value) {
    return typeof value === 'string' && value.startsWith('data:image/') && value.length > 200
}

function readStoredPhoto() {
    try {
        const stored = localStorage.getItem(PROFILE_PHOTO_KEY) || ''
        if (stored && !isValidPhoto(stored)) {
            localStorage.removeItem(PROFILE_PHOTO_KEY)
            return ''
        }
        return stored
    } catch {
        return ''
    }
}

// Crops the middle square of an image or webcam frame and shrinks it, so the saved photo stays small.
export function imageSourceToDataUrl(source, width, height) {
    const side = Math.min(width, height)
    if (!side) throw new Error('The image has no size')

    const canvas = document.createElement('canvas')
    canvas.width = OUTPUT_SIZE
    canvas.height = OUTPUT_SIZE
    const ctx = canvas.getContext('2d')

    // The webcam preview is shown mirrored, so the saved photo is mirrored too (what you see is what you get)
    if (typeof HTMLVideoElement !== 'undefined' && source instanceof HTMLVideoElement) {
        ctx.translate(OUTPUT_SIZE, 0)
        ctx.scale(-1, 1)
    }

    ctx.drawImage(source, (width - side) / 2, (height - side) / 2, side, side, 0, 0, OUTPUT_SIZE, OUTPUT_SIZE)

    const result = canvas.toDataURL('image/jpeg', 0.85)
    if (!isValidPhoto(result)) throw new Error('Could not create the photo')
    return result
}

export function fileToProfileDataUrl(file) {
    return new Promise((resolve, reject) => {
        if (!file.type.startsWith('image/')) {
            reject(new Error('Please choose an image file'))
            return
        }

        const url = URL.createObjectURL(file)
        const img = new Image()
        img.onload = () => {
            try {
                resolve(imageSourceToDataUrl(img, img.naturalWidth, img.naturalHeight))
            } catch (err) {
                reject(err)
            } finally {
                URL.revokeObjectURL(url)
            }
        }
        img.onerror = () => {
            URL.revokeObjectURL(url)
            reject(new Error('This image could not be read. Try a JPG or PNG'))
        }
        img.src = url
    })
}

// Returns { photo, save, remove }. Every component using it updates together when the photo changes.
export default function useProfilePhoto() {
    const [photo, setPhoto] = useState(readStoredPhoto)

    useEffect(() => {
        const sync = () => setPhoto(readStoredPhoto())
        window.addEventListener(PROFILE_PHOTO_EVENT, sync)
        window.addEventListener('storage', sync)
        return () => {
            window.removeEventListener(PROFILE_PHOTO_EVENT, sync)
            window.removeEventListener('storage', sync)
        }
    }, [])

    // Throws if the photo is invalid or the browser storage is full
    const save = useCallback((dataUrl) => {
        if (!isValidPhoto(dataUrl)) throw new Error('Invalid photo')
        localStorage.setItem(PROFILE_PHOTO_KEY, dataUrl)
        window.dispatchEvent(new Event(PROFILE_PHOTO_EVENT))
    }, [])

    const remove = useCallback(() => {
        try {
            localStorage.removeItem(PROFILE_PHOTO_KEY)
        } catch {
            // nothing to remove if storage is unavailable
        }
        window.dispatchEvent(new Event(PROFILE_PHOTO_EVENT))
    }, [])

    return { photo, save, remove }
}