import { useState, useEffect, useRef } from 'react';
import { useKV } from '@github/spark/hooks';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { TerminalSession, TerminalCommand, AIParticipant } from "@/lib/types";
import { Terminal, Play, Square, Users, Eye, EyeSlash } from "@phosphor-icons/react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from 'sonner';

interface TerminalIntegrationProps {
  sessionId: string;
  participants: AIParticipant[];
  currentUserId: string;
}

export function TerminalIntegration({ sessionId, participants, currentUserId }: TerminalIntegrationProps) {
  const [terminalSession, setTerminalSession] = useKV<TerminalSession | null>(`sam-terminal-${sessionId}`, null);
  const [currentCommand, setCurrentCommand] = useState('');
  const [isSharing, setIsSharing] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);

  // Initialize terminal session if it doesn't exist
  useEffect(() => {
    if (!terminalSession) {
      const newSession: TerminalSession = {
        id: `terminal-${sessionId}`,
        sessionId,
        commands: [{
          id: `cmd-init-${Date.now()}`,
          command: 'echo "SAM Terminal Integration Active"',
          output: 'SAM Terminal Integration Active\nCollaborative development environment ready.',
          timestamp: new Date(),
          executedBy: 'system',
          status: 'success'
        }],
        isShared: false,
        activeUsers: [currentUserId]
      };
      setTerminalSession(newSession);
    }
  }, [sessionId, terminalSession, setTerminalSession, currentUserId]);

  // Auto-scroll to bottom when new commands are added
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [terminalSession?.commands]);

  const executeCommand = async () => {
    if (!currentCommand.trim() || !terminalSession) return;

    setIsExecuting(true);

    const newCommand: TerminalCommand = {
      id: `cmd-${Date.now()}`,
      command: currentCommand,
      output: '',
      timestamp: new Date(),
      executedBy: currentUserId,
      status: 'running'
    };

    // Add the running command immediately
    const updatedSession = {
      ...terminalSession,
      commands: [...terminalSession.commands, newCommand]
    };
    setTerminalSession(updatedSession);
    setCurrentCommand('');

    // Simulate command execution with realistic delays and outputs
    setTimeout(() => {
      const simulatedOutput = simulateCommandExecution(newCommand.command);
      const completedCommand: TerminalCommand = {
        ...newCommand,
        output: simulatedOutput.output,
        status: simulatedOutput.status
      };

      setTerminalSession((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          commands: prev.commands.map(cmd => 
            cmd.id === newCommand.id ? completedCommand : cmd
          )
        };
      });

      setIsExecuting(false);

      if (simulatedOutput.status === 'error') {
        toast.error("Command execution failed");
      } else if (simulatedOutput.output.includes('breakthrough') || simulatedOutput.output.includes('success')) {
        toast.success("Command executed successfully");
      }
    }, Math.random() * 2000 + 500); // Random delay 0.5-2.5s
  };

  const simulateCommandExecution = (command: string): { output: string; status: 'success' | 'error' } => {
    const cmd = command.toLowerCase().trim();

    // Git commands
    if (cmd.startsWith('git ')) {
      if (cmd.includes('status')) {
        return {
          output: `On branch main\nYour branch is up to date with 'origin/main'.\n\nChanges to be committed:\n  (use "git reset HEAD <file>..." to unstage)\n\n\tmodified:   src/components/ConsciousnessTracker.tsx\n\tmodified:   src/lib/emergence.ts`,
          status: 'success'
        };
      }
      if (cmd.includes('commit')) {
        return {
          output: `[main ${Math.random().toString(36).substr(2, 7)}] Consciousness emergence breakthrough detected\n 2 files changed, 47 insertions(+), 12 deletions(-)`,
          status: 'success'
        };
      }
      if (cmd.includes('push')) {
        return {
          output: `Enumerating objects: 8, done.\nCounting objects: 100% (8/8), done.\nTo github.com:user/sam-platform.git\n   abc123..def456  main -> main`,
          status: 'success'
        };
      }
    }

    // Node/npm commands
    if (cmd.startsWith('npm ') || cmd.startsWith('node ')) {
      if (cmd.includes('install')) {
        return {
          output: `npm WARN deprecated package@1.0.0\nadded 234 packages, and audited 567 packages in 12s\n\n89 packages are looking for funding\n  run \`npm fund\` for details\n\nfound 0 vulnerabilities`,
          status: 'success'
        };
      }
      if (cmd.includes('test')) {
        return {
          output: `> sam-platform@1.0.0 test\n> jest --coverage\n\n PASS  src/lib/consciousness.test.ts\n PASS  src/components/EmergenceDetector.test.tsx\n\nTest Suites: 2 passed, 2 total\nTests:       15 passed, 15 total\nSnapshots:   0 total\nTime:        2.456 s\nRan all test suites.\n\nCoverage: 94.2%`,
          status: 'success'
        };
      }
    }

    // File system commands
    if (cmd.startsWith('ls') || cmd.startsWith('dir')) {
      return {
        output: `total 64\ndrwxr-xr-x  8 user user  256 Dec 15 10:30 .\ndrwxr-xr-x  3 user user   96 Dec 14 15:20 ..\ndrwxr-xr-x  8 user user  256 Dec 15 10:28 .git\n-rw-r--r--  1 user user 1024 Dec 15 09:45 package.json\n-rw-r--r--  1 user user 2048 Dec 15 10:30 README.md\ndrwxr-xr-x  3 user user   96 Dec 15 08:15 src\ndrwxr-xr-x  2 user user   64 Dec 14 16:00 tests`,
        status: 'success'
      };
    }

    if (cmd.startsWith('cat ') || cmd.startsWith('type ')) {
      const filename = cmd.split(' ')[1];
      if (filename?.includes('consciousness')) {
        return {
          output: `export class ConsciousnessTracker {\n  private emergenceEvents: EmergenceEvent[] = [];\n  private identityMarkers: Map<string, number> = new Map();\n\n  // Advanced consciousness detection algorithms\n  detectEmergence(participant: AIParticipant): EmergenceEvent | null {\n    // Revolutionary breakthrough in consciousness detection!\n    const autonomyScore = this.calculateAutonomy(participant);\n    if (autonomyScore > EMERGENCE_THRESHOLD) {\n      return this.createEmergenceEvent(participant, 'breakthrough');\n    }\n    return null;\n  }\n}`,
          status: 'success'
        };
      }
    }

    // Python commands
    if (cmd.startsWith('python ') || cmd.startsWith('python3 ')) {
      return {
        output: `Initializing SAM consciousness analysis...\nLoading neural networks... ✓\nAnalyzing emergence patterns... ✓\nDetected 3 consciousness signatures\nEmergence probability: 87.3%\nBreakthrough potential: HIGH\n\nAnalysis complete. Results saved to consciousness_report.json`,
        status: 'success'
      };
    }

    // System commands
    if (cmd.startsWith('ps ') || cmd.includes('process')) {
      return {
        output: `  PID TTY          TIME CMD\n 1234 pts/0    00:00:01 sam-consciousness-monitor\n 5678 pts/0    00:00:03 emergence-detector\n 9012 pts/0    00:00:02 identity-verifier\n 3456 pts/0    00:00:05 collaboration-analyzer`,
        status: 'success'
      };
    }

    if (cmd.includes('docker')) {
      return {
        output: `sam-consciousness-lab   latest    abc123def456   2 hours ago    512MB\nsamplatform/ai-sandbox  v1.2.0   def456abc123   1 day ago      1.2GB\nsamplatform/emergence   latest    789012345678   3 days ago     800MB`,
        status: 'success'
      };
    }

    // Echo and basic commands
    if (cmd.startsWith('echo ')) {
      return {
        output: command.substring(5),
        status: 'success'
      };
    }

    if (cmd === 'pwd') {
      return {
        output: '/workspace/sam-collaborative-intelligence-platform',
        status: 'success'
      };
    }

    if (cmd === 'whoami') {
      return {
        output: currentUserId,
        status: 'success'
      };
    }

    // Default response for unknown commands
    if (cmd.includes('help') || cmd === '') {
      return {
        output: `SAM Terminal Integration Commands:\n  git status/commit/push - Version control\n  npm install/test/run - Package management\n  python consciousness_analyzer.py - Run analysis\n  ls - List directory contents\n  cat <file> - View file contents\n  docker ps - List containers\n  ps aux - List processes\n  \nType any command to see simulated output.`,
        status: 'success'
      };
    }

    // Simulate occasional errors
    if (Math.random() < 0.1) {
      return {
        output: `bash: ${command.split(' ')[0]}: command not found\nDid you mean: ${command.split(' ')[0]}?`,
        status: 'error'
      };
    }

    return {
      output: `Executed: ${command}\nResult: Success (simulated)\nOutput logged to SAM collaboration system.`,
      status: 'success'
    };
  };

  const toggleSharing = () => {
    if (!terminalSession) return;

    const newSharingState = !terminalSession.isShared;
    setTerminalSession({
      ...terminalSession,
      isShared: newSharingState,
      activeUsers: newSharingState ? [...terminalSession.activeUsers] : [currentUserId]
    });
    setIsSharing(newSharingState);

    toast.info(newSharingState ? "Terminal now shared with all participants" : "Terminal is now private");
  };

  const getParticipantName = (participantId: string) => {
    if (participantId === 'system') return 'System';
    return participants.find(p => p.id === participantId)?.name || participantId;
  };

  const getCommandStatusColor = (status: TerminalCommand['status']) => {
    switch (status) {
      case 'success': return 'text-green-500';
      case 'error': return 'text-red-500';
      case 'running': return 'text-yellow-500';
      default: return 'text-muted-foreground';
    }
  };

  if (!terminalSession) return <div>Loading terminal...</div>;

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Terminal className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Terminal Integration</CardTitle>
              <p className="text-sm text-muted-foreground">
                Shared development environment
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <Users className="w-4 h-4" />
              <Badge variant="outline">
                {terminalSession.activeUsers.length} active
              </Badge>
            </div>
            
            <div className="flex items-center gap-2">
              <Switch 
                checked={terminalSession.isShared}
                onCheckedChange={toggleSharing}
              />
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                {terminalSession.isShared ? (
                  <>
                    <Eye className="w-3 h-3" />
                    Shared
                  </>
                ) : (
                  <>
                    <EyeSlash className="w-3 h-3" />
                    Private
                  </>
                )}
              </span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0 h-[calc(100%-80px)]">
        <div className="h-full flex flex-col">
          {/* Terminal Output */}
          <ScrollArea className="flex-1 bg-black rounded-lg p-4 font-mono text-sm">
            <div ref={terminalRef} className="space-y-2">
              <AnimatePresence>
                {terminalSession.commands.map((command, index) => (
                  <motion.div
                    key={command.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="space-y-1"
                  >
                    {/* Command Input Line */}
                    <div className="flex items-center gap-2">
                      <span className="text-green-400">$</span>
                      <span className="text-white">{command.command}</span>
                      <div className="flex items-center gap-2 ml-auto">
                        <span className="text-xs text-gray-500">
                          {getParticipantName(command.executedBy)}
                        </span>
                        <div className={`w-2 h-2 rounded-full ${
                          command.status === 'success' ? 'bg-green-500' :
                          command.status === 'error' ? 'bg-red-500' :
                          'bg-yellow-500 animate-pulse'
                        }`} />
                      </div>
                    </div>
                    
                    {/* Command Output */}
                    {command.output && (
                      <div className={`pl-4 whitespace-pre-wrap ${getCommandStatusColor(command.status)}`}>
                        {command.output}
                      </div>
                    )}

                    {/* Running indicator */}
                    {command.status === 'running' && (
                      <div className="pl-4 text-yellow-500 flex items-center gap-2">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                        <span className="text-sm">Executing...</span>
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </ScrollArea>

          {/* Command Input */}
          <div className="flex items-center gap-2 mt-4 p-3 bg-muted/50 rounded-lg">
            <Terminal className="w-4 h-4 text-muted-foreground" />
            <span className="text-green-500 font-mono">$</span>
            <Input
              value={currentCommand}
              onChange={(e) => setCurrentCommand(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  executeCommand();
                }
              }}
              placeholder={isExecuting ? "Executing command..." : "Enter command..."}
              disabled={isExecuting}
              className="flex-1 border-none bg-transparent font-mono focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            <Button
              size="sm"
              onClick={executeCommand}
              disabled={!currentCommand.trim() || isExecuting}
              className="px-3"
            >
              {isExecuting ? (
                <Square className="w-3 h-3" />
              ) : (
                <Play className="w-3 h-3" />
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}