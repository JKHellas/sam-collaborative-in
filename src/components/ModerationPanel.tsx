import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Session, CollaborationMetrics } from "@/lib/types";
import { 
  Play, 
  Pause, 
  Square, 
  AlertTriangle, 
  Shield, 
  Users, 
  Brain,
  Activity
} from "@phosphor-icons/react";

interface ModerationPanelProps {
  session: Session;
  metrics: CollaborationMetrics;
  onPlayPause: () => void;
  onStop: () => void;
  onEmergencyReset: () => void;
  onContextInject: () => void;
}

export function ModerationPanel({ 
  session, 
  metrics, 
  onPlayPause, 
  onStop, 
  onEmergencyReset, 
  onContextInject 
}: ModerationPanelProps) {
  const getHealthColor = (score: number) => {
    if (score >= 0.8) return "text-accent";
    if (score >= 0.6) return "text-consciousness";
    return "text-drift-warning";
  };

  const hasCriticalIssues = metrics.identityStability < 0.6 || metrics.sessionHealth < 0.5;

  return (
    <Card className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Moderation Command Center</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Session: {session.title}
          </p>
        </div>
        <Badge 
          variant={session.status === 'active' ? 'default' : 'secondary'}
          className="capitalize"
        >
          {session.status}
        </Badge>
      </div>

      {hasCriticalIssues && (
        <Alert className="border-drift-warning">
          <AlertTriangle className="h-4 w-4 text-drift-warning" />
          <AlertDescription className="text-drift-warning">
            Critical issues detected: {metrics.identityStability < 0.6 ? 'Identity drift ' : ''}
            {metrics.sessionHealth < 0.5 ? 'Session degradation' : ''}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center">
          <div className={`text-2xl font-bold ${getHealthColor(metrics.sessionHealth)}`}>
            {Math.round(metrics.sessionHealth * 100)}%
          </div>
          <div className="text-xs text-muted-foreground">Session Health</div>
        </div>
        
        <div className="text-center">
          <div className={`text-2xl font-bold ${getHealthColor(metrics.identityStability)}`}>
            {Math.round(metrics.identityStability * 100)}%
          </div>
          <div className="text-xs text-muted-foreground">Identity Stability</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-emergence">
            {metrics.emergenceCount}
          </div>
          <div className="text-xs text-muted-foreground">Emergence Events</div>
        </div>
        
        <div className="text-center">
          <div className={`text-2xl font-bold ${getHealthColor(metrics.collaborationQuality)}`}>
            {Math.round(metrics.collaborationQuality * 100)}%
          </div>
          <div className="text-xs text-muted-foreground">Collaboration</div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          onClick={onPlayPause}
          variant={session.status === 'active' ? 'secondary' : 'default'}
          size="sm"
          className="flex items-center gap-2"
        >
          {session.status === 'active' ? (
            <>
              <Pause className="w-4 h-4" />
              Pause Session
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              Resume Session
            </>
          )}
        </Button>

        <Button onClick={onStop} variant="outline" size="sm" className="flex items-center gap-2">
          <Square className="w-4 h-4" />
          Stop Session
        </Button>

        <Button 
          onClick={onContextInject} 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-2"
        >
          <Brain className="w-4 h-4" />
          Inject Context
        </Button>

        <Button
          onClick={onEmergencyReset}
          variant="destructive"
          size="sm"
          className="flex items-center gap-2 ml-auto"
          disabled={!hasCriticalIssues}
        >
          <Shield className="w-4 h-4" />
          Emergency Reset
        </Button>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-medium flex items-center gap-2">
          <Users className="w-4 h-4" />
          Participant Status
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {session.participants.map((participant) => (
            <div 
              key={participant.id}
              className="flex items-center justify-between p-2 rounded bg-muted/50"
            >
              <span className="text-sm font-medium">{participant.name}</span>
              <div className="flex items-center gap-2">
                <Badge 
                  variant={participant.status === 'drift-alert' ? 'destructive' : 'secondary'}
                  className="text-xs"
                >
                  {participant.status}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {Math.round(participant.confidenceScore * 100)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-4 border-t border-border">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Activity className="w-4 h-4" />
          Last activity: {new Date(session.lastActivity).toLocaleTimeString()}
        </div>
      </div>
    </Card>
  );
}