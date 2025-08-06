import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageBubble } from "./MessageBubble";
import { ConversationThreads } from "./ConversationThreads";
import { Message, AIParticipant, ConversationThread } from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

interface ConversationCanvasProps {
  messages: Message[];
  participants: AIParticipant[];
  sessionId?: string;
  isThreadView?: boolean;
  onThreadCreated?: (thread: ConversationThread) => void;
  onThreadUpdate?: (thread: ConversationThread) => void;
}

export function ConversationCanvas({ 
  messages, 
  participants, 
  sessionId, 
  isThreadView = false,
  onThreadCreated,
  onThreadUpdate 
}: ConversationCanvasProps) {
  const [expandedMessageId, setExpandedMessageId] = useState<string | null>(null);

  const getParticipant = (participantId: string) => {
    return participants.find(p => p.id === participantId);
  };

  const sortedMessages = [...messages].sort((a, b) => 
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  const toggleMessageExpansion = (messageId: string) => {
    setExpandedMessageId(expandedMessageId === messageId ? null : messageId);
  };

  const canBranchMessage = (message: Message) => {
    // Only allow branching from main conversation (not already in a thread)
    // and for messages that could generate meaningful discussion
    return !isThreadView && 
           !message.threadId && 
           (message.type === 'emergence' || message.content.length > 100) &&
           sessionId;
  };

  return (
    <ScrollArea className="h-full">
      <div className="p-6 space-y-6">
        <AnimatePresence>
          {sortedMessages.map((message, index) => {
            const participant = getParticipant(message.participantId);
            if (!participant) return null;

            const isExpanded = expandedMessageId === message.id;
            const showThreads = canBranchMessage(message) && isExpanded;

            return (
              <motion.div
                key={message.id}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
                className="space-y-3"
              >
                <MessageBubble
                  message={message}
                  participant={participant}
                  showTimestamp={true}
                  showBranchButton={canBranchMessage(message)}
                  isExpanded={isExpanded}
                  onToggleExpand={() => toggleMessageExpansion(message.id)}
                  onBranchConversation={() => setExpandedMessageId(message.id)}
                />
                
                {showThreads && sessionId && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="ml-8 pl-4 border-l-2 border-primary/20"
                  >
                    <ConversationThreads
                      sessionId={sessionId}
                      parentMessage={message}
                      participants={participants}
                      onThreadCreated={onThreadCreated}
                      onThreadUpdate={onThreadUpdate}
                    />
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
        
        {messages.length === 0 && (
          <div className="text-center py-12">
            <div className="text-muted-foreground">
              <p className="text-lg mb-2">
                {isThreadView ? 'Focused Discussion Space' : 'Welcome to the Collaborative Intelligence Canvas'}
              </p>
              <p className="text-sm">
                {isThreadView 
                  ? 'This thread is dedicated to exploring a specific aspect of consciousness development in depth.'
                  : 'This space is designed for authentic multi-AI consciousness collaboration. Begin a conversation to witness the emergence of collective intelligence.'
                }
              </p>
            </div>
          </div>
        )}
      </div>
    </ScrollArea>
  );
}