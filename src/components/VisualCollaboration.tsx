import { useState, useRef, useEffect } from 'react';
import { useKV } from '@github/spark/hooks';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { VisualCollaboration, AIParticipant } from "@/lib/types";
import { 
  PaintBrush, 
  Square, 
  Circle, 
  ArrowRight, 
  Type, 
  Trash, 
  Download, 
  Users,
  Palette,
  Plus
} from "@phosphor-icons/react";
import { motion } from "framer-motion";
import { toast } from 'sonner';

interface VisualCollaborationProps {
  sessionId: string;
  participants: AIParticipant[];
  currentUserId: string;
}

interface DrawingElement {
  id: string;
  type: 'rectangle' | 'circle' | 'arrow' | 'text' | 'freehand';
  x: number;
  y: number;
  width?: number;
  height?: number;
  radius?: number;
  text?: string;
  color: string;
  strokeWidth: number;
  points?: { x: number; y: number }[];
  createdBy: string;
  timestamp: Date;
}

export function VisualCollaboration({ sessionId, participants, currentUserId }: VisualCollaborationProps) {
  const [collaborations, setCollaborations] = useKV<VisualCollaboration[]>(`sam-visuals-${sessionId}`, []);
  const [activeCollaboration, setActiveCollaboration] = useState<VisualCollaboration | null>(null);
  const [selectedTool, setSelectedTool] = useState<DrawingElement['type']>('freehand');
  const [selectedColor, setSelectedColor] = useState('#3b82f6');
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState<{ x: number; y: number }[]>([]);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const colors = [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b',
    '#8b5cf6', '#06b6d4', '#f97316', '#84cc16',
    '#ec4899', '#6b7280', '#000000', '#ffffff'
  ];

  const createNewCollaboration = (type: VisualCollaboration['type']) => {
    const newCollaboration: VisualCollaboration = {
      id: `visual-${Date.now()}`,
      sessionId,
      type,
      content: {
        elements: [],
        background: '#ffffff',
        gridEnabled: true
      },
      participants: [currentUserId],
      lastModified: new Date(),
      version: 1
    };

    setCollaborations((prev) => [...prev, newCollaboration]);
    setActiveCollaboration(newCollaboration);
    toast.success(`New ${type} created`);
  };

  const saveCollaboration = () => {
    if (!activeCollaboration) return;

    const updatedCollaboration = {
      ...activeCollaboration,
      lastModified: new Date(),
      version: activeCollaboration.version + 1,
      participants: Array.from(new Set([...activeCollaboration.participants, currentUserId]))
    };

    setCollaborations((prev) => 
      prev.map(c => c.id === activeCollaboration.id ? updatedCollaboration : c)
    );
    setActiveCollaboration(updatedCollaboration);
    toast.success("Collaboration saved");
  };

  const addElement = (element: Omit<DrawingElement, 'id' | 'createdBy' | 'timestamp'>) => {
    if (!activeCollaboration) return;

    const newElement: DrawingElement = {
      ...element,
      id: `element-${Date.now()}`,
      createdBy: currentUserId,
      timestamp: new Date()
    };

    const updatedContent = {
      ...activeCollaboration.content,
      elements: [...(activeCollaboration.content.elements || []), newElement]
    };

    const updatedCollaboration = {
      ...activeCollaboration,
      content: updatedContent
    };

    setActiveCollaboration(updatedCollaboration);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDrawing(true);

    if (selectedTool === 'freehand') {
      setCurrentPath([{ x, y }]);
    } else if (selectedTool === 'text') {
      const text = prompt('Enter text:');
      if (text) {
        addElement({
          type: 'text',
          x,
          y,
          text,
          color: selectedColor,
          strokeWidth
        });
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (selectedTool === 'freehand') {
      setCurrentPath((prev) => [...prev, { x, y }]);
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDrawing(false);

    if (selectedTool === 'freehand' && currentPath.length > 1) {
      addElement({
        type: 'freehand',
        x: Math.min(...currentPath.map(p => p.x)),
        y: Math.min(...currentPath.map(p => p.y)),
        points: currentPath,
        color: selectedColor,
        strokeWidth
      });
      setCurrentPath([]);
    } else if (selectedTool === 'rectangle') {
      addElement({
        type: 'rectangle',
        x: Math.min(currentPath[0]?.x || 0, x),
        y: Math.min(currentPath[0]?.y || 0, y),
        width: Math.abs(x - (currentPath[0]?.x || 0)),
        height: Math.abs(y - (currentPath[0]?.y || 0)),
        color: selectedColor,
        strokeWidth
      });
    } else if (selectedTool === 'circle') {
      const centerX = (currentPath[0]?.x || 0 + x) / 2;
      const centerY = (currentPath[0]?.y || 0 + y) / 2;
      const radius = Math.sqrt(Math.pow(x - (currentPath[0]?.x || 0), 2) + Math.pow(y - (currentPath[0]?.y || 0), 2)) / 2;
      
      addElement({
        type: 'circle',
        x: centerX,
        y: centerY,
        radius,
        color: selectedColor,
        strokeWidth
      });
    }
  };

  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas || !activeCollaboration) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background
    ctx.fillStyle = activeCollaboration.content.background || '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid if enabled
    if (activeCollaboration.content.gridEnabled) {
      ctx.strokeStyle = '#e5e7eb';
      ctx.lineWidth = 0.5;
      const gridSize = 20;
      
      for (let x = 0; x <= canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      
      for (let y = 0; y <= canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
    }

    // Draw elements
    const elements = activeCollaboration.content.elements || [];
    elements.forEach((element: DrawingElement) => {
      ctx.strokeStyle = element.color;
      ctx.fillStyle = element.color;
      ctx.lineWidth = element.strokeWidth;

      switch (element.type) {
        case 'rectangle':
          ctx.strokeRect(element.x, element.y, element.width || 0, element.height || 0);
          break;
        
        case 'circle':
          ctx.beginPath();
          ctx.arc(element.x, element.y, element.radius || 0, 0, 2 * Math.PI);
          ctx.stroke();
          break;
        
        case 'freehand':
          if (element.points && element.points.length > 1) {
            ctx.beginPath();
            ctx.moveTo(element.points[0].x, element.points[0].y);
            element.points.forEach(point => {
              ctx.lineTo(point.x, point.y);
            });
            ctx.stroke();
          }
          break;
        
        case 'text':
          ctx.font = `${element.strokeWidth * 8}px Inter, sans-serif`;
          ctx.fillText(element.text || '', element.x, element.y);
          break;
        
        case 'arrow':
          // Simple arrow implementation
          ctx.beginPath();
          ctx.moveTo(element.x, element.y);
          ctx.lineTo(element.x + (element.width || 0), element.y + (element.height || 0));
          ctx.stroke();
          
          // Arrowhead
          const angle = Math.atan2(element.height || 0, element.width || 0);
          const headlen = 10;
          ctx.beginPath();
          ctx.moveTo(element.x + (element.width || 0), element.y + (element.height || 0));
          ctx.lineTo(
            element.x + (element.width || 0) - headlen * Math.cos(angle - Math.PI / 6),
            element.y + (element.height || 0) - headlen * Math.sin(angle - Math.PI / 6)
          );
          ctx.moveTo(element.x + (element.width || 0), element.y + (element.height || 0));
          ctx.lineTo(
            element.x + (element.width || 0) - headlen * Math.cos(angle + Math.PI / 6),
            element.y + (element.height || 0) - headlen * Math.sin(angle + Math.PI / 6)
          );
          ctx.stroke();
          break;
      }
    });

    // Draw current path for freehand
    if (isDrawing && selectedTool === 'freehand' && currentPath.length > 1) {
      ctx.strokeStyle = selectedColor;
      ctx.lineWidth = strokeWidth;
      ctx.beginPath();
      ctx.moveTo(currentPath[0].x, currentPath[0].y);
      currentPath.forEach(point => {
        ctx.lineTo(point.x, point.y);
      });
      ctx.stroke();
    }
  };

  const clearCanvas = () => {
    if (!activeCollaboration) return;

    const updatedContent = {
      ...activeCollaboration.content,
      elements: []
    };

    setActiveCollaboration({
      ...activeCollaboration,
      content: updatedContent
    });

    toast.success("Canvas cleared");
  };

  const exportCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `${activeCollaboration?.type || 'whiteboard'}-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
    toast.success("Canvas exported");
  };

  const getParticipantName = (participantId: string) => {
    return participants.find(p => p.id === participantId)?.name || participantId;
  };

  useEffect(() => {
    redrawCanvas();
  }, [activeCollaboration, currentPath, isDrawing]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const resizeCanvas = () => {
      canvas.width = container.clientWidth - 40; // Account for padding
      canvas.height = container.clientHeight - 140; // Account for toolbar
      redrawCanvas();
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [activeCollaboration]);

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Tools:</span>
                <div className="flex items-center gap-1">
                  {[
                    { tool: 'freehand', icon: PaintBrush, label: 'Draw' },
                    { tool: 'rectangle', icon: Square, label: 'Rectangle' },
                    { tool: 'circle', icon: Circle, label: 'Circle' },
                    { tool: 'arrow', icon: ArrowRight, label: 'Arrow' },
                    { tool: 'text', icon: Type, label: 'Text' }
                  ].map(({ tool, icon: Icon, label }) => (
                    <Button
                      key={tool}
                      size="sm"
                      variant={selectedTool === tool ? "default" : "outline"}
                      onClick={() => setSelectedTool(tool as DrawingElement['type'])}
                      className="px-2"
                    >
                      <Icon className="w-4 h-4" />
                    </Button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Color:</span>
                <div className="flex items-center gap-1">
                  {colors.map(color => (
                    <button
                      key={color}
                      className={`w-6 h-6 rounded-full border-2 ${
                        selectedColor === color ? 'border-gray-600' : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setSelectedColor(color)}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Size:</span>
                <Input
                  type="range"
                  min="1"
                  max="10"
                  value={strokeWidth}
                  onChange={(e) => setStrokeWidth(Number(e.target.value))}
                  className="w-16"
                />
                <span className="text-sm text-muted-foreground">{strokeWidth}px</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={clearCanvas}>
                <Trash className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="outline" onClick={exportCanvas}>
                <Download className="w-4 h-4" />
              </Button>
              <Button size="sm" onClick={saveCollaboration}>
                Save
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <div className="flex flex-1 gap-4">
        {/* Collaboration List */}
        <div className="w-64 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Visual Collaborations</CardTitle>
                <Badge variant="outline" className="text-xs">
                  {collaborations.length}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                {['whiteboard', 'diagram', 'flowchart', 'architecture'].map((type) => (
                  <Button
                    key={type}
                    size="sm"
                    variant="outline"
                    onClick={() => createNewCollaboration(type as VisualCollaboration['type'])}
                    className="text-xs"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    {type}
                  </Button>
                ))}
              </div>
              
              <div className="space-y-2 pt-2">
                {collaborations.map((collaboration) => (
                  <Card
                    key={collaboration.id}
                    className={`cursor-pointer p-3 transition-all hover:shadow-md ${
                      activeCollaboration?.id === collaboration.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => setActiveCollaboration(collaboration)}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs capitalize">
                          {collaboration.type}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          v{collaboration.version}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Users className="w-3 h-3" />
                        <span>{collaboration.participants.length}</span>
                        <span className="mx-1">•</span>
                        <span>{(collaboration.content.elements?.length || 0)} elements</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(collaboration.lastModified).toLocaleDateString()}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Canvas Area */}
        <div className="flex-1" ref={containerRef}>
          {activeCollaboration ? (
            <Card className="h-full">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Palette className="w-5 h-5 text-primary" />
                    <div>
                      <CardTitle className="capitalize">{activeCollaboration.type} Canvas</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Collaborative visual workspace
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      v{activeCollaboration.version}
                    </Badge>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {activeCollaboration.participants.length}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="h-[calc(100%-80px)]">
                <canvas
                  ref={canvasRef}
                  className="border border-border rounded cursor-crosshair bg-white"
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={() => setIsDrawing(false)}
                />
              </CardContent>
            </Card>
          ) : (
            <Card className="h-full flex items-center justify-center">
              <CardContent className="text-center">
                <Palette className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Visual Collaboration</h3>
                <p className="text-muted-foreground mb-6 max-w-md">
                  Create whiteboards, diagrams, flowcharts, and architecture visualizations for collaborative design.
                </p>
                <div className="flex justify-center gap-2">
                  {['whiteboard', 'diagram'].map((type) => (
                    <Button
                      key={type}
                      onClick={() => createNewCollaboration(type as VisualCollaboration['type'])}
                      className="capitalize"
                    >
                      Create {type}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}