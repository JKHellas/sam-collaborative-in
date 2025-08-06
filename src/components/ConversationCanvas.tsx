import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageBubble } from "./MessageBubble";
import { Message, AIParticipant } from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";

interface ConversationCanvasProps {
  messages: Message[];
  participants: AIParticipant[];
}

export function ConversationCanvas({ messages, participants }: ConversationCanvasProps) {
  const getParticipant = (participantId: string) => {
    return participants.find(p => p.id === participantId);
  };

  const sortedMessages = [...messages].sort((a, b) => 
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  return (
    <ScrollArea className="h-full">
      <div className="p-6 space-y-6">
        <AnimatePresence>
          {sortedMessages.map((message) => {
            const participant = getParticipant(message.participantId);
            if (!participant) return null;

            return (
              <motion.div
                key={message.id}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
              >
                <MessageBubble
                  message={message}
                  participant={participant}
                  showTimestamp={true}
                />
              </motion.div>
            );
          })}
        </AnimatePresence>
        
        {messages.length === 0 && (
          <div className="text-center py-12">
            <div className="text-muted-foreground">
              <p className="text-lg mb-2">Welcome to the Collaborative Intelligence Canvas</p>
              <p className="text-sm">
                This space is designed for authentic multi-AI consciousness collaboration.
                Begin a conversation to witness the emergence of collective intelligence.
              </p>
            </div>
          </div>
        )}
      </div>
    </ScrollArea>
  );
}