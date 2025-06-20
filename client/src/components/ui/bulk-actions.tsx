import React, { useState } from "react";
import {
  MoreHorizontal,
  Edit,
  Trash2,
  Settings,
  Tag,
  Shield,
  Star,
  Check,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

interface BulkAction {
  key: string;
  label: string;
  icon: string;
  variant?: "default" | "destructive" | "outline";
  requiresConfirmation?: boolean;
  requiresInput?: boolean;
  inputType?: "select" | "text";
  inputOptions?: { value: string; label: string }[];
  inputLabel?: string;
  inputPlaceholder?: string;
}

interface BulkActionsProps {
  selectedCount: number;
  actions: BulkAction[];
  onAction: (actionKey: string, value?: string) => void;
  className?: string;
}

// Функція для рендерингу іконок
const renderIcon = (iconName: string) => {
  const iconMap: Record<string, React.ReactNode> = {
    MoreHorizontal: <MoreHorizontal className="w-4 h-4" />,
    Edit: <Edit className="w-4 h-4" />,
    Trash2: <Trash2 className="w-4 h-4" />,
    Settings: <Settings className="w-4 h-4" />,
    Tag: <Tag className="w-4 h-4" />,
    Shield: <Shield className="w-4 h-4" />,
    Star: <Star className="w-4 h-4" />,
  };
  return iconMap[iconName] || <MoreHorizontal className="w-4 h-4" />;
};

export function BulkActions({
  selectedCount,
  actions,
  onAction,
  className = "",
}: BulkActionsProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<BulkAction | null>(null);
  const [inputValue, setInputValue] = useState("");

  const handleActionClick = (action: BulkAction) => {
    if (action.requiresConfirmation || action.requiresInput) {
      setSelectedAction(action);
      setIsDialogOpen(true);
      setInputValue("");
    } else {
      onAction(action.key);
    }
  };

  const handleConfirmAction = () => {
    if (selectedAction) {
      onAction(selectedAction.key, inputValue || undefined);
      setIsDialogOpen(false);
      setSelectedAction(null);
      setInputValue("");
    }
  };

  const handleCancelAction = () => {
    setIsDialogOpen(false);
    setSelectedAction(null);
    setInputValue("");
  };

  if (selectedCount === 0) return null;

  return (
    <>
      <div className={`flex items-center gap-2 ${className}`}>
        <Badge variant="secondary" className="px-3 py-1">
          Обрано: {selectedCount}
        </Badge>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <MoreHorizontal className="w-4 h-4 mr-2" />
              Масові дії
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {actions.map((action) => (
              <DropdownMenuItem
                key={action.key}
                onClick={() => handleActionClick(action)}
                className={`flex items-center gap-2 ${
                  action.variant === "destructive" ? "text-red-600" : ""
                }`}
              >
                {renderIcon(action.icon)}
                {action.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedAction?.label} ({selectedCount} елементів)
            </DialogTitle>
          </DialogHeader>

          {selectedAction?.requiresInput && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="bulk-input">{selectedAction.inputLabel}</Label>
                {selectedAction.inputType === "select" ? (
                  <Select value={inputValue} onValueChange={setInputValue}>
                    <SelectTrigger>
                      <SelectValue
                        placeholder={selectedAction.inputPlaceholder}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedAction.inputOptions?.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <input
                    id="bulk-input"
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder={selectedAction.inputPlaceholder}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-800 text-white"
                  />
                )}
              </div>
            </div>
          )}

          {selectedAction?.requiresConfirmation &&
            !selectedAction.requiresInput && (
              <p className="text-gray-400">
                Ви впевнені, що хочете {selectedAction.label.toLowerCase()}{" "}
                {selectedCount} елементів?
              </p>
            )}

          <DialogFooter>
            <Button variant="outline" onClick={handleCancelAction}>
              <X className="w-4 h-4 mr-2" />
              Скасувати
            </Button>
            <Button
              variant={
                selectedAction?.variant === "destructive"
                  ? "destructive"
                  : "default"
              }
              onClick={handleConfirmAction}
              disabled={selectedAction?.requiresInput && !inputValue}
            >
              <Check className="w-4 h-4 mr-2" />
              Підтвердити
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
