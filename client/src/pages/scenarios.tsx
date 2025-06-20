import React, { useEffect, useState, useRef } from "react";
import { Button } from "../components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../components/ui/popover";
import { toast } from "../hooks/use-toast";
import { Skeleton } from "../components/ui/skeleton";
import { Dialog, DialogContent, DialogTitle } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import ReactMarkdown from "react-markdown";
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Node,
  Edge,
  Position,
} from "react-flow-renderer";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "../components/ui/tooltip";
import { useTranslation } from "@/lib/i18n";

// Тип сценарію
interface Scenario {
  id: string;
  name: { uk: string; en: string };
  description: { uk: string; en: string };
  icon?: string;
  image?: string;
  color?: string;
  parentId?: string | null;
  order: number;
  type?: string;
  status?: "draft" | "active" | "archived";
  createdAt?: string;
  updatedAt?: string;
  author?: string;
  tags?: string[];
}

function fetchScenarios() {
  return fetch("/api/worlds/1/scenarios").then((r) => r.json());
}
function createScenario(data: Partial<Scenario>) {
  return fetch("/api/worlds/1/scenarios", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then((r) => r.json());
}
function updateScenario(id: string, data: Partial<Scenario>) {
  return fetch(`/api/worlds/1/scenarios/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then((r) => r.json());
}
function deleteScenario(id: string) {
  return fetch(`/api/worlds/1/scenarios/${id}`, { method: "DELETE" });
}

function fetchEvents() {
  return fetch("/api/worlds/1/events").then((r) => r.json());
}
function fetchLore() {
  return fetch("/api/worlds/1/lore").then((r) => r.json());
}
function fetchLocations() {
  return fetch("/api/worlds/1/markers").then((r) => r.json());
}

function ScenarioTree({
  scenarios,
  onEdit,
  onDelete,
  onReorder,
  events,
  lore,
  locations,
  selectedIds,
  onSelect,
}: any) {
  // Побудова дерева
  const buildTree = (parentId: string | null) =>
    scenarios
      .filter((s: Scenario) => s.parentId === parentId)
      .sort((a: Scenario, b: Scenario) => a.order - b.order)
      .map((s: Scenario) => (
        <ScenarioNode
          key={s.id}
          scenario={s}
          scenarios={scenarios}
          onEdit={onEdit}
          onDelete={onDelete}
          onReorder={onReorder}
          events={events}
          lore={lore}
          locations={locations}
          selected={selectedIds.includes(s.id)}
          onSelect={onSelect}
          selectedIds={selectedIds}
        />
      ));
  return <div>{buildTree(null)}</div>;
}

function ScenarioNode({
  scenario,
  scenarios,
  onEdit,
  onDelete,
  onReorder,
  events,
  lore,
  locations,
  selected,
  onSelect,
  selectedIds,
}: any) {
  const [{ isDragging }, drag] = useDrag({
    type: "SCENARIO",
    item: { id: scenario.id },
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  });
  const [, drop] = useDrop({
    accept: "SCENARIO",
    drop: (item: any) => {
      if (item.id !== scenario.id) onReorder(item.id, scenario.id);
    },
  });

  // Пошук пов'язаних подій, лору, локацій
  const relatedEvents = events.filter((e: any) =>
    (e.relatedScenarioIds || []).includes(scenario.id)
  );
  const relatedLore = lore.filter((l: any) =>
    (l.relatedScenarioIds || []).includes(scenario.id)
  );
  const relatedLocations = locations.filter((loc: any) =>
    (loc.relatedScenarioIds || []).includes(scenario.id)
  );

  const [collapsed, setCollapsed] = useState(false);

  return (
    <div
      ref={(node) => drag(drop(node))}
      style={{
        opacity: isDragging ? 0.5 : 1,
        marginLeft: scenario.parentId ? 24 : 0,
        transition: "margin 0.2s",
      }}
      className={`mb-2 p-2 rounded bg-black/30 flex flex-col gap-1 ${
        selected ? "ring-2 ring-blue-400" : ""
      }`}
    >
      <div className="flex items-center gap-2">
        {scenarios.filter((s: Scenario) => s.parentId === scenario.id).length >
          0 && (
          <button
            onClick={() => setCollapsed((v) => !v)}
            className="text-xs px-1 py-0.5 rounded bg-gray-700/40 hover:bg-gray-600/60 transition"
            title={collapsed ? "Розгорнути" : "Згорнути"}
          >
            {collapsed ? "+" : "–"}
          </button>
        )}
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onSelect(scenario.id)}
        />
        {scenario.icon && <span className="text-xl">{scenario.icon}</span>}
        <span
          className="font-bold"
          style={{ color: scenario.color || undefined }}
        >
          {scenario.name.uk}
        </span>
        {scenario.status && (
          <span
            className={`px-2 py-0.5 rounded text-xs ${
              scenario.status === "active"
                ? "bg-green-700/60 text-green-100"
                : scenario.status === "draft"
                ? "bg-yellow-700/60 text-yellow-100"
                : "bg-gray-700/60 text-gray-200"
            }`}
          >
            {scenario.status}
          </span>
        )}
        {scenario.tags &&
          scenario.tags.map((t: string, i: number) => (
            <span
              key={i}
              className="px-2 py-0.5 bg-gray-700 rounded text-xs text-white"
            >
              {t}
            </span>
          ))}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onEdit(scenario)}
            >
              ✏️
            </Button>
          </TooltipTrigger>
          <TooltipContent>Редагувати</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => onDelete(scenario.id)}
            >
              🗑️
            </Button>
          </TooltipTrigger>
          <TooltipContent>Видалити</TooltipContent>
        </Tooltip>
      </div>
      <div className="flex gap-2 text-xs mt-1">
        {scenario.author && (
          <span className="text-gray-400">Автор: {scenario.author}</span>
        )}
        {scenario.createdAt && (
          <span className="text-gray-400">
            Створено: {new Date(scenario.createdAt).toLocaleDateString()}
          </span>
        )}
        {scenario.updatedAt && (
          <span className="text-gray-400">
            Оновлено: {new Date(scenario.updatedAt).toLocaleDateString()}
          </span>
        )}
      </div>
      {/* Пов'язані події, лор, локації */}
      <div className="flex flex-wrap gap-2 text-xs mt-1">
        {relatedEvents.map((e: any) => (
          <Popover key={e.id}>
            <PopoverTrigger asChild>
              <span className="px-2 py-0.5 bg-blue-900/40 rounded text-blue-200 cursor-pointer hover:bg-blue-700/60">
                {typeof e.name === "object" ? e.name.uk : e.name}
              </span>
            </PopoverTrigger>
            <PopoverContent className="max-w-xs bg-black/90 text-white p-4 rounded shadow-lg">
              <div className="font-bold mb-1">
                {typeof e.name === "object" ? e.name.uk : e.name}
              </div>
              <div className="text-xs whitespace-pre-line">
                {typeof e.description === "object"
                  ? e.description.uk
                  : e.description}
              </div>
              <Button
                size="sm"
                variant="outline"
                className="mt-2"
                onClick={() => {
                  window.location.href = `/timeline#${e.id}`;
                }}
              >
                Перейти до події
              </Button>
            </PopoverContent>
          </Popover>
        ))}
        {relatedLore.map((l: any) => (
          <Popover key={l.id}>
            <PopoverTrigger asChild>
              <span className="px-2 py-0.5 bg-green-900/40 rounded text-green-200 cursor-pointer hover:bg-green-700/60">
                {typeof l.name === "object" ? l.name.uk : l.name}
              </span>
            </PopoverTrigger>
            <PopoverContent className="max-w-xs bg-black/90 text-white p-4 rounded shadow-lg">
              <div className="font-bold mb-1">
                {typeof l.name === "object" ? l.name.uk : l.name}
              </div>
              <div className="text-xs whitespace-pre-line">
                {typeof l.description === "object"
                  ? l.description.uk
                  : l.description}
              </div>
              <Button
                size="sm"
                variant="outline"
                className="mt-2"
                onClick={() => {
                  window.location.href = `/lore#${l.id}`;
                }}
              >
                Перейти до лору
              </Button>
            </PopoverContent>
          </Popover>
        ))}
        {relatedLocations.map((loc: any) => (
          <Popover key={loc.id}>
            <PopoverTrigger asChild>
              <span className="px-2 py-0.5 bg-yellow-900/40 rounded text-yellow-200 cursor-pointer hover:bg-yellow-700/60">
                {typeof loc.name === "object" ? loc.name.uk : loc.name}
              </span>
            </PopoverTrigger>
            <PopoverContent className="max-w-xs bg-black/90 text-white p-4 rounded shadow-lg">
              <div className="font-bold mb-1">
                {typeof loc.name === "object" ? loc.name.uk : loc.name}
              </div>
              <div className="text-xs whitespace-pre-line">
                {typeof loc.description === "object"
                  ? loc.description.uk
                  : loc.description}
              </div>
              <Button
                size="sm"
                variant="outline"
                className="mt-2"
                onClick={() => {
                  window.location.href = `/world-map#${loc.id}`;
                }}
              >
                Перейти до локації
              </Button>
            </PopoverContent>
          </Popover>
        ))}
      </div>
      {/* Дочірні сценарії */}
      {!collapsed && (
        <div className="ml-4 transition-all duration-200 ease-in-out">
          {scenarios.filter((s: Scenario) => s.parentId === scenario.id)
            .length > 0 && (
            <ScenarioTree
              scenarios={scenarios}
              onEdit={onEdit}
              onDelete={onDelete}
              onReorder={onReorder}
              events={events}
              lore={lore}
              locations={locations}
              selectedIds={selectedIds}
              onSelect={onSelect}
            />
          )}
        </div>
      )}
    </div>
  );
}

function ScenarioForm({ initialData, onSave, onCancel }: any) {
  const t = useTranslation();
  const [nameUk, setNameUk] = useState(initialData?.name?.uk || "");
  const [nameEn, setNameEn] = useState(initialData?.name?.en || "");
  const [descriptionUk, setDescriptionUk] = useState(
    initialData?.description?.uk || ""
  );
  const [descriptionEn, setDescriptionEn] = useState(
    initialData?.description?.en || ""
  );
  const [icon, setIcon] = useState(initialData?.icon || "");
  const [image, setImage] = useState(initialData?.image || "");
  const [color, setColor] = useState(initialData?.color || "");
  const [type, setType] = useState(initialData?.type || "main");
  const [saving, setSaving] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [status, setStatus] = useState<Scenario["status"]>(
    initialData?.status || "active"
  );
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  const [tagInput, setTagInput] = useState("");
  const [author, setAuthor] = useState(initialData?.author || "");

  const handleSubmit = (e: any) => {
    e.preventDefault();
    setSaving(true);
    onSave({
      name: { uk: nameUk, en: nameEn },
      description: { uk: descriptionUk, en: descriptionEn },
      icon,
      image,
      color,
      type,
      status,
      tags,
      author,
    });
  };

  // Drag&drop upload
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImage(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <Input
        value={nameUk}
        onChange={(e) => setNameUk(e.target.value)}
        placeholder="Назва (укр)"
        required
      />
      <Input
        value={nameEn}
        onChange={(e) => setNameEn(e.target.value)}
        placeholder="Name (en)"
        required
      />
      <div className="flex flex-col md:flex-row gap-2">
        <div className="flex-1">
          <label className="text-xs">Опис (укр, markdown)</label>
          <Textarea
            value={descriptionUk}
            onChange={(e) => setDescriptionUk(e.target.value)}
            rows={3}
          />
        </div>
        <div className="flex-1 bg-black/10 rounded p-2 min-h-[80px]">
          <label className="text-xs">Прев'ю</label>
          <div className="prose prose-invert text-xs">
            <ReactMarkdown>{descriptionUk}</ReactMarkdown>
          </div>
        </div>
      </div>
      <div className="flex flex-col md:flex-row gap-2">
        <div className="flex-1">
          <label className="text-xs">Description (en, markdown)</label>
          <Textarea
            value={descriptionEn}
            onChange={(e) => setDescriptionEn(e.target.value)}
            rows={3}
          />
        </div>
        <div className="flex-1 bg-black/10 rounded p-2 min-h-[80px]">
          <label className="text-xs">Preview</label>
          <div className="prose prose-invert text-xs">
            <ReactMarkdown>{descriptionEn}</ReactMarkdown>
          </div>
        </div>
      </div>
      <Input
        value={icon}
        onChange={(e) => setIcon(e.target.value)}
        placeholder="Іконка (emoji)"
      />
      <div
        className={`border-2 border-dashed rounded p-2 text-center ${
          dragActive ? "border-blue-500 bg-blue-100/20" : "border-gray-400"
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setDragActive(false);
        }}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center gap-2">
          <span className="text-xs">
            Drag&drop зображення або вставте URL нижче
          </span>
          {image && (
            <img
              src={image}
              alt="preview"
              className="max-h-24 rounded mx-auto"
            />
          )}
        </div>
      </div>
      <Input
        value={image}
        onChange={(e) => setImage(e.target.value)}
        placeholder="Зображення (URL або drag&drop)"
      />
      <Input
        value={color}
        onChange={(e) => setColor(e.target.value)}
        placeholder="Колір (hex)"
      />
      <select
        value={type}
        onChange={(e) => setType(e.target.value)}
        className="fantasy-input"
      >
        <option value="main">{t.scenarioTypes.main}</option>
        <option value="alt">{t.scenarioTypes.alt}</option>
        <option value="whatif">{t.scenarioTypes.whatif}</option>
      </select>
      <Input
        value={author}
        onChange={(e) => setAuthor(e.target.value)}
        placeholder="Автор"
      />
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value as Scenario["status"])}
        className="fantasy-input"
      >
        <option value="active">{t.scenarioStatuses.active}</option>
        <option value="draft">{t.scenarioStatuses.draft}</option>
        <option value="archived">{t.scenarioStatuses.archived}</option>
      </select>
      <div className="flex gap-2 items-center flex-wrap">
        {tags.map((t, i) => (
          <span
            key={i}
            className="px-2 py-0.5 bg-gray-700 rounded text-xs text-white flex items-center gap-1"
          >
            {t}{" "}
            <button
              type="button"
              onClick={() => setTags(tags.filter((x, j) => j !== i))}
            >
              ×
            </button>
          </span>
        ))}
        <input
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && tagInput.trim()) {
              setTags([...tags, tagInput.trim()]);
              setTagInput("");
              e.preventDefault();
            }
          }}
          placeholder="Додати тег"
          className="px-2 py-1 rounded border bg-black/20 text-white text-xs w-32"
        />
      </div>
      <div className="flex gap-2 mt-2">
        <Button type="submit" disabled={saving}>
          {initialData ? t.labels.save : t.labels.create}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Скасувати
        </Button>
      </div>
    </form>
  );
}

export default function ScenariosPage() {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editScenario, setEditScenario] = useState<Scenario | null>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [lore, setLore] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [undoStack, setUndoStack] = useState<any[]>([]);
  const [redoStack, setRedoStack] = useState<any[]>([]);
  const lastScenarios = useRef<Scenario[]>([]);
  const [viewMode, setViewMode] = useState<"tree" | "graph">("tree");
  const [filterTag, setFilterTag] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importPreview, setImportPreview] = useState<any>(null);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [historyPreview, setHistoryPreview] = useState<any>(null);
  const [scenarioHistory, setScenarioHistory] = useState<any[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("scenarios_history") || "[]");
    } catch {
      return [];
    }
  });
  const t = useTranslation();

  useEffect(() => {
    fetchScenarios().then((data) => {
      setScenarios(data);
      setLoading(false);
    });
    fetchEvents().then(setEvents);
    fetchLore().then(setLore);
    fetchLocations().then(setLocations);
  }, []);

  // Undo/redo helpers
  const pushUndo = (next: Scenario[]) => {
    setUndoStack((prev) => [...prev, scenarios]);
    setRedoStack([]);
    lastScenarios.current = scenarios;
    setScenarios(next);
  };
  const handleUndo = () => {
    if (undoStack.length > 0) {
      setRedoStack((prev) => [...prev, scenarios]);
      setScenarios(undoStack[undoStack.length - 1]);
      setUndoStack((prev) => prev.slice(0, -1));
      toast({ title: "Undo" });
    }
  };
  const handleRedo = () => {
    if (redoStack.length > 0) {
      setUndoStack((prev) => [...prev, scenarios]);
      setScenarios(redoStack[redoStack.length - 1]);
      setRedoStack((prev) => prev.slice(0, -1));
      toast({ title: "Redo" });
    }
  };

  // Масове виділення
  const handleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };
  const handleSelectAll = () => {
    setSelectedIds(scenarios.map((s) => s.id));
  };
  const handleDeselectAll = () => {
    setSelectedIds([]);
  };
  // Масове видалення
  const handleMassDelete = () => {
    if (selectedIds.length === 0) return;
    pushUndo(scenarios.filter((s) => !selectedIds.includes(s.id)));
    setSelectedIds([]);
    Promise.all(selectedIds.map(deleteScenario)).then(() => {
      toast({ title: "Сценарії видалено" });
    });
  };
  // Масове переміщення (до parentId)
  const handleMassMove = (parentId: string | null) => {
    pushUndo(
      scenarios.map((s) =>
        selectedIds.includes(s.id) ? { ...s, parentId } : s
      )
    );
    setSelectedIds([]);
    Promise.all(selectedIds.map((id) => updateScenario(id, { parentId }))).then(
      () => {
        toast({ title: "Сценарії переміщено" });
      }
    );
  };

  // Пошук
  const filteredScenarios = scenarios
    .filter(
      (s) =>
        (s.name.uk + s.name.en).toLowerCase().includes(search.toLowerCase()) ||
        (s.description.uk + s.description.en)
          .toLowerCase()
          .includes(search.toLowerCase())
    )
    .filter(
      (s) =>
        (!filterTag || (s.tags || []).includes(filterTag)) &&
        (!filterStatus || s.status === filterStatus)
    );

  // Додаю функції, які були втрачені при рефакторингу
  const handleEdit = (s: Scenario) => {
    setEditScenario(s);
    setModalOpen(true);
  };
  const handleDelete = (id: string) => {
    pushUndo(scenarios.filter((s) => s.id !== id));
    deleteScenario(id).then(() => {
      setScenarios((prev) => prev.filter((s) => s.id !== id));
      toast({ title: "Сценарій видалено" });
    });
  };
  const handleReorder = (dragId: string, dropId: string) => {
    const next = scenarios.map((s) =>
      s.id === dragId ? { ...s, parentId: dropId } : s
    );
    pushUndo(next);
    updateScenario(dragId, { parentId: dropId });
  };
  const handleSave = (data: Partial<Scenario>) => {
    if (editScenario) {
      updateScenario(editScenario.id, data).then((s) => {
        setScenarios((prev) => prev.map((x) => (x.id === s.id ? s : x)));
        setModalOpen(false);
        setEditScenario(null);
        toast({ title: "Сценарій оновлено" });
      });
    } else {
      createScenario(data).then((s) => {
        setScenarios((prev) => [...prev, s]);
        setModalOpen(false);
        toast({ title: "Сценарій створено" });
      });
    }
  };

  // Для graph view
  const scenarioNodes: Node[] = filteredScenarios.map((s) => ({
    id: s.id,
    data: {
      label: `${s.name.uk}${s.status ? ` (${s.status})` : ""}${
        s.tags && s.tags.length ? ` [${s.tags.join(", ")}]` : ""
      }${s.author ? `\n${s.author}` : ""}`,
      type: s.type,
    },
    position: { x: Math.random() * 400, y: Math.random() * 400 },
    style: {
      background:
        s.type === "main"
          ? "#2563eb"
          : s.type === "alt"
          ? "#059669"
          : "#f59e42",
      color: "#fff",
      borderRadius: 8,
      border: "2px solid #222",
      minWidth: 120,
    },
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
  }));
  const scenarioEdges: Edge[] = filteredScenarios
    .filter((s) => s.parentId)
    .map((s) => ({
      id: `${s.parentId}-${s.id}`,
      source: s.parentId!,
      target: s.id,
      animated: false,
      style: { stroke: "#888", strokeWidth: 2 },
    }));
  const [nodes, setNodes, onNodesChange] = useNodesState(scenarioNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(scenarioEdges);
  // Drag&drop reorder (on connect)
  const onConnect = (params: any) => {
    const dragId = params.target;
    const dropId = params.source;
    handleReorder(dragId, dropId);
    setEdges((eds) => addEdge(params, eds));
  };

  // Експорт сценаріїв (гілки або всіх)
  const exportScenarios = (rootId?: string) => {
    const collectTree = (id: string | null): any[] => {
      const nodes = scenarios.filter((s) => s.parentId === id);
      return nodes.map((n) => ({
        ...n,
        children: collectTree(n.id),
      }));
    };
    let data;
    if (rootId) {
      const root = scenarios.find((s) => s.id === rootId);
      if (!root) return;
      data = [{ ...root, children: collectTree(root.id) }];
    } else {
      data = collectTree(null);
    }
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `scenarios_export_${rootId || "all"}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Експортовано!" });
  };
  // Імпорт сценаріїв
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        setImportPreview(data);
        setImportDialogOpen(true);
      } catch {
        toast({ title: "Помилка імпорту: некоректний JSON" });
      }
    };
    reader.readAsText(file);
  };
  const confirmImport = () => {
    const flatten = (arr: any[]): any[] =>
      arr.flatMap((n: any) => [
        { ...n, children: undefined },
        ...flatten(n.children || []),
      ]);
    const flat = flatten(importPreview);
    flat.forEach((s: any) => createScenario(s));
    setImportDialogOpen(false);
    setImportPreview(null);
    toast({ title: "Імпортовано!" });
  };

  // Додаю запис у історію при зміні сценаріїв
  const pushHistory = (action: string, data: any) => {
    const entry = {
      action,
      data,
      date: new Date().toISOString(),
      author: data.author || "user",
    };
    const next = [...scenarioHistory, entry];
    setScenarioHistory(next);
    localStorage.setItem("scenarios_history", JSON.stringify(next));
  };

  // Undo/redo для історії
  const handleRestore = (entry: any) => {
    setScenarios(entry.data);
    toast({ title: "Відновлено версію" });
    setHistoryDialogOpen(false);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Сценарії</h1>
      <div className="flex gap-2 mb-4 flex-wrap">
        <Button
          onClick={() => setViewMode("tree")}
          variant={viewMode === "tree" ? "default" : "outline"}
        >
          Дерево
        </Button>
        <Button
          onClick={() => setViewMode("graph")}
          variant={viewMode === "graph" ? "default" : "outline"}
        >
          Graph view
        </Button>
        <Button
          onClick={() => {
            setEditScenario(null);
            setModalOpen(true);
          }}
        >
          + Новий сценарій
        </Button>
        <Button
          variant="outline"
          onClick={handleUndo}
          disabled={undoStack.length === 0}
        >
          Undo
        </Button>
        <Button
          variant="outline"
          onClick={handleRedo}
          disabled={redoStack.length === 0}
        >
          Redo
        </Button>
        <Button
          variant="destructive"
          onClick={handleMassDelete}
          disabled={selectedIds.length === 0}
        >
          Видалити вибране
        </Button>
        <Button variant="outline" onClick={handleSelectAll}>
          Виділити все
        </Button>
        <Button variant="outline" onClick={handleDeselectAll}>
          Зняти виділення
        </Button>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Пошук..."
          className="fantasy-input px-2 py-1 rounded border bg-black/40 text-white"
        />
        {selectedIds.length > 0 && (
          <select
            onChange={(e) => handleMassMove(e.target.value || null)}
            className="fantasy-input"
          >
            <option value="">Перемістити до...</option>
            {scenarios
              .filter((s) => !selectedIds.includes(s.id))
              .map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name.uk}
                </option>
              ))}
            <option value="">Корінь</option>
          </select>
        )}
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="fantasy-input"
        >
          <option value="">Всі статуси</option>
          <option value="active">{t.scenarioStatuses.active}</option>
          <option value="draft">{t.scenarioStatuses.draft}</option>
          <option value="archived">{t.scenarioStatuses.archived}</option>
        </select>
        <select
          value={filterTag}
          onChange={(e) => setFilterTag(e.target.value)}
          className="fantasy-input"
        >
          <option value="">Всі теги</option>
          {Array.from(new Set(scenarios.flatMap((s) => s.tags || []))).map(
            (t) => (
              <option key={t} value={t}>
                {t}
              </option>
            )
          )}
        </select>
        <Button variant="outline" onClick={() => exportScenarios()}>
          Експорт всіх
        </Button>
        <Button
          variant="outline"
          onClick={() =>
            selectedIds.length === 1 && exportScenarios(selectedIds[0])
          }
          disabled={selectedIds.length !== 1}
        >
          Експорт гілки
        </Button>
        <label className="px-4 py-2 bg-gray-700 rounded cursor-pointer text-white hover:bg-gray-600 transition">
          Імпорт
          <input
            type="file"
            accept="application/json"
            className="hidden"
            onChange={handleImport}
          />
        </label>
        <Button variant="outline" onClick={() => setHistoryDialogOpen(true)}>
          Історія змін
        </Button>
      </div>
      {viewMode === "tree" ? (
        <div className="mt-6">
          {loading ? (
            <Skeleton className="h-32 w-full" />
          ) : (
            <DndProvider backend={HTML5Backend}>
              <ScenarioTree
                scenarios={filteredScenarios}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onReorder={handleReorder}
                events={events}
                lore={lore}
                locations={locations}
                selectedIds={selectedIds}
                onSelect={handleSelect}
              />
            </DndProvider>
          )}
        </div>
      ) : (
        <div className="h-[600px] bg-black/10 rounded">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            fitView
          >
            <MiniMap
              nodeColor={(n) =>
                n.data.type === "main"
                  ? "#2563eb"
                  : n.data.type === "alt"
                  ? "#059669"
                  : "#f59e42"
              }
            />
            <Controls />
            <Background />
          </ReactFlow>
        </div>
      )}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogTitle>
            {editScenario ? "Редагувати сценарій" : "Новий сценарій"}
          </DialogTitle>
          <ScenarioForm
            initialData={editScenario}
            onSave={handleSave}
            onCancel={() => setModalOpen(false)}
          />
        </DialogContent>
      </Dialog>
      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogContent>
          <DialogTitle>Попередній перегляд імпорту</DialogTitle>
          <pre className="max-h-64 overflow-auto bg-black/10 p-2 rounded text-xs whitespace-pre-wrap">
            {JSON.stringify(importPreview, null, 2)}
          </pre>
          <div className="flex gap-2 mt-4">
            <Button onClick={confirmImport}>Імпортувати</Button>
            <Button
              variant="outline"
              onClick={() => setImportDialogOpen(false)}
            >
              Скасувати
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={historyDialogOpen} onOpenChange={setHistoryDialogOpen}>
        <DialogContent>
          <DialogTitle>Історія змін сценаріїв</DialogTitle>
          <div className="max-h-64 overflow-auto bg-black/10 p-2 rounded text-xs whitespace-pre-wrap">
            {scenarioHistory.length === 0 && <div>Історія порожня</div>}
            {scenarioHistory.map((h, i) => (
              <div key={i} className="mb-2 border-b border-gray-700 pb-2">
                <div className="flex gap-2 items-center">
                  <span className="font-bold">{h.action}</span>
                  <span className="text-gray-400">
                    {new Date(h.date).toLocaleString()}
                  </span>
                  <span className="text-gray-400">{h.author}</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setHistoryPreview(h)}
                  >
                    Переглянути
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleRestore(h)}
                  >
                    Відкотити
                  </Button>
                </div>
                <pre className="bg-black/20 rounded p-1 mt-1 max-h-24 overflow-auto">
                  {JSON.stringify(h.data, null, 2)}
                </pre>
              </div>
            ))}
          </div>
          <Button variant="outline" onClick={() => setHistoryDialogOpen(false)}>
            Закрити
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
