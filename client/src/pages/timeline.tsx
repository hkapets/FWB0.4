import React, { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "../components/ui/tooltip";
import { Lock, Clock, Calendar, MapPin, User, Sword, Sparkles } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import CreateTimelineEventModal from "@/components/modals/create-timeline-event-modal";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from "@/components/ui/hover-card";
import { Checkbox } from "@/components/ui/checkbox";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const EVENT_TYPES = [
  { value: "war", label: "Війна" },
  { value: "discovery", label: "Відкриття" },
  { value: "birth", label: "Народження" },
  { value: "death", label: "Смерть" },
  { value: "founding", label: "Заснування" },
  { value: "custom", label: "Custom" },
];

// Горизонтальний компонент події
function HorizontalTimelineEvent({ 
  event, 
  index, 
  totalEvents, 
  moveEvent, 
  onEdit, 
  characters, 
  locations, 
  artifacts, 
  typeColors, 
  selected, 
  onSelect 
}: any) {
  const [{ isDragging }, drag] = useDrag({
    type: 'event',
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: 'event',
    hover: (item: { index: number }) => {
      if (item.index !== index) {
        moveEvent(item.index, index);
        item.index = index;
      }
    },
  });

  // Розташування над/під лінією (парні/непарні)
  const isAbove = index % 2 === 0;
  const leftPosition = (index / (totalEvents - 1)) * 90; // 90% від ширини контейнера
  
  const getEventIcon = (type: string) => {
    switch (type) {
      case 'war': return <Sword className="w-4 h-4" />;
      case 'discovery': return <Sparkles className="w-4 h-4" />;
      case 'birth': case 'death': return <User className="w-4 h-4" />;
      case 'founding': return <MapPin className="w-4 h-4" />;
      default: return <Calendar className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      war: "from-red-600 to-red-800",
      discovery: "from-blue-600 to-blue-800", 
      birth: "from-green-600 to-green-800",
      death: "from-gray-600 to-gray-800",
      founding: "from-purple-600 to-purple-800",
      default: "from-yellow-600 to-yellow-800"
    };
    return colors[type] || colors.default;
  };

  return (
    <div
      ref={(node) => drag(drop(node))}
      className={`absolute cursor-pointer transition-all duration-300 ${isDragging ? 'opacity-50 scale-95' : 'hover:scale-105'}`}
      style={{
        left: `${leftPosition}%`,
        top: isAbove ? '20%' : '60%',
        transform: 'translateX(-50%)',
      }}
    >
      {/* Вертикальна лінія до головної лінії */}
      <div 
        className="absolute w-0.5 bg-yellow-400/60"
        style={{
          height: '60px',
          left: '50%',
          top: isAbove ? '100%' : '-60px',
          transform: 'translateX(-50%)',
        }}
      />
      
      {/* Точка на головній лінії */}
      <div 
        className="absolute w-4 h-4 bg-yellow-400 rounded-full shadow-lg border-2 border-yellow-300"
        style={{
          left: '50%',
          top: isAbove ? 'calc(100% + 58px)' : '-62px',
          transform: 'translateX(-50%)',
        }}
      />

      {/* Картка події */}
      <div 
        className={`
          relative w-72 p-4 rounded-lg shadow-xl backdrop-blur-sm border 
          bg-gradient-to-br ${getTypeColor(event.type)} 
          ${selected ? 'ring-2 ring-yellow-400' : ''}
          hover:shadow-2xl transition-all duration-300
        `}
        onClick={() => onEdit(event)}
      >
        {/* Чекбокс вибору */}
        <div className="absolute -top-2 -right-2">
          <Checkbox 
            checked={selected}
            onCheckedChange={onSelect}
            className="bg-white/90"
            onClick={(e) => e.stopPropagation()}
          />
        </div>

        {/* Заголовок події */}
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            {getEventIcon(event.type)}
          </div>
          <h3 className="font-bold text-white text-lg truncate">{event.name}</h3>
        </div>

        {/* Дата */}
        <div className="text-white/90 text-sm mb-2 flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          {event.date || 'Невідома дата'}
        </div>

        {/* Опис */}
        {event.description && (
          <p className="text-white/80 text-sm line-clamp-3 mb-3">
            {event.description}
          </p>
        )}

        {/* Додаткова інформація */}
        <div className="flex items-center justify-between text-xs">
          <span className="bg-white/20 px-2 py-1 rounded-full text-white">
            {EVENT_TYPES.find(t => t.value === event.type)?.label || event.type}
          </span>
          
          {/* Іконки звя'язків */}
          <div className="flex gap-1">
            {event.characterId && <User className="w-3 h-3 text-white/70" />}
            {event.locationId && <MapPin className="w-3 h-3 text-white/70" />}
            {event.artifactId && <Sword className="w-3 h-3 text-white/70" />}
          </div>
        </div>

        {/* Drag handle */}
        <div className="absolute top-2 left-2 text-white/50 cursor-move">
          <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor">
            <circle cx="5" cy="6" r="1" />
            <circle cx="5" cy="10" r="1" />
            <circle cx="5" cy="14" r="1" />
            <circle cx="15" cy="6" r="1" />
            <circle cx="15" cy="10" r="1" />
            <circle cx="15" cy="14" r="1" />
          </svg>
        </div>
      </div>
    </div>
  );
}

export default function TimelinePage() {
  const t = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const worldId = 1; // TODO: отримувати з контексту

  // --- Timelines ---
  const { data: timelines = [], refetch: refetchTimelines } = useQuery<any[]>({
    queryKey: ["/api/worlds", worldId, "timelines"],
    queryFn: async () => {
      const res = await fetch(`/api/worlds/${worldId}/timelines`);
      return res.json();
    },
    enabled: !!worldId,
  });
  const [selectedTimelineId, setSelectedTimelineId] = useState<number | null>(
    null
  );
  useEffect(() => {
    if (timelines.length > 0 && !selectedTimelineId) {
      setSelectedTimelineId(timelines[0].id);
    }
  }, [timelines, selectedTimelineId]);

  // CRUD timelines
  const [timelineName, setTimelineName] = useState("");
  const [editingTimeline, setEditingTimeline] = useState<any | null>(null);
  const createTimeline = async () => {
    if (!timelineName.trim()) return;
    await fetch(`/api/worlds/${worldId}/timelines`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: timelineName }),
    });
    setTimelineName("");
    refetchTimelines();
  };
  const updateTimeline = async (id: number, name: string) => {
    await fetch(`/api/timelines/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    setEditingTimeline(null);
    refetchTimelines();
  };
  const deleteTimeline = async (id: number) => {
    await fetch(`/api/timelines/${id}`, { method: "DELETE" });
    if (selectedTimelineId === id) setSelectedTimelineId(null);
    refetchTimelines();
  };

  // --- Events ---
  const { data: events = [], refetch: refetchEvents } = useQuery<any[]>({
    queryKey: ["/api/worlds", worldId, "events", selectedTimelineId],
    queryFn: async () => {
      if (!selectedTimelineId) return [];
      const res = await fetch(
        `/api/worlds/${worldId}/events?timelineId=${selectedTimelineId}`
      );
      return res.json();
    },
    enabled: !!worldId && !!selectedTimelineId,
  });

  const { data: characters = [] } = useQuery<any[]>({
    queryKey: ["/api/characters"],
  });
  const { data: locations = [] } = useQuery<any[]>({
    queryKey: ["/api/locations"],
  });
  const { data: artifacts = [] } = useQuery<any[]>({
    queryKey: ["/api/artifacts"],
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedEventIds, setSelectedEventIds] = useState<string[]>([]);

  // Draft state
  const [draftDate, setDraftDate] = useState("");
  const [draftName, setDraftName] = useState("");
  const [draftDescription, setDraftDescription] = useState("");
  const [draftType, setDraftType] = useState("");
  const [draftCharacterId, setDraftCharacterId] = useState<number | undefined>(
    undefined
  );
  const [draftLocationId, setDraftLocationId] = useState<number | undefined>(
    undefined
  );
  const [draftArtifactId, setDraftArtifactId] = useState<number | undefined>(
    undefined
  );

  // Filter state
  const [filterType, setFilterType] = useState("");
  const [filterCharacter, setFilterCharacter] = useState("");
  const [filterLocation, setFilterLocation] = useState("");
  const [filterArtifact, setFilterArtifact] = useState("");
  const [search, setSearch] = useState("");

  // Кольори типів подій
  const typeColors: Record<string, string> = {
    war: "bg-red-700 text-white",
    discovery: "bg-blue-700 text-white",
    birth: "bg-green-700 text-white",
    death: "bg-gray-700 text-white",
    other: "bg-yellow-700 text-white",
  };

  const createEvent = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch(`/api/worlds/${worldId}/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create event");
      return res.json();
    },
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["/api/worlds", worldId, "events", selectedTimelineId],
      }),
  });
  const updateEvent = useMutation({
    mutationFn: async ({ id, ...data }: any) => {
      const res = await fetch(`/api/events/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update event");
      return res.json();
    },
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["/api/worlds", worldId, "events", selectedTimelineId],
      }),
  });
  const deleteEvent = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/events/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete event");
      return true;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["/api/worlds", worldId, "events", selectedTimelineId],
      }),
  });

  function openCreate() {
    setEditingEvent(null);
    setDraftDate("");
    setDraftName("");
    setDraftDescription("");
    setDraftType("");
    setDraftCharacterId(undefined);
    setDraftLocationId(undefined);
    setDraftArtifactId(undefined);
    setModalOpen(true);
  }
  function openEdit(event: any) {
    setEditingEvent(event);
    setDraftDate(event.date || "");
    setDraftName(event.name || "");
    setDraftDescription(event.description || "");
    setDraftType(event.type || "");
    setDraftCharacterId(event.characterId ?? undefined);
    setDraftLocationId(event.locationId ?? undefined);
    setDraftArtifactId(event.artifactId ?? undefined);
    setModalOpen(true);
  }
  function handleSave() {
    const data = {
      name: draftName,
      date: draftDate,
      description: draftDescription,
      type: draftType,
      characterId: draftCharacterId,
      locationId: draftLocationId,
      artifactId: draftArtifactId,
      timelineId: selectedTimelineId,
    };
    if (editingEvent) {
      updateEvent.mutate({ id: editingEvent.id, ...data });
    } else {
      createEvent.mutate(data);
    }
    setModalOpen(false);
  }
  function handleDelete() {
    if (editingEvent) {
      deleteEvent.mutate(editingEvent.id);
    }
    setDeleteDialogOpen(false);
    setModalOpen(false);
  }

  // Сортуємо події за датою
  const sortedEvents = [...events].sort((a, b) => (a.date > b.date ? 1 : -1));

  // Фільтрація подій
  const filteredEvents = sortedEvents.filter(
    (e) =>
      (!filterType || e.type === filterType) &&
      (!filterCharacter || String(e.characterId) === filterCharacter) &&
      (!filterLocation || String(e.locationId) === filterLocation) &&
      (!filterArtifact || String(e.artifactId) === filterArtifact) &&
      (!search ||
        e.name?.toLowerCase?.().includes(search.toLowerCase()) ||
        e.description?.toLowerCase?.().includes(search.toLowerCase()))
  );

  // --- Undo/Redo reorder ---
  const [history, setHistory] = useState<any[][]>([]);
  const [future, setFuture] = useState<any[][]>([]);
  // Стейт для reorder
  const [localEvents, setLocalEvents] = useState<any[]>([]);
  useEffect(() => {
    setLocalEvents(filteredEvents.map((e) => ({ ...e })));
    setHistory([]);
    setFuture([]);
  }, [filteredEvents]);
  function moveEvent(dragIndex: number, hoverIndex: number) {
    setLocalEvents((prev) => {
      const updated = [...prev];
      const [removed] = updated.splice(dragIndex, 1);
      updated.splice(hoverIndex, 0, removed);
      setHistory((h) => [...h, prev]);
      setFuture([]);
      return updated;
    });
  }
  function undoReorder() {
    setHistory((h) => {
      if (h.length === 0) return h;
      setFuture((f) => [localEvents, ...f]);
      setLocalEvents(h[h.length - 1]);
      return h.slice(0, -1);
    });
  }
  function redoReorder() {
    setFuture((f) => {
      if (f.length === 0) return f;
      setHistory((h) => [...h, localEvents]);
      setLocalEvents(f[0]);
      return f.slice(1);
    });
  }

  function toggleSelectEvent(id: string) {
    setSelectedEventIds((prev) =>
      prev.includes(id) ? prev.filter((eid) => eid !== id) : [...prev, id]
    );
  }
  function selectAll() {
    setSelectedEventIds(localEvents.map((e) => String(e.id)));
  }
  function deselectAll() {
    setSelectedEventIds([]);
  }

  async function handleMassDelete() {
    for (const id of selectedEventIds) {
      await deleteEvent.mutateAsync(id);
    }
    setSelectedEventIds([]);
    queryClient.invalidateQueries({
      queryKey: ["/api/worlds", worldId, "events", selectedTimelineId],
    });
  }

  const [massType, setMassType] = useState("");
  const [massDate, setMassDate] = useState("");
  async function handleMassUpdate() {
    for (const id of selectedEventIds) {
      const update: any = {};
      if (massType) update.type = massType;
      if (massDate) update.date = massDate;
      if (Object.keys(update).length > 0) {
        await updateEvent.mutateAsync({ id, ...update });
      }
    }
    setMassType("");
    setMassDate("");
    setSelectedEventIds([]);
    queryClient.invalidateQueries({
      queryKey: ["/api/worlds", worldId, "events", selectedTimelineId],
    });
  }

  async function saveOrder() {
    for (let i = 0; i < localEvents.length; i++) {
      if (localEvents[i].order !== i) {
        await updateEvent.mutateAsync({ id: localEvents[i].id, order: i });
      }
    }
    queryClient.invalidateQueries({
      queryKey: ["/api/worlds", worldId, "events", selectedTimelineId],
    });
  }

  const timelineRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);

  async function handleExport(type: "png" | "pdf") {
    if (!timelineRef.current) return;
    setExporting(true);
    try {
      const canvas = await html2canvas(timelineRef.current, {
        backgroundColor: "#18181b",
        scale: 2,
        useCORS: true,
      });
      if (type === "png") {
        const url = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.href = url;
        link.download = `timeline-${Date.now()}.png`;
        link.click();
        toast({ title: "Експортовано у PNG!" });
      } else {
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF({
          orientation: "portrait",
          unit: "px",
          format: [canvas.width, canvas.height],
        });
        pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
        pdf.save(`timeline-${Date.now()}.pdf`);
        toast({ title: "Експортовано у PDF!" });
      }
    } catch (e) {
      toast({
        title: "Помилка експорту",
        description: String(e),
        variant: "destructive",
      });
    }
    setExporting(false);
  }

  return (
    <div className="w-full py-8 px-4">
      {/* Заголовок та навігація таймлайнів */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-4xl font-fantasy font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-500 mb-2">
              Хронологія світу
            </h1>
            <p className="text-purple-200">
              Горизонтальна лінія часу подій вашого фентезійного світу
            </p>
          </div>
          <Button onClick={openCreate} className="fantasy-button">
            Додати подію
          </Button>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {timelines.map((tl) => (
            <button
              key={tl.id}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
                selectedTimelineId === tl.id
                  ? "bg-gradient-to-r from-yellow-500 to-yellow-400 text-purple-900 shadow-lg"
                  : "bg-purple-900/40 text-yellow-200 hover:bg-purple-800/60 border border-yellow-400/30"
              }`}
              onClick={() => setSelectedTimelineId(tl.id)}
            >
              {editingTimeline?.id === tl.id ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    updateTimeline(tl.id, editingTimeline.name);
                  }}
                  className="inline-flex gap-1"
                >
                  <input
                    className="px-1 rounded text-black"
                    value={editingTimeline.name}
                    onChange={(e) =>
                      setEditingTimeline({
                        ...editingTimeline,
                        name: e.target.value,
                      })
                    }
                    autoFocus
                  />
                  <Button size="sm" type="submit">
                    OK
                  </Button>
                  <Button
                    size="sm"
                    type="button"
                    variant="ghost"
                    onClick={() => setEditingTimeline(null)}
                  >
                    ✕
                  </Button>
                </form>
              ) : (
                <span
                  onDoubleClick={() =>
                    setEditingTimeline({ id: tl.id, name: tl.name })
                  }
                >
                  {tl.name}
                </span>
              )}
              <Button
                size="sm"
                variant="ghost"
                onClick={() => deleteTimeline(tl.id)}
                title="Видалити"
              >
                🗑
              </Button>
            </button>
          ))}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              createTimeline();
            }}
            className="inline-flex gap-2"
          >
            <input
              className="px-3 py-2 rounded-lg bg-purple-900/40 border border-yellow-400/30 text-yellow-100 placeholder:text-yellow-400/70"
              value={timelineName}
              onChange={(e) => setTimelineName(e.target.value)}
              placeholder="Нова лінія часу"
            />
            <Button size="sm" type="submit" className="fantasy-button">
              +
            </Button>
          </form>
        </div>
      </div>
      {/* Масова панель дій */}
      {selectedEventIds.length > 0 && (
        <div className="mb-4 p-2 bg-yellow-900/30 rounded flex flex-wrap items-center gap-4">
          <span className="text-sm">Обрано: {selectedEventIds.length}</span>
          <Button size="sm" variant="destructive" onClick={handleMassDelete}>
            Видалити обрані
          </Button>
          <div className="flex items-center gap-2">
            <select
              className="px-2 py-1 rounded bg-black/40 text-white"
              value={massType}
              onChange={(e) => setMassType(e.target.value)}
            >
              <option value="">Тип події...</option>
              <option value="war">Війна</option>
              <option value="discovery">Відкриття</option>
              <option value="birth">Народження</option>
              <option value="death">Смерть</option>
              <option value="other">Інше</option>
            </select>
            <input
              type="text"
              className="px-2 py-1 rounded bg-black/40 text-white"
              value={massDate}
              onChange={(e) => setMassDate(e.target.value)}
              placeholder="Дата..."
              style={{ width: 100 }}
            />
            <Button size="sm" variant="outline" onClick={handleMassUpdate}>
              Застосувати до обраних
            </Button>
          </div>
          <Button size="sm" variant="outline" onClick={deselectAll}>
            Скасувати вибір
          </Button>
        </div>
      )}
      <div className="flex flex-wrap gap-2 mb-6 items-end">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Тип події</label>
          <select
            className="px-2 py-1 rounded bg-black/40 text-white"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="">Всі</option>
            <option value="war">Війна</option>
            <option value="discovery">Відкриття</option>
            <option value="birth">Народження</option>
            <option value="death">Смерть</option>
            <option value="other">Інше</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Персонаж</label>
          <select
            className="px-2 py-1 rounded bg-black/40 text-white"
            value={filterCharacter}
            onChange={(e) => setFilterCharacter(e.target.value)}
          >
            <option value="">Всі</option>
            {characters.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Локація</label>
          <select
            className="px-2 py-1 rounded bg-black/40 text-white"
            value={filterLocation}
            onChange={(e) => setFilterLocation(e.target.value)}
          >
            <option value="">Всі</option>
            {locations.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Артефакт</label>
          <select
            className="px-2 py-1 rounded bg-black/40 text-white"
            value={filterArtifact}
            onChange={(e) => setFilterArtifact(e.target.value)}
          >
            <option value="">Всі</option>
            {artifacts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1 min-w-[160px]">
          <label className="block text-xs text-gray-400 mb-1">Пошук</label>
          <input
            className="px-2 py-1 rounded bg-black/40 text-white w-full"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Пошук..."
          />
        </div>
      </div>
      <div className="text-xs text-gray-400 mb-2 flex items-center gap-2">
        <Checkbox
          checked={
            selectedEventIds.length === localEvents.length &&
            localEvents.length > 0
          }
          onCheckedChange={(checked) => (checked ? selectAll() : deselectAll())}
        />
        <span>Вибрати всі</span>
        <span className="ml-2">
          Перетягуйте події мишкою для зміни порядку. Після цього натисніть
          "Зберегти порядок".
        </span>
      </div>
      <div className="mb-4 flex gap-2 items-center">
        <Button
          onClick={() => handleExport("png")}
          disabled={exporting}
          variant="outline"
        >
          Експортувати PNG
        </Button>
        <Button
          onClick={() => handleExport("pdf")}
          disabled={exporting}
          variant="outline"
        >
          Експортувати PDF
        </Button>
        {exporting && (
          <span className="text-xs text-yellow-300 ml-2">Експортуємо...</span>
        )}
      </div>
      <DndProvider backend={HTML5Backend}>
        {/* Горизонтальний таймлайн */}
        <div 
          ref={timelineRef}
          className="relative w-full overflow-x-auto bg-gradient-to-r from-purple-900/20 via-gray-900/20 to-purple-800/20 rounded-xl p-8 fantasy-border"
          style={{ minHeight: '400px' }}
        >
          {/* Головна горизонтальна лінія */}
          <div className="absolute top-1/2 left-8 right-8 h-1 bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-400 rounded-full shadow-lg transform -translate-y-1/2">
            {/* Decorative elements */}
            <div className="absolute -left-2 top-1/2 w-4 h-4 bg-yellow-400 rounded-full transform -translate-y-1/2 shadow-lg"></div>
            <div className="absolute -right-2 top-1/2 w-4 h-4 bg-yellow-400 rounded-full transform -translate-y-1/2 shadow-lg"></div>
          </div>

          {/* Події розташовані горизонтально */}
          <div className="relative" style={{ minWidth: `${Math.max(localEvents.length * 300, 800)}px`, height: '300px' }}>
            {localEvents.length === 0 ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-gray-400">
                <div className="w-24 h-24 bg-purple-500/10 rounded-full flex items-center justify-center mb-4">
                  <Clock className="w-12 h-12 text-purple-400/50" />
                </div>
                <div className="text-xl mb-2 text-purple-200">
                  У цій лінії часу ще немає жодної події
                </div>
                <div className="mb-4 text-sm text-purple-300/70">
                  Створіть першу подію, щоб розпочати хронологію світу!
                </div>
                <Button onClick={openCreate} className="fantasy-button">
                  Додати першу подію
                </Button>
              </div>
            ) : (
              localEvents.map((event, idx) => (
                <HorizontalTimelineEvent
                  key={event.id}
                  event={event}
                  index={idx}
                  totalEvents={localEvents.length}
                  moveEvent={moveEvent}
                  onEdit={openEdit}
                  characters={characters}
                  locations={locations}
                  artifacts={artifacts}
                  typeColors={typeColors}
                  selected={selectedEventIds.includes(String(event.id))}
                  onSelect={() => toggleSelectEvent(String(event.id))}
                />
              ))
            )}
          </div>

          {/* Undo/Redo кнопки */}
          {localEvents.length > 1 && (
            <div className="absolute top-4 right-4 flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={undoReorder}
                disabled={history.length === 0}
                className="bg-purple-900/60 border-yellow-400/30 text-white"
              >
                Undo
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={redoReorder}
                disabled={future.length === 0}
                className="bg-purple-900/60 border-yellow-400/30 text-white"
              >
                Redo
              </Button>
            </div>
          )}

          {/* Кнопка збереження порядку */}
          {localEvents.length > 1 && (
            <div className="absolute bottom-4 right-4">
              <Button onClick={saveOrder} className="fantasy-button">
                Зберегти порядок
              </Button>
            </div>
          )}
        </div>
      </DndProvider>
      {/* Модалка створення/редагування події */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingEvent ? "Редагувати подію" : "Додати подію"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              value={draftName}
              onChange={(e) => setDraftName(e.target.value)}
              placeholder="Назва події"
            />
            <Input
              value={draftDate}
              onChange={(e) => setDraftDate(e.target.value)}
              placeholder="Дата (наприклад, 1234 р.)"
            />
            <Textarea
              value={draftDescription}
              onChange={(e) => setDraftDescription(e.target.value)}
              placeholder="Опис події"
            />
            <Select value={draftType} onValueChange={setDraftType}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Тип події" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="war">Війна</SelectItem>
                <SelectItem value="discovery">Відкриття</SelectItem>
                <SelectItem value="birth">Народження</SelectItem>
                <SelectItem value="death">Смерть</SelectItem>
                <SelectItem value="other">Інше</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={draftCharacterId ? String(draftCharacterId) : ""}
              onValueChange={(val) =>
                setDraftCharacterId(val ? Number(val) : undefined)
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Пов'язаний персонаж (опціонально)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">—</SelectItem>
                {characters.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={draftLocationId ? String(draftLocationId) : ""}
              onValueChange={(val) =>
                setDraftLocationId(val ? Number(val) : undefined)
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Пов'язана локація (опціонально)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">—</SelectItem>
                {locations.map((l) => (
                  <SelectItem key={l.id} value={String(l.id)}>
                    {l.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={draftArtifactId ? String(draftArtifactId) : ""}
              onValueChange={(val) =>
                setDraftArtifactId(val ? Number(val) : undefined)
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Пов'язаний артефакт (опціонально)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">—</SelectItem>
                {artifacts.map((a) => (
                  <SelectItem key={a.id} value={String(a.id)}>
                    {a.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            {editingEvent && (
              <>
                <AlertDialog
                  open={deleteDialogOpen}
                  onOpenChange={setDeleteDialogOpen}
                >
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Видалити подію?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Ви впевнені, що хочете видалити цю подію? Дію не можна
                        скасувати.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Скасувати</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-red-600 hover:bg-red-700"
                        onClick={handleDelete}
                      >
                        Видалити
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                <Button
                  variant="destructive"
                  onClick={() => setDeleteDialogOpen(true)}
                  type="button"
                >
                  Видалити
                </Button>
              </>
            )}
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Скасувати
            </Button>
            <Button onClick={handleSave}>
              {editingEvent ? "Зберегти" : "Додати"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function TimelineEventCard({
  event,
  index,
  moveEvent,
  onEdit,
  characters,
  locations,
  artifacts,
  typeColors,
  selected,
  onSelect,
  alwaysShowDragHandle,
}: any) {
  const ref = useRef<HTMLDivElement>(null);
  const [, drop] = useDrop({
    accept: "event",
    hover(item: any) {
      if (item.index === index) return;
      moveEvent(item.index, index);
      item.index = index;
    },
  });
  const [{ isDragging }, drag, preview] = useDrag({
    type: "event",
    item: { id: event.id, index },
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  });
  drag(drop(ref));
  return (
    <div
      ref={ref}
      className={`mb-8 relative group transition-all duration-200 ease-in-out ${
        isDragging
          ? "scale-95 shadow-2xl bg-yellow-900/30 z-20"
          : "hover:shadow-lg"
      } animate-[reorder_0.3s]`}
      style={{ opacity: isDragging ? 0.7 : 1, cursor: "move" }}
    >
      <div className="absolute -left-7 top-0 w-4 h-4 bg-yellow-400 rounded-full border-2 border-white"></div>
      <div className="bg-black/70 rounded p-4 shadow-md transition-all duration-200 flex items-start gap-2">
        <Checkbox
          checked={selected}
          onCheckedChange={onSelect}
          className="mt-1"
        />
        <div className="flex-1">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-lg truncate max-w-[60vw]">
              {event.name}
            </span>
            <div className="flex items-center gap-2">
              <span
                className={`text-xl select-none ${
                  alwaysShowDragHandle
                    ? ""
                    : "group-hover:opacity-100 opacity-60"
                } cursor-move`}
                title="Перетягніть для зміни порядку"
                style={{ fontFamily: "monospace" }}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <circle cx="5" cy="6" r="1.5" fill="#eab308" />
                  <circle cx="5" cy="10" r="1.5" fill="#eab308" />
                  <circle cx="5" cy="14" r="1.5" fill="#eab308" />
                  <circle cx="15" cy="6" r="1.5" fill="#eab308" />
                  <circle cx="15" cy="10" r="1.5" fill="#eab308" />
                  <circle cx="15" cy="14" r="1.5" fill="#eab308" />
                </svg>
              </span>
              <Button size="sm" variant="outline" onClick={() => onEdit(event)}>
                Редагувати
              </Button>
            </div>
          </div>
          <div className="text-xs text-gray-400 mb-1">{event.date}</div>
          <div className="text-sm mb-2 break-words whitespace-pre-line">
            {event.description}
          </div>
          <div className="flex gap-2 text-xs text-gray-300 items-center flex-wrap">
            {event.type && (
              <span
                className={`px-2 py-0.5 rounded font-bold ${
                  typeColors[event.type] || "bg-yellow-900/40"
                }`}
              >
                {event.type === "war"
                  ? "Війна"
                  : event.type === "discovery"
                  ? "Відкриття"
                  : event.type === "birth"
                  ? "Народження"
                  : event.type === "death"
                  ? "Смерть"
                  : "Інше"}
              </span>
            )}
            {event.characterId && (
              <span>
                Персонаж:{" "}
                <HoverCard>
                  <HoverCardTrigger asChild>
                    <Link
                      href={`/characters/${event.characterId}`}
                      className="underline cursor-pointer hover:text-yellow-300"
                    >
                      {
                        characters.find((c: any) => c.id === event.characterId)
                          ?.name
                      }
                    </Link>
                  </HoverCardTrigger>
                  <HoverCardContent>
                    {(() => {
                      const c = characters.find(
                        (c: any) => c.id === event.characterId
                      );
                      if (!c) return null;
                      return (
                        <div>
                          <div className="font-bold text-yellow-200 mb-1">
                            {c.name}
                          </div>
                          <div className="text-xs text-gray-400 mb-1">
                            {c.race} / {c.class}
                          </div>
                          {c.description && (
                            <div className="text-sm text-gray-300 line-clamp-3">
                              {c.description}
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </HoverCardContent>
                </HoverCard>
              </span>
            )}
            {event.locationId && (
              <span>
                Локація:{" "}
                <HoverCard>
                  <HoverCardTrigger asChild>
                    <Link
                      href={`/world-map?location=${event.locationId}`}
                      className="underline cursor-pointer hover:text-yellow-300"
                    >
                      {
                        locations.find((l: any) => l.id === event.locationId)
                          ?.name
                      }
                    </Link>
                  </HoverCardTrigger>
                  <HoverCardContent>
                    {(() => {
                      const l = locations.find(
                        (l: any) => l.id === event.locationId
                      );
                      if (!l) return null;
                      return (
                        <div>
                          <div className="font-bold text-yellow-200 mb-1">
                            {l.name}
                          </div>
                          <div className="text-xs text-gray-400 mb-1">
                            {l.type} / Небезпека: {l.dangerLevel}
                          </div>
                          {l.description && (
                            <div className="text-sm text-gray-300 line-clamp-3">
                              {l.description}
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </HoverCardContent>
                </HoverCard>
              </span>
            )}
            {event.artifactId && (
              <span>
                Артефакт:{" "}
                <HoverCard>
                  <HoverCardTrigger asChild>
                    <Link
                      href={`/lore/artifacts/${event.artifactId}`}
                      className="underline cursor-pointer hover:text-yellow-300"
                    >
                      {
                        artifacts.find((a: any) => a.id === event.artifactId)
                          ?.name
                      }
                    </Link>
                  </HoverCardTrigger>
                  <HoverCardContent>
                    {(() => {
                      const a = artifacts.find(
                        (a: any) => a.id === event.artifactId
                      );
                      if (!a) return null;
                      return (
                        <div>
                          <div className="font-bold text-yellow-200 mb-1">
                            {a.name}
                          </div>
                          {a.rarity && (
                            <div className="text-xs text-yellow-300 mb-1">
                              Рідкість: {a.rarity}
                            </div>
                          )}
                          {a.description && (
                            <div className="text-sm text-gray-300 line-clamp-3">
                              {a.description}
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </HoverCardContent>
                </HoverCard>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function EventForm({
  initialData,
  onSave,
  loading,
  onCancel,
  onDelete,
  allLore,
  allLocations,
  allScenarios,
}: any) {
  const [nameUk, setNameUk] = useState(initialData?.name?.uk || "");
  const [nameEn, setNameEn] = useState(initialData?.name?.en || "");
  const [descriptionUk, setDescriptionUk] = useState(
    initialData?.description?.uk || ""
  );
  const [descriptionEn, setDescriptionEn] = useState(
    initialData?.description?.en || ""
  );
  const [date, setDate] = useState(initialData?.date || "");
  const [endDate, setEndDate] = useState(initialData?.endDate || "");
  const [type, setType] = useState(initialData?.type || "custom");
  const [icon, setIcon] = useState(initialData?.icon || "");
  const [image, setImage] = useState(initialData?.image || "");
  const [color, setColor] = useState(initialData?.color || "#fbbf24");
  const [saving, setSaving] = useState(false);
  const [relatedLoreIds, setRelatedLoreIds] = useState<string[]>(
    initialData?.relatedLoreIds || []
  );
  const [relatedLocationIds, setRelatedLocationIds] = useState<string[]>(
    initialData?.relatedLocationIds || []
  );
  const [relatedScenarioIds, setRelatedScenarioIds] = useState<string[]>(
    initialData?.relatedScenarioIds || []
  );

  const handleSubmit = (e: any) => {
    e.preventDefault();
    if (!nameUk.trim() && !nameEn.trim()) return;
    onSave({
      name: { uk: nameUk, en: nameEn },
      description: { uk: descriptionUk, en: descriptionEn },
      date,
      endDate: endDate || undefined,
      type,
      icon,
      image,
      color,
      relatedLoreIds,
      relatedLocationIds,
      relatedScenarioIds,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <div className="flex gap-2">
        <div className="flex-1">
          <label>Назва (uk)</label>
          <Input
            value={nameUk}
            onChange={(e) => setNameUk(e.target.value)}
            required
          />
        </div>
        <div className="flex-1">
          <label>Name (en)</label>
          <Input
            value={nameEn}
            onChange={(e) => setNameEn(e.target.value)}
            required
          />
        </div>
      </div>
      <div className="flex gap-2">
        <div className="flex-1">
          <label>Опис (uk)</label>
          <Input
            value={descriptionUk}
            onChange={(e) => setDescriptionUk(e.target.value)}
          />
        </div>
        <div className="flex-1">
          <label>Description (en)</label>
          <Input
            value={descriptionEn}
            onChange={(e) => setDescriptionEn(e.target.value)}
          />
        </div>
      </div>
      <div className="flex gap-2">
        <div className="flex-1">
          <label>Дата/період</label>
          <Input
            value={date}
            onChange={(e) => setDate(e.target.value)}
            placeholder="Напр. -1000, 1234-05-01, Епоха Драконів"
          />
        </div>
        <div className="flex-1">
          <label>Кінець (опц.)</label>
          <Input
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            placeholder="Для періодів"
          />
        </div>
      </div>
      <div className="flex gap-2 items-center">
        <div className="flex-1">
          <label>Тип</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="fantasy-input w-full"
          >
            {EVENT_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label>Іконка (emoji)</label>
          <Input
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
            placeholder="🗡️"
          />
        </div>
        <div className="flex-1">
          <label>Колір</label>
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-10 h-10 rounded"
          />
        </div>
      </div>
      <div>
        <label>Зображення (url)</label>
        <Input
          value={image}
          onChange={(e) => setImage(e.target.value)}
          placeholder="https://..."
        />
        {image && (
          <img
            src={image}
            alt=""
            className="w-32 h-20 object-cover rounded mt-2"
          />
        )}
      </div>
      <div className="flex gap-2">
        <div className="flex-1">
          <label>Прив'язати до лору</label>
          <select
            multiple
            value={relatedLoreIds}
            onChange={(e) =>
              setRelatedLoreIds(
                Array.from(e.target.selectedOptions, (o) => o.value)
              )
            }
            className="fantasy-input w-full h-20"
          >
            {allLore.map((l: any) => (
              <option key={l.id} value={l.id}>
                {typeof l.name === "object" ? l.name.uk : l.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label>Прив'язати до локації</label>
          <select
            multiple
            value={relatedLocationIds}
            onChange={(e) =>
              setRelatedLocationIds(
                Array.from(e.target.selectedOptions, (o) => o.value)
              )
            }
            className="fantasy-input w-full h-20"
          >
            {allLocations.map((loc: any) => (
              <option key={loc.id} value={loc.id}>
                {loc.name || loc.type || loc.id}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex gap-2">
        <div className="flex-1">
          <label>Прив'язати до сценарію</label>
          <select
            multiple
            value={relatedScenarioIds}
            onChange={(e) =>
              setRelatedScenarioIds(
                Array.from(e.target.selectedOptions, (o) => o.value)
              )
            }
            className="fantasy-input w-full h-20"
          >
            {allScenarios.map((s: any) => (
              <option key={s.id} value={s.id}>
                {typeof s.name === "object" ? s.name.uk : s.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex gap-2 mt-4">
        <Button type="submit" disabled={loading || saving}>
          {initialData ? "Зберегти" : "Створити"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Скасувати
        </Button>
        {onDelete && (
          <Button type="button" variant="destructive" onClick={onDelete}>
            Видалити
          </Button>
        )}
      </div>
    </form>
  );
}
