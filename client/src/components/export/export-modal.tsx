import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, FileText, File, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  worldId: number;
  worldName: string;
}

export default function ExportModal({ isOpen, onClose, worldId, worldName }: ExportModalProps) {
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<'pdf' | 'docx' | 'json'>('pdf');
  const [selectedSections, setSelectedSections] = useState({
    overview: true,
    characters: true,
    locations: true,
    creatures: true,
    events: true,
    artifacts: true,
    races: true,
    magicSystems: true,
  });

  const sections = [
    { key: 'overview', label: 'Огляд світу', icon: FileText },
    { key: 'characters', label: 'Персонажі', icon: FileText },
    { key: 'locations', label: 'Локації', icon: FileText },
    { key: 'creatures', label: 'Створіння', icon: FileText },
    { key: 'events', label: 'Історичні події', icon: FileText },
    { key: 'artifacts', label: 'Артефакти', icon: FileText },
    { key: 'races', label: 'Раси', icon: FileText },
    { key: 'magicSystems', label: 'Системи магії', icon: FileText },
  ];

  const handleSectionToggle = (sectionKey: string) => {
    setSelectedSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey as keyof typeof prev]
    }));
  };

  const handleSelectAll = () => {
    const allSelected = Object.values(selectedSections).every(Boolean);
    const newState = Object.keys(selectedSections).reduce((acc, key) => ({
      ...acc,
      [key]: !allSelected
    }), {});
    setSelectedSections(newState);
  };

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      const response = await fetch('/api/export/world', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          worldId,
          format: exportFormat,
          sections: selectedSections,
        }),
      });

      if (!response.ok) {
        throw new Error('Export failed');
      }

      if (exportFormat === 'json') {
        const data = await response.json();
        const blob = new Blob([JSON.stringify(data, null, 2)], { 
          type: 'application/json' 
        });
        downloadFile(blob, `${worldName}-export.json`);
      } else {
        const blob = await response.blob();
        const extension = exportFormat === 'pdf' ? 'pdf' : 'docx';
        downloadFile(blob, `${worldName}-compendium.${extension}`);
      }

      toast({
        title: 'Експорт завершено',
        description: `Файл ${worldName} успішно створено`,
      });
      
      onClose();
    } catch (error) {
      toast({
        title: 'Помилка експорту',
        description: 'Не вдалося створити файл',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const downloadFile = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'pdf': return FileText;
      case 'docx': return File;
      default: return Download;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="fantasy-dialog max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-fantasy-gold-300 flex items-center gap-2">
            <Download className="w-5 h-5" />
            Експорт світу: {worldName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Формат експорту */}
          <Card className="fantasy-border bg-black/20">
            <CardHeader>
              <CardTitle className="text-fantasy-gold-300 text-lg">
                Формат файлу
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={exportFormat} onValueChange={(value: any) => setExportFormat(value)}>
                <SelectTrigger className="fantasy-input">
                  <SelectValue placeholder="Оберіть формат" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      PDF - Документ для перегляду та друку
                    </div>
                  </SelectItem>
                  <SelectItem value="docx">
                    <div className="flex items-center gap-2">
                      <File className="w-4 h-4" />
                      DOCX - Документ Word для редагування
                    </div>
                  </SelectItem>
                  <SelectItem value="json">
                    <div className="flex items-center gap-2">
                      <Download className="w-4 h-4" />
                      JSON - Структуровані дані
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Вибір розділів */}
          <Card className="fantasy-border bg-black/20">
            <CardHeader>
              <CardTitle className="text-fantasy-gold-300 text-lg flex items-center justify-between">
                Розділи для експорту
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleSelectAll}
                >
                  {Object.values(selectedSections).every(Boolean) ? 'Зняти все' : 'Вибрати все'}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {sections.map((section) => {
                  const Icon = section.icon;
                  return (
                    <div 
                      key={section.key}
                      className="flex items-center space-x-2 p-2 rounded hover:bg-gray-800/50"
                    >
                      <Checkbox
                        id={section.key}
                        checked={selectedSections[section.key as keyof typeof selectedSections]}
                        onCheckedChange={() => handleSectionToggle(section.key)}
                      />
                      <label 
                        htmlFor={section.key}
                        className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer"
                      >
                        <Icon className="w-4 h-4" />
                        {section.label}
                      </label>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Кнопки дій */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
              Скасувати
            </Button>
            <Button 
              className="fantasy-button gap-2" 
              onClick={handleExport}
              disabled={isExporting || !Object.values(selectedSections).some(Boolean)}
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Експортую...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Експортувати
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}