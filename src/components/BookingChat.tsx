'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

interface Message {
  id: string
  sender_id: string
  body: string
  created_at: string
}

interface BookingChatProps {
  bookingId: string
  currentUserId: string
  isLocked: boolean
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export default function BookingChat({ bookingId, currentUserId, isLocked }: BookingChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [messageText, setMessageText] = useState('')
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const threadRef = useRef<HTMLDivElement>(null)

  const fetchMessages = useCallback(async () => {
    if (isLocked) return
    try {
      const res = await fetch(`/api/bookings/${bookingId}/messages`)
      if (res.ok) {
        const data = await res.json()
        if (!data.locked) setMessages(data.messages)
      }
    } catch {}
  }, [bookingId, isLocked])

  useEffect(() => {
    if (!open || isLocked) return
    fetchMessages()
    const interval = setInterval(fetchMessages, 15_000)
    return () => clearInterval(interval)
  }, [open, fetchMessages, isLocked])

  useEffect(() => {
    if (open && threadRef.current) {
      threadRef.current.scrollTop = threadRef.current.scrollHeight
    }
  }, [messages, open])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    const text = messageText.trim()
    if (!text || sending) return

    setSending(true)
    setSendError(null)

    try {
      const res = await fetch(`/api/bookings/${bookingId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: text }),
      })

      const data = await res.json()

      if (res.ok) {
        setMessages(prev => [...prev, data as Message])
        setMessageText('')
      } else {
        setSendError(data?.error ?? `Failed to send (${res.status})`)
      }
    } catch (err) {
      setSendError(err instanceof Error ? err.message : 'Network error — please try again.')
    } finally {
      setSending(false)
    }
  }

  if (isLocked) {
    return (
      <div className="mt-4 px-4 py-3 rounded-xl border border-border/40 bg-muted/20 flex items-center gap-2.5">
        <svg className="w-4 h-4 text-muted-foreground/50 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        <p className="text-[11px] text-muted-foreground">Chat unlocks after payment is confirmed.</p>
      </div>
    )
  }

  return (
    <div className="mt-4">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-primary hover:text-primary/80 transition-colors"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        {open ? 'Hide chat' : `Chat${messages.length > 0 ? ` (${messages.length})` : ''}`}
      </button>

      {open && (
        <div className="mt-3 border border-border/60 rounded-xl overflow-hidden bg-background/50">
          {/* Message thread */}
          <div ref={threadRef} className="max-h-[260px] overflow-y-auto p-4 flex flex-col gap-3">
            {messages.length === 0 ? (
              <p className="text-[12px] text-muted-foreground text-center py-6">No messages yet. Say hello!</p>
            ) : (
              messages.map(msg => {
                const isOwn = msg.sender_id === currentUserId
                return (
                  <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] rounded-xl px-3.5 py-2.5 ${
                      isOwn
                        ? 'bg-primary/15 border border-primary/20 text-foreground'
                        : 'bg-card/70 border border-border/50 text-foreground'
                    }`}>
                      <p className="text-[13px] leading-snug whitespace-pre-wrap break-words">{msg.body}</p>
                      <p className="text-[10px] text-muted-foreground/50 mt-1 text-right">{timeAgo(msg.created_at)}</p>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Error banner */}
          {sendError && (
            <div className="px-3 py-2 bg-red-500/10 border-t border-red-500/20 text-red-400 text-[11px]">
              {sendError}
            </div>
          )}

          {/* Input */}
          <form onSubmit={handleSend} className="flex gap-2 p-3 border-t border-border/40 bg-card/30">
            <input
              type="text"
              value={messageText}
              onChange={e => {
                setMessageText(e.target.value)
                if (sendError) setSendError(null)
              }}
              placeholder="Type a message…"
              className="flex-1 h-9 px-3 rounded-lg bg-background border border-border text-foreground text-[13px] focus:outline-none focus:border-primary/40 transition-colors placeholder:text-muted-foreground/30"
            />
            <button
              type="submit"
              disabled={sending || messageText.trim() === ''}
              className="px-4 h-9 bg-primary text-primary-foreground text-[11px] font-bold uppercase tracking-widest rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-40 flex-shrink-0"
            >
              {sending ? '…' : 'Send'}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
