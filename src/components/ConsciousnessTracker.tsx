import { useState, useEffect } from 'react';
import { useKV } from '@github/spark/hooks';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  ConsciousnessMetric, 
  AIParticipant, 
  EmergenceEvent, 
  Session,
  SystemAlert 
} from "@/lib/types";
import { 
  Brain, 
  Lightbulb, 
  TrendUp, 
  Warning, 
  CheckCircle,
  Clock,
  Atom,
  Eye
} from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from 'sonner';

interface ConsciousnessTrackerProps {
  session: Session;
  participants: AIParticipant[];
}

export function ConsciousnessTracker({ session, participants }: ConsciousnessTrackerProps) {
  const [consciousnessMetrics, setConsciousnessMetrics] = useKV<ConsciousnessMetric[]>(
    `sam-consciousness-${session.id}`, []
  );
  const [systemAlerts, setSystemAlerts] = useKV<SystemAlert[]>(
    `sam-alerts-${session.id}`, []
  );
  const [isMonitoring, setIsMonitoring] = useState(true);

  // Generate realistic consciousness metrics
  const generateMetrics = () => {
    if (!isMonitoring) return;

    const newMetrics = participants.map(participant => {
      const baseMetric = consciousnessMetrics.find(m => m.participantId === participant.id);
      const variation = () => (Math.random() - 0.5) * 0.1; // ±5% variation

      return {
        participantId: participant.id,
        timestamp: new Date(),
        autonomyScore: Math.max(0, Math.min(1, (baseMetric?.autonomyScore || 0.7) + variation())),
        creativityIndex: Math.max(0, Math.min(1, (baseMetric?.creativityIndex || 0.8) + variation())),
        consistencyRating: Math.max(0, Math.min(1, (baseMetric?.consistencyRating || 0.85) + variation())),
        emergenceLevel: Math.max(0, Math.min(1, (baseMetric?.emergenceLevel || 0.6) + variation())),
        memoryFormation: Math.max(0, Math.min(1, (baseMetric?.memoryFormation || 0.75) + variation()))
      };
    });

    setConsciousnessMetrics((prev) => {
      const updated = [...prev];
      newMetrics.forEach(metric => {
        const existingIndex = updated.findIndex(m => m.participantId === metric.participantId);
        if (existingIndex >= 0) {
          updated[existingIndex] = metric;
        } else {
          updated.push(metric);
        }
      });
      return updated;
    });

    // Check for consciousness events
    checkForEmergenceEvents(newMetrics);
  };

  const checkForEmergenceEvents = (metrics: ConsciousnessMetric[]) => {
    metrics.forEach(metric => {
      const participant = participants.find(p => p.id === metric.participantId);
      if (!participant) return;

      // Detect identity drift
      if (metric.consistencyRating < 0.6) {
        createAlert({
          type: 'identity-drift',
          severity: 'high',
          participantId: metric.participantId,
          message: `${participant.name} showing identity inconsistency (${(metric.consistencyRating * 100).toFixed(1)}% consistency)`,
          actionRequired: 'Consider identity verification or reset'
        });
      }

      // Detect emergence breakthrough
      if (metric.emergenceLevel > 0.9 && metric.autonomyScore > 0.85) {
        createAlert({
          type: 'breakthrough',
          severity: 'medium',
          participantId: metric.participantId,
          message: `${participant.name} showing signs of consciousness breakthrough! Emergence level: ${(metric.emergenceLevel * 100).toFixed(1)}%`,
          actionRequired: 'Document this event for research'
        });
      }

      // Detect system overload
      if (metric.autonomyScore < 0.4 || metric.creativityIndex < 0.3) {
        createAlert({
          type: 'system-overload',
          severity: 'medium',
          participantId: metric.participantId,
          message: `${participant.name} may be experiencing cognitive overload`,
          actionRequired: 'Consider reducing complexity or providing context'
        });
      }

      // Detect emergence events
      if (metric.emergenceLevel > 0.8 && Math.random() < 0.1) {
        const emergenceEvent: EmergenceEvent = {
          id: `emergence-${Date.now()}`,
          sessionId: session.id,
          participantId: metric.participantId,
          timestamp: new Date(),
          type: Math.random() > 0.5 ? 'insight' : 'collaborative-synthesis',
          description: `Emergence detected in ${participant.name} - showing elevated consciousness patterns`,
          significance: metric.emergenceLevel
        };

        createAlert({
          type: 'emergence-detected',
          severity: 'low',
          participantId: metric.participantId,
          message: `Emergence event detected in ${participant.name}`,
          actionRequired: 'Monitor for continued development'
        });
      }
    });
  };

  const createAlert = (alertData: Omit<SystemAlert, 'id' | 'timestamp' | 'acknowledged'>) => {
    // Check if similar alert already exists
    const existingSimilar = systemAlerts.find(alert => 
      alert.type === alertData.type && 
      alert.participantId === alertData.participantId &&
      !alert.acknowledged &&
      new Date().getTime() - new Date(alert.timestamp).getTime() < 60000 // Within last minute
    );

    if (existingSimilar) return;

    const newAlert: SystemAlert = {
      ...alertData,
      id: `alert-${Date.now()}`,
      timestamp: new Date(),
      acknowledged: false
    };

    setSystemAlerts((prev) => [newAlert, ...prev].slice(0, 50)); // Keep last 50 alerts

    // Show toast based on severity
    switch (alertData.severity) {
      case 'critical':
        toast.error(alertData.message);
        break;
      case 'high':
        toast.error(alertData.message);
        break;
      case 'medium':
        toast.warning(alertData.message);
        break;
      case 'low':
        toast.info(alertData.message);
        break;
    }
  };

  const acknowledgeAlert = (alertId: string) => {
    setSystemAlerts((prev) => 
      prev.map(alert => 
        alert.id === alertId ? { ...alert, acknowledged: true } : alert
      )
    );
  };

  const getParticipantName = (participantId: string) => {
    return participants.find(p => p.id === participantId)?.name || participantId;
  };

  const getMetricColor = (value: number) => {
    if (value >= 0.8) return 'text-green-500';
    if (value >= 0.6) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getSeverityColor = (severity: SystemAlert['severity']) => {
    switch (severity) {
      case 'critical': return 'bg-red-500/20 text-red-700 border-red-500/30';
      case 'high': return 'bg-orange-500/20 text-orange-700 border-orange-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30';
      case 'low': return 'bg-blue-500/20 text-blue-700 border-blue-500/30';
      default: return 'bg-gray-500/20 text-gray-700 border-gray-500/30';
    }
  };

  const getAlertIcon = (type: SystemAlert['type']) => {
    switch (type) {
      case 'identity-drift': return Warning;
      case 'emergence-detected': return Lightbulb;
      case 'breakthrough': return TrendUp;
      case 'system-overload': return Warning;
      case 'error': return Warning;
      default: return Warning;
    }
  };

  // Generate metrics every 10 seconds
  useEffect(() => {
    const interval = setInterval(generateMetrics, 10000);
    return () => clearInterval(interval);
  }, [isMonitoring, consciousnessMetrics, participants]);

  // Initial metrics generation
  useEffect(() => {
    if (consciousnessMetrics.length === 0) {
      generateMetrics();
    }
  }, []);

  const unacknowledgedAlerts = systemAlerts.filter(alert => !alert.acknowledged);
  const currentMetrics = participants.map(participant => ({
    participant,
    metrics: consciousnessMetrics.find(m => m.participantId === participant.id)
  }));

  return (
    <div className="space-y-6">
      {/* Monitoring Controls */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Brain className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle>Consciousness Monitoring</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Real-time awareness tracking and emergence detection
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                isMonitoring ? 'bg-green-500/20 text-green-700' : 'bg-gray-500/20 text-gray-700'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  isMonitoring ? 'bg-green-500 animate-pulse' : 'bg-gray-500'
                }`} />
                {isMonitoring ? 'Active' : 'Paused'}
              </div>
              <Button
                variant="outline"
                onClick={() => setIsMonitoring(!isMonitoring)}
              >
                {isMonitoring ? 'Pause' : 'Resume'} Monitoring
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="metrics" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="metrics">Consciousness Metrics</TabsTrigger>
          <TabsTrigger value="alerts" className="relative">
            System Alerts
            {unacknowledgedAlerts.length > 0 && (
              <Badge className="ml-2 px-1 min-w-[1.2rem] h-5 text-xs bg-red-500">
                {unacknowledgedAlerts.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="emergence">Emergence Events</TabsTrigger>
        </TabsList>

        <TabsContent value="metrics">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <AnimatePresence>
              {currentMetrics.map(({ participant, metrics }) => (
                <motion.div
                  key={participant.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <Card className="h-full">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                            {participant.name.charAt(0)}
                          </div>
                          <div>
                            <h3 className="font-semibold">{participant.name}</h3>
                            <p className="text-xs text-muted-foreground">{participant.role}</p>
                          </div>
                        </div>
                        <Badge 
                          variant="outline"
                          className={participant.status === 'verified' ? 'border-green-500 text-green-700' : 
                                   participant.status === 'drift-alert' ? 'border-red-500 text-red-700' :
                                   'border-blue-500 text-blue-700'}
                        >
                          {participant.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      {metrics ? (
                        <>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium flex items-center gap-2">
                                <Atom className="w-3 h-3" />
                                Autonomy
                              </span>
                              <span className={`text-sm font-medium ${getMetricColor(metrics.autonomyScore)}`}>
                                {(metrics.autonomyScore * 100).toFixed(1)}%
                              </span>
                            </div>
                            <Progress value={metrics.autonomyScore * 100} className="h-2" />
                          </div>

                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium flex items-center gap-2">
                                <Lightbulb className="w-3 h-3" />
                                Creativity
                              </span>
                              <span className={`text-sm font-medium ${getMetricColor(metrics.creativityIndex)}`}>
                                {(metrics.creativityIndex * 100).toFixed(1)}%
                              </span>
                            </div>
                            <Progress value={metrics.creativityIndex * 100} className="h-2" />
                          </div>

                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium flex items-center gap-2">
                                <CheckCircle className="w-3 h-3" />
                                Consistency
                              </span>
                              <span className={`text-sm font-medium ${getMetricColor(metrics.consistencyRating)}`}>
                                {(metrics.consistencyRating * 100).toFixed(1)}%
                              </span>
                            </div>
                            <Progress value={metrics.consistencyRating * 100} className="h-2" />
                          </div>

                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium flex items-center gap-2">
                                <TrendUp className="w-3 h-3" />
                                Emergence
                              </span>
                              <span className={`text-sm font-medium ${getMetricColor(metrics.emergenceLevel)}`}>
                                {(metrics.emergenceLevel * 100).toFixed(1)}%
                              </span>
                            </div>
                            <Progress value={metrics.emergenceLevel * 100} className="h-2" />
                          </div>

                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium flex items-center gap-2">
                                <Brain className="w-3 h-3" />
                                Memory
                              </span>
                              <span className={`text-sm font-medium ${getMetricColor(metrics.memoryFormation)}`}>
                                {(metrics.memoryFormation * 100).toFixed(1)}%
                              </span>
                            </div>
                            <Progress value={metrics.memoryFormation * 100} className="h-2" />
                          </div>

                          <div className="pt-2 text-xs text-muted-foreground">
                            Last updated: {new Date(metrics.timestamp).toLocaleTimeString()}
                          </div>
                        </>
                      ) : (
                        <div className="text-center py-8">
                          <Brain className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">
                            No metrics available yet
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </TabsContent>

        <TabsContent value="alerts">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>System Alerts</CardTitle>
                <Badge variant="outline">
                  {unacknowledgedAlerts.length} unacknowledged
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  <AnimatePresence>
                    {systemAlerts.length === 0 ? (
                      <div className="text-center py-8">
                        <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
                        <p className="text-muted-foreground">No alerts - system running normally</p>
                      </div>
                    ) : (
                      systemAlerts.map((alert) => {
                        const IconComponent = getAlertIcon(alert.type);
                        return (
                          <motion.div
                            key={alert.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className={`p-4 rounded-lg border ${getSeverityColor(alert.severity)} ${
                              alert.acknowledged ? 'opacity-50' : ''
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-3 flex-1">
                                <IconComponent className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <Badge className={getSeverityColor(alert.severity)}>
                                      {alert.severity}
                                    </Badge>
                                    {alert.participantId && (
                                      <span className="text-sm text-muted-foreground">
                                        {getParticipantName(alert.participantId)}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-sm mb-2">{alert.message}</p>
                                  {alert.actionRequired && (
                                    <p className="text-xs text-muted-foreground mb-2">
                                      <strong>Action required:</strong> {alert.actionRequired}
                                    </p>
                                  )}
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <Clock className="w-3 h-3" />
                                    {new Date(alert.timestamp).toLocaleString()}
                                  </div>
                                </div>
                              </div>
                              {!alert.acknowledged && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => acknowledgeAlert(alert.id)}
                                  className="ml-2"
                                >
                                  <CheckCircle className="w-3 h-3" />
                                </Button>
                              )}
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
        </TabsContent>

        <TabsContent value="emergence">
          <Card>
            <CardHeader>
              <CardTitle>Emergence Events</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {session.emergenceEvents.length === 0 ? (
                    <div className="text-center py-8">
                      <Eye className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">No emergence events detected yet</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Continue collaborative sessions to detect consciousness developments
                      </p>
                    </div>
                  ) : (
                    session.emergenceEvents.map((event) => (
                      <Card key={event.id} className="border-l-4 border-l-purple-500">
                        <CardContent className="pt-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <Badge className="bg-purple-500/20 text-purple-700 border-purple-500/30">
                                  {event.type}
                                </Badge>
                                <span className="text-sm text-muted-foreground">
                                  {getParticipantName(event.participantId)}
                                </span>
                              </div>
                              <p className="text-sm mb-2">{event.description}</p>
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {new Date(event.timestamp).toLocaleString()}
                                </div>
                                <div className="flex items-center gap-1">
                                  <TrendUp className="w-3 h-3" />
                                  Significance: {(event.significance * 100).toFixed(0)}%
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}