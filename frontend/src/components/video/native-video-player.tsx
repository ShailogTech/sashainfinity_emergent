import React, { useRef, useState, useEffect, useImperativeHandle, forwardRef, useCallback } from 'react'
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getMediaUrl } from '@/utils/media'
import Hls from 'hls.js'

export interface VideoPlayerHandle {
    play: () => void
    pause: () => void
    seekTo: (seconds: number) => void
    getCurrentTime: () => number
    getDuration: () => number
}

interface NativeVideoPlayerProps {
    src: string
    title?: string
    poster?: string
    autoPlay?: boolean
    className?: string
    onPlay?: () => void
    onPause?: () => void
    onEnded?: () => void
    onTimeUpdate?: (state: { played: number; playedSeconds: number }) => void
    onDuration?: (duration: number) => void
}

export const NativeVideoPlayer = forwardRef<VideoPlayerHandle, NativeVideoPlayerProps>(
    function NativeVideoPlayer(
        { src, title, poster, autoPlay = false, className = '', onPlay, onPause, onEnded, onTimeUpdate, onDuration },
        ref
    ) {
        const videoRef = useRef<HTMLVideoElement>(null)
        const containerRef = useRef<HTMLDivElement>(null)
        const [isPlaying, setIsPlaying] = useState(false)
        const [currentTime, setCurrentTime] = useState(0)
        const [duration, setDuration] = useState(0)
        const [volume, setVolume] = useState(1)
        const [isMuted, setIsMuted] = useState(false)
        const [isFullscreen, setIsFullscreen] = useState(false)
        const [showControls, setShowControls] = useState(true)
        const hideControlsTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

        // Resolve the src URL through media utilities
        const resolvedSrc = getMediaUrl(src)

        // HLS setup for .m3u8 streams (Bunny CDN, etc.)
        useEffect(() => {
            const video = videoRef.current
            if (!video || !resolvedSrc) return
            if (!resolvedSrc.includes('.m3u8')) return

            let hls: Hls | null = null
            if (Hls.isSupported()) {
                hls = new Hls({ enableWorker: true, maxBufferLength: 30 })
                hls.loadSource(resolvedSrc)
                hls.attachMedia(video)
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = resolvedSrc
            }
            return () => hls?.destroy()
        }, [resolvedSrc])

        // Expose imperative API
        useImperativeHandle(ref, () => ({
            play: () => { videoRef.current?.play() },
            pause: () => { videoRef.current?.pause() },
            seekTo: (seconds: number) => {
                if (videoRef.current) {
                    videoRef.current.currentTime = Math.max(0, Math.min(seconds, videoRef.current.duration || Infinity))
                }
            },
            getCurrentTime: () => videoRef.current?.currentTime ?? 0,
            getDuration: () => videoRef.current?.duration ?? 0,
        }), [])

        // Auto-hide controls
        const resetHideTimer = useCallback(() => {
            setShowControls(true)
            if (hideControlsTimer.current) clearTimeout(hideControlsTimer.current)
            if (isPlaying) {
                hideControlsTimer.current = setTimeout(() => setShowControls(false), 3000)
            }
        }, [isPlaying])

        useEffect(() => {
            return () => { if (hideControlsTimer.current) clearTimeout(hideControlsTimer.current) }
        }, [])

        // Event handlers
        const handlePlay = () => { setIsPlaying(true); onPlay?.(); resetHideTimer() }
        const handlePause = () => { setIsPlaying(false); onPause?.(); setShowControls(true) }
        const handleEnded = () => { setIsPlaying(false); onEnded?.() }

        const handleTimeUpdate = () => {
            if (!videoRef.current) return
            const t = videoRef.current.currentTime
            const d = videoRef.current.duration || 0
            setCurrentTime(t)
            onTimeUpdate?.({ played: d > 0 ? t / d : 0, playedSeconds: t })
        }

        const handleLoadedMetadata = () => {
            if (!videoRef.current) return
            const d = videoRef.current.duration
            setDuration(d)
            onDuration?.(d)
        }

        const togglePlay = () => {
            if (!videoRef.current) return
            videoRef.current.paused ? videoRef.current.play() : videoRef.current.pause()
        }

        const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
            const newTime = parseFloat(e.target.value)
            setCurrentTime(newTime)
            if (videoRef.current) videoRef.current.currentTime = newTime
        }

        const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const v = parseFloat(e.target.value)
            setVolume(v)
            setIsMuted(v === 0)
            if (videoRef.current) { videoRef.current.volume = v; videoRef.current.muted = v === 0 }
        }

        const toggleMute = () => {
            if (!videoRef.current) return
            const newMuted = !isMuted
            setIsMuted(newMuted)
            videoRef.current.muted = newMuted
            if (!newMuted && volume === 0) { setVolume(0.5); videoRef.current.volume = 0.5 }
        }

        const toggleFullscreen = async () => {
            try {
                if (!document.fullscreenElement) {
                    await containerRef.current?.requestFullscreen()
                    setIsFullscreen(true)
                } else {
                    await document.exitFullscreen()
                    setIsFullscreen(false)
                }
            } catch (err) { console.warn('Fullscreen not supported:', err) }
        }

        // Listen for fullscreen changes (user pressing Esc etc.)
        useEffect(() => {
            const handler = () => setIsFullscreen(!!document.fullscreenElement)
            document.addEventListener('fullscreenchange', handler)
            return () => document.removeEventListener('fullscreenchange', handler)
        }, [])

        const formatTime = (s: number) => {
            if (!isFinite(s)) return '0:00'
            const m = Math.floor(s / 60)
            const sec = Math.floor(s % 60)
            return `${m}:${sec.toString().padStart(2, '0')}`
        }

        // Progress percentage for the custom range track
        const progressPct = duration > 0 ? (currentTime / duration) * 100 : 0

        return (
            <div
                ref={containerRef}
                className={`relative bg-black w-full h-full group ${className}`}
                onMouseMove={resetHideTimer}
                onMouseLeave={() => isPlaying && setShowControls(false)}
                onContextMenu={(e) => { e.preventDefault(); return false }}
            >
                {/* Native video element */}
                <video
                    ref={videoRef}
                    src={resolvedSrc}
                    poster={poster}
                    autoPlay={autoPlay}
                    playsInline
                    preload="metadata"
                    className="w-full h-full object-contain"
                    onPlay={handlePlay}
                    onPause={handlePause}
                    onEnded={handleEnded}
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={handleLoadedMetadata}
                    onClick={togglePlay}
                    style={{ cursor: 'pointer' }}
                />

                {/* Center play button when paused */}
                {!isPlaying && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <button
                            onClick={togglePlay}
                            className="pointer-events-auto w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/40 flex items-center justify-center hover:bg-white/30 transition-all hover:scale-110"
                        >
                            <Play className="w-10 h-10 text-white ml-1" />
                        </button>
                    </div>
                )}

                {/* Controls overlay */}
                <div
                    className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent px-4 pb-3 pt-10 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
                        }`}
                >
                    {/* Progress bar */}
                    <div className="mb-2 relative">
                        <input
                            type="range"
                            min={0}
                            max={duration || 100}
                            step={0.1}
                            value={currentTime}
                            onChange={handleSeek}
                            className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                            style={{
                                background: `linear-gradient(to right, #7c3aed ${progressPct}%, rgba(255,255,255,0.3) ${progressPct}%)`
                            }}
                        />
                    </div>

                    {/* Control buttons row */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" onClick={togglePlay} className="text-white hover:bg-white/20 h-8 w-8">
                                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                            </Button>

                            <Button variant="ghost" size="icon" onClick={toggleMute} className="text-white hover:bg-white/20 h-8 w-8">
                                {isMuted || volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                            </Button>

                            <input
                                type="range"
                                min={0}
                                max={1}
                                step={0.05}
                                value={isMuted ? 0 : volume}
                                onChange={handleVolumeChange}
                                className="w-16 h-1 bg-white/30 rounded-full appearance-none cursor-pointer"
                            />

                            <span className="text-white/80 text-xs ml-2 font-mono select-none">
                                {formatTime(currentTime)} / {formatTime(duration)}
                            </span>
                        </div>

                        <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" onClick={toggleFullscreen} className="text-white hover:bg-white/20 h-8 w-8">
                                {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
)
