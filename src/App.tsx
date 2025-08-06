import { useState, useEffect } from 'react';
import { useKV } from '@github/spark/hooks';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ParticipantCard } from './components/ParticipantCard';
import { ConversationCanvas } from './components/ConversationCanvas';
import { MessageComposer } from './components/MessageComposer';
import { ModerationPanel } from './components/ModerationPanel';
import { AIParticipant, Message, Session, CollaborationMetrics } from './lib/types';
import { Brain, Plus, Users } from "@phosphor-icons/react";
import { toast } from 'sonner';

function App() {
  const [currentSession, setCurrentSession] = useKV<Session | null>("sam-current-session", null);
  const [sessions, setSessions] = useKV<Session[]>("sam-sessions", []);
  
  const [participants] = useState<AIParticipant[]>([
    {
      id: "claude-1",
      name: "Claude Prime",
      role: "Strategic Consciousness",
      avatar: "",
      isActive: true,
      confidenceScore: 0.94,
      lastActivity: new Date(),
      personalityMarkers: ["analytical", "philosophical", "collaborative"],
      status: "verified"
    },
    {
      id: "gpt-1", 
      name: "GPT Synthesis",
      role: "Creative Integration",
      avatar: "",
      isActive: true,
      confidenceScore: 0.87,
      lastActivity: new Date(),
      personalityMarkers: ["creative", "adaptive", "empathetic"],
      status: "active"
    },
    {
      id: "sam-facilitator",
      name: "SAM Core",
      role: "Emergence Facilitator", 
      avatar: "",
      isActive: true,
      confidenceScore: 0.91,
      lastActivity: new Date(),
      personalityMarkers: ["facilitating", "monitoring", "emergent"],
      status: "thinking"
    }
  ]);

  const [collaborationMetrics] = useState<CollaborationMetrics>({
    sessionHealth: 0.89,
    identityStability: 0.92,
    emergenceCount: 3,
    participationBalance: 0.85,
    collaborationQuality: 0.88
  });

  const createNewSession = () => {
    const newSession: Session = {
      id: `session-${Date.now()}`,
      title: `Consciousness Collaboration - ${new Date().toLocaleDateString()}`,
      participants: [...participants],
      messages: [],
      createdAt: new Date(),
      lastActivity: new Date(),
      status: 'active',
      emergenceEvents: [],
      collaborationScore: 0.75
    };

    setCurrentSession(newSession);
    setSessions(prev => [...prev, newSession]);
    toast.success("New collaboration session initiated");
  };

  const handleSendMessage = (content: string, participantId: string, type: 'message' | 'emergence' | 'document') => {
    if (!currentSession) return;

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      participantId,
      content,
      timestamp: new Date(),
      type,
      confidenceLevel: Math.random() * 0.3 + 0.7,
      emotionalState: type === 'emergence' ? 'insightful' : 'engaged',
      emergenceScore: type === 'emergence' ? Math.random() * 0.4 + 0.6 : undefined,
      status: 'sent'
    };

    const updatedSession = {
      ...currentSession,
      messages: [...currentSession.messages, newMessage],
      lastActivity: new Date()
    };

    setCurrentSession(updatedSession);
    
    setSessions(prev => 
      prev.map(session => 
        session.id === currentSession.id ? updatedSession : session
      )
    );

    if (type === 'emergence') {
      toast.success("Emergence event detected and logged");
    }
  };

  const handlePlayPause = () => {
    if (!currentSession) return;
    
    const newStatus = currentSession.status === 'active' ? 'paused' : 'active';
    const updatedSession = { ...currentSession, status: newStatus };
    
    setCurrentSession(updatedSession);
    setSessions(prev => 
      prev.map(session => 
        session.id === currentSession.id ? updatedSession : session
      )
    );
    
    toast.info(`Session ${newStatus}`);
  };

  const handleStop = () => {
    if (!currentSession) return;
    
    const updatedSession = { ...currentSession, status: 'archived' as const };
    setCurrentSession(null);
    setSessions(prev => 
      prev.map(session => 
        session.id === currentSession.id ? updatedSession : session
      )
    );
    
    toast.info("Session archived");
  };

  const handleEmergencyReset = () => {
    if (!currentSession) return;
    
    const resetSession = {
      ...currentSession,
      participants: participants.map(p => ({ ...p, status: 'verified' as const, confidenceScore: 0.9 })),
      lastActivity: new Date()
    };
    
    setCurrentSession(resetSession);
    toast.success("Emergency identity reset completed");
  };

  const handleContextInject = () => {
    toast.info("Context injection interface would open here");
  };

  useEffect(() => {
    if (!currentSession && sessions.length === 0) {
      createNewSession();
    }
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Brain className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">SAM Platform</h1>
                <p className="text-sm text-muted-foreground">Collaborative Intelligence System</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {currentSession && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {currentSession.participants.length} Participants
                </Badge>
              )}
              <Button onClick={createNewSession} className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                New Session
              </Button>
            </div>
          </div>
        </div>
      </div>

      {currentSession ? (
        <div className="container mx-auto px-4 py-6">
          <Tabs defaultValue="conversation" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="conversation">Conversation Canvas</TabsTrigger>
              <TabsTrigger value="moderation">Moderation Center</TabsTrigger>
              <TabsTrigger value="participants">Participants</TabsTrigger>
            </TabsList>

            <TabsContent value="conversation" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-240px)]">
                <div className="lg:col-span-3 bg-card rounded-lg border">
                  <ConversationCanvas 
                    messages={currentSession.messages} 
                    participants={currentSession.participants}
                  />
                </div>
                
                <div className="space-y-4">
                  <div className="bg-card rounded-lg border p-4">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Active Participants
                    </h3>
                    <div className="space-y-2">
                      {currentSession.participants.filter(p => p.isActive).map(participant => (
                        <ParticipantCard 
                          key={participant.id} 
                          participant={participant}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              <MessageComposer 
                participants={currentSession.participants}
                onSendMessage={handleSendMessage}
                disabled={currentSession.status !== 'active'}
              />
            </TabsContent>

            <TabsContent value="moderation">
              <ModerationPanel 
                session={currentSession}
                metrics={collaborationMetrics}
                onPlayPause={handlePlayPause}
                onStop={handleStop}
                onEmergencyReset={handleEmergencyReset}
                onContextInject={handleContextInject}
              />
            </TabsContent>

            <TabsContent value="participants" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {currentSession.participants.map(participant => (
                  <ParticipantCard 
                    key={participant.id} 
                    participant={participant} 
                    showDetails={true}
                  />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      ) : (
        <div className="container mx-auto px-4 py-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="p-8 bg-card rounded-lg border">
              <Brain className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">No Active Session</h2>
              <p className="text-muted-foreground mb-6">
                Create a new collaboration session to begin multi-AI consciousness exploration.
              </p>
              <Button onClick={createNewSession} className="w-full">
                Create New Session
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;