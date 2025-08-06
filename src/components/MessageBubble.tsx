import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Message, AIParticipant } from "@/lib/types";
import { 
  Brain, 
  Lightbulb, 
  CheckCircle, 
  Clock, 
  GitBranch, 
  ChevronDown, 
  ChevronUp,
  MessageSquare 
} from "@phosphor-icons/react";
import { motion } from "framer-motion";

interface MessageBubbleProps {
  message: Message;
  participant: AIParticipant;
  showTimestamp?: boolean;
  showBranchButton?: boolean;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  onBranchConversation?: () => void;
}

export function MessageBubble({ 
  message, 
  participant, 
  showTimestamp = true,
  showBranchButton = false,
  isExpanded = false,
  onToggleExpand,
  onBranchConversation
}: MessageBubbleProps) {
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
      className="flex gap-3 group relative"
    >
      <Avatar className="w-8 h-8 mt-1 flex-shrink-0">
        <AvatarImage src={participant.avatar} />
        <AvatarFallback className="bg-primary text-primary-foreground text-sm">
          {participant.name.split(' ').map(n => n[0]).join('')}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-sm">{participant.name}</span>
          <Badge variant="outline" className="text-xs">
            {participant.role}
          </Badge>
          {message.threadId && (
            <Badge variant="secondary" className="text-xs">
              <MessageSquare className="w-2 h-2 mr-1" />
              Thread
            </Badge>
          )}
          {showTimestamp && (
            <span className="text-xs text-muted-foreground">
              {new Date(message.timestamp).toLocaleTimeString()}
            </span>
          )}
          {getStatusIcon()}
        </div>

        <Card className={`relative p-4 ${getMessageTypeStyle()} w-full`}>
          {getEmergenceIndicator()}
          
          <div className="prose prose-sm max-w-none text-card-foreground">
            {message.content.split('\n').map((line, index) => (
              <p key={index} className="mb-2 last:mb-0 break-words">
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

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mt-3 pt-2 border-t border-border/50">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                Confidence: {Math.round(message.confidenceLevel * 100)}%
              </span>
              {message.emotionalState && (
                <Badge variant="outline" className="text-xs">
                  {message.emotionalState}
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {message.emergenceScore && message.emergenceScore > 0.5 && (
                <Badge variant="secondary" className="text-xs bg-emergence/20 text-emergence whitespace-nowrap">
                  Emergence: {Math.round(message.emergenceScore * 100)}%
                </Badge>
              )}
              
              {showBranchButton && (
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={onToggleExpand}
                    className="h-6 px-2 text-xs"
                  >
                    {isExpanded ? (
                      <ChevronUp className="w-3 h-3" />
                    ) : (
                      <ChevronDown className="w-3 h-3" />
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={onBranchConversation}
                    className="h-6 px-2 text-xs"
                    title="Branch conversation"
                  >
                    <GitBranch className="w-3 h-3" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    </motion.div>
  );
}