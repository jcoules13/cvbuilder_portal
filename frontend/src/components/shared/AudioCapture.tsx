import { useState, useRef, useCallback, useEffect } from 'react'
import { Loader2 } from 'lucide-react'

export interface AudioCaptureProps {
  onTranscription: (text: string) => void
  maxDuration?: number // seconds, default 120
  className?: string
  placeholder?: string
}

type State = 'idle' | 'recording' | 'sending' | 'error'

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0')
  const s = (seconds % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

/** Convert a Blob to a base64 string (without the data: prefix) */
async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      const result = reader.result as string
      // Strip "data:audio/webm;base64," prefix
      const base64 = result.split(',')[1]
      resolve(base64)
    }
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

export default function AudioCapture({
  onTranscription,
  maxDuration = 120,
  className = '',
  placeholder = 'Décrivez votre métier ou vos compétences...',
}: AudioCaptureProps) {
  const [state, setState] = useState<State>('idle')
  const [elapsed, setElapsed] = useState(0)
  const [errorMsg, setErrorMsg] = useState('')

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop())
    }
  }, [])

  const startRecording = useCallback(async () => {
    setErrorMsg('')
    setElapsed(0)

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm'

      const recorder = new MediaRecorder(stream, {
        mimeType,
        audioBitsPerSecond: 64000,
      })

      chunksRef.current = []
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      recorder.onstop = async () => {
        // Stop mic tracks
        stream.getTracks().forEach((t) => t.stop())
        streamRef.current = null

        const blob = new Blob(chunksRef.current, { type: mimeType })
        await sendForTranscription(blob)
      }

      recorder.start(1000)
      mediaRecorderRef.current = recorder
      setState('recording')

      // Start timer — auto-stop at maxDuration
      timerRef.current = setInterval(() => {
        setElapsed((prev) => {
          const next = prev + 1
          if (next >= maxDuration) {
            stopRecording()
          }
          return next
        })
      }, 1000)
    } catch (err: unknown) {
      const error = err as Error
      const msg =
        error?.name === 'NotAllowedError' || error?.message?.includes('Permission denied')
          ? "Impossible d'accéder au microphone. Vérifiez les permissions de votre navigateur."
          : "Impossible d'accéder au microphone : " + (error?.message || 'Erreur inconnue')
      setErrorMsg(msg)
      setState('error')
    }
  }, [maxDuration]) // eslint-disable-line react-hooks/exhaustive-deps

  const stopRecording = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== 'inactive'
    ) {
      mediaRecorderRef.current.stop()
    }
    // State will transition to 'sending' inside sendForTranscription
  }, [])

  const sendForTranscription = async (blob: Blob) => {
    setState('sending')
    setErrorMsg('')

    try {
      const base64 = await blobToBase64(blob)

      const webhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL || ''
      const endpoint = `${webhookUrl}/cv-builder-transcribe`

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audio: base64, format: 'webm' }),
      })

      if (!res.ok) {
        throw new Error(`Erreur serveur : ${res.status}`)
      }

      const data = await res.json()
      const text: string = data.text || data.transcription || ''

      if (!text.trim()) {
        throw new Error('Aucun texte transcrit reçu')
      }

      onTranscription(text.trim())
      setState('idle')
      setElapsed(0)
    } catch (err: unknown) {
      const error = err as Error
      setErrorMsg('Erreur de transcription : ' + (error?.message || 'Veuillez réessayer'))
      setState('error')
    }
  }

  const handleReset = () => {
    setState('idle')
    setElapsed(0)
    setErrorMsg('')
  }

  // ── IDLE ──────────────────────────────────────────────────────────────────
  if (state === 'idle') {
    return (
      <div className={`flex flex-wrap items-center gap-3 ${className}`}>
        {placeholder && (
          <p className="text-sm text-gray-500">{placeholder}</p>
        )}
        <button
          type="button"
          onClick={startRecording}
          className="flex items-center gap-2 py-2 px-4 text-sm font-semibold bg-primary-600 text-white rounded-xl hover:bg-primary-700 active:scale-95 transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
          aria-label="Commencer l'enregistrement vocal"
        >
          🎤 Parler
        </button>
        <span className="text-xs text-gray-400">max {Math.round(maxDuration / 60)} min</span>
      </div>
    )
  }

  // ── RECORDING ─────────────────────────────────────────────────────────────
  if (state === 'recording') {
    return (
      <div className={`flex flex-col items-center gap-4 ${className}`}>
        {/* Pulsing red indicator */}
        <div className="relative flex items-center justify-center w-20 h-20">
          <span className="absolute inline-flex w-full h-full rounded-full bg-red-400 opacity-60 animate-ping" />
          <span className="relative flex items-center justify-center w-16 h-16 bg-red-600 rounded-full text-white text-3xl shadow-lg">
            🎤
          </span>
        </div>

        {/* Timer */}
        <div className="text-2xl font-mono font-bold text-red-600" aria-live="polite" aria-atomic="true">
          {formatTime(elapsed)}
        </div>

        {/* Progress bar */}
        <div className="w-full max-w-xs h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-red-500 transition-all duration-1000"
            style={{ width: `${Math.min((elapsed / maxDuration) * 100, 100)}%` }}
          />
        </div>

        {/* Stop button */}
        <button
          type="button"
          onClick={stopRecording}
          className="flex items-center gap-3 px-8 py-4 bg-gray-800 text-white text-xl font-bold rounded-2xl hover:bg-gray-900 active:scale-95 transition-all shadow-md focus:outline-none focus:ring-4 focus:ring-gray-400"
          aria-label="Arrêter l'enregistrement"
        >
          ⏹ Arrêter
        </button>
      </div>
    )
  }

  // ── SENDING ───────────────────────────────────────────────────────────────
  if (state === 'sending') {
    return (
      <div className={`flex flex-col items-center gap-4 py-4 ${className}`}>
        <Loader2 className="w-10 h-10 animate-spin text-primary-600" />
        <p className="text-base font-semibold text-gray-700">Envoi en cours...</p>
        <p className="text-sm text-gray-400">La transcription peut prendre quelques secondes.</p>
      </div>
    )
  }

  // ── ERROR ─────────────────────────────────────────────────────────────────
  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      <div className="w-full p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm text-center">
        ⚠️ {errorMsg}
      </div>
      <button
        type="button"
        onClick={handleReset}
        className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors"
      >
        🎤 Réessayer
      </button>
    </div>
  )
}
