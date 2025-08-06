import { useState, useEffect } from 'react';
import { useKV } from '@github/spark/hooks';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ConversationCanvas } from './ConversationCanvas';
import { MessageComposer } from './MessageComposer';
import { ConversationThread, Message, AIParticipant, EmergenceEvent } from '../lib/types';
import { 
  GitBranch, 
  MessageSquare, 
  Users, 
  Clock, 
  Target,
  Sparkles,
  CheckCircle,
  Archive,
  Merge,
  TrendUp,
  Eye,
  EyeSlash
} from "@phosphor-icons/react";
import { toast } from 'sonner';

interface ThreadsManagerProps {
  sessionId: string;
  participants: AIParticipant[];
  mainMessages: Message[];
  onThreadCreated?: (thread: ConversationThread) => void;
  onThreadUpdate?: (thread: ConversationThread) => void;
}

export function ThreadsManager({ 
  sessionId, 
  participants, 
  mainMessages,
  onThreadCreated,
  onThreadUpdate 
}: ThreadsManagerProps) {
  const [threads, setThreads] = useKV<ConversationThread[]>(`threads-${sessionId}`, []);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [showResolved, setShowResolved] = useState(false);
  
  const activeThread = threads.find(t => t.id === activeThreadId);
  const activeThreads = threads.filter(t => t.status === 'active');
  const resolvedThreads = threads.filter(t => t.status === 'resolved');
  const allVisibleThreads = showResolved ? threads : activeThreads;

  const handleSendMessage = (content: string, participantId: string, type: 'message' | 'emergence' | 'document') => {
    if (!activeThread) return;

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      participantId,
      content,
      timestamp: new Date(),
      type,
      threadId: activeThread.id,
      parentMessageId: activeThread.parentMessageId,
      confidenceLevel: Math.random() * 0.3 + 0.7,
      emotionalState: type === 'emergence' ? 'breakthrough' : 'focused',
      emergenceScore: type === 'emergence' ? Math.random() * 0.4 + 0.6 : undefined,
      status: 'sent'
    };

    // Create emergence event if applicable
    let newEmergenceEvents = [...activeThread.emergenceEvents];
    if (type === 'emergence' && newMessage.emergenceScore && newMessage.emergenceScore > 0.7) {
      const emergenceEvent: EmergenceEvent = {
        id: `emergence-${Date.now()}`,
        sessionId,
        participantId,
        timestamp: new Date(),
        type: 'breakthrough',
        description: `Breakthrough insight in focused thread: ${activeThread.title}`,
        significance: newMessage.emergenceScore
      };
      newEmergenceEvents.push(emergenceEvent);
    }

    const updatedThread = {
      ...activeThread,
      messages: [...activeThread.messages, newMessage],
      lastActivity: new Date(),
      emergenceEvents: newEmergenceEvents
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
    
    if (activeThreadId === threadId) {
      setActiveThreadId(null);
    }
    
    toast.success("Thread resolved and archived");
  };

  const archiveThread = (threadId: string) => {
    setThreads(prev => 
      prev.map(thread => 
        thread.id === threadId 
          ? { ...thread, status: 'archived' as const } 
          : thread
      )
    );
    
    if (activeThreadId === threadId) {
      setActiveThreadId(null);
    }
    
    toast.info("Thread archived");
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
      case 'active': return <MessageSquare className="w-3 h-3 text-green-500" />;
      case 'resolved': return <CheckCircle className="w-3 h-3 text-blue-500" />;
      case 'merged': return <Merge className="w-3 h-3 text-purple-500" />;
      case 'archived': return <Archive className="w-3 h-3 text-gray-500" />;
      default: return <MessageSquare className="w-3 h-3" />;
    }
  };

  const getParentMessagePreview = (parentId: string) => {
    const parentMessage = mainMessages.find(m => m.id === parentId);
    if (!parentMessage) return 'Unknown message';
    
    return parentMessage.content.length > 100 
      ? parentMessage.content.substring(0, 100) + '...'
      : parentMessage.content;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg">
            <GitBranch className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Conversation Threading</h2>
            <p className="text-sm text-muted-foreground">
              Manage focused discussions and collaborative deep-dives
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowResolved(!showResolved)}
            className="flex items-center gap-2"
          >
            {showResolved ? <EyeSlash className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
            {showResolved ? 'Hide' : 'Show'} Resolved
          </Button>
          <Badge variant="outline">
            {activeThreads.length} active • {resolvedThreads.length} resolved
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-280px)]">
        {/* Thread List */}
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="w-4 h-4" />
                Active Threads
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[calc(100%-60px)]">
                <div className="p-4 space-y-3">
                  {allVisibleThreads.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <GitBranch className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No conversation threads yet</p>
                      <p className="text-xs">
                        Use the branch button on emergence messages to create focused discussions
                      </p>
                    </div>
                  )}
                  
                  {allVisibleThreads.map(thread => (
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
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {getStatusIcon(thread.status)}
                              <h4 className="font-semibold text-sm truncate">{thread.title}</h4>
                            </div>
                            <Badge className={`${getFocusLevelColor(thread.focusLevel)} text-xs`}>
                              {thread.focusLevel}
                            </Badge>
                          </div>
                          
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {thread.topic}
                          </p>
                          
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                {thread.participants.length}
                              </div>
                              <div className="flex items-center gap-1">
                                <MessageSquare className="w-3 h-3" />
                                {thread.messages.length}
                              </div>
                              {thread.emergenceEvents.length > 0 && (
                                <div className="flex items-center gap-1 text-consciousness">
                                  <Sparkles className="w-3 h-3" />
                                  {thread.emergenceEvents.length}
                                </div>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {thread.lastActivity.toLocaleTimeString()}
                            </div>
                          </div>
                          
                          {thread.mergeBackSuggested && (
                            <Badge variant="secondary" className="text-xs w-full justify-center">
                              Merge Back Suggested
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Thread Details */}
        <div className="lg:col-span-2">
          {activeThread ? (
            <Card className="h-full flex flex-col">
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      {activeThread.title}
                      <Badge className={getFocusLevelColor(activeThread.focusLevel)}>
                        {activeThread.focusLevel} focus
                      </Badge>
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">{activeThread.topic}</p>
                  </div>
                  
                  <div className="flex gap-2">
                    {activeThread.status === 'active' && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => resolveThread(activeThread.id)}
                        >
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Resolve
                        </Button>
                        {activeThread.messages.length > 3 && !activeThread.mergeBackSuggested && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => suggestMergeBack(activeThread.id)}
                          >
                            <TrendUp className="w-3 h-3 mr-1" />
                            Suggest Merge
                          </Button>
                        )}
                      </>
                    )}
                    
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => archiveThread(activeThread.id)}
                    >
                      <Archive className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                
                <div className="text-xs text-muted-foreground">
                  <strong>Parent message:</strong> {getParentMessagePreview(activeThread.parentMessageId)}
                </div>
              </CardHeader>
              
              <CardContent className="flex-1 p-0">
                <div className="h-full flex flex-col">
                  <div className="flex-1 min-h-0">
                    <ConversationCanvas 
                      messages={activeThread.messages}
                      participants={participants.filter(p => activeThread.participants.includes(p.id))}
                      isThreadView={true}
                    />
                  </div>
                  
                  {activeThread.status === 'active' && (
                    <div className="p-4 border-t bg-muted/20">
                      <MessageComposer
                        participants={participants.filter(p => activeThread.participants.includes(p.id))}
                        onSendMessage={handleSendMessage}
                        disabled={false}
                        placeholder={`Contribute to: ${activeThread.title}`}
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="h-full flex items-center justify-center">
              <div className="text-center">
                <Target className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                <h3 className="text-lg font-semibold mb-2">Select a Thread</h3>
                <p className="text-muted-foreground max-w-md">
                  Choose a conversation thread to view its focused discussion and contribute insights
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}