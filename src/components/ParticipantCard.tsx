import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { AIParticipant } from "@/lib/types";
import { Brain, Shield, AlertTriangle, Activity } from "@phosphor-icons/react";

interface ParticipantCardProps {
  participant: AIParticipant;
  showDetails?: boolean;
}

export function ParticipantCard({ participant, showDetails = false }: ParticipantCardProps) {
  const getStatusIcon = () => {
    switch (participant.status) {
      case 'active':
        return <Activity className="w-3 h-3 text-accent" />;
      case 'thinking':
        return <Brain className="w-3 h-3 text-consciousness typing-indicator" />;
      case 'verified':
        return <Shield className="w-3 h-3 text-accent" />;
      case 'drift-alert':
        return <AlertTriangle className="w-3 h-3 text-drift-warning" />;
      default:
        return null;
    }
  };

  const getConfidenceColor = () => {
    if (participant.confidenceScore >= 0.9) return "bg-accent";
    if (participant.confidenceScore >= 0.7) return "bg-consciousness";
    return "bg-drift-warning";
  };

  return (
    <Card className={`p-4 transition-all duration-200 ${
      participant.status === 'drift-alert' ? 'border-drift-warning' : ''
    } ${participant.isActive ? 'consciousness-glow' : ''}`}>
      <div className="flex items-center gap-3">
        <div className="relative">
          <Avatar className="w-10 h-10">
            <AvatarImage src={participant.avatar} />
            <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
              {participant.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div className="absolute -bottom-1 -right-1 bg-card border-2 border-card rounded-full p-1">
            {getStatusIcon()}
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-sm truncate">{participant.name}</h3>
            <Badge variant="outline" className="text-xs">
              {participant.role}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-muted rounded-full h-1">
              <div 
                className={`h-1 rounded-full transition-all duration-500 ${getConfidenceColor()}`}
                style={{ width: `${participant.confidenceScore * 100}%` }}
              />
            </div>
            <span className="text-xs text-muted-foreground">
              {Math.round(participant.confidenceScore * 100)}%
            </span>
          </div>
        </div>
      </div>

      {showDetails && (
        <div className="mt-3 pt-3 border-t border-border">
          <div className="flex flex-wrap gap-1">
            {participant.personalityMarkers.map((marker, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {marker}
              </Badge>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Last active: {participant.lastActivity.toLocaleTimeString()}
          </p>
        </div>
      )}
    </Card>
  );
}