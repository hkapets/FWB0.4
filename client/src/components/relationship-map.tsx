import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Plus, 
  Trash2, 
  Edit, 
  Heart, 
  Sword, 
  Crown, 
  Shield,
  MapPin,
  Zap
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface RelationshipNode {
  id: string;
  name: string;
  type: 'character' | 'location' | 'organization' | 'event';
  x: number;
  y: number;
  imageUrl?: string;
}

interface Relationship {
  id: string;
  fromId: string;
  toId: string;
  type: 'family' | 'friend' | 'enemy' | 'ally' | 'romantic' | 'mentor' | 'subordinate' | 'neutral';
  strength: number; // 1-10
  description: string;
  isDirectional: boolean;
}

interface RelationshipMapProps {
  worldId: number;
}

const relationshipTypes = [
  { value: 'family', label: 'Родина', icon: Heart, color: 'text-pink-400' },
  { value: 'friend', label: 'Друг', icon: Users, color: 'text-green-400' },
  { value: 'enemy', label: 'Ворог', icon: Sword, color: 'text-red-400' },
  { value: 'ally', label: 'Союзник', icon: Shield, color: 'text-blue-400' },
  { value: 'romantic', label: 'Романтичні', icon: Heart, color: 'text-rose-400' },
  { value: 'mentor', label: 'Наставник', icon: Crown, color: 'text-yellow-400' },
  { value: 'subordinate', label: 'Підлеглий', icon: Crown, color: 'text-purple-400' },
  { value: 'neutral', label: 'Нейтральні', icon: Users, color: 'text-gray-400' },
];

export default function RelationshipMap({ worldId }: RelationshipMapProps) {
  const [nodes, setNodes] = useState<RelationshipNode[]>([]);
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [selectedNode, setSelectedNode] = useState<RelationshipNode | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement>(null);

  const [formData, setFormData] = useState({
    fromId: '',
    toId: '',
    type: 'neutral' as const,
    strength: 5,
    description: '',
    isDirectional: false,
  });

  useEffect(() => {
    loadData();
  }, [worldId]);

  const loadData = async () => {
    try {
      // Завантажуємо персонажів та локації
      const [charactersRes, locationsRes] = await Promise.all([
        fetch(`/api/worlds/${worldId}/characters`),
        fetch(`/api/worlds/${worldId}/locations`),
      ]);

      const characters = await charactersRes.json();
      const locations = await locationsRes.json();

      // Створюємо вузли
      const characterNodes: RelationshipNode[] = characters.map((char: any, index: number) => ({
        id: `char-${char.id}`,
        name: char.name,
        type: 'character' as const,
        x: 100 + (index % 5) * 150,
        y: 100 + Math.floor(index / 5) * 150,
        imageUrl: char.imageUrl,
      }));

      const locationNodes: RelationshipNode[] = locations.map((loc: any, index: number) => ({
        id: `loc-${loc.id}`,
        name: loc.name,
        type: 'location' as const,
        x: 100 + (index % 5) * 150,
        y: 300 + Math.floor(index / 5) * 150,
      }));

      setNodes([...characterNodes, ...locationNodes]);

      // Завантажуємо зв'язки (поки що заглушка)
      setRelationships([]);
    } catch (error) {
      console.error('Error loading relationship data:', error);
    }
  };

  const handleNodeMouseDown = (node: RelationshipNode, event: React.MouseEvent) => {
    if (event.button === 0) { // Лівий клік
      setSelectedNode(node);
      setIsDragging(true);
      const rect = svgRef.current?.getBoundingClientRect();
      if (rect) {
        setDragOffset({
          x: (event.clientX - rect.left) / zoom - node.x,
          y: (event.clientY - rect.top) / zoom - node.y,
        });
      }
    }
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    if (isDragging && selectedNode) {
      const rect = svgRef.current?.getBoundingClientRect();
      if (rect) {
        const newX = (event.clientX - rect.left) / zoom - dragOffset.x;
        const newY = (event.clientY - rect.top) / zoom - dragOffset.y;

        setNodes(prev => prev.map(node => 
          node.id === selectedNode.id 
            ? { ...node, x: newX, y: newY }
            : node
        ));
      }
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setSelectedNode(null);
  };

  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'character': return Users;
      case 'location': return MapPin;
      case 'organization': return Crown;
      case 'event': return Zap;
      default: return Users;
    }
  };

  const getRelationshipColor = (type: string) => {
    const relType = relationshipTypes.find(rt => rt.value === type);
    return relType?.color || 'text-gray-400';
  };

  const createRelationship = async () => {
    try {
      // Тут буде API запит для створення зв'язку
      const newRelationship: Relationship = {
        id: `rel-${Date.now()}`,
        ...formData,
      };

      setRelationships(prev => [...prev, newRelationship]);
      setIsCreateModalOpen(false);
      setFormData({
        fromId: '',
        toId: '',
        type: 'neutral',
        strength: 5,
        description: '',
        isDirectional: false,
      });
    } catch (error) {
      console.error('Error creating relationship:', error);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 border-b border-yellow-500/20">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-fantasy text-fantasy-gold-300">
            Карта зв'язків
          </h2>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setZoom(prev => Math.min(prev + 0.1, 2))}
              className="fantasy-button-outline"
            >
              +
            </Button>
            <span className="text-sm text-gray-400 min-w-[60px] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setZoom(prev => Math.max(prev - 0.1, 0.5))}
              className="fantasy-button-outline"
            >
              -
            </Button>
          </div>
        </div>
        
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          className="fantasy-button"
        >
          <Plus className="mr-2 h-4 w-4" />
          Додати зв'язок
        </Button>
      </div>

      {/* Map Container */}
      <div className="flex-1 relative overflow-hidden bg-black/20">
        <svg
          ref={svgRef}
          width="100%"
          height="100%"
          className="cursor-move"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon
                points="0 0, 10 3.5, 0 7"
                fill="currentColor"
                className="text-gray-400"
              />
            </marker>
          </defs>

          <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
            {/* Relationships */}
            {relationships.map(rel => {
              const fromNode = nodes.find(n => n.id === rel.fromId);
              const toNode = nodes.find(n => n.id === rel.toId);
              
              if (!fromNode || !toNode) return null;

              return (
                <g key={rel.id}>
                  <line
                    x1={fromNode.x + 25}
                    y1={fromNode.y + 25}
                    x2={toNode.x + 25}
                    y2={toNode.y + 25}
                    stroke="currentColor"
                    strokeWidth={Math.max(1, rel.strength / 2)}
                    className={getRelationshipColor(rel.type)}
                    markerEnd={rel.isDirectional ? "url(#arrowhead)" : undefined}
                    opacity={0.7}
                  />
                  
                  {/* Relationship label */}
                  <text
                    x={(fromNode.x + toNode.x) / 2 + 25}
                    y={(fromNode.y + toNode.y) / 2 + 20}
                    className="text-xs fill-gray-300"
                    textAnchor="middle"
                    pointerEvents="none"
                  >
                    {relationshipTypes.find(rt => rt.value === rel.type)?.label}
                  </text>
                </g>
              );
            })}

            {/* Nodes */}
            {nodes.map(node => {
              const Icon = getNodeIcon(node.type);
              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x}, ${node.y})`}
                  onMouseDown={(e) => handleNodeMouseDown(node, e)}
                  className="cursor-move"
                >
                  {/* Node background */}
                  <circle
                    cx="25"
                    cy="25"
                    r="25"
                    className={`fill-black/40 stroke-2 ${
                      node.type === 'character' ? 'stroke-purple-400' :
                      node.type === 'location' ? 'stroke-green-400' :
                      'stroke-gray-400'
                    }`}
                  />
                  
                  {/* Node icon */}
                  <Icon 
                    className={`w-6 h-6 ${
                      node.type === 'character' ? 'text-purple-400' :
                      node.type === 'location' ? 'text-green-400' :
                      'text-gray-400'
                    }`}
                    x="19" 
                    y="19"
                  />
                  
                  {/* Node label */}
                  <text
                    x="25"
                    y="65"
                    className="text-xs fill-gray-300 font-medium"
                    textAnchor="middle"
                    pointerEvents="none"
                  >
                    {node.name}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>

        {/* Legend */}
        <Card className="absolute top-4 right-4 w-64 fantasy-border bg-black/80 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-fantasy-gold-300">Легенда</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full border-2 border-purple-400 bg-black/40" />
              <span className="text-xs text-gray-300">Персонажі</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full border-2 border-green-400 bg-black/40" />
              <span className="text-xs text-gray-300">Локації</span>
            </div>
            <div className="text-xs text-gray-400 mt-3">
              Перетягуйте вузли для зміни позиції
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create Relationship Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="fantasy-modal">
          <DialogHeader>
            <DialogTitle className="text-fantasy-gold-300 font-fantasy">
              Створити зв'язок
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">
                  Від
                </label>
                <Select value={formData.fromId} onValueChange={(value) => 
                  setFormData(prev => ({ ...prev, fromId: value }))
                }>
                  <SelectTrigger className="fantasy-input">
                    <SelectValue placeholder="Оберіть елемент" />
                  </SelectTrigger>
                  <SelectContent>
                    {nodes.map(node => (
                      <SelectItem key={node.id} value={node.id}>
                        {node.name} ({node.type})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">
                  До
                </label>
                <Select value={formData.toId} onValueChange={(value) => 
                  setFormData(prev => ({ ...prev, toId: value }))
                }>
                  <SelectTrigger className="fantasy-input">
                    <SelectValue placeholder="Оберіть елемент" />
                  </SelectTrigger>
                  <SelectContent>
                    {nodes.map(node => (
                      <SelectItem key={node.id} value={node.id}>
                        {node.name} ({node.type})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">
                Тип зв'язку
              </label>
              <Select value={formData.type} onValueChange={(value: any) => 
                setFormData(prev => ({ ...prev, type: value }))
              }>
                <SelectTrigger className="fantasy-input">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {relationshipTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">
                Сила зв'язку: {formData.strength}
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={formData.strength}
                onChange={(e) => setFormData(prev => ({ ...prev, strength: parseInt(e.target.value) }))}
                className="w-full"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">
                Опис
              </label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Опишіть характер зв'язку..."
                className="fantasy-input"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isDirectional"
                checked={formData.isDirectional}
                onChange={(e) => setFormData(prev => ({ ...prev, isDirectional: e.target.checked }))}
                className="rounded"
              />
              <label htmlFor="isDirectional" className="text-sm text-gray-300">
                Односпрямований зв'язок
              </label>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateModalOpen(false)}
              className="fantasy-button-outline"
            >
              Скасувати
            </Button>
            <Button onClick={createRelationship} className="fantasy-button">
              Створити
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}