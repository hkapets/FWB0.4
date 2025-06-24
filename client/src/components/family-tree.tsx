import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Plus, 
  Users, 
  Heart, 
  Crown, 
  Baby,
  UserCheck,
  Trash2,
  Edit
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface FamilyMember {
  id: string;
  characterId: number;
  name: string;
  generation: number;
  parentIds: string[];
  spouseIds: string[];
  gender: 'male' | 'female' | 'other';
  isAlive: boolean;
  birthYear?: number;
  deathYear?: number;
}

interface FamilyTree {
  id: string;
  name: string;
  description: string;
  members: FamilyMember[];
  worldId: number;
}

interface FamilyTreeProps {
  worldId: number;
}

export default function FamilyTreeComponent({ worldId }: FamilyTreeProps) {
  const [trees, setTrees] = useState<FamilyTree[]>([]);
  const [selectedTree, setSelectedTree] = useState<FamilyTree | null>(null);
  const [isCreateTreeModalOpen, setIsCreateTreeModalOpen] = useState(false);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [characters, setCharacters] = useState<any[]>([]);
  
  const [treeFormData, setTreeFormData] = useState({
    name: '',
    description: '',
  });

  const [memberFormData, setMemberFormData] = useState({
    characterId: '',
    generation: 1,
    parentIds: [] as string[],
    spouseIds: [] as string[],
  });

  useEffect(() => {
    loadCharacters();
    loadFamilyTrees();
  }, [worldId]);

  const loadCharacters = async () => {
    try {
      const response = await fetch(`/api/worlds/${worldId}/characters`);
      const data = await response.json();
      setCharacters(data);
    } catch (error) {
      console.error('Error loading characters:', error);
    }
  };

  const loadFamilyTrees = async () => {
    // Заглушка - буде завантажувати з API
    setTrees([]);
  };

  const createFamilyTree = () => {
    const newTree: FamilyTree = {
      id: `tree-${Date.now()}`,
      name: treeFormData.name,
      description: treeFormData.description,
      members: [],
      worldId,
    };

    setTrees(prev => [...prev, newTree]);
    setSelectedTree(newTree);
    setIsCreateTreeModalOpen(false);
    setTreeFormData({ name: '', description: '' });
  };

  const addMemberToTree = () => {
    if (!selectedTree || !memberFormData.characterId) return;

    const character = characters.find(c => c.id.toString() === memberFormData.characterId);
    if (!character) return;

    const newMember: FamilyMember = {
      id: `member-${Date.now()}`,
      characterId: character.id,
      name: character.name,
      generation: memberFormData.generation,
      parentIds: memberFormData.parentIds,
      spouseIds: memberFormData.spouseIds,
      gender: character.gender || 'other',
      isAlive: true,
    };

    const updatedTree = {
      ...selectedTree,
      members: [...selectedTree.members, newMember],
    };

    setTrees(prev => prev.map(tree => 
      tree.id === selectedTree.id ? updatedTree : tree
    ));
    setSelectedTree(updatedTree);
    setIsAddMemberModalOpen(false);
    setMemberFormData({
      characterId: '',
      generation: 1,
      parentIds: [],
      spouseIds: [],
    });
  };

  const renderFamilyTree = () => {
    if (!selectedTree || selectedTree.members.length === 0) {
      return (
        <div className="text-center py-12">
          <Users className="mx-auto h-12 w-12 text-gray-500 mb-4" />
          <p className="text-gray-400 text-lg">Родинне дерево порожнє</p>
          <p className="text-gray-500 mb-6">Додайте членів сім'ї</p>
          <Button onClick={() => setIsAddMemberModalOpen(true)} className="fantasy-button">
            <Plus className="mr-2 h-4 w-4" />
            Додати члена сім'ї
          </Button>
        </div>
      );
    }

    // Групуємо по поколіннях
    const generations = selectedTree.members.reduce((acc, member) => {
      if (!acc[member.generation]) {
        acc[member.generation] = [];
      }
      acc[member.generation].push(member);
      return acc;
    }, {} as Record<number, FamilyMember[]>);

    const sortedGenerations = Object.keys(generations)
      .map(Number)
      .sort((a, b) => a - b);

    return (
      <div className="space-y-8">
        {sortedGenerations.map(generation => (
          <div key={generation} className="space-y-4">
            <h3 className="text-lg font-fantasy text-fantasy-gold-300">
              Покоління {generation}
            </h3>
            <div className="flex flex-wrap gap-4 justify-center">
              {generations[generation].map(member => (
                <Card key={member.id} className="fantasy-border bg-black/20 backdrop-blur-sm w-48">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-fantasy text-fantasy-gold-300 text-center">
                      {member.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-center space-y-2">
                    <div className="flex justify-center">
                      {member.gender === 'male' && (
                        <Badge variant="secondary" className="text-xs">
                          <UserCheck className="mr-1 h-3 w-3" />
                          Чоловік
                        </Badge>
                      )}
                      {member.gender === 'female' && (
                        <Badge variant="secondary" className="text-xs">
                          <Heart className="mr-1 h-3 w-3" />
                          Жінка
                        </Badge>
                      )}
                    </div>

                    {/* Батьки */}
                    {member.parentIds.length > 0 && (
                      <div className="text-xs text-gray-400">
                        <div className="flex items-center justify-center mb-1">
                          <Crown className="h-3 w-3 mr-1" />
                          Батьки:
                        </div>
                        {member.parentIds.map(parentId => {
                          const parent = selectedTree.members.find(m => m.id === parentId);
                          return parent ? (
                            <div key={parentId} className="text-gray-300">
                              {parent.name}
                            </div>
                          ) : null;
                        })}
                      </div>
                    )}

                    {/* Подружжя */}
                    {member.spouseIds.length > 0 && (
                      <div className="text-xs text-gray-400">
                        <div className="flex items-center justify-center mb-1">
                          <Heart className="h-3 w-3 mr-1" />
                          Подружжя:
                        </div>
                        {member.spouseIds.map(spouseId => {
                          const spouse = selectedTree.members.find(m => m.id === spouseId);
                          return spouse ? (
                            <div key={spouseId} className="text-gray-300">
                              {spouse.name}
                            </div>
                          ) : null;
                        })}
                      </div>
                    )}

                    {/* Діти */}
                    {(() => {
                      const children = selectedTree.members.filter(m => 
                        m.parentIds.includes(member.id)
                      );
                      return children.length > 0 ? (
                        <div className="text-xs text-gray-400">
                          <div className="flex items-center justify-center mb-1">
                            <Baby className="h-3 w-3 mr-1" />
                            Діти:
                          </div>
                          {children.map(child => (
                            <div key={child.id} className="text-gray-300">
                              {child.name}
                            </div>
                          ))}
                        </div>
                      ) : null;
                    })()}

                    <div className="flex justify-center gap-1 pt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 hover:bg-purple-700/20"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 hover:bg-red-700/20"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Tree Selection */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Select 
            value={selectedTree?.id || ''} 
            onValueChange={(value) => {
              const tree = trees.find(t => t.id === value);
              setSelectedTree(tree || null);
            }}
          >
            <SelectTrigger className="fantasy-input w-64">
              <SelectValue placeholder="Оберіть родинне дерево" />
            </SelectTrigger>
            <SelectContent>
              {trees.map(tree => (
                <SelectItem key={tree.id} value={tree.id}>
                  {tree.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button 
            onClick={() => setIsCreateTreeModalOpen(true)}
            className="fantasy-button"
          >
            <Plus className="mr-2 h-4 w-4" />
            Нове дерево
          </Button>
        </div>

        {selectedTree && (
          <Button 
            onClick={() => setIsAddMemberModalOpen(true)}
            className="fantasy-button"
          >
            <Plus className="mr-2 h-4 w-4" />
            Додати члена сім'ї
          </Button>
        )}
      </div>

      {/* Tree Display */}
      {selectedTree ? (
        <Card className="fantasy-border bg-black/10 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl font-fantasy text-fantasy-gold-300">
              {selectedTree.name}
            </CardTitle>
            {selectedTree.description && (
              <p className="text-gray-400 text-sm">{selectedTree.description}</p>
            )}
          </CardHeader>
          <CardContent>
            {renderFamilyTree()}
          </CardContent>
        </Card>
      ) : (
        <div className="text-center py-12">
          <Users className="mx-auto h-12 w-12 text-gray-500 mb-4" />
          <p className="text-gray-400 text-lg">Оберіть або створіть родинне дерево</p>
        </div>
      )}

      {/* Create Tree Modal */}
      <Dialog open={isCreateTreeModalOpen} onOpenChange={setIsCreateTreeModalOpen}>
        <DialogContent className="fantasy-modal">
          <DialogHeader>
            <DialogTitle className="text-fantasy-gold-300 font-fantasy">
              Створити родинне дерево
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">
                Назва дерева
              </label>
              <Input
                value={treeFormData.name}
                onChange={(e) => setTreeFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Родина Старків..."
                className="fantasy-input"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">
                Опис
              </label>
              <Input
                value={treeFormData.description}
                onChange={(e) => setTreeFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Опис родинного дерева..."
                className="fantasy-input"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateTreeModalOpen(false)}
              className="fantasy-button-outline"
            >
              Скасувати
            </Button>
            <Button onClick={createFamilyTree} className="fantasy-button">
              Створити
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Member Modal */}
      <Dialog open={isAddMemberModalOpen} onOpenChange={setIsAddMemberModalOpen}>
        <DialogContent className="fantasy-modal">
          <DialogHeader>
            <DialogTitle className="text-fantasy-gold-300 font-fantasy">
              Додати члена сім'ї
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">
                Персонаж
              </label>
              <Select 
                value={memberFormData.characterId} 
                onValueChange={(value) => 
                  setMemberFormData(prev => ({ ...prev, characterId: value }))
                }
              >
                <SelectTrigger className="fantasy-input">
                  <SelectValue placeholder="Оберіть персонажа" />
                </SelectTrigger>
                <SelectContent>
                  {characters
                    .filter(char => !selectedTree?.members.some(m => m.characterId === char.id))
                    .map(character => (
                    <SelectItem key={character.id} value={character.id.toString()}>
                      {character.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">
                Покоління: {memberFormData.generation}
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={memberFormData.generation}
                onChange={(e) => setMemberFormData(prev => ({ 
                  ...prev, 
                  generation: parseInt(e.target.value) 
                }))}
                className="w-full"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">
                Батьки
              </label>
              <Select 
                value="" 
                onValueChange={(value) => {
                  if (!memberFormData.parentIds.includes(value)) {
                    setMemberFormData(prev => ({ 
                      ...prev, 
                      parentIds: [...prev.parentIds, value] 
                    }));
                  }
                }}
              >
                <SelectTrigger className="fantasy-input">
                  <SelectValue placeholder="Додати батька/матір" />
                </SelectTrigger>
                <SelectContent>
                  {selectedTree?.members
                    .filter(member => !memberFormData.parentIds.includes(member.id))
                    .map(member => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {memberFormData.parentIds.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {memberFormData.parentIds.map(parentId => {
                    const parent = selectedTree?.members.find(m => m.id === parentId);
                    return parent ? (
                      <Badge key={parentId} variant="secondary" className="text-xs">
                        {parent.name}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0 ml-1"
                          onClick={() => setMemberFormData(prev => ({
                            ...prev,
                            parentIds: prev.parentIds.filter(id => id !== parentId)
                          }))}
                        >
                          ×
                        </Button>
                      </Badge>
                    ) : null;
                  })}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddMemberModalOpen(false)}
              className="fantasy-button-outline"
            >
              Скасувати
            </Button>
            <Button onClick={addMemberToTree} className="fantasy-button">
              Додати
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}