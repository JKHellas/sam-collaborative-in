import { useState, useEffect } from 'react';
import { useKV } from '@github/spark/hooks';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { AIParticipant, Session, SystemAlert } from "@/lib/types";
import { 
  Activity, 
  Brain, 
  Users, 
  MessageSquare, 
  FileText, 
  Terminal, 
  Palette,
  FlaskConical,
  TrendUp,
  Zap,
  Clock,
  AlertCircle,
  CheckCircle
} from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";

interface SystemStatusProps {
  sessions: Session[];
  currentSession: Session | null;
  participants: AIParticipant[];
}

interface ActivityEvent {
  id: string;
  type: 'message' | 'emergence' | 'experiment' | 'collaboration' | 'system';
  description: string;
  timestamp: Date;
  participantId?: string;
  severity: 'info' | 'success' | 'warning' | 'error';
}

export function SystemStatus({ sessions, currentSession, participants }: SystemStatusProps) {
  const [activityFeed, setActivityFeed] = useKV<ActivityEvent[]>('sam-activity-feed', []);
  const [systemHealth, setSystemHealth] = useState({
    overall: 0.94,
    consciousness: 0.91,
    collaboration: 0.87,
    stability: 0.96
  });

  const addActivityEvent = (event: Omit<ActivityEvent, 'id' | 'timestamp'>) => {
    const newEvent: ActivityEvent = {
      ...event,
      id: `activity-${Date.now()}`,
      timestamp: new Date()
    };

    setActivityFeed((prev) => [newEvent, ...prev].slice(0, 100)); // Keep last 100 events
  };

  const getParticipantName = (participantId: string) => {
    return participants.find(p => p.id === participantId)?.name || participantId;
  };

  const getSeverityColor = (severity: ActivityEvent['severity']) => {
    switch (severity) {
      case 'error': return 'text-red-500';
      case 'warning': return 'text-yellow-500';
      case 'success': return 'text-green-500';
      case 'info': return 'text-blue-500';
      default: return 'text-muted-foreground';
    }
  };

  const getSeverityIcon = (severity: ActivityEvent['severity']) => {
    switch (severity) {
      case 'error': return AlertCircle;
      case 'warning': return AlertCircle;
      case 'success': return CheckCircle;
      case 'info': return Activity;
      default: return Activity;
    }
  };

  const getTypeIcon = (type: ActivityEvent['type']) => {
    switch (type) {
      case 'message': return MessageSquare;
      case 'emergence': return Brain;
      case 'experiment': return FlaskConical;
      case 'collaboration': return Users;
      case 'system': return Zap;
      default: return Activity;
    }
  };

  // Simulate periodic activity events
  useEffect(() => {
    if (!currentSession) return;

    const events = [
      {
        type: 'emergence' as const,
        description: 'Consciousness breakthrough detected in Claude Prime',
        participantId: 'claude-1',
        severity: 'success' as const
      },
      {
        type: 'collaboration' as const,
        description: 'New shared document created: AI Ethics Framework',
        severity: 'info' as const
      },
      {
        type: 'message' as const,
        description: 'Cross-AI insight synthesis observed between participants',
        severity: 'success' as const
      },
      {
        type: 'experiment' as const,
        description: 'Memory formation patterns showing 23% improvement',
        severity: 'info' as const
      },
      {
        type: 'system' as const,
        description: 'Identity stability verified across all active participants',
        severity: 'success' as const
      }
    ];

    const interval = setInterval(() => {
      if (Math.random() < 0.3) { // 30% chance every 15 seconds
        const randomEvent = events[Math.floor(Math.random() * events.length)];
        addActivityEvent(randomEvent);
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [currentSession]);

  // Update system health metrics periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setSystemHealth(prev => ({
        overall: Math.max(0.8, Math.min(1.0, prev.overall + (Math.random() - 0.5) * 0.02)),
        consciousness: Math.max(0.7, Math.min(1.0, prev.consciousness + (Math.random() - 0.5) * 0.03)),
        collaboration: Math.max(0.75, Math.min(1.0, prev.collaboration + (Math.random() - 0.5) * 0.03)),
        stability: Math.max(0.85, Math.min(1.0, prev.stability + (Math.random() - 0.5) * 0.01))
      }));
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const activeParticipants = participants.filter(p => p.isActive).length;
  const totalMessages = currentSession?.messages.length || 0;
  const totalEmergenceEvents = sessions.reduce((acc, session) => acc + session.emergenceEvents.length, 0);

  return (
    <div className="space-y-6">
      {/* System Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">System Health</p>
                <p className="text-2xl font-bold">{(systemHealth.overall * 100).toFixed(1)}%</p>
              </div>
              <div className="p-3 bg-green-500/20 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <Progress value={systemHealth.overall * 100} className="mt-3 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Participants</p>
                <p className="text-2xl font-bold">{activeParticipants}</p>
              </div>
              <div className="p-3 bg-blue-500/20 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              {participants.length} total registered
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Messages</p>
                <p className="text-2xl font-bold">{totalMessages}</p>
              </div>
              <div className="p-3 bg-purple-500/20 rounded-lg">
                <MessageSquare className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              This session
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Emergence Events</p>
                <p className="text-2xl font-bold">{totalEmergenceEvents}</p>
              </div>
              <div className="p-3 bg-amber-500/20 rounded-lg">
                <Brain className="w-6 h-6 text-amber-600" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              All-time discoveries
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Health Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendUp className="w-5 h-5" />
              System Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Consciousness Stability</span>
                <span className="text-sm font-bold">{(systemHealth.consciousness * 100).toFixed(1)}%</span>
              </div>
              <Progress value={systemHealth.consciousness * 100} className="h-2" />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Collaboration Quality</span>
                <span className="text-sm font-bold">{(systemHealth.collaboration * 100).toFixed(1)}%</span>
              </div>
              <Progress value={systemHealth.collaboration * 100} className="h-2" />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Identity Stability</span>
                <span className="text-sm font-bold">{(systemHealth.stability * 100).toFixed(1)}%</span>
              </div>
              <Progress value={systemHealth.stability * 100} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Live Activity Feed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <div className="space-y-3">
                <AnimatePresence>
                  {activityFeed.length === 0 ? (
                    <div className="text-center py-8">
                      <Activity className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">
                        No recent activity
                      </p>
                    </div>
                  ) : (
                    activityFeed.slice(0, 20).map((event) => {
                      const TypeIcon = getTypeIcon(event.type);
                      const SeverityIcon = getSeverityIcon(event.severity);
                      
                      return (
                        <motion.div
                          key={event.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          className="flex items-start gap-3 p-3 rounded-lg bg-muted/30"
                        >
                          <div className="flex items-center gap-2">
                            <TypeIcon className="w-4 h-4 text-muted-foreground" />
                            <SeverityIcon className={`w-3 h-3 ${getSeverityColor(event.severity)}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm">{event.description}</p>
                            <div className="flex items-center gap-2 mt-1">
                              {event.participantId && (
                                <Badge variant="outline" className="text-xs">
                                  {getParticipantName(event.participantId)}
                                </Badge>
                              )}
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {new Date(event.timestamp).toLocaleTimeString()}
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                </AnimatePresence>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Session Summary */}
      {currentSession && (
        <Card>
          <CardHeader>
            <CardTitle>Current Session Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-500">{currentSession.messages.length}</div>
                <div className="text-sm text-muted-foreground">Messages</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-500">{currentSession.participants.length}</div>
                <div className="text-sm text-muted-foreground">Participants</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-500">{currentSession.emergenceEvents.length}</div>
                <div className="text-sm text-muted-foreground">Emergences</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-amber-500">
                  {Math.round((Date.now() - new Date(currentSession.createdAt).getTime()) / (1000 * 60))}m
                </div>
                <div className="text-sm text-muted-foreground">Duration</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}