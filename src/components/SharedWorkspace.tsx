import { useState, useEffect } from 'react';
import { useKV } from '@github/spark/hooks';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SharedDocument, AIParticipant } from "@/lib/types";
import { FileText, Code, FlaskConical, Architecture, NotePen, Plus, Users, Clock } from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from 'sonner';

interface SharedWorkspaceProps {
  sessionId: string;
  participants: AIParticipant[];
  currentUserId: string;
}

export function SharedWorkspace({ sessionId, participants, currentUserId }: SharedWorkspaceProps) {
  const [documents, setDocuments] = useKV<SharedDocument[]>(`sam-documents-${sessionId}`, []);
  const [activeDocument, setActiveDocument] = useState<SharedDocument | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [newDocTitle, setNewDocTitle] = useState('');
  const [newDocType, setNewDocType] = useState<SharedDocument['type']>('notes');

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
  };

  const selectDocument = (doc: SharedDocument) => {
    if (activeDocument && editingContent !== activeDocument.content) {
      saveDocument();
    }
    setActiveDocument(doc);
    setEditingContent(doc.content);
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

  useEffect(() => {
    const interval = setInterval(() => {
      if (activeDocument && editingContent !== activeDocument.content) {
        saveDocument();
      }
    }, 30000); // Auto-save every 30 seconds

    return () => clearInterval(interval);
  }, [activeDocument, editingContent]);

  return (
    <div className="h-full flex">
      {/* Document List Sidebar */}
      <div className="w-1/3 border-r border-border bg-card/50 p-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
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

          {/* Document List */}
          <ScrollArea className="h-[400px]">
            <div className="space-y-2">
              <AnimatePresence>
                {documents.map((doc) => {
                  const IconComponent = documentIcons[doc.type];
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
      </div>

      {/* Document Editor */}
      <div className="flex-1 p-4">
        {activeDocument ? (
          <div className="h-full flex flex-col">
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
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
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

            <div className="flex-1">
              <Textarea
                value={editingContent}
                onChange={(e) => setEditingContent(e.target.value)}
                className="h-full resize-none font-mono text-sm"
                placeholder="Start writing your document here..."
              />
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Document Selected</h3>
              <p className="text-muted-foreground mb-6">
                Select a document from the sidebar or create a new one to start collaborating.
              </p>
              <Button onClick={() => document.querySelector('input')?.focus()}>
                Create New Document
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}