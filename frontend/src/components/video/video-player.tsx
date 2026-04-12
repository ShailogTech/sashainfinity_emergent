import { forwardRef } from 'react'
import { NativeVideoPlayer, type VideoPlayerHandle } from './native-video-player'
import { YouTubeExtractedPlayer } from './youtube-extracted-player'

interface VideoPlayerProps {
  src: string
  title?: string
  duration?: number
  poster?: string
  autoPlay?: boolean
  controls?: boolean
  className?: string
  onPlay?: () => void
  onPause?: () => void
  onEnded?: () => void
  onTimeUpdate?: (state: { played: number; playedSeconds: number }) => void
  onDuration?: (duration: number) => void
  lessonId?: number
  courseId?: number
}

/**
 * Detect if a URL is a YouTube URL
 */
export function isYouTubeUrl(url: string): boolean {
  if (!url) return false
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/shorts\/([^&\n?#]+)/
  ]
  return patterns.some(p => p.test(url))
}

/**
 * Smart video player wrapper that detects the video source type
 * and renders the appropriate player component.
 *
 * - YouTube URLs → YouTubeExtractedPlayer (extracts direct MP4 via backend, plays natively — no YouTube branding)
 * - Direct video files → NativeVideoPlayer (HTML5 <video>)
 */
export const VideoPlayer = forwardRef<VideoPlayerHandle, VideoPlayerProps>(
  function VideoPlayer({ src, title, poster, autoPlay, className, onPlay, onPause, onEnded, onTimeUpdate, onDuration, lessonId, courseId }, ref) {
    if (!src) {
      return (
        <div className={`flex items-center justify-center bg-black text-white/60 ${className ?? ''}`}>
          <div className="text-center p-8">
            <p className="text-lg font-medium mb-2">No Video Available</p>
            <p className="text-sm text-neutral-500">This lesson does not have a video attached.</p>
          </div>
        </div>
      )
    }

    // Bunny.net player URL → iframe embed
    if (src.includes('mediadelivery.net') || src.includes('b-cdn.net/play')) {
      return (
        <div className={`relative w-full h-full overflow-hidden bg-black ${className ?? ''}`} style={{ minHeight: '100%' }}>
          <iframe
            src={src}
            className="absolute"
            allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
            style={{ border: 'none', top: '50%', left: '50%', width: '100%', height: '100%', transform: 'translate(-50%, -50%)' }}
          />
        </div>
      )
    }
    // YouTube URL → extract direct stream via backend, play natively (no branding)
    if (isYouTubeUrl(src)) {
      return (
        <YouTubeExtractedPlayer
          ref={ref}
          src={src}
          title={title}
          poster={poster}
          autoPlay={autoPlay}
          className={className}
          onPlay={onPlay}
          onPause={onPause}
          onEnded={onEnded}
          onTimeUpdate={onTimeUpdate}
          onDuration={onDuration}
        />
      )
    }

    // Direct video file → native HTML5 player
    return (
      <NativeVideoPlayer
        ref={ref}
        src={src}
        title={title}
        poster={poster}
        autoPlay={autoPlay}
        className={className}
        onPlay={onPlay}
        onPause={onPause}
        onEnded={onEnded}
        onTimeUpdate={onTimeUpdate}
        onDuration={onDuration}
      />
    )
  }
)

// Re-export the handle type and the helper
export type { VideoPlayerHandle } from './native-video-player'