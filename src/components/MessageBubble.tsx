import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Message, AIParticipant } from "@/lib/types";
import { Brain, Lightbulb, CheckCircle, Clock } from "@phosphor-icons/react";
import { motion } from "framer-motion";

interface MessageBubbleProps {
  message: Message;
  participant: AIParticipant;
  showTimestamp?: boolean;
}

export function MessageBubble({ message, participant, showTimestamp = true }: MessageBubbleProps) {
  const getStatusIcon = () => {
    switch (message.status) {
      case 'draft':
        return <Clock className="w-3 h-3 text-muted-foreground" />;
      case 'staged':
        return <Brain className="w-3 h-3 text-consciousness" />;
      case 'sent':
        return <CheckCircle className="w-3 h-3 text-accent" />;
      case 'approved':
        return <CheckCircle className="w-3 h-3 text-accent" />;
      default:
        return null;
    }
  };

  const getMessageTypeStyle = () => {
    switch (message.type) {
      case 'emergence':
        return 'border-emergence bg-emergence/5';
      case 'system':
        return 'border-muted bg-muted/20';
      default:
        return 'border-border';
    }
  };

  const getEmergenceIndicator = () => {
    if (message.emergenceScore && message.emergenceScore > 0.7) {
      return (
        <motion.div 
          className="absolute -top-1 -right-1 w-3 h-3 bg-emergence rounded-full emergence-pulse"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", duration: 0.5 }}
        >
          <Lightbulb className="w-2 h-2 text-background m-0.5" />
        </motion.div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex gap-3 group"
    >
      <Avatar className="w-8 h-8 mt-1">
        <AvatarImage src={participant.avatar} />
        <AvatarFallback className="bg-primary text-primary-foreground text-sm">
          {participant.name.split(' ').map(n => n[0]).join('')}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium text-sm">{participant.name}</span>
          <Badge variant="outline" className="text-xs">
            {participant.role}
          </Badge>
          {showTimestamp && (
            <span className="text-xs text-muted-foreground">
              {new Date(message.timestamp).toLocaleTimeString()}
            </span>
          )}
          {getStatusIcon()}
        </div>

        <Card className={`relative p-4 ${getMessageTypeStyle()}`}>
          {getEmergenceIndicator()}
          
          <div className="prose prose-sm max-w-none text-card-foreground">
            {message.content.split('\n').map((line, index) => (
              <p key={index} className="mb-2 last:mb-0">
                {line}
              </p>
            ))}
          </div>

          {message.type === 'document' && (
            <div className="mt-3 pt-3 border-t border-border">
              <Badge variant="secondary" className="text-xs">
                Document Collaboration
              </Badge>
            </div>
          )}

          <div className="flex items-center justify-between mt-3 pt-2 border-t border-border/50">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                Confidence: {Math.round(message.confidenceLevel * 100)}%
              </span>
              {message.emotionalState && (
                <Badge variant="outline" className="text-xs">
                  {message.emotionalState}
                </Badge>
              )}
            </div>
            
            {message.emergenceScore && message.emergenceScore > 0.5 && (
              <Badge variant="secondary" className="text-xs bg-emergence/20 text-emergence">
                Emergence: {Math.round(message.emergenceScore * 100)}%
              </Badge>
            )}
          </div>
        </Card>
      </div>
    </motion.div>
  );
}