import React, {
  useMemo,
  useCallback,
  useState,
  useEffect,
  useRef,
} from "react";
import { useDrop, useDrag } from "react-dnd";
import { Button } from "./ui/button";
import { Skeleton } from "./ui/skeleton";
import { useToast } from "@/hooks/use-toast";

export type LoreItem = {
  id: string;
  name: string;
  type: string;
  parentId?: string | null;
  icon?: string;
  image?: string;
  description?: string;
  order?: number;
};

interface LoreTreeProps {
  lore: LoreItem[];
  filterType: string;
  onEdit: (item: LoreItem) => void;
  onDelete: (item: LoreItem) => void;
  onPreview: (item: LoreItem) => void;
  onReorder: (lore: LoreItem[]) => void;
  search?: string;
  selectedLoreIds?: string[];
  onSelectLore?: (id: string, checked: boolean) => void;
  onSelectAll?: (checked: boolean, visibleLore: LoreItem[]) => void;
}

const ITEM_TYPE = "LORE_ITEM";

type LoreTreeNodeType = LoreItem & { children?: LoreTreeNodeType[] };

function buildTree(
  lore: LoreItem[],
  parentId: string | null = null
): LoreTreeNodeType[] {
  return lore
    .filter((l) => (parentId ? l.parentId === parentId : !l.parentId))
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map((l) => ({ ...l, children: buildTree(lore, l.id) }));
}

const LoreTree: React.FC<LoreTreeProps> = ({
  lore,
  filterType,
  onEdit,
  onDelete,
  onPreview,
  onReorder,
  search,
  selectedLoreIds = [],
  onSelectLore,
  onSelectAll,
}) => {
  const { toast } = useToast();
  const tree = useMemo(
    () =>
      buildTree(
        filterType === "all" ? lore : lore.filter((l) => l.type === filterType)
      ),
    [lore, filterType]
  );

  // Collapsed state for nodes
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const toggleCollapse = (id: string) =>
    setCollapsed((c) => ({ ...c, [id]: !c[id] }));

  // Drag&Drop: move item to new parent
  const moveItem = useCallback(
    (dragId: string, hoverId: string | null) => {
      if (dragId === hoverId) return;
      const dragItem = lore.find((l) => l.id === dragId);
      if (!dragItem) return;
      // Якщо hoverId null — переносимо в корінь
      const updated = lore.map((l) =>
        l.id === dragId ? { ...l, parentId: hoverId } : l
      );
      onReorder(updated);
    },
    [lore, onReorder]
  );

  // Всі видимі id (для select all)
  const visibleIds = useMemo(() => lore.map((l) => l.id), [lore]);
  const allSelected =
    visibleIds.length > 0 &&
    visibleIds.every((id) => selectedLoreIds.includes(id));

  if (!lore || lore.length === 0) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-8 w-full rounded" />
        <Skeleton className="h-8 w-2/3 rounded" />
        <Skeleton className="h-8 w-1/2 rounded" />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Select all checkbox */}
      {onSelectAll && (
        <div className="flex items-center gap-2 mb-2">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={(e) => onSelectAll(e.target.checked, lore)}
          />
          <span className="text-xs text-gray-400">Виділити всі</span>
        </div>
      )}
      {/* Drop zone for root */}
      <RootDropZone onDrop={() => moveItem(draggedIdRef.current, null)} />
      {tree.map((item) => (
        <LoreTreeNode
          key={item.id}
          item={item}
          moveItem={moveItem}
          onEdit={onEdit}
          onDelete={onDelete}
          onPreview={onPreview}
          level={0}
          collapsed={collapsed[item.id]}
          toggleCollapse={toggleCollapse}
          search={search}
          selectedLoreIds={selectedLoreIds}
          onSelectLore={onSelectLore}
          lore={lore}
        />
      ))}
    </div>
  );
};

// Для зберігання id перетягуваного елемента (щоб кидати в root)
const draggedIdRef = { current: "" };

const RootDropZone: React.FC<{ onDrop: () => void }> = ({ onDrop }) => {
  const [, drop] = useDrop({
    accept: ITEM_TYPE,
    drop: () => onDrop(),
    collect: (monitor) => ({ isOver: monitor.isOver() }),
  });
  return <div ref={drop} className="h-2" />;
};

interface LoreTreeNodeProps {
  item: LoreTreeNodeType;
  moveItem: (dragId: string, hoverId: string | null) => void;
  onEdit: (item: LoreItem) => void;
  onDelete: (item: LoreItem) => void;
  onPreview: (item: LoreItem) => void;
  level: number;
  collapsed: boolean | undefined;
  toggleCollapse: (id: string) => void;
  search?: string;
  selectedLoreIds?: string[];
  onSelectLore?: (id: string, checked: boolean) => void;
  lore: LoreItem[];
}

const LORE_TYPES = [
  "artifact",
  "event",
  "geography",
  "magic",
  "mythology",
  "religion",
  "custom",
];

const LoreTreeNode: React.FC<LoreTreeNodeProps> = ({
  item,
  moveItem,
  onEdit,
  onDelete,
  onPreview,
  level,
  collapsed,
  toggleCollapse,
  search,
  selectedLoreIds = [],
  onSelectLore,
  lore,
}) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const [editing, setEditing] = useState<null | "name" | "icon" | "type">(null);
  const [editValue, setEditValue] = useState<string>("");
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [{ isOver }, drop] = useDrop<LoreItem, void, { isOver: boolean }>({
    accept: ITEM_TYPE,
    drop: (dragged) => {
      if (dragged.id !== item.id) {
        // Перевірка на циклічність
        let parent = item;
        while (parent) {
          if (parent.id === dragged.id) {
            toast({
              title: "Помилка",
              description: "Неможливо перемістити у власного нащадка!",
              variant: "destructive",
            });
            return;
          }
          const nextParent = lore?.find?.((l: any) => l.id === parent.parentId);
          if (!nextParent) break;
          parent = nextParent;
        }
        moveItem(dragged.id, item.id);
        toast({
          title: "Переміщено",
          description: `Елемент переміщено до ${item.name}`,
        });
      }
    },
    collect: (monitor) => ({ isOver: monitor.isOver() }),
  });
  const [{ isDragging }, drag] = useDrag({
    type: ITEM_TYPE,
    item: { ...item, id: item.id },
    collect: (monitor) => {
      if (monitor.isDragging()) draggedIdRef.current = item.id;
      return { isDragging: monitor.isDragging() };
    },
  });
  drag(drop(ref));

  // Inline edit handlers
  const startEdit = (field: "name" | "icon" | "type") => {
    setEditing(field);
    setEditValue(
      field === "name"
        ? item.name
        : field === "icon"
        ? item.icon || ""
        : item.type
    );
  };
  const saveEdit = () => {
    if (!editing) return;
    if (
      editValue.trim() &&
      editValue !==
        (editing === "name"
          ? item.name
          : editing === "icon"
          ? item.icon || ""
          : item.type)
    ) {
      onEdit({ ...item, [editing]: editValue });
    }
    setEditing(null);
  };
  const cancelEdit = () => setEditing(null);

  // Highlight search matches
  function highlight(text: string, query?: string) {
    if (!query) return text;
    const i = text.toLowerCase().indexOf(query.toLowerCase());
    if (i === -1) return text;
    return (
      <>
        {text.slice(0, i)}
        <mark className="bg-yellow-300 text-black px-0.5 rounded">
          {text.slice(i, i + query.length)}
        </mark>
        {text.slice(i + query.length)}
      </>
    );
  }

  const isSelected = selectedLoreIds.includes(item.id);

  return (
    <div
      ref={drop}
      className={`flex items-center gap-2 p-2 rounded transition-all duration-200 ${
        isOver ? "bg-yellow-200/40 ring-2 ring-yellow-400" : ""
      }`}
      style={{ marginLeft: level * 24 }}
    >
      {onSelectLore && (
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => onSelectLore(item.id, e.target.checked)}
        />
      )}
      {item.children && item.children.length > 0 && (
        <Button
          size="icon"
          variant="ghost"
          onClick={() => toggleCollapse(item.id)}
          title={collapsed ? "Expand" : "Collapse"}
        >
          {collapsed ? "▶" : "▼"}
        </Button>
      )}
      {/* Inline edit icon */}
      {editing === "icon" ? (
        <input
          ref={inputRef}
          className="w-10 text-xl bg-transparent border-b border-yellow-400 outline-none"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={saveEdit}
          onKeyDown={(e) => {
            if (e.key === "Enter") saveEdit();
            if (e.key === "Escape") cancelEdit();
          }}
        />
      ) : (
        <span
          className="text-xl cursor-pointer"
          onDoubleClick={() => startEdit("icon")}
        >
          {item.icon}
        </span>
      )}
      {/* Inline edit name */}
      {editing === "name" ? (
        <input
          ref={inputRef}
          className="font-medium bg-transparent border-b border-yellow-400 outline-none"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={saveEdit}
          onKeyDown={(e) => {
            if (e.key === "Enter") saveEdit();
            if (e.key === "Escape") cancelEdit();
          }}
        />
      ) : (
        <span
          className="font-medium cursor-pointer"
          onClick={() => onPreview(item)}
          onDoubleClick={() => startEdit("name")}
        >
          {highlight(item.name, search)}
        </span>
      )}
      {/* Inline edit type */}
      {editing === "type" ? (
        <select
          ref={inputRef as any}
          className="text-xs bg-transparent border-b border-yellow-400 outline-none"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={saveEdit}
          onKeyDown={(e) => {
            if (e.key === "Enter") saveEdit();
            if (e.key === "Escape") cancelEdit();
          }}
        >
          {LORE_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      ) : (
        <span
          className="text-xs text-gray-400 cursor-pointer"
          onDoubleClick={() => startEdit("type")}
        >
          {item.type}
        </span>
      )}
      <Button
        size="icon"
        variant="ghost"
        onClick={() => onEdit(item)}
        title="Edit"
      >
        <span>✏️</span>
      </Button>
      <Button
        size="icon"
        variant="ghost"
        onClick={() => onDelete(item)}
        title="Delete"
      >
        <span>🗑️</span>
      </Button>
      {!collapsed && item.children && item.children.length > 0 && (
        <div className="flex flex-col w-full">
          {item.children.map((child) => (
            <LoreTreeNode
              key={child.id}
              item={child}
              moveItem={moveItem}
              onEdit={onEdit}
              onDelete={onDelete}
              onPreview={onPreview}
              level={level + 1}
              collapsed={collapsed}
              toggleCollapse={toggleCollapse}
              search={search}
              selectedLoreIds={selectedLoreIds}
              onSelectLore={onSelectLore}
              lore={lore}
            />
          ))}
        </div>
      )}
      {isOver && (
        <span className="text-xs text-yellow-600 ml-2">Скинути сюди</span>
      )}
    </div>
  );
};

export default LoreTree;
