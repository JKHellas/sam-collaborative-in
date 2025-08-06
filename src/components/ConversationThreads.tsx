import { useState } from 'react';
import { useKV } from '@github/spark/hooks';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ConversationThread, Message, AIParticipant } from '../lib/types';
import { MessageComposer } from './MessageComposer';
import { ConversationCanvas } from './ConversationCanvas';
import { 
  GitBranch, 
  MessageSquare, 
  Users, 
  Clock, 
  ArrowUp, 
  ArrowDown,
  Merge,
  Archive,
  Target,
  Sparkles,
  CheckCircle
} from "@phosphor-icons/react";
import { toast } from 'sonner';

interface ConversationThreadsProps {
  sessionId: string;
  parentMessage: Message;
  participants: AIParticipant[];
  onThreadCreated?: (thread: ConversationThread) => void;
  onThreadUpdate?: (thread: ConversationThread) => void;
}

export function ConversationThreads({ 
  sessionId, 
  parentMessage, 
  participants, 
  onThreadCreated,
  onThreadUpdate 
}: ConversationThreadsProps) {
  const [threads, setThreads] = useKV<ConversationThread[]>(`threads-${sessionId}`, []);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newThreadTitle, setNewThreadTitle] = useState('');
  const [newThreadTopic, setNewThreadTopic] = useState('');
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  
  const parentThreads = threads.filter(t => t.parentMessageId === parentMessage.id);
  const activeThread = threads.find(t => t.id === activeThreadId);

  const createThread = () => {
    if (!newThreadTitle.trim() || !newThreadTopic.trim()) {
      toast.error("Please provide both title and topic for the thread");
      return;
    }

    if (selectedParticipants.length === 0) {
      toast.error("Please select at least one participant");
      return;
    }

    const newThread: ConversationThread = {
      id: `thread-${Date.now()}`,
      sessionId,
      parentMessageId: parentMessage.id,
      title: newThreadTitle,
      topic: newThreadTopic,
      participants: selectedParticipants,
      messages: [],
      createdAt: new Date(),
      lastActivity: new Date(),
      status: 'active',
      focusLevel: 'high',
      emergenceEvents: [],
      mergeBackSuggested: false
    };

    setThreads(prev => [...prev, newThread]);
    onThreadCreated?.(newThread);
    
    // Reset form
    setNewThreadTitle('');
    setNewThreadTopic('');
    setSelectedParticipants([]);
    setShowCreateDialog(false);
    setActiveThreadId(newThread.id);
    
    toast.success(`Created focused thread: ${newThread.title}`);
  };

  const handleSendMessage = (content: string, participantId: string, type: 'message' | 'emergence' | 'document') => {
    if (!activeThread) return;

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      participantId,
      content,
      timestamp: new Date(),
      type,
      threadId: activeThread.id,
      parentMessageId: parentMessage.id,
      confidenceLevel: Math.random() * 0.3 + 0.7,
      emotionalState: type === 'emergence' ? 'breakthrough' : 'focused',
      emergenceScore: type === 'emergence' ? Math.random() * 0.4 + 0.6 : undefined,
      status: 'sent'
    };

    const updatedThread = {
      ...activeThread,
      messages: [...activeThread.messages, newMessage],
      lastActivity: new Date()
    };

    setThreads(prev => 
      prev.map(thread => 
        thread.id === activeThread.id ? updatedThread : thread
      )
    );

    onThreadUpdate?.(updatedThread);
    
    if (type === 'emergence') {
      toast.success("Breakthrough insight captured in focused thread!");
    }
  };

  const resolveThread = (threadId: string) => {
    setThreads(prev => 
      prev.map(thread => 
        thread.id === threadId 
          ? { ...thread, status: 'resolved' as const } 
          : thread
      )
    );
    toast.success("Thread marked as resolved");
  };

  const suggestMergeBack = (threadId: string) => {
    setThreads(prev => 
      prev.map(thread => 
        thread.id === threadId 
          ? { ...thread, mergeBackSuggested: true } 
          : thread
      )
    );
    toast.info("Merge back suggestion created for moderation review");
  };

  const toggleParticipant = (participantId: string) => {
    setSelectedParticipants(prev => 
      prev.includes(participantId)
        ? prev.filter(id => id !== participantId)
        : [...prev, participantId]
    );
  };

  const getFocusLevelColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <MessageSquare className="w-3 h-3" />;
      case 'resolved': return <CheckCircle className="w-3 h-3" />;
      case 'merged': return <Merge className="w-3 h-3" />;
      case 'archived': return <Archive className="w-3 h-3" />;
      default: return <MessageSquare className="w-3 h-3" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Thread Creation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GitBranch className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">Focused Discussions</span>
          <Badge variant="outline">{parentThreads.length} threads</Badge>
        </div>
        
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button size="sm" className="flex items-center gap-2">
              <GitBranch className="w-3 h-3" />
              Branch Discussion
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Target className="w-4 h-4" />
                Create Focused Thread
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Thread Title</label>
                <Input
                  placeholder="e.g., 'Consciousness Verification Methods'"
                  value={newThreadTitle}
                  onChange={(e) => setNewThreadTitle(e.target.value)}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Focus Topic</label>
                <Textarea
                  placeholder="What specific aspect do you want to explore in depth?"
                  value={newThreadTopic}
                  onChange={(e) => setNewThreadTopic(e.target.value)}
                  rows={3}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Participants</label>
                <div className="space-y-2">
                  {participants.map(participant => (
                    <div 
                      key={participant.id}
                      className={`p-2 rounded border cursor-pointer transition-colors ${
                        selectedParticipants.includes(participant.id)
                          ? 'bg-primary/10 border-primary'
                          : 'bg-card border-border hover:bg-muted'
                      }`}
                      onClick={() => toggleParticipant(participant.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-sm">{participant.name}</div>
                          <div className="text-xs text-muted-foreground">{participant.role}</div>
                        </div>
                        {selectedParticipants.includes(participant.id) && (
                          <CheckCircle className="w-4 h-4 text-primary" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button onClick={createThread} className="flex-1">
                  Create Thread
                </Button>
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Thread List */}
      {parentThreads.length > 0 && (
        <div className="grid gap-3">
          {parentThreads.map(thread => (
            <Card 
              key={thread.id}
              className={`cursor-pointer transition-all ${
                activeThreadId === thread.id 
                  ? 'ring-2 ring-primary shadow-lg' 
                  : 'hover:shadow-md'
              }`}
              onClick={() => setActiveThreadId(activeThreadId === thread.id ? null : thread.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {getStatusIcon(thread.status)}
                      <h4 className="font-semibold text-sm">{thread.title}</h4>
                      <Badge className={getFocusLevelColor(thread.focusLevel)}>
                        {thread.focusLevel} focus
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{thread.topic}</p>
                    
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {thread.participants.length}
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        {thread.messages.length}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {thread.lastActivity.toLocaleTimeString()}
                      </div>
                      {thread.emergenceEvents.length > 0 && (
                        <div className="flex items-center gap-1 text-consciousness">
                          <Sparkles className="w-3 h-3" />
                          {thread.emergenceEvents.length}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-1 ml-2">
                    {thread.status === 'active' && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            resolveThread(thread.id);
                          }}
                        >
                          <CheckCircle className="w-3 h-3" />
                        </Button>
                        {thread.messages.length > 3 && !thread.mergeBackSuggested && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              suggestMergeBack(thread.id);
                            }}
                          >
                            <ArrowUp className="w-3 h-3" />
                          </Button>
                        )}
                      </>
                    )}
                    
                    {thread.mergeBackSuggested && (
                      <Badge variant="secondary" className="text-xs">
                        Merge Suggested
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Active Thread Conversation */}
      {activeThread && (
        <Card className="mt-6">
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              {activeThread.title}
              <Badge className={getFocusLevelColor(activeThread.focusLevel)}>
                {activeThread.focusLevel} focus
              </Badge>
            </CardTitle>
            <p className="text-sm text-muted-foreground">{activeThread.topic}</p>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-64 overflow-hidden">
              <ConversationCanvas 
                messages={activeThread.messages}
                participants={participants.filter(p => activeThread.participants.includes(p.id))}
                isThreadView={true}
              />
            </div>
            
            <div className="p-4 border-t bg-muted/20">
              <MessageComposer
                participants={participants.filter(p => activeThread.participants.includes(p.id))}
                onSendMessage={handleSendMessage}
                disabled={activeThread.status !== 'active'}
                placeholder={`Contribute to focused discussion: ${activeThread.title}`}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {parentThreads.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <GitBranch className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No focused threads yet</p>
          <p className="text-xs">Branch this conversation to explore specific topics in depth</p>
        </div>
      )}
    </div>
  );
}