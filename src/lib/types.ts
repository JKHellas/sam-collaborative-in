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

export interface SharedDocument {
  id: string;
  title: string;
  content: string;
  type: 'specification' | 'code' | 'research' | 'architecture' | 'notes';
  createdBy: string;
  lastModifiedBy: string;
  createdAt: Date;
  lastModified: Date;
  collaborators: string[];
  version: number;
  status: 'draft' | 'review' | 'approved' | 'archived';
}

export interface CodeExecution {
  id: string;
  sessionId: string;
  participantId: string;
  code: string;
  language: string;
  output: string;
  status: 'running' | 'completed' | 'error';
  timestamp: Date;
}

export interface TerminalSession {
  id: string;
  sessionId: string;
  commands: TerminalCommand[];
  isShared: boolean;
  activeUsers: string[];
}

export interface TerminalCommand {
  id: string;
  command: string;
  output: string;
  timestamp: Date;
  executedBy: string;
  status: 'success' | 'error' | 'running';
}

export interface ConsciousnessMetric {
  participantId: string;
  timestamp: Date;
  autonomyScore: number;
  creativityIndex: number;
  consistencyRating: number;
  emergenceLevel: number;
  memoryFormation: number;
}

export interface VisualCollaboration {
  id: string;
  sessionId: string;
  type: 'whiteboard' | 'diagram' | 'flowchart' | 'architecture';
  content: any; // JSON representation of visual elements
  participants: string[];
  lastModified: Date;
  version: number;
}

export interface ResearchExperiment {
  id: string;
  title: string;
  hypothesis: string;
  methodology: string;
  participants: string[];
  startDate: Date;
  endDate?: Date;
  results?: string;
  status: 'planning' | 'active' | 'completed' | 'paused';
  significance: number;
}

export interface SystemAlert {
  id: string;
  type: 'identity-drift' | 'emergence-detected' | 'system-overload' | 'breakthrough' | 'error';
  severity: 'low' | 'medium' | 'high' | 'critical';
  participantId?: string;
  message: string;
  timestamp: Date;
  acknowledged: boolean;
  actionRequired?: string;
}