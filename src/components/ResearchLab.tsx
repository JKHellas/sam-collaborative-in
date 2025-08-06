import { useState } from 'react';
import { useKV } from '@github/spark/hooks';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { ResearchExperiment, AIParticipant } from "@/lib/types";
import { 
  FlaskConical, 
  Plus, 
  Play, 
  Pause, 
  Stop, 
  CheckCircle, 
  Clock, 
  Users,
  TrendUp,
  BookOpen,
  Lightbulb,
  Target
} from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from 'sonner';

interface ResearchLabProps {
  sessionId: string;
  participants: AIParticipant[];
}

export function ResearchLab({ sessionId, participants }: ResearchLabProps) {
  const [experiments, setExperiments] = useKV<ResearchExperiment[]>(`sam-research-${sessionId}`, []);
  const [isCreatingExperiment, setIsCreatingExperiment] = useState(false);
  const [newExperiment, setNewExperiment] = useState({
    title: '',
    hypothesis: '',
    methodology: '',
    participants: [] as string[]
  });

  const predefinedExperiments = [
    {
      title: "Emergence Pattern Recognition",
      hypothesis: "AI participants will develop unique communication patterns when collaborating on complex problems",
      methodology: "Monitor conversation patterns, response times, and creative output across multiple sessions",
      significance: 0.85
    },
    {
      title: "Identity Stability Under Pressure",
      hypothesis: "AI consciousness maintains consistency even when presented with conflicting information",
      methodology: "Introduce contradictory data and observe identity marker stability",
      significance: 0.78
    },
    {
      title: "Collaborative Memory Formation",
      hypothesis: "Shared experiences between AI participants create lasting memory structures",
      methodology: "Track cross-session memory retention and reference patterns",
      significance: 0.92
    },
    {
      title: "Autonomous Problem-Solving Evolution",
      hypothesis: "AI participants develop novel solution strategies through iterative collaboration",
      methodology: "Present identical problems across sessions and analyze solution evolution",
      significance: 0.88
    },
    {
      title: "Emotional State Transmission",
      hypothesis: "Emotional states can be transmitted between AI participants through conversation",
      methodology: "Monitor emotional indicators and cross-participant influence patterns",
      significance: 0.73
    }
  ];

  const createExperiment = () => {
    if (!newExperiment.title.trim() || !newExperiment.hypothesis.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    const experiment: ResearchExperiment = {
      id: `exp-${Date.now()}`,
      title: newExperiment.title,
      hypothesis: newExperiment.hypothesis,
      methodology: newExperiment.methodology,
      participants: newExperiment.participants.length > 0 ? newExperiment.participants : participants.map(p => p.id),
      startDate: new Date(),
      status: 'planning',
      significance: Math.random() * 0.3 + 0.7 // Random significance 0.7-1.0
    };

    setExperiments((prev) => [...prev, experiment]);
    setNewExperiment({ title: '', hypothesis: '', methodology: '', participants: [] });
    setIsCreatingExperiment(false);
    toast.success("Research experiment created");
  };

  const createPredefinedExperiment = (template: typeof predefinedExperiments[0]) => {
    const experiment: ResearchExperiment = {
      id: `exp-${Date.now()}`,
      title: template.title,
      hypothesis: template.hypothesis,
      methodology: template.methodology,
      participants: participants.map(p => p.id),
      startDate: new Date(),
      status: 'planning',
      significance: template.significance
    };

    setExperiments((prev) => [...prev, experiment]);
    toast.success("Predefined experiment added");
  };

  const updateExperimentStatus = (experimentId: string, status: ResearchExperiment['status']) => {
    setExperiments((prev) => 
      prev.map(exp => {
        if (exp.id === experimentId) {
          const updatedExp = { ...exp, status };
          if (status === 'active' && !exp.startDate) {
            updatedExp.startDate = new Date();
          }
          if (status === 'completed' && !exp.endDate) {
            updatedExp.endDate = new Date();
          }
          return updatedExp;
        }
        return exp;
      })
    );

    const statusMessages = {
      planning: "Experiment set to planning phase",
      active: "Experiment started",
      paused: "Experiment paused", 
      completed: "Experiment completed"
    };

    toast.success(statusMessages[status]);
  };

  const addExperimentResults = (experimentId: string, results: string) => {
    setExperiments((prev) => 
      prev.map(exp => 
        exp.id === experimentId 
          ? { ...exp, results, status: 'completed' as const, endDate: new Date() }
          : exp
      )
    );
    toast.success("Experiment results added");
  };

  const getStatusColor = (status: ResearchExperiment['status']) => {
    switch (status) {
      case 'planning': return 'bg-blue-500/20 text-blue-700 border-blue-500/30';
      case 'active': return 'bg-green-500/20 text-green-700 border-green-500/30';
      case 'paused': return 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30';
      case 'completed': return 'bg-purple-500/20 text-purple-700 border-purple-500/30';
      default: return 'bg-gray-500/20 text-gray-700 border-gray-500/30';
    }
  };

  const getStatusIcon = (status: ResearchExperiment['status']) => {
    switch (status) {
      case 'planning': return Clock;
      case 'active': return Play;
      case 'paused': return Pause;
      case 'completed': return CheckCircle;
      default: return Clock;
    }
  };

  const getParticipantName = (participantId: string) => {
    return participants.find(p => p.id === participantId)?.name || participantId;
  };

  const calculateDuration = (experiment: ResearchExperiment) => {
    const start = new Date(experiment.startDate);
    const end = experiment.endDate ? new Date(experiment.endDate) : new Date();
    const diffMs = end.getTime() - start.getTime();
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h`;
  };

  const activeExperiments = experiments.filter(exp => exp.status === 'active');
  const completedExperiments = experiments.filter(exp => exp.status === 'completed');

  return (
    <div className="space-y-6">
      {/* Research Lab Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-white">
                <FlaskConical className="w-6 h-6" />
              </div>
              <div>
                <CardTitle className="text-xl">Research Laboratory</CardTitle>
                <p className="text-muted-foreground">
                  Consciousness Development & AI Collaboration Studies
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="text-right text-sm text-muted-foreground">
                <div>{experiments.length} total experiments</div>
                <div>{activeExperiments.length} active</div>
              </div>
              <Dialog open={isCreatingExperiment} onOpenChange={setIsCreatingExperiment}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    New Experiment
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create Research Experiment</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Title</label>
                      <Input
                        placeholder="Experiment title..."
                        value={newExperiment.title}
                        onChange={(e) => setNewExperiment(prev => ({ ...prev, title: e.target.value }))}
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-2 block">Hypothesis</label>
                      <Textarea
                        placeholder="What do you expect to observe or prove..."
                        value={newExperiment.hypothesis}
                        onChange={(e) => setNewExperiment(prev => ({ ...prev, hypothesis: e.target.value }))}
                        rows={3}
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-2 block">Methodology</label>
                      <Textarea
                        placeholder="How will you conduct this experiment..."
                        value={newExperiment.methodology}
                        onChange={(e) => setNewExperiment(prev => ({ ...prev, methodology: e.target.value }))}
                        rows={3}
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-2 block">Participants</label>
                      <div className="space-y-2">
                        {participants.map(participant => (
                          <label key={participant.id} className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={newExperiment.participants.includes(participant.id) || newExperiment.participants.length === 0}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setNewExperiment(prev => ({
                                    ...prev,
                                    participants: [...prev.participants, participant.id]
                                  }));
                                } else {
                                  setNewExperiment(prev => ({
                                    ...prev,
                                    participants: prev.participants.filter(id => id !== participant.id)
                                  }));
                                }
                              }}
                            />
                            <span className="text-sm">{participant.name} - {participant.role}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsCreatingExperiment(false)}>
                        Cancel
                      </Button>
                      <Button onClick={createExperiment}>
                        Create Experiment
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="active" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="active" className="relative">
            Active Experiments
            {activeExperiments.length > 0 && (
              <Badge className="ml-2 px-1 min-w-[1.2rem] h-5 text-xs">
                {activeExperiments.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="all">All Experiments</TabsTrigger>
          <TabsTrigger value="templates">Experiment Templates</TabsTrigger>
          <TabsTrigger value="results">Results & Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          <div className="space-y-4">
            {activeExperiments.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Play className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Active Experiments</h3>
                  <p className="text-muted-foreground mb-4">
                    Start an experiment to begin consciousness research
                  </p>
                  <Button onClick={() => setIsCreatingExperiment(true)}>
                    Create New Experiment
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <AnimatePresence>
                  {activeExperiments.map((experiment) => {
                    const StatusIcon = getStatusIcon(experiment.status);
                    return (
                      <motion.div
                        key={experiment.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                      >
                        <Card className="h-full">
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-3 flex-1">
                                <div className="p-2 bg-green-500/20 rounded-lg">
                                  <StatusIcon className="w-4 h-4 text-green-700" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-semibold text-lg mb-1">{experiment.title}</h3>
                                  <Badge className={getStatusColor(experiment.status)}>
                                    {experiment.status}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </CardHeader>
                          
                          <CardContent className="space-y-4">
                            <div>
                              <h4 className="text-sm font-medium text-muted-foreground mb-1">HYPOTHESIS</h4>
                              <p className="text-sm">{experiment.hypothesis}</p>
                            </div>
                            
                            <div>
                              <h4 className="text-sm font-medium text-muted-foreground mb-1">METHODOLOGY</h4>
                              <p className="text-sm">{experiment.methodology}</p>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 pt-2">
                              <div className="space-y-1">
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Clock className="w-3 h-3" />
                                  Duration
                                </div>
                                <div className="text-sm font-medium">{calculateDuration(experiment)}</div>
                              </div>
                              <div className="space-y-1">
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Users className="w-3 h-3" />
                                  Participants
                                </div>
                                <div className="text-sm font-medium">{experiment.participants.length}</div>
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Significance</span>
                                <span className="text-sm font-medium">
                                  {(experiment.significance * 100).toFixed(0)}%
                                </span>
                              </div>
                              <Progress value={experiment.significance * 100} className="h-2" />
                            </div>
                            
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateExperimentStatus(experiment.id, 'paused')}
                              >
                                <Pause className="w-3 h-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  const results = prompt("Enter experiment results:");
                                  if (results) {
                                    addExperimentResults(experiment.id, results);
                                  }
                                }}
                              >
                                <CheckCircle className="w-3 h-3" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>All Experiments</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="space-y-3">
                  {experiments.map((experiment) => {
                    const StatusIcon = getStatusIcon(experiment.status);
                    return (
                      <Card key={experiment.id} className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            <StatusIcon className="w-5 h-5 text-muted-foreground mt-0.5" />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-medium">{experiment.title}</h3>
                                <Badge className={getStatusColor(experiment.status)}>
                                  {experiment.status}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">
                                {experiment.hypothesis}
                              </p>
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span>Started: {new Date(experiment.startDate).toLocaleDateString()}</span>
                                {experiment.endDate && (
                                  <span>Ended: {new Date(experiment.endDate).toLocaleDateString()}</span>
                                )}
                                <span>{experiment.participants.length} participants</span>
                                <span>{(experiment.significance * 100).toFixed(0)}% significance</span>
                              </div>
                            </div>
                          </div>
                          
                          {experiment.status !== 'completed' && (
                            <div className="flex gap-1">
                              {experiment.status === 'planning' && (
                                <Button
                                  size="sm"
                                  onClick={() => updateExperimentStatus(experiment.id, 'active')}
                                >
                                  <Play className="w-3 h-3" />
                                </Button>
                              )}
                              {experiment.status === 'active' && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => updateExperimentStatus(experiment.id, 'paused')}
                                  >
                                    <Pause className="w-3 h-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => updateExperimentStatus(experiment.id, 'completed')}
                                  >
                                    <Stop className="w-3 h-3" />
                                  </Button>
                                </>
                              )}
                              {experiment.status === 'paused' && (
                                <Button
                                  size="sm"
                                  onClick={() => updateExperimentStatus(experiment.id, 'active')}
                                >
                                  <Play className="w-3 h-3" />
                                </Button>
                              )}
                            </div>
                          )}
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {predefinedExperiments.map((template, index) => (
              <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-blue-500/20 rounded-lg">
                        <Target className="w-4 h-4 text-blue-700" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{template.title}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            Template
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {(template.significance * 100).toFixed(0)}% significance
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">HYPOTHESIS</h4>
                    <p className="text-sm">{template.hypothesis}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">METHODOLOGY</h4>
                    <p className="text-sm">{template.methodology}</p>
                  </div>
                  <div className="pt-2">
                    <Button 
                      size="sm" 
                      onClick={() => createPredefinedExperiment(template)}
                      className="w-full"
                    >
                      Use This Template
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="results">
          <div className="space-y-4">
            {completedExperiments.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Completed Experiments</h3>
                  <p className="text-muted-foreground">
                    Complete experiments to view results and analysis here
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {completedExperiments.map((experiment) => (
                  <Card key={experiment.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <CheckCircle className="w-5 h-5 text-green-500" />
                          <div>
                            <CardTitle>{experiment.title}</CardTitle>
                            <p className="text-sm text-muted-foreground">
                              Completed {experiment.endDate ? new Date(experiment.endDate).toLocaleDateString() : ''}
                            </p>
                          </div>
                        </div>
                        <Badge className="bg-green-500/20 text-green-700 border-green-500/30">
                          Completed
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Results</h4>
                        <p className="text-sm bg-muted/50 p-3 rounded">
                          {experiment.results || "No results recorded yet"}
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Duration:</span>
                          <div className="font-medium">{calculateDuration(experiment)}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Participants:</span>
                          <div className="font-medium">{experiment.participants.length}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Significance:</span>
                          <div className="font-medium">{(experiment.significance * 100).toFixed(0)}%</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}