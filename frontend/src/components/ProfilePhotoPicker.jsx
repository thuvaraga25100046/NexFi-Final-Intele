import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Camera, ImagePlus, Trash2, UserRound, X } from 'lucide-react'
import useProfilePhoto, { fileToProfileDataUrl, imageSourceToDataUrl } from '../hooks/useProfilePhoto.js'

const MAX_FILE_BYTES = 8 * 1024 * 1024 // 8 MB before compression

export default function ProfilePhotoPicker({ name = '', onMessage = () => {} }) {
    const { photo, save, remove } = useProfilePhoto()
    const galleryInputRef = useRef(null)
    const cameraInputRef = useRef(null)
    const videoRef = useRef(null)
    const streamRef = useRef(null)

    const [cameraOpen, setCameraOpen] = useState(false)
    const [cameraError, setCameraError] = useState('')

    const initials = name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((p) => p[0].toUpperCase())
        .join('')

    const storePhoto = (dataUrl) => {
        try {
            save(dataUrl)
            onMessage('✓ Profile photo updated')
        } catch {
            onMessage('❌ Could not save photo (browser storage is full)')
        }
    }

    const handleFile = async (e) => {
        const file = e.target.files?.[0]
        e.target.value = ''
        if (!file) return
        if (file.size > MAX_FILE_BYTES) {
            onMessage('❌ Image is too large. Pick one under 8 MB')
            return
        }
        try {
            storePhoto(await fileToProfileDataUrl(file))
        } catch (err) {
            onMessage(`❌ ${err.message}`)
        }
    }

    // ---- Camera ----
    const stopStream = () => {
        streamRef.current?.getTracks().forEach((track) => track.stop())
        streamRef.current = null
    }

    const closeCamera = () => {
        stopStream()
        setCameraOpen(false)
        setCameraError('')
    }

    const handleTakePhoto = () => {
        const isTouchDevice = window.matchMedia?.('(pointer: coarse)').matches
        const canUseWebcam = !!navigator.mediaDevices?.getUserMedia

        // Phones/tablets: the native camera app opens straight away
        if (isTouchDevice || !canUseWebcam) {
            cameraInputRef.current?.click()
            return
        }
        // Desktop: live webcam preview popup
        setCameraError('')
        setCameraOpen(true)
    }

    useEffect(() => {
        if (!cameraOpen) return undefined
        let cancelled = false

        navigator.mediaDevices
            .getUserMedia({ video: { facingMode: 'user' }, audio: false })
            .then((stream) => {
                if (cancelled) {
                    stream.getTracks().forEach((t) => t.stop())
                    return
                }
                streamRef.current = stream
                if (videoRef.current) {
                    videoRef.current.srcObject = stream
                    videoRef.current.play().catch(() => {})
                }
            })
            .catch((err) => {
                if (cancelled) return
                setCameraError(
                    err?.name === 'NotAllowedError'
                        ? 'Camera permission was denied. Allow camera access in your browser and try again.'
                        : 'No camera found on this device.',
                )
            })

        return () => {
            cancelled = true
            stopStream()
        }
    }, [cameraOpen])

    const capture = () => {
        const video = videoRef.current
        if (!video || !video.videoWidth) return
        try {
            storePhoto(imageSourceToDataUrl(video, video.videoWidth, video.videoHeight))
        } finally {
            closeCamera()
        }
    }

    const handleRemove = () => {
        remove()
        onMessage('✓ Profile photo removed')
    }

    return (
        <div className="flex flex-col items-center gap-3 w-full">
            <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-indigo-200 dark:border-indigo-900 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-2xl font-extrabold">
                {photo ? (
                    <img src={photo} alt="Profile" className="w-full h-full object-cover" />
                ) : initials ? (
                    <span>{initials}</span>
                ) : (
                    <UserRound size={36} />
                )}
            </div>

            <div className="grid grid-cols-2 gap-2 w-full">
                <button
                    type="button"
                    onClick={() => galleryInputRef.current?.click()}
                    className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                >
                    <ImagePlus size={14} />
                    <span>From Gallery</span>
                </button>

                <button
                    type="button"
                    onClick={handleTakePhoto}
                    className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs flex items-center justify-center gap-1.5 hover:border-slate-400 transition-colors cursor-pointer"
                >
                    <Camera size={14} />
                    <span>Take Photo</span>
                </button>
            </div>

            {photo && (
                <button
                    type="button"
                    onClick={handleRemove}
                    className="text-rose-500 hover:text-rose-400 font-semibold text-[11px] flex items-center gap-1 cursor-pointer"
                >
                    <Trash2 size={12} />
                    <span>Remove photo</span>
                </button>
            )}

            {/* Gallery picker */}
            <input ref={galleryInputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
            {/* Native camera on phones (front camera) */}
            <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="user"
                className="hidden"
                onChange={handleFile}
            />

            {cameraOpen &&
                createPortal(
                    <div className="fixed inset-0 z-[90] bg-black/70 flex items-center justify-center p-4">
                        <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl p-4 space-y-3">
                            <div className="flex items-center justify-between">
                                <strong className="text-sm font-bold text-slate-900 dark:text-white">Take a profile photo</strong>
                                <button
                                    type="button"
                                    onClick={closeCamera}
                                    aria-label="Close camera"
                                    className="p-1 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            {cameraError ? (
                                <p className="text-xs text-rose-500 py-6 text-center">{cameraError}</p>
                            ) : (
                                <video
                                    ref={videoRef}
                                    playsInline
                                    muted
                                    className="w-full aspect-square object-cover rounded-xl bg-black [transform:scaleX(-1)]"
                                />
                            )}

                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={closeCamera}
                                    className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs cursor-pointer"
                                >
                                    Cancel
                                </button>
                                {!cameraError && (
                                    <button
                                        type="button"
                                        onClick={capture}
                                        className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-1.5 cursor-pointer"
                                    >
                                        <Camera size={13} />
                                        <span>Capture</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>,
                    document.body,
                )}
        </div>
    )
}