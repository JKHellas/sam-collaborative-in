import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Session, Message, EmergenceEvent, AIParticipant, ConversationThread } from "./types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Utility function to convert date strings back to Date objects after KV deserialization
export function deserializeSession(session: any): Session {
  if (!session) return session;
  
  return {
    ...session,
    createdAt: new Date(session.createdAt),
    lastActivity: new Date(session.lastActivity),
    participants: session.participants?.map((p: any) => ({
      ...p,
      lastActivity: new Date(p.lastActivity)
    })) || [],
    messages: session.messages?.map((m: any) => ({
      ...m,
      timestamp: new Date(m.timestamp)
    })) || [],
    threads: session.threads?.map((t: any) => ({
      ...t,
      createdAt: new Date(t.createdAt),
      lastActivity: new Date(t.lastActivity),
      messages: t.messages?.map((m: any) => ({
        ...m,
        timestamp: new Date(m.timestamp)
      })) || [],
      emergenceEvents: t.emergenceEvents?.map((e: any) => ({
        ...e,
        timestamp: new Date(e.timestamp)
      })) || []
    })) || [],
    emergenceEvents: session.emergenceEvents?.map((e: any) => ({
      ...e,
      timestamp: new Date(e.timestamp)
    })) || []
  };
}
