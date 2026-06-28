import { supabase } from './supabase'

// A point in normalized canvas space (0..1 on both axes), so the drawer's phone
// maps onto the larger TV canvas as long as both use the same aspect ratio.
export interface Pt {
  x: number
  y: number
}

export interface StrokeMsg {
  id: string // stroke id (so the TV can append segments to the right stroke)
  color: string
  size: number // brush size as a fraction of canvas width
  points: Pt[]
}

export interface RoomChannel {
  sendSync: () => void
  sendStroke: (s: StrokeMsg) => void
  sendClear: () => void
  cleanup: () => void
}

// One broadcast channel per room. `sync` = "round state changed, refetch
// rounds_public". `stroke`/`clear` = ephemeral drawing events.
export function openRoomChannel(
  code: string,
  handlers: {
    onSync?: () => void
    onStroke?: (s: StrokeMsg) => void
    onClear?: () => void
  },
): RoomChannel {
  const channel = supabase.channel(`room:${code}`, {
    config: { broadcast: { self: false } },
  })

  channel
    .on('broadcast', { event: 'sync' }, () => handlers.onSync?.())
    .on('broadcast', { event: 'stroke' }, ({ payload }) => handlers.onStroke?.(payload as StrokeMsg))
    .on('broadcast', { event: 'clear' }, () => handlers.onClear?.())
    .subscribe()

  const send = (event: string, payload?: unknown) =>
    channel.send({ type: 'broadcast', event, payload: payload ?? {} })

  return {
    sendSync: () => send('sync'),
    sendStroke: (s) => send('stroke', s),
    sendClear: () => send('clear'),
    cleanup: () => {
      supabase.removeChannel(channel)
    },
  }
}
