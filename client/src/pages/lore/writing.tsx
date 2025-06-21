import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Trash2,
  List,
  Grid,
  BookOpen,
  Calendar,
  ScrollText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n";
import { useToast } from "@/hooks/use-toast";
import CreateWritingModal from "@/components/modals/create-writing-modal";
import { apiRequest } from "@/lib/queryClient";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SortableList } from "@/components/ui/sortable-list";
import { FilterBar } from "@/components/ui/filter-bar";
import { BulkActions } from "@/components/ui/bulk-actions";
import { filterData } from "@/lib/filter-utils";
import { createWritingBulkActions } from "@/lib/bulk-actions-utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Фільтри для письменності
const createWritingFilters = () => [
  {
    key: "type",
    label: "Тип",
    type: "select" as const,
    options: [
      { value: "writing_system", label: "Система письма" },
      { value: "calendar", label: "Літочислення" },
      { value: "language", label: "Мова" },
      { value: "script", label: "Писемність" },
      { value: "numerals", label: "Числова система" },
    ],
  },
  {
    key: "origin",
    label: "Походження",
    type: "select" as const,
    options: [
      { value: "ancient", label: "Стародавнє" },
      { value: "divine", label: "Божественне" },
      { value: "scholarly", label: "Вчене" },
      { value: "folk", label: "Народне" },
      { value: "foreign", label: "Іноземне" },
    ],
  },
];

export default function WritingPage({
  currentWorldId,
}: {
  currentWorldId?: number | null;
}) {
  const t = useTranslation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selected, setSelected] = useState<number[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [editWriting, setEditWriting] = useState<any | null>(null);
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});
  const worldId = currentWorldId || 1; // Use currentWorldId if available, fallback to 1

  const { data: writing = [], isLoading } = useQuery({
    queryKey: ["/api/worlds", worldId, "writing"],
    enabled: !!worldId,
  });

  // Фільтрація даних
  const filteredWriting = useMemo(() => {
    return filterData(writing as any[], activeFilters, ["name", "description"]);
  }, [writing, activeFilters]);

  const deleteMutation = useMutation({
    mutationFn: async (ids: number[]) => {
      await Promise.all(
        ids.map((id) => apiRequest("DELETE", `/api/writing/${id}`))
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/worlds", worldId, "writing"],
      });
      setSelected([]);
      toast({
        title: t.actions.delete,
        description: t.messages.creatureCreated,
      });
    },
    onError: () => {
      toast({
        title: t.actions.delete,
        description: t.messages.errorDesc,
        variant: "destructive",
      });
    },
  });

  const bulkUpdateMutation = useMutation({
    mutationFn: async ({ ids, updates }: { ids: number[]; updates: any }) => {
      await Promise.all(
        ids.map((id) => apiRequest("PUT", `/api/writing/${id}`, updates))
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/worlds", worldId, "writing"],
      });
      setSelected([]);
      toast({
        title: "Оновлено",
        description: "Властивості письменності змінено",
      });
    },
    onError: () => {
      toast({
        title: "Помилка",
        description: "Не вдалося оновити властивості",
        variant: "destructive",
      });
    },
  });

  const reorderMutation = useMutation({
    mutationFn: async (reorderedWriting: any[]) => {
      await Promise.all(
        reorderedWriting.map((writingItem, index) =>
          apiRequest("PUT", `/api/writing/${writingItem.id}`, {
            ...writingItem,
            order: index,
          })
        )
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/worlds", worldId, "writing"],
      });
      toast({
        title: "Порядок оновлено",
        description: "Список письменності переупорядковано",
      });
    },
    onError: () => {
      toast({
        title: "Помилка",
        description: "Не вдалося оновити порядок",
        variant: "destructive",
      });
    },
  });

  const handleSelect = (id: number) => {
    setSelected((sel) =>
      sel.includes(id) ? sel.filter((i) => i !== id) : [...sel, id]
    );
  };

  const handleDelete = () => {
    setDeleteDialog(false);
    if (selected.length) deleteMutation.mutate(selected);
  };

  const handleEdit = (writingItem: any) => {
    setEditWriting(writingItem);
    setIsCreateOpen(true);
  };

  const handleReorder = (reorderedWriting: any[]) => {
    reorderMutation.mutate(reorderedWriting);
  };

  const handleFiltersChange = (filters: Record<string, any>) => {
    setActiveFilters(filters);
    setSelected([]);
  };

  const handleBulkAction = (actionKey: string, value?: string) => {
    if (actionKey === "delete") {
      setDeleteDialog(true);
    } else if (actionKey === "changeType" && value) {
      bulkUpdateMutation.mutate({
        ids: selected,
        updates: { type: value },
      });
    } else if (actionKey === "changeOrigin" && value) {
      bulkUpdateMutation.mutate({
        ids: selected,
        updates: { origin: value },
      });
    }
  };

  const handleSubmit = async (data: any) => {
    if (editWriting) {
      await apiRequest("PUT", `/api/writing/${editWriting.id}`, data);
      toast({ title: t.actions.edit, description: t.messages.creatureCreated });
    } else {
      await apiRequest("POST", `/api/worlds/${worldId}/writing`, data);
      toast({ title: t.actions.add, description: t.messages.creatureCreated });
    }
    queryClient.invalidateQueries({
      queryKey: ["/api/worlds", worldId, "writing"],
    });
    setIsCreateOpen(false);
    setEditWriting(null);
  };

  const WritingCard = ({ item, isSelected, onSelect }: any) => (
    <div
      className={`fantasy-border p-4 cursor-pointer transition-all duration-200 ${
        isSelected ? "ring-2 ring-yellow-400" : ""
      }`}
      onClick={() => onSelect(item.id)}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          {item.type === "calendar" ? (
            <Calendar className="w-5 h-5 text-blue-400" />
          ) : (
            <BookOpen className="w-5 h-5 text-green-400" />
          )}
          <h3 className="font-bold text-lg">
            {typeof item.name === "object" ? item.name.uk : item.name}
          </h3>
        </div>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => {
            e.stopPropagation();
            onSelect(item.id);
          }}
          className="w-4 h-4"
        />
      </div>

      <div className="text-sm text-gray-300 mb-2">
        {item.type === "writing_system" && "Система письма"}
        {item.type === "calendar" && "Літочислення"}
        {item.type === "language" && "Мова"}
        {item.type === "script" && "Писемність"}
        {item.type === "numerals" && "Числова система"}
      </div>

      <p className="text-sm text-gray-400 mb-3 line-clamp-3">
        {typeof item.description === "object"
          ? item.description.uk
          : item.description}
      </p>

      {item.origin && (
        <div className="text-xs text-gray-500">Походження: {item.origin}</div>
      )}

      <div className="flex gap-2 mt-3">
        <Button
          size="sm"
          variant="outline"
          onClick={(e) => {
            e.stopPropagation();
            handleEdit(item);
          }}
        >
          Редагувати
        </Button>
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-fantasy font-bold text-fantasy-gold-400 flex items-center">
            <ScrollText className="mr-3 h-8 w-8" />
            Писемність
          </h1>
          <p className="text-gray-400 mt-1">
            Системи письма та літочислення вашого світу
          </p>
        </div>
        <Button className="fantasy-button">
          <Plus className="mr-2 h-4 w-4" />
          Додати писемність
        </Button>
      </div>

      <div className="text-center py-12">
        <ScrollText className="h-16 w-16 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-300 mb-2">
          Функція в розробці
        </h3>
        <p className="text-gray-400 mb-4">
          Система писемності та літочислення буде доступна в наступному
          оновленні
        </p>
      </div>
    </div>
  );
}
