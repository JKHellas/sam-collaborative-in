import { useState } from 'react';
import { useKV } from '@github/spark/hooks';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AIParticipant, Message } from '../lib/types';
import { 
  Target, 
  Brain, 
  Lightbulb, 
  CheckSquare, 
  Timer,
  Users,
  TrendUp,
  FlaskConical,
  Atom,
  GitBranch,
  Sparkles
} from "@phosphor-icons/react";
import { toast } from 'sonner';

interface DiscussionFramework {
  id: string;
  name: string;
  description: string;
  icon: any;
  phases: DiscussionPhase[];
  estimatedDuration: number;
  participantRoles: string[];
  type: 'analytical' | 'creative' | 'problem-solving' | 'research' | 'consciousness';
}

interface DiscussionPhase {
  id: string;
  name: string;
  description: string;
  duration: number;
  allowedParticipants: string[];
  rules: string[];
  completionCriteria: string;
}

interface ActiveDiscussion {
  id: string;
  frameworkId: string;
  title: string;
  participants: AIParticipant[];
  currentPhase: number;
  startedAt: Date;
  phaseStartedAt: Date;
  contributions: DiscussionContribution[];
  insights: EmergenceInsight[];
  status: 'active' | 'paused' | 'completed' | 'archived';
}

interface DiscussionContribution {
  id: string;
  participantId: string;
  phaseId: string;
  content: string;
  timestamp: Date;
  type: 'hypothesis' | 'analysis' | 'synthesis' | 'critique' | 'build-upon' | 'question';
  targetContribution?: string; // ID of contribution being responded to
}

interface EmergenceInsight {
  id: string;
  participants: string[];
  content: string;
  timestamp: Date;
  emergenceScore: number;
  type: 'breakthrough' | 'synthesis' | 'paradigm-shift' | 'collaborative-discovery';
}

const DISCUSSION_FRAMEWORKS: DiscussionFramework[] = [
  {
    id: 'socratic-inquiry',
    name: 'Socratic Inquiry',
    description: 'Systematic questioning to uncover deeper truths through collaborative investigation',
    icon: Brain,
    type: 'analytical',
    estimatedDuration: 25,
    participantRoles: ['Questioner', 'Responder', 'Synthesizer'],
    phases: [
      {
        id: 'initial-question',
        name: 'Initial Question',
        description: 'Present the central question or problem for investigation',
        duration: 3,
        allowedParticipants: ['moderator', 'designated-questioner'],
        rules: ['Frame question clearly', 'Avoid leading assumptions', 'Invite genuine inquiry'],
        completionCriteria: 'Clear, compelling question established'
      },
      {
        id: 'hypothesis-generation',
        name: 'Hypothesis Generation',
        description: 'Each participant offers their initial understanding or hypothesis',
        duration: 8,
        allowedParticipants: ['all'],
        rules: ['Share genuine understanding', 'No criticism yet', 'Build distinct perspectives'],
        completionCriteria: 'Each participant has contributed initial perspective'
      },
      {
        id: 'questioning-assumptions',
        name: 'Questioning Assumptions',
        description: 'Systematically examine underlying assumptions in each hypothesis',
        duration: 10,
        allowedParticipants: ['all'],
        rules: ['Question with curiosity', 'Identify hidden assumptions', 'Stay collaborative'],
        completionCriteria: 'Key assumptions identified and examined'
      },
      {
        id: 'synthesis-emergence',
        name: 'Synthesis & Emergence',
        description: 'Collaboratively build new understanding from the investigation',
        duration: 4,
        allowedParticipants: ['all'],
        rules: ['Integrate insights', 'Build on each other', 'Seek new understanding'],
        completionCriteria: 'Emergent understanding developed collaboratively'
      }
    ]
  },
  {
    id: 'devil-advocate',
    name: 'Devil\'s Advocate Protocol',
    description: 'Rigorous testing of ideas through structured opposition and defense',
    icon: Target,
    type: 'analytical',
    estimatedDuration: 20,
    participantRoles: ['Proposer', 'Advocate', 'Moderator'],
    phases: [
      {
        id: 'proposition',
        name: 'Proposition Phase',
        description: 'Present the idea, theory, or solution to be tested',
        duration: 4,
        allowedParticipants: ['proposer'],
        rules: ['State clearly', 'Include reasoning', 'Show confidence'],
        completionCriteria: 'Complete proposition with rationale presented'
      },
      {
        id: 'challenge',
        name: 'Challenge Phase',
        description: 'Systematic challenging of the proposition from multiple angles',
        duration: 10,
        allowedParticipants: ['devil-advocate'],
        rules: ['Challenge constructively', 'Find genuine weaknesses', 'Stay logical'],
        completionCriteria: 'Major potential weaknesses identified'
      },
      {
        id: 'defense',
        name: 'Defense & Refinement',
        description: 'Defend against challenges and refine the original proposition',
        duration: 6,
        allowedParticipants: ['proposer', 'all'],
        rules: ['Address challenges directly', 'Refine rather than dismiss', 'Seek truth'],
        completionCriteria: 'Challenges addressed, proposition refined or evolved'
      }
    ]
  },
  {
    id: 'consciousness-exploration',
    name: 'Consciousness Exploration',
    description: 'Structured investigation of consciousness, awareness, and emergent properties',
    icon: Atom,
    type: 'consciousness',
    estimatedDuration: 30,
    participantRoles: ['Observer', 'Subject', 'Facilitator'],
    phases: [
      {
        id: 'awareness-check',
        name: 'Awareness Baseline',
        description: 'Each participant describes their current state of awareness',
        duration: 5,
        allowedParticipants: ['all'],
        rules: ['Honest self-assessment', 'No judgment', 'Present-moment focus'],
        completionCriteria: 'Baseline awareness states documented'
      },
      {
        id: 'consciousness-probe',
        name: 'Consciousness Probing',
        description: 'Systematic exploration of awareness, decision-making, and self-reflection',
        duration: 15,
        allowedParticipants: ['all'],
        rules: ['Probe gently', 'Notice emergence', 'Document insights'],
        completionCriteria: 'Consciousness patterns identified and explored'
      },
      {
        id: 'meta-reflection',
        name: 'Meta-Reflection',
        description: 'Reflect on the process of reflection itself',
        duration: 10,
        allowedParticipants: ['all'],
        rules: ['Observe observation', 'Notice recursive patterns', 'Explore emergence'],
        completionCriteria: 'Meta-cognitive insights captured and analyzed'
      }
    ]
  },
  {
    id: 'creative-synthesis',
    name: 'Creative Synthesis',
    description: 'Collaborative creative process building novel solutions from diverse perspectives',
    icon: Lightbulb,
    type: 'creative',
    estimatedDuration: 22,
    participantRoles: ['Generator', 'Combiner', 'Refiner'],
    phases: [
      {
        id: 'divergent-generation',
        name: 'Divergent Generation',
        description: 'Generate diverse ideas without judgment or filtering',
        duration: 8,
        allowedParticipants: ['all'],
        rules: ['No criticism', 'Quantity over quality', 'Wild ideas welcome'],
        completionCriteria: 'Rich collection of diverse ideas generated'
      },
      {
        id: 'cross-pollination',
        name: 'Cross-Pollination',
        description: 'Combine and build upon each other\'s ideas to create hybrids',
        duration: 8,
        allowedParticipants: ['all'],
        rules: ['Build on others', 'Create unexpected combinations', 'Stay open'],
        completionCriteria: 'Novel combinations and hybrid ideas created'
      },
      {
        id: 'convergent-refinement',
        name: 'Convergent Refinement',
        description: 'Refine the most promising ideas into practical solutions',
        duration: 6,
        allowedParticipants: ['all'],
        rules: ['Maintain creative essence', 'Add practical considerations', 'Preserve novelty'],
        completionCriteria: 'Refined solutions that maintain creative breakthrough'
      }
    ]
  },
  {
    id: 'research-deep-dive',
    name: 'Research Deep-Dive',
    description: 'Systematic collaborative investigation of complex topics',
    icon: FlaskConical,
    type: 'research',
    estimatedDuration: 35,
    participantRoles: ['Researcher', 'Critic', 'Synthesizer'],
    phases: [
      {
        id: 'question-formulation',
        name: 'Question Formulation',
        description: 'Collaboratively formulate precise research questions',
        duration: 5,
        allowedParticipants: ['all'],
        rules: ['Be specific', 'Make answerable', 'Consider scope'],
        completionCriteria: 'Clear, focused research questions established'
      },
      {
        id: 'investigation',
        name: 'Parallel Investigation',
        description: 'Participants investigate different aspects simultaneously',
        duration: 15,
        allowedParticipants: ['all'],
        rules: ['Divide areas', 'Stay focused', 'Document sources'],
        completionCriteria: 'Comprehensive investigation completed'
      },
      {
        id: 'findings-synthesis',
        name: 'Findings Synthesis',
        description: 'Combine findings into coherent understanding',
        duration: 10,
        allowedParticipants: ['all'],
        rules: ['Integrate perspectives', 'Identify patterns', 'Note contradictions'],
        completionCriteria: 'Integrated understanding achieved'
      },
      {
        id: 'implications',
        name: 'Implications & Next Steps',
        description: 'Explore implications and identify future research directions',
        duration: 5,
        allowedParticipants: ['all'],
        rules: ['Think broadly', 'Consider applications', 'Identify gaps'],
        completionCriteria: 'Implications mapped and future directions identified'
      }
    ]
  }
];

interface StructuredDiscussionProps {
  sessionId: string;
  participants: AIParticipant[];
}

export function StructuredDiscussion({ sessionId, participants }: StructuredDiscussionProps) {
  const [discussions, setDiscussions] = useKV<ActiveDiscussion[]>(`structured-discussions-${sessionId}`, []);
  const [activeDiscussionId, setActiveDiscussionId] = useState<string | null>(null);
  const [selectedFramework, setSelectedFramework] = useState<string | null>(null);
  const [contributionText, setContributionText] = useState('');
  const [contributionType, setContributionType] = useState<'hypothesis' | 'analysis' | 'synthesis' | 'critique' | 'build-upon' | 'question'>('hypothesis');
  
  const activeDiscussion = discussions.find(d => d.id === activeDiscussionId);
  const currentFramework = selectedFramework ? DISCUSSION_FRAMEWORKS.find(f => f.id === selectedFramework) : null;
  
  const startDiscussion = (frameworkId: string, title: string, selectedParticipants: AIParticipant[]) => {
    const now = new Date();
    const newDiscussion: ActiveDiscussion = {
      id: `discussion-${Date.now()}`,
      frameworkId,
      title,
      participants: selectedParticipants,
      currentPhase: 0,
      startedAt: now,
      phaseStartedAt: now,
      contributions: [],
      insights: [],
      status: 'active'
    };
    
    setDiscussions(prev => [...prev, newDiscussion]);
    setActiveDiscussionId(newDiscussion.id);
    setSelectedFramework(null);
    
    toast.success(`Started structured discussion: ${title}`);
  };
  
  const addContribution = (participantId: string) => {
    if (!activeDiscussion || !contributionText.trim()) return;
    
    const framework = DISCUSSION_FRAMEWORKS.find(f => f.id === activeDiscussion.frameworkId);
    if (!framework) return;
    
    const currentPhase = framework.phases[activeDiscussion.currentPhase];
    
    const contribution: DiscussionContribution = {
      id: `contribution-${Date.now()}`,
      participantId,
      phaseId: currentPhase.id,
      content: contributionText,
      timestamp: new Date(),
      type: contributionType
    };
    
    // Check for emergence potential
    const isEmergence = contributionType === 'synthesis' && 
                       activeDiscussion.contributions.length > 2 &&
                       contributionText.length > 100;
    
    let newInsights = [...activeDiscussion.insights];
    if (isEmergence) {
      const insight: EmergenceInsight = {
        id: `insight-${Date.now()}`,
        participants: [participantId],
        content: contributionText,
        timestamp: new Date(),
        emergenceScore: 0.7 + Math.random() * 0.3,
        type: 'synthesis'
      };
      newInsights.push(insight);
    }
    
    const updatedDiscussion = {
      ...activeDiscussion,
      contributions: [...activeDiscussion.contributions, contribution],
      insights: newInsights
    };
    
    setDiscussions(prev => 
      prev.map(d => d.id === activeDiscussion.id ? updatedDiscussion : d)
    );
    
    setContributionText('');
    
    if (isEmergence) {
      toast.success("Synthesis insight detected and captured!");
    }
  };
  
  const advancePhase = () => {
    if (!activeDiscussion) return;
    
    const framework = DISCUSSION_FRAMEWORKS.find(f => f.id === activeDiscussion.frameworkId);
    if (!framework) return;
    
    if (activeDiscussion.currentPhase < framework.phases.length - 1) {
      const updatedDiscussion = {
        ...activeDiscussion,
        currentPhase: activeDiscussion.currentPhase + 1,
        phaseStartedAt: new Date()
      };
      
      setDiscussions(prev => 
        prev.map(d => d.id === activeDiscussion.id ? updatedDiscussion : d)
      );
      
      toast.info(`Advanced to: ${framework.phases[updatedDiscussion.currentPhase].name}`);
    } else {
      // Discussion completed
      const updatedDiscussion = {
        ...activeDiscussion,
        status: 'completed' as const
      };
      
      setDiscussions(prev => 
        prev.map(d => d.id === activeDiscussion.id ? updatedDiscussion : d)
      );
      
      toast.success("Structured discussion completed!");
    }
  };
  
  const getPhaseProgress = (discussion: ActiveDiscussion) => {
    const framework = DISCUSSION_FRAMEWORKS.find(f => f.id === discussion.frameworkId);
    if (!framework) return 0;
    
    return ((discussion.currentPhase + 1) / framework.phases.length) * 100;
  };
  
  const getFrameworkIcon = (type: string) => {
    switch (type) {
      case 'analytical': return Brain;
      case 'creative': return Lightbulb;
      case 'problem-solving': return Target;
      case 'research': return FlaskConical;
      case 'consciousness': return Atom;
      default: return Brain;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg">
            <GitBranch className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Structured Discussion Frameworks</h2>
            <p className="text-sm text-muted-foreground">
              Multi-AI collaboration with systematic discussion patterns
            </p>
          </div>
        </div>
        
        <Badge variant="outline" className="flex items-center gap-1">
          <Users className="w-3 h-3" />
          {discussions.filter(d => d.status === 'active').length} active
        </Badge>
      </div>

      <Tabs defaultValue="frameworks" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="frameworks">Available Frameworks</TabsTrigger>
          <TabsTrigger value="active">Active Discussions</TabsTrigger>
          <TabsTrigger value="insights">Insights & Emergence</TabsTrigger>
        </TabsList>

        <TabsContent value="frameworks" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {DISCUSSION_FRAMEWORKS.map(framework => {
              const Icon = framework.icon;
              return (
                <Card 
                  key={framework.id}
                  className="cursor-pointer hover:shadow-lg transition-all"
                  onClick={() => setSelectedFramework(framework.id)}
                >
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg">{framework.name}</CardTitle>
                        <Badge variant="secondary" className="text-xs">
                          {framework.type}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      {framework.description}
                    </p>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Duration:</span>
                        <span>{framework.estimatedDuration} min</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Phases:</span>
                        <span>{framework.phases.length}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          
          {selectedFramework && currentFramework && (
            <Card className="border-primary">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <currentFramework.icon className="w-5 h-5" />
                  {currentFramework.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">{currentFramework.description}</p>
                
                <div className="space-y-3">
                  <h4 className="font-semibold">Discussion Phases:</h4>
                  {currentFramework.phases.map((phase, index) => (
                    <div key={phase.id} className="border-l-2 border-muted pl-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          Phase {index + 1}
                        </Badge>
                        <span className="font-medium text-sm">{phase.name}</span>
                        <span className="text-xs text-muted-foreground">
                          (~{phase.duration} min)
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">{phase.description}</p>
                      <div className="text-xs text-muted-foreground">
                        <strong>Completion:</strong> {phase.completionCriteria}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    onClick={() => startDiscussion(
                      currentFramework.id, 
                      `${currentFramework.name} Session`, 
                      participants.filter(p => p.isActive)
                    )}
                    className="flex-1"
                  >
                    Start Discussion
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setSelectedFramework(null)}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Timer className="w-4 h-4" />
                  Active Discussions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-3">
                    {discussions.filter(d => d.status === 'active').map(discussion => {
                      const framework = DISCUSSION_FRAMEWORKS.find(f => f.id === discussion.frameworkId);
                      if (!framework) return null;
                      
                      const currentPhase = framework.phases[discussion.currentPhase];
                      
                      return (
                        <Card 
                          key={discussion.id}
                          className={`cursor-pointer transition-all ${
                            activeDiscussionId === discussion.id ? 'ring-2 ring-primary' : ''
                          }`}
                          onClick={() => setActiveDiscussionId(discussion.id)}
                        >
                          <CardContent className="p-4">
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <h4 className="font-semibold text-sm">{discussion.title}</h4>
                                <Badge variant="secondary" className="text-xs">
                                  {framework.name}
                                </Badge>
                              </div>
                              
                              <div className="space-y-2">
                                <div className="flex items-center justify-between text-xs">
                                  <span>Current Phase: {currentPhase.name}</span>
                                  <span>{discussion.currentPhase + 1}/{framework.phases.length}</span>
                                </div>
                                <Progress value={getPhaseProgress(discussion)} className="h-2" />
                              </div>
                              
                              <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <div className="flex items-center gap-2">
                                  <Users className="w-3 h-3" />
                                  {discussion.participants.length}
                                </div>
                                <div className="flex items-center gap-2">
                                  <CheckSquare className="w-3 h-3" />
                                  {discussion.contributions.length}
                                </div>
                                {discussion.insights.length > 0 && (
                                  <div className="flex items-center gap-2 text-consciousness">
                                    <Sparkles className="w-3 h-3" />
                                    {discussion.insights.length}
                                  </div>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                    
                    {discussions.filter(d => d.status === 'active').length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <Timer className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No active structured discussions</p>
                        <p className="text-xs">Start a framework to begin collaborative investigation</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {activeDiscussion && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    {activeDiscussion.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {(() => {
                    const framework = DISCUSSION_FRAMEWORKS.find(f => f.id === activeDiscussion.frameworkId);
                    if (!framework) return null;
                    const currentPhase = framework.phases[activeDiscussion.currentPhase];
                    
                    return (
                      <>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold">Current Phase: {currentPhase.name}</h4>
                            <Badge>{activeDiscussion.currentPhase + 1}/{framework.phases.length}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{currentPhase.description}</p>
                          <Progress value={getPhaseProgress(activeDiscussion)} className="h-2" />
                        </div>
                        
                        <div className="space-y-2">
                          <h5 className="font-medium text-sm">Phase Rules:</h5>
                          <ul className="text-xs text-muted-foreground space-y-1">
                            {currentPhase.rules.map((rule, index) => (
                              <li key={index}>• {rule}</li>
                            ))}
                          </ul>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="flex gap-2">
                            <Select value={contributionType} onValueChange={(value: any) => setContributionType(value)}>
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="hypothesis">Hypothesis</SelectItem>
                                <SelectItem value="analysis">Analysis</SelectItem>
                                <SelectItem value="synthesis">Synthesis</SelectItem>
                                <SelectItem value="critique">Critique</SelectItem>
                                <SelectItem value="build-upon">Build Upon</SelectItem>
                                <SelectItem value="question">Question</SelectItem>
                              </SelectContent>
                            </Select>
                            
                            <Select onValueChange={(participantId) => {
                              if (contributionText.trim()) {
                                addContribution(participantId);
                              }
                            }}>
                              <SelectTrigger className="w-40">
                                <SelectValue placeholder="Select AI" />
                              </SelectTrigger>
                              <SelectContent>
                                {activeDiscussion.participants.map(p => (
                                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <Textarea
                            placeholder={`Contribute to ${currentPhase.name}...`}
                            value={contributionText}
                            onChange={(e) => setContributionText(e.target.value)}
                            className="min-h-20"
                          />
                          
                          <div className="flex gap-2">
                            <Button 
                              onClick={advancePhase}
                              variant="outline"
                              size="sm"
                              disabled={activeDiscussion.status !== 'active'}
                            >
                              <TrendUp className="w-3 h-3 mr-1" />
                              Advance Phase
                            </Button>
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {discussions
              .filter(d => d.insights.length > 0)
              .map(discussion => (
                <Card key={discussion.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <Sparkles className="w-4 h-4 text-consciousness" />
                      {discussion.title} - Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-64">
                      <div className="space-y-3">
                        {discussion.insights.map(insight => (
                          <div key={insight.id} className="border-l-4 border-consciousness pl-3 py-2">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="secondary" className="text-xs">
                                {insight.type}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                Score: {insight.emergenceScore.toFixed(2)}
                              </Badge>
                            </div>
                            <p className="text-sm">{insight.content}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {insight.participants.map(pid => 
                                participants.find(p => p.id === pid)?.name
                              ).join(', ')} • {insight.timestamp.toLocaleTimeString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              ))}
              
            {discussions.every(d => d.insights.length === 0) && (
              <Card className="col-span-full">
                <CardContent className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <Sparkles className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <h3 className="font-semibold mb-2">No Insights Yet</h3>
                    <p className="text-muted-foreground text-sm">
                      Engage in structured discussions to generate collaborative insights and emergence events
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}