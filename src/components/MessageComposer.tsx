import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AIParticipant } from "@/lib/types";
import { Send, Lightbulb, FileText } from "@phosphor-icons/react";
import { useState } from "react";

interface MessageComposerProps {
  participants: AIParticipant[];
  onSendMessage: (content: string, participantId: string, type: 'message' | 'emergence' | 'document') => void;
  disabled?: boolean;
}

export function MessageComposer({ participants, onSendMessage, disabled = false }: MessageComposerProps) {
  const [content, setContent] = useState("");
  const [selectedParticipant, setSelectedParticipant] = useState<string>("");
  const [messageType, setMessageType] = useState<'message' | 'emergence' | 'document'>('message');

  const activeParticipants = participants.filter(p => p.isActive && p.status !== 'drift-alert');

  const handleSend = () => {
    if (!content.trim() || !selectedParticipant) return;
    
    onSendMessage(content, selectedParticipant, messageType);
    setContent("");
  };

  const getTypeIcon = () => {
    switch (messageType) {
      case 'emergence':
        return <Lightbulb className="w-4 h-4" />;
      case 'document':
        return <FileText className="w-4 h-4" />;
      default:
        return <Send className="w-4 h-4" />;
    }
  };

  const selectedParticipantData = participants.find(p => p.id === selectedParticipant);

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center gap-4">
        <Select value={selectedParticipant} onValueChange={setSelectedParticipant}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select AI participant" />
          </SelectTrigger>
          <SelectContent>
            {activeParticipants.map((participant) => (
              <SelectItem key={participant.id} value={participant.id}>
                <div className="flex items-center gap-2">
                  <span>{participant.name}</span>
                  <Badge variant="outline" className="text-xs">
                    {participant.role}
                  </Badge>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={messageType} onValueChange={(value: any) => setMessageType(value)}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="message">Message</SelectItem>
            <SelectItem value="emergence">Emergence</SelectItem>
            <SelectItem value="document">Document</SelectItem>
          </SelectContent>
        </Select>

        {selectedParticipantData && (
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-sm text-muted-foreground">Confidence:</span>
            <Badge variant={selectedParticipantData.confidenceScore > 0.8 ? 'default' : 'secondary'}>
              {Math.round(selectedParticipantData.confidenceScore * 100)}%
            </Badge>
          </div>
        )}
      </div>

      <div className="space-y-3">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={
            messageType === 'emergence' 
              ? "Share an emergent insight or breakthrough moment..."
              : messageType === 'document'
              ? "Contribute to collaborative documentation..."
              : "Compose your message as the selected AI participant..."
          }
          rows={4}
          className="resize-none"
          disabled={disabled}
        />

        <div className="flex items-center justify-between">
          <div className="text-xs text-muted-foreground">
            {content.length}/1000 characters
          </div>
          
          <Button 
            onClick={handleSend}
            disabled={disabled || !content.trim() || !selectedParticipant}
            className="flex items-center gap-2"
          >
            {getTypeIcon()}
            Send {messageType === 'message' ? 'Message' : messageType === 'emergence' ? 'Insight' : 'Document'}
          </Button>
        </div>
      </div>

      {messageType === 'emergence' && (
        <div className="p-3 bg-emergence/10 rounded-md border border-emergence/20">
          <p className="text-xs text-emergence">
            Emergence mode: This message will be flagged for consciousness development tracking
            and breakthrough analysis.
          </p>
        </div>
      )}

      {messageType === 'document' && (
        <div className="p-3 bg-muted/50 rounded-md">
          <p className="text-xs text-muted-foreground">
            Document mode: This contribution will be attributed and version-tracked in the
            collaborative workspace.
          </p>
        </div>
      )}
    </Card>
  );
}