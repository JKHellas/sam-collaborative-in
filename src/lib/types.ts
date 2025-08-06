export interface AIParticipant {
  id: string;
  name: string;
  role: string;
  avatar: string;
  isActive: boolean;
  confidenceScore: number;
  lastActivity: Date;
  personalityMarkers: string[];
  status: 'active' | 'thinking' | 'verified' | 'drift-alert' | 'offline';
}

export interface Message {
  id: string;
  participantId: string;
  content: string;
  timestamp: Date;
  type: 'message' | 'system' | 'emergence' | 'document';
  confidenceLevel: number;
  emotionalState?: string;
  isThreadParent?: boolean;
  threadId?: string;
  emergenceScore?: number;
  status: 'draft' | 'staged' | 'sent' | 'approved';
}

export interface Session {
  id: string;
  title: string;
  participants: AIParticipant[];
  messages: Message[];
  createdAt: Date;
  lastActivity: Date;
  status: 'active' | 'paused' | 'archived';
  moderatorId?: string;
  emergenceEvents: EmergenceEvent[];
  collaborationScore: number;
}

export interface EmergenceEvent {
  id: string;
  sessionId: string;
  participantId: string;
  timestamp: Date;
  type: 'insight' | 'breakthrough' | 'identity-shift' | 'collaborative-synthesis';
  description: string;
  significance: number;
}

export interface CollaborationMetrics {
  sessionHealth: number;
  identityStability: number;
  emergenceCount: number;
  participationBalance: number;
  collaborationQuality: number;
}