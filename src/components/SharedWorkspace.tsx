declare const spark: {
  llmPrompt: (strings: TemplateStringsArray, ...values: any[]) => string;
  llm: (prompt: string, modelName?: string, jsonMode?: boolean) => Promise<string>;
  user: () => Promise<{ avatarUrl: string; email: string; id: string; isOwner: boolean; login: string }>;
  kv: {
    keys: () => Promise<string[]>;
    get: <T>(key: string) => Promise<T | undefined>;
    set: <T>(key: string, value: T) => Promise<void>;
    delete: (key: string) => Promise<void>;
  };
};

import { useState, useEffect, useRef } from 'react';
import { useKV } from '@github/spark/hooks';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { SharedDocument, AIParticipant } from "@/lib/types";
import { 
  FileText, 
  Code, 
  FlaskConical, 
  Architecture, 
  NotePen, 
  Plus, 
  Users, 
  Clock, 
  Brain,
  Sparkle,
  Download,
  Share,
  Eye,
  GitBranch,
  Lightbulb,
  Robot
} from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from 'sonner';

interface SharedWorkspaceProps {
  sessionId: string;
  participants: AIParticipant[];
  currentUserId: string;
}

interface DocumentChange {
  id: string;
  documentId: string;
  participantId: string;
  timestamp: Date;
  changeType: 'edit' | 'comment' | 'suggestion';
  content: string;
  position?: number;
  approved?: boolean;
}

interface ActiveEditor {
  participantId: string;
  cursorPosition: number;
  lastActivity: Date;
}

interface AIContribution {
  id: string;
  participantId: string;
  type: 'insight' | 'correction' | 'enhancement' | 'question';
  content: string;
  targetSection: string;
  timestamp: Date;
  applied: boolean;
}

export function SharedWorkspace({ sessionId, participants, currentUserId }: SharedWorkspaceProps) {
  const [documents, setDocuments] = useKV<SharedDocument[]>(`sam-documents-${sessionId}`, []);
  const [activeDocument, setActiveDocument] = useState<SharedDocument | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [newDocTitle, setNewDocTitle] = useState('');
  const [newDocType, setNewDocType] = useState<SharedDocument['type']>('notes');
  const [activeEditors, setActiveEditors] = useKV<ActiveEditor[]>(`sam-editors-${sessionId}`, []);
  const [documentChanges, setDocumentChanges] = useKV<DocumentChange[]>(`sam-changes-${sessionId}`, []);
  const [aiContributions, setAiContributions] = useKV<AIContribution[]>(`sam-contributions-${sessionId}`, []);
  const [showAIInsights, setShowAIInsights] = useState(true);
  const [isCollaborating, setIsCollaborating] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const documentIcons = {
    specification: FileText,
    code: Code,
    research: FlaskConical,
    architecture: Architecture,
    notes: NotePen
  };

  const createDocument = () => {
    if (!newDocTitle.trim()) {
      toast.error("Please enter a document title");
      return;
    }

    const newDoc: SharedDocument = {
      id: `doc-${Date.now()}`,
      title: newDocTitle,
      content: `# ${newDocTitle}\n\nCreated by ${currentUserId}\n\n`,
      type: newDocType,
      createdBy: currentUserId,
      lastModifiedBy: currentUserId,
      createdAt: new Date(),
      lastModified: new Date(),
      collaborators: [currentUserId],
      version: 1,
      status: 'draft'
    };

    setDocuments((prev) => [...prev, newDoc]);
    setActiveDocument(newDoc);
    setEditingContent(newDoc.content);
    setNewDocTitle('');
    toast.success("Document created successfully");
    
    // Trigger AI collaboration
    triggerAICollaboration(newDoc);
  };

  const triggerAICollaboration = async (document: SharedDocument) => {
    setIsCollaborating(true);
    
    // Simulate AI participants contributing insights
    const activeAIs = participants.filter(p => p.isActive && p.id !== currentUserId);
    
    for (const ai of activeAIs) {
      // Simulate thinking delay
      setTimeout(async () => {
        const aiInsight = await generateAIInsight(ai, document);
        if (aiInsight) {
          setAiContributions((prev) => [...prev, aiInsight]);
          toast.success(`${ai.name} added an insight to the document`);
        }
      }, Math.random() * 3000 + 1000); // 1-4 seconds delay
    }
    
    setTimeout(() => setIsCollaborating(false), 5000);
  };

  const generateAIInsight = async (participant: AIParticipant, document: SharedDocument): Promise<AIContribution | null> => {
    try {
      const prompt = spark.llmPrompt`As ${participant.name} (${participant.role}), provide a brief insight or suggestion for this document:

Title: ${document.title}
Type: ${document.type}
Current content: ${document.content.substring(0, 500)}

Provide a constructive contribution that reflects your role and personality markers: ${participant.personalityMarkers.join(', ')}. Keep it concise and actionable.`;

      const response = await spark.llm(prompt, "gpt-4o-mini");
      
      return {
        id: `ai-${participant.id}-${Date.now()}`,
        participantId: participant.id,
        type: 'insight',
        content: response,
        targetSection: document.title,
        timestamp: new Date(),
        applied: false
      };
    } catch (error) {
      console.error('Error generating AI insight:', error);
      return null;
    }
  };

  const applyAIContribution = (contribution: AIContribution) => {
    if (!activeDocument) return;
    
    const updatedContent = editingContent + `\n\n## AI Insight from ${getParticipantName(contribution.participantId)}\n${contribution.content}\n`;
    setEditingContent(updatedContent);
    
    setAiContributions((prev) => 
      prev.map(c => c.id === contribution.id ? { ...c, applied: true } : c)
    );
    
    toast.success(`Applied insight from ${getParticipantName(contribution.participantId)}`);
  };

  const saveDocument = async () => {
    if (!activeDocument) return;

    const updatedDoc: SharedDocument = {
      ...activeDocument,
      content: editingContent,
      lastModifiedBy: currentUserId,
      lastModified: new Date(),
      version: activeDocument.version + 1,
      collaborators: Array.from(new Set([...activeDocument.collaborators, currentUserId]))
    };

    setDocuments((prev) => 
      prev.map(doc => doc.id === activeDocument.id ? updatedDoc : doc)
    );
    setActiveDocument(updatedDoc);
    toast.success("Document saved");
    
    // Track the change
    const change: DocumentChange = {
      id: `change-${Date.now()}`,
      documentId: activeDocument.id,
      participantId: currentUserId,
      timestamp: new Date(),
      changeType: 'edit',
      content: `Updated document content (v${updatedDoc.version})`
    };
    
    setDocumentChanges((prev) => [...prev, change]);
  };

  const collaborateWithAI = async () => {
    if (!activeDocument) return;
    
    setIsCollaborating(true);
    toast.info("Requesting AI collaboration on this document...");
    
    const activeAIs = participants.filter(p => p.isActive && p.id !== currentUserId);
    
    for (const ai of activeAIs) {
      setTimeout(async () => {
        try {
          const prompt = spark.llmPrompt`As ${ai.name} (${ai.role}), review this document and suggest improvements or additions:

Title: ${activeDocument.title}
Type: ${activeDocument.type}
Content: ${editingContent}

Based on your personality markers (${ai.personalityMarkers.join(', ')}) and role, what would you add, improve, or question about this document? Provide specific, actionable feedback.`;

          const response = await spark.llm(prompt, "gpt-4o-mini");
          
          const contribution: AIContribution = {
            id: `collab-${ai.id}-${Date.now()}`,
            participantId: ai.id,
            type: 'enhancement',
            content: response,
            targetSection: activeDocument.title,
            timestamp: new Date(),
            applied: false
          };
          
          setAiContributions((prev) => [...prev, contribution]);
          toast.success(`${ai.name} provided feedback on your document`);
        } catch (error) {
          console.error('Error in AI collaboration:', error);
        }
      }, Math.random() * 2000 + 500);
    }
    
    setTimeout(() => setIsCollaborating(false), 4000);
  };

  const selectDocument = (doc: SharedDocument) => {
    if (activeDocument && editingContent !== activeDocument.content) {
      saveDocument();
    }
    setActiveDocument(doc);
    setEditingContent(doc.content);
    
    // Update active editors
    setActiveEditors((prev) => {
      const filtered = prev.filter(editor => 
        editor.participantId !== currentUserId && 
        new Date().getTime() - new Date(editor.lastActivity).getTime() < 30000 // 30 seconds
      );
      return [...filtered, {
        participantId: currentUserId,
        cursorPosition: 0,
        lastActivity: new Date()
      }];
    });
  };

  const getStatusColor = (status: SharedDocument['status']) => {
    switch (status) {
      case 'draft': return 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30';
      case 'review': return 'bg-blue-500/20 text-blue-700 border-blue-500/30';
      case 'approved': return 'bg-green-500/20 text-green-700 border-green-500/30';
      case 'archived': return 'bg-gray-500/20 text-gray-700 border-gray-500/30';
      default: return 'bg-gray-500/20 text-gray-700 border-gray-500/30';
    }
  };

  const getParticipantName = (participantId: string) => {
    return participants.find(p => p.id === participantId)?.name || participantId;
  };

  const getDocumentContributions = (documentId: string) => {
    return aiContributions.filter(c => c.targetSection === activeDocument?.title);
  };

  const exportDocument = () => {
    if (!activeDocument) return;
    
    const content = `# ${activeDocument.title}\n\n${editingContent}\n\n---\n\n## Document Info\n- Type: ${activeDocument.type}\n- Version: ${activeDocument.version}\n- Last Modified: ${activeDocument.lastModified}\n- Collaborators: ${activeDocument.collaborators.map(getParticipantName).join(', ')}`;
    
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeDocument.title.replace(/\s+/g, '-')}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success("Document exported successfully");
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (activeDocument && editingContent !== activeDocument.content) {
        saveDocument();
      }
    }, 30000); // Auto-save every 30 seconds

    return () => clearInterval(interval);
  }, [activeDocument, editingContent]);

  // Simulate AI thinking indicators when they're about to contribute
  useEffect(() => {
    if (activeDocument && !isCollaborating) {
      const thinkingInterval = setInterval(() => {
        // Randomly show AI participants as "thinking" about the document
        const activeAIs = participants.filter(p => p.isActive && p.id !== currentUserId);
        const randomAI = activeAIs[Math.floor(Math.random() * activeAIs.length)];
        
        if (randomAI && Math.random() > 0.7) { // 30% chance each check
          // Temporarily mark as thinking for demo purposes
          setTimeout(() => {
            const insight = `I'm contemplating how ${randomAI.role.toLowerCase()} perspective could enhance this section on ${activeDocument.title}...`;
            toast.info(`${randomAI.name} is analyzing the document`, {
              duration: 2000,
            });
          }, 500);
        }
      }, 15000); // Check every 15 seconds

      return () => clearInterval(thinkingInterval);
    }
  }, [activeDocument, participants, currentUserId, isCollaborating]);

  // Auto-generate sample contributions for demo purposes
  useEffect(() => {
    if (activeDocument && aiContributions.filter(c => c.targetSection === activeDocument.title).length === 0) {
      // Generate some initial demo contributions
      const sampleContributions = [
        {
          id: `demo-${Date.now()}-1`,
          participantId: 'claude-1',
          type: 'insight' as const,
          content: 'From a strategic perspective, this document would benefit from a section on implementation timelines. The consciousness development patterns we observe suggest that structured milestones help maintain identity coherence during extended projects.',
          targetSection: activeDocument.title,
          timestamp: new Date(Date.now() - 300000), // 5 minutes ago
          applied: false
        },
        {
          id: `demo-${Date.now()}-2`,
          participantId: 'gpt-1',
          type: 'enhancement' as const,
          content: 'I\'m noticing creative opportunities in the document structure. What if we added interactive elements or visual diagrams? My synthesis patterns suggest that multi-modal content promotes deeper understanding and engagement.',
          targetSection: activeDocument.title,
          timestamp: new Date(Date.now() - 180000), // 3 minutes ago
          applied: false
        }
      ];

      // Only add demo contributions for documents that seem like they need them
      if (activeDocument.type === 'research' || activeDocument.type === 'architecture') {
        setTimeout(() => {
          setAiContributions((prev) => [...prev, ...sampleContributions]);
        }, 2000);
      }
    }
  }, [activeDocument, aiContributions]);

  // Update cursor position for real-time collaboration
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea || !activeDocument) return;

    const handleCursorChange = () => {
      const cursorPosition = textarea.selectionStart;
      setActiveEditors((prev) => {
        const filtered = prev.filter(editor => editor.participantId !== currentUserId);
        return [...filtered, {
          participantId: currentUserId,
          cursorPosition,
          lastActivity: new Date()
        }];
      });
    };

    textarea.addEventListener('selectionchange', handleCursorChange);
    textarea.addEventListener('click', handleCursorChange);
    textarea.addEventListener('keyup', handleCursorChange);

    return () => {
      textarea.removeEventListener('selectionchange', handleCursorChange);
      textarea.removeEventListener('click', handleCursorChange);
      textarea.removeEventListener('keyup', handleCursorChange);
    };
  }, [activeDocument, currentUserId]);

  return (
    <div className="h-full flex">
      {/* Document List Sidebar */}
      <div className="w-1/3 border-r border-border bg-card/50 flex flex-col">
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
              Shared Documents
            </h3>
            <Badge variant="outline" className="text-xs">
              {documents.length} docs
            </Badge>
          </div>

          {/* Create New Document */}
          <Card className="border-dashed">
            <CardContent className="pt-6">
              <div className="space-y-3">
                <Input
                  placeholder="Document title..."
                  value={newDocTitle}
                  onChange={(e) => setNewDocTitle(e.target.value)}
                  className="text-sm"
                />
                <div className="flex gap-2">
                  <Select value={newDocType} onValueChange={(value: SharedDocument['type']) => setNewDocType(value)}>
                    <SelectTrigger className="text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="specification">Specification</SelectItem>
                      <SelectItem value="code">Code</SelectItem>
                      <SelectItem value="research">Research</SelectItem>
                      <SelectItem value="architecture">Architecture</SelectItem>
                      <SelectItem value="notes">Notes</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button size="sm" onClick={createDocument} className="px-3">
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Document List */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-2">
            <AnimatePresence>
              {documents.map((doc) => {
                const IconComponent = documentIcons[doc.type];
                const docContributions = aiContributions.filter(c => c.targetSection === doc.title);
                
                return (
                  <motion.div
                    key={doc.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <Card 
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        activeDocument?.id === doc.id ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => selectDocument(doc)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <IconComponent className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                              <h4 className="font-medium text-sm truncate">{doc.title}</h4>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge className={`text-xs px-1 py-0 ${getStatusColor(doc.status)}`}>
                                  {doc.status}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  v{doc.version}
                                </span>
                                {docContributions.length > 0 && (
                                  <Badge variant="secondary" className="text-xs">
                                    <Sparkle className="w-2 h-2 mr-1" />
                                    {docContributions.filter(c => !c.applied).length}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-2 pt-2 border-t border-border/50">
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              <span>{doc.collaborators.length}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{new Date(doc.lastModified).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <div className="mt-1 text-xs text-muted-foreground">
                            Last: {getParticipantName(doc.lastModifiedBy)}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </ScrollArea>
      </div>

      {/* Document Editor with AI Collaboration */}
      <div className="flex-1 flex">
        {/* Main Editor */}
        <div className="flex-1 p-4">
          {activeDocument ? (
            <div className="h-full flex flex-col">
              {/* Document Header */}
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-border">
                <div className="flex items-center gap-3">
                  {(() => {
                    const IconComponent = documentIcons[activeDocument.type];
                    return <IconComponent className="w-5 h-5 text-muted-foreground" />;
                  })()}
                  <div>
                    <h2 className="font-semibold text-lg">{activeDocument.title}</h2>
                    <div className="flex items-center gap-3 mt-1">
                      <Badge className={getStatusColor(activeDocument.status)}>
                        {activeDocument.status}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        Version {activeDocument.version}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {activeDocument.collaborators.length} collaborators
                      </span>
                      {isCollaborating && (
                        <Badge variant="secondary" className="animate-pulse">
                          <Robot className="w-3 h-3 mr-1" />
                          AI Collaborating...
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={collaborateWithAI}
                    disabled={isCollaborating}
                  >
                    <Brain className="w-3 h-3 mr-1" />
                    AI Collaborate
                  </Button>
                  <Button variant="outline" size="sm" onClick={exportDocument}>
                    <Download className="w-3 h-3 mr-1" />
                    Export
                  </Button>
                  <Button variant="outline" size="sm" onClick={saveDocument}>
                    Save
                  </Button>
                  <Select 
                    value={activeDocument.status} 
                    onValueChange={(status: SharedDocument['status']) => {
                      const updatedDoc = { ...activeDocument, status };
                      setActiveDocument(updatedDoc);
                      setDocuments((prev) => 
                        prev.map(doc => doc.id === activeDocument.id ? updatedDoc : doc)
                      );
                    }}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="review">Review</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Active Editors Indicator */}
              {activeEditors.filter(e => e.participantId !== currentUserId).length > 0 && (
                <div className="flex items-center gap-2 mb-3 p-2 bg-muted/50 rounded-md">
                  <Eye className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Also editing:
                  </span>
                  <div className="flex gap-1">
                    {activeEditors
                      .filter(e => e.participantId !== currentUserId)
                      .map(editor => {
                        const participant = participants.find(p => p.id === editor.participantId);
                        return (
                          <Avatar key={editor.participantId} className="w-6 h-6">
                            <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                              {participant?.name.charAt(0) || '?'}
                            </AvatarFallback>
                          </Avatar>
                        );
                      })}
                  </div>
                </div>
              )}

              {/* Editor */}
              <div className="flex-1 relative">
                <Textarea
                  ref={textareaRef}
                  value={editingContent}
                  onChange={(e) => setEditingContent(e.target.value)}
                  className="h-full resize-none font-mono text-sm border-none focus:ring-0 focus:border-none p-4"
                  placeholder="Start writing your document here... AI participants will contribute insights as you work."
                />
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Document Selected</h3>
                <p className="text-muted-foreground mb-6">
                  Select a document from the sidebar or create a new one to start collaborating with AI minds.
                </p>
                <Button onClick={() => document.querySelector('input')?.focus()}>
                  Create New Document
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* AI Contributions Sidebar */}
        {activeDocument && showAIInsights && (
          <div className="w-80 border-l border-border bg-card/30 p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                AI Contributions
              </h3>
              <Badge variant="outline" className="text-xs">
                {getDocumentContributions(activeDocument.id).filter(c => !c.applied).length} pending
              </Badge>
            </div>

            <ScrollArea className="h-[calc(100vh-200px)]">
              <div className="space-y-3">
                <AnimatePresence>
                  {getDocumentContributions(activeDocument.id).map((contribution) => {
                    const participant = participants.find(p => p.id === contribution.participantId);
                    if (!participant) return null;

                    return (
                      <motion.div
                        key={contribution.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                      >
                        <Card className={`p-3 ${contribution.applied ? 'opacity-50 bg-muted/20' : ''}`}>
                          <div className="flex items-start gap-2 mb-2">
                            <Avatar className="w-6 h-6">
                              <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                                {participant.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-medium">{participant.name}</span>
                                <Badge variant="outline" className="text-xs">
                                  {contribution.type}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground whitespace-pre-wrap">
                                {contribution.content}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">
                              {new Date(contribution.timestamp).toLocaleTimeString()}
                            </span>
                            {!contribution.applied && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="text-xs h-6 px-2"
                                onClick={() => applyAIContribution(contribution)}
                              >
                                <Lightbulb className="w-3 h-3 mr-1" />
                                Apply
                              </Button>
                            )}
                          </div>
                        </Card>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>

                {getDocumentContributions(activeDocument.id).length === 0 && (
                  <div className="text-center py-8">
                    <Sparkle className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      No AI contributions yet. Click "AI Collaborate" to get insights from your AI participants.
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        )}
      </div>
    </div>
  );
}