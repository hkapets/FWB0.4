import React, { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
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
import { Lock } from "lucide-react";

const EVENT_TYPES = [
  { value: "war", label: "Війна" },
  { value: "discovery", label: "Відкриття" },
  { value: "birth", label: "Народження" },
  { value: "death", label: "Смерть" },
  { value: "founding", label: "Заснування" },
  { value: "custom", label: "Custom" },
];

export default function TimelinePage() {
  const { toast } = useToast();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editEvent, setEditEvent] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);
  const worldId = 1; // TODO: отримувати з контексту
  const [lore, setLore] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [filterLore, setFilterLore] = useState<string>("all");
  const [filterLocation, setFilterLocation] = useState<string>("all");
  const [filterImage, setFilterImage] = useState<string>("all");
  const [filterDate, setFilterDate] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [filterType, setFilterType] = useState<string>("all");
  const [undoStack, setUndoStack] = useState<any[]>([]);
  const [redoStack, setRedoStack] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [massEditSaving, setMassEditSaving] = useState(false);
  const [scenarios, setScenarios] = useState<any[]>([]);
  const [filterScenario, setFilterScenario] = useState<string>("all");
  const [hoveredScenarioId, setHoveredScenarioId] = useState<string | null>(
    null
  );

  useEffect(() => {
    setLoading(true);
    fetch(`/api/worlds/${worldId}/events`)
      .then((r) => r.json())
      .then((data) => setEvents(data))
      .finally(() => setLoading(false));
    fetch(`/api/worlds/${worldId}/lore`)
      .then((r) => r.json())
      .then(setLore);
    fetch(`/api/worlds/${worldId}/markers`)
      .then((r) => r.json())
      .then((data) => {
        // markers + polygons
        fetch(`/api/worlds/${worldId}/polygons`)
          .then((r2) => r2.json())
          .then((polys) => {
            setLocations([...(data || []), ...(polys || [])]);
          });
      });
    fetch(`/api/worlds/${worldId}/scenarios`)
      .then((r) => r.json())
      .then(setScenarios);
  }, [worldId]);

  const openCreate = () => {
    setEditEvent(null);
    setModalOpen(true);
  };
  const openEdit = (event: any) => {
    setEditEvent(event);
    setModalOpen(true);
  };
  const handleSave = async (data: any) => {
    setSaving(true);
    try {
      let res: Response, saved: any;
      if (editEvent) {
        res = await fetch(`/api/events/${editEvent.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        saved = await res.json();
        setEvents(events.map((e) => (e.id === saved.id ? saved : e)));
        toast({ title: "Подію оновлено" });
      } else {
        res = await fetch(`/api/worlds/${worldId}/events`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        saved = await res.json();
        setEvents([...events, saved]);
        toast({ title: "Подію створено" });
      }
      setModalOpen(false);
    } catch (e) {
      toast({ title: "Помилка збереження", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };
  const handleDelete = async (event: any) => {
    if (!window.confirm("Видалити цю подію?")) return;
    try {
      await fetch(`/api/events/${event.id}`, { method: "DELETE" });
      setEvents(events.filter((e) => e.id !== event.id));
      toast({ title: "Подію видалено" });
      setModalOpen(false);
    } catch (e) {
      toast({ title: "Помилка видалення", variant: "destructive" });
    }
  };

  // Drag&drop reorder
  const moveEvent = (dragIdx: number, hoverIdx: number) => {
    const updated = [...events];
    const [removed] = updated.splice(dragIdx, 1);
    updated.splice(hoverIdx, 0, removed);
    // Оновлюємо order
    const withOrder = updated.map((e, i) => ({ ...e, order: i }));
    setEvents(withOrder);
  };
  const saveOrder = async () => {
    for (const e of events) {
      await fetch(`/api/events/${e.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: e.order }),
      });
    }
    toast({ title: "Порядок подій збережено" });
  };

  const handleUndo = async () => {
    if (undoStack.length === 0) return;
    setRedoStack((stack) => [events.map((e) => ({ ...e })), ...stack]);
    const prev = undoStack[undoStack.length - 1];
    setEvents(prev);
    setUndoStack((stack) => stack.slice(0, -1));
    for (const e of prev) {
      await fetch(`/api/events/${e.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(e),
      });
    }
    toast({ title: "Undo", description: "Останню дію скасовано." });
  };

  const handleRedo = async () => {
    if (redoStack.length === 0) return;
    setUndoStack((stack) => [...stack, events.map((e) => ({ ...e }))]);
    const next = redoStack[0];
    setEvents(next);
    setRedoStack((stack) => stack.slice(1));
    for (const e of next) {
      await fetch(`/api/events/${e.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(e),
      });
    }
    toast({ title: "Redo", description: "Дію повернуто." });
  };

  // Масове виділення
  const handleSelect = (id: string, checked: boolean) => {
    setSelectedIds((ids) =>
      checked ? [...ids, id] : ids.filter((i) => i !== id)
    );
  };
  const handleSelectAll = (checked: boolean, visibleEvents: any[]) => {
    if (checked)
      setSelectedIds(
        Array.from(new Set([...selectedIds, ...visibleEvents.map((e) => e.id)]))
      );
    else
      setSelectedIds(
        selectedIds.filter((id) => !visibleEvents.some((e) => e.id === id))
      );
  };
  // Масове видалення
  const handleMassDelete = async () => {
    if (!window.confirm(`Видалити ${selectedIds.length} подій?`)) return;
    for (const id of selectedIds) {
      await fetch(`/api/events/${id}`, { method: "DELETE" });
    }
    setEvents(events.filter((e) => !selectedIds.includes(e.id)));
    setSelectedIds([]);
    toast({ title: "Видалено", description: "Вибрані події видалено." });
  };

  // Масова зміна типу
  const handleMassType = async (type: string) => {
    for (const id of selectedIds) {
      await fetch(`/api/events/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      });
    }
    setEvents(
      events.map((e) => (selectedIds.includes(e.id) ? { ...e, type } : e))
    );
    toast({
      title: "Тип змінено",
      description: "Вибраним подіям змінено тип.",
    });
  };
  // Масове прив'язування до лору
  const handleMassLore = async (loreId: string) => {
    for (const id of selectedIds) {
      const e = events.find((ev) => ev.id === id);
      const relatedLoreIds = Array.from(
        new Set([...(e.relatedLoreIds || []), loreId])
      );
      await fetch(`/api/events/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ relatedLoreIds }),
      });
    }
    setEvents(
      events.map((e) =>
        selectedIds.includes(e.id)
          ? {
              ...e,
              relatedLoreIds: Array.from(
                new Set([...(e.relatedLoreIds || []), loreId])
              ),
            }
          : e
      )
    );
    toast({ title: "Лор додано", description: "Вибраним подіям додано лор." });
  };
  // Масове прив'язування до локації
  const handleMassLocation = async (locId: string) => {
    for (const id of selectedIds) {
      const e = events.find((ev) => ev.id === id);
      const relatedLocationIds = Array.from(
        new Set([...(e.relatedLocationIds || []), locId])
      );
      await fetch(`/api/events/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ relatedLocationIds }),
      });
    }
    setEvents(
      events.map((e) =>
        selectedIds.includes(e.id)
          ? {
              ...e,
              relatedLocationIds: Array.from(
                new Set([...(e.relatedLocationIds || []), locId])
              ),
            }
          : e
      )
    );
    toast({
      title: "Локацію додано",
      description: "Вибраним подіям додано локацію.",
    });
  };

  // Відфільтровані події для масових дій
  const filteredEvents = events.filter(
    (e) =>
      (filterType === "all" || e.type === filterType) &&
      (search.trim() === "" ||
        (typeof e.name === "object"
          ? (e.name.uk + e.name.en).toLowerCase().includes(search.toLowerCase())
          : (e.name || "").toLowerCase().includes(search.toLowerCase())) ||
        (typeof e.description === "object"
          ? (e.description.uk + e.description.en)
              .toLowerCase()
              .includes(search.toLowerCase())
          : (e.description || "")
              .toLowerCase()
              .includes(search.toLowerCase()))) &&
      (filterLore === "all" || (e.relatedLoreIds || []).includes(filterLore)) &&
      (filterLocation === "all" ||
        (e.relatedLocationIds || []).includes(filterLocation)) &&
      (filterScenario === "all" ||
        (e.relatedScenarioIds || []).includes(filterScenario)) &&
      (filterImage === "all" ||
        (filterImage === "with" ? !!e.image : !e.image)) &&
      (filterDate.trim() === "" ||
        (e.date || "").includes(filterDate) ||
        (e.endDate || "").includes(filterDate))
  );

  // Додаю функцію для оновлення події з undo
  const updateEventWithUndo = async (id: string, patch: any) => {
    const prev = events.find((e) => e.id === id);
    setUndoStack((stack) => [...stack, events.map((e) => ({ ...e }))]);
    setRedoStack([]);
    const updated = events.map((e) => (e.id === id ? { ...e, ...patch } : e));
    setEvents(updated);
    await fetch(`/api/events/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
  };

  const handleMassEdit = async (patch: any) => {
    setMassEditSaving(true);
    for (const id of selectedIds) {
      await fetch(`/api/events/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
    }
    setEvents(
      events.map((e) => (selectedIds.includes(e.id) ? { ...e, ...patch } : e))
    );
    setMassEditSaving(false);
    toast({
      title: "Масове редагування",
      description: "Зміни застосовано до вибраних подій.",
    });
  };

  // У тулбарі додаю масові дії для сценарію
  {
    selectedIds.length > 0 && (
      <div className="flex gap-2 items-center">
        <select
          onChange={(e) => handleMassAddScenario(e.target.value)}
          className="fantasy-input"
        >
          <option value="">Додати сценарій до вибраних...</option>
          {scenarios.map((s) => (
            <option key={s.id} value={s.id}>
              {typeof s.name === "object" ? s.name.uk : s.name}
            </option>
          ))}
        </select>
        <select
          onChange={(e) => handleMassRemoveScenario(e.target.value)}
          className="fantasy-input"
        >
          <option value="">Видалити сценарій з вибраних...</option>
          {scenarios.map((s) => (
            <option key={s.id} value={s.id}>
              {typeof s.name === "object" ? s.name.uk : s.name}
            </option>
          ))}
        </select>
      </div>
    );
  }

  // Додаю функції масового додавання/видалення сценарію
  const handleMassAddScenario = (scenarioId: string) => {
    if (!scenarioId) return;
    setUndoStack((stack) => [...stack, events.map((e) => ({ ...e }))]);
    setRedoStack([]);
    setEvents(
      events.map((e) =>
        selectedIds.includes(e.id)
          ? {
              ...e,
              relatedScenarioIds: Array.from(
                new Set([...(e.relatedScenarioIds || []), scenarioId])
              ),
            }
          : e
      )
    );
    setSelectedIds([]);
    toast({ title: "Сценарій додано до вибраних подій" });
  };
  const handleMassRemoveScenario = (scenarioId: string) => {
    if (!scenarioId) return;
    setUndoStack((stack) => [...stack, events.map((e) => ({ ...e }))]);
    setRedoStack([]);
    setEvents(
      events.map((e) =>
        selectedIds.includes(e.id)
          ? {
              ...e,
              relatedScenarioIds: (e.relatedScenarioIds || []).filter(
                (id: string) => id !== scenarioId
              ),
            }
          : e
      )
    );
    setSelectedIds([]);
    toast({ title: "Сценарій видалено з вибраних подій" });
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Таймлайн світу</h1>
        <div className="flex gap-2">
          <Button onClick={openCreate}>+ Додати подію</Button>
          <Button
            onClick={handleUndo}
            disabled={undoStack.length === 0}
            variant="outline"
          >
            Undo
          </Button>
          <Button
            onClick={handleRedo}
            disabled={redoStack.length === 0}
            variant="outline"
          >
            Redo
          </Button>
        </div>
      </div>
      <div className="flex gap-2 mb-4 flex-wrap">
        <input
          type="text"
          className="px-2 py-1 rounded border bg-black/40 text-white placeholder:text-gray-400"
          placeholder="Пошук по назві чи опису..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ minWidth: 200 }}
        />
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-2 py-1 rounded border bg-black/40 text-white"
        >
          <option value="all">Всі типи</option>
          {EVENT_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
        <select
          value={filterLore}
          onChange={(e) => setFilterLore(e.target.value)}
          className="px-2 py-1 rounded border bg-black/40 text-white"
        >
          <option value="all">Весь лор</option>
          {lore.map((l) => (
            <option key={l.id} value={l.id}>
              {typeof l.name === "object" ? l.name.uk : l.name}
            </option>
          ))}
        </select>
        <select
          value={filterLocation}
          onChange={(e) => setFilterLocation(e.target.value)}
          className="px-2 py-1 rounded border bg-black/40 text-white"
        >
          <option value="all">Всі локації</option>
          {locations.map((loc) => (
            <option key={loc.id} value={loc.id}>
              {loc.name || loc.type || loc.id}
            </option>
          ))}
        </select>
        <select
          value={filterImage}
          onChange={(e) => setFilterImage(e.target.value)}
          className="px-2 py-1 rounded border bg-black/40 text-white"
        >
          <option value="all">Всі</option>
          <option value="with">Зі зображенням</option>
          <option value="without">Без зображення</option>
        </select>
        <input
          type="text"
          className="px-2 py-1 rounded border bg-black/40 text-white placeholder:text-gray-400"
          placeholder="Дата (фільтр)"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          style={{ minWidth: 120 }}
        />
        <select
          value={filterScenario}
          onChange={(e) => setFilterScenario(e.target.value)}
          className="px-2 py-1 rounded border bg-black/40 text-white"
        >
          <option value="all">Всі сценарії</option>
          {scenarios.map((s) => (
            <option
              key={s.id}
              value={s.id}
              onMouseEnter={() => setHoveredScenarioId(s.id)}
              onMouseLeave={() => setHoveredScenarioId(null)}
            >
              {typeof s.name === "object" ? s.name.uk : s.name}
            </option>
          ))}
        </select>
      </div>
      {selectedIds.length > 0 && (
        <div className="mb-2 flex gap-2 items-center bg-yellow-900/30 p-2 rounded flex-wrap">
          <span className="text-yellow-200">
            Виділено: {selectedIds.length}
          </span>
          <Button
            size="sm"
            variant="destructive"
            onClick={handleMassDelete}
            disabled={massEditSaving}
          >
            Видалити
          </Button>
          <select
            className="px-2 py-1 rounded border bg-black/40 text-white"
            defaultValue=""
            onChange={(e) => {
              if (e.target.value) handleMassType(e.target.value);
            }}
            disabled={massEditSaving}
          >
            <option value="">Змінити тип...</option>
            {EVENT_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
          <select
            className="px-2 py-1 rounded border bg-black/40 text-white"
            defaultValue=""
            onChange={(e) => {
              if (e.target.value) handleMassLore(e.target.value);
            }}
            disabled={massEditSaving}
          >
            <option value="">Додати лор...</option>
            {lore.map((l) => (
              <option key={l.id} value={l.id}>
                {typeof l.name === "object" ? l.name.uk : l.name}
              </option>
            ))}
          </select>
          <select
            className="px-2 py-1 rounded border bg-black/40 text-white"
            defaultValue=""
            onChange={(e) => {
              if (e.target.value) handleMassLocation(e.target.value);
            }}
            disabled={massEditSaving}
          >
            <option value="">Додати локацію...</option>
            {locations.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.name || loc.type || loc.id}
              </option>
            ))}
          </select>
          <input
            type="text"
            className="px-2 py-1 rounded border bg-black/40 text-white"
            placeholder="Дата для всіх"
            style={{ width: 110 }}
            disabled={massEditSaving}
            onBlur={(e) =>
              e.target.value && handleMassEdit({ date: e.target.value })
            }
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.target as HTMLInputElement).value)
                handleMassEdit({ date: (e.target as HTMLInputElement).value });
            }}
          />
          <select
            className="px-2 py-1 rounded border bg-black/40 text-white"
            defaultValue=""
            disabled={massEditSaving}
            onChange={(e) => {
              if (e.target.value) handleMassEdit({ type: e.target.value });
            }}
          >
            <option value="">Тип для всіх...</option>
            {EVENT_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
          <input
            type="color"
            className="w-8 h-8 rounded border"
            disabled={massEditSaving}
            onChange={(e) => handleMassEdit({ color: e.target.value })}
            title="Колір для всіх"
          />
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setSelectedIds([])}
            disabled={massEditSaving}
          >
            Зняти виділення
          </Button>
          {massEditSaving && (
            <span className="text-xs text-yellow-300 animate-pulse">
              Збереження...
            </span>
          )}
        </div>
      )}
      {loading ? (
        <div>Завантаження...</div>
      ) : events.length === 0 ? (
        <div className="text-gray-400">Подій ще немає.</div>
      ) : (
        <DndProvider backend={HTML5Backend}>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 mb-2">
              <input
                type="checkbox"
                checked={
                  filteredEvents.length > 0 &&
                  filteredEvents.every((e) => selectedIds.includes(e.id))
                }
                onChange={(e) =>
                  handleSelectAll(e.target.checked, filteredEvents)
                }
              />
              <span className="text-xs text-gray-300">Виділити всі</span>
            </div>
            {filteredEvents
              .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
              .map((event, idx) => (
                <TimelineEventCard
                  key={event.id}
                  event={event}
                  index={idx}
                  moveEvent={moveEvent}
                  onEdit={() => openEdit(event)}
                  lore={lore}
                  locations={locations}
                  scenarios={scenarios}
                  selected={selectedIds.includes(event.id)}
                  onSelect={handleSelect}
                  onDelete={handleDelete}
                  updateEventWithUndo={updateEventWithUndo}
                  hoveredScenarioId={hoveredScenarioId}
                />
              ))}
          </div>
          <Button className="mt-4" onClick={saveOrder} variant="outline">
            Зберегти порядок
          </Button>
        </DndProvider>
      )}
      {/* Модалка створення/редагування події */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <EventForm
            initialData={editEvent}
            onSave={handleSave}
            loading={saving}
            onCancel={() => setModalOpen(false)}
            onDelete={editEvent ? () => handleDelete(editEvent) : undefined}
            allLore={lore}
            allLocations={locations}
            allScenarios={scenarios}
          />
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
  lore,
  locations,
  scenarios,
  selected,
  onSelect,
  onDelete,
  updateEventWithUndo,
  hoveredScenarioId,
}: any) {
  const ref = useRef<HTMLDivElement>(null);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(
    typeof event.name === "object" ? event.name.uk : event.name
  );
  const [type, setType] = useState(event.type);
  const [date, setDate] = useState(event.date);
  const [saving, setSaving] = useState(false);
  const [previewLore, setPreviewLore] = useState<any | null>(null);
  const [previewLoc, setPreviewLoc] = useState<any | null>(null);
  const [previewScenario, setPreviewScenario] = useState<any | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [, drop] = useDrop({
    accept: "event",
    hover(item: any) {
      if (!ref.current || item.index === index) return;
      moveEvent(item.index, index);
      item.index = index;
    },
  });
  const [{ isDragging }, drag] = useDrag({
    type: "event",
    item: { index },
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  });
  drag(drop(ref));

  // Анімація reorder
  useEffect(() => {
    if (ref.current) {
      ref.current.style.transition =
        "box-shadow 0.2s, background 0.2s, transform 0.2s";
    }
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!ref.current || document.activeElement !== ref.current) return;
      if (e.key === "Enter") setEditing(true);
      if (e.key === "Delete" && onDelete) onDelete(event);
      if (e.key === "ArrowUp") {
        const prev = ref.current.previousElementSibling as HTMLElement;
        if (prev) prev.focus();
      }
      if (e.key === "ArrowDown") {
        const next = ref.current.nextElementSibling as HTMLElement;
        if (next) next.focus();
      }
    };
    ref.current?.addEventListener("keydown", handleKey);
    return () => ref.current?.removeEventListener("keydown", handleKey);
  }, [onDelete, event]);

  // Inline save
  const saveInline = async () => {
    setSaving(true);
    await updateEventWithUndo(event.id, {
      name: { ...event.name, uk: name },
      type,
      date,
    });
    setSaving(false);
  };

  // Знаходимо сценарій події
  const scenario = scenarios.find((s: any) =>
    (event.relatedScenarioIds || []).includes(s.id)
  );
  const scenarioType = scenario?.type || "main";
  const scenarioStatus = scenario?.status || "active";
  const scenarioColor =
    scenarioType === "main"
      ? "bg-blue-900/40"
      : scenarioType === "alt"
      ? "bg-green-900/40"
      : "bg-yellow-900/40";
  const isHighlighted =
    hoveredScenarioId && scenario && scenario.id === hoveredScenarioId;

  return (
    <div
      className={`flex items-center gap-4 bg-black/40 rounded p-4 shadow cursor-move hover:bg-yellow-900/20 transition-all ${
        isDragging ? "opacity-50" : ""
      } ${selected ? "ring-2 ring-yellow-400" : ""} ${scenarioColor} ${
        selected ? "ring-2 ring-blue-400" : ""
      } ${isHighlighted ? "ring-4 ring-yellow-400" : ""}`}
      style={{
        borderLeft: `6px solid ${event.color || "#fbbf24"}`,
        opacity: scenarioStatus === "archived" ? 0.6 : 1,
      }}
      onClick={onEdit}
      tabIndex={0}
      aria-selected={selected}
      onDoubleClick={() => {
        setEditing(true);
        setTimeout(() => inputRef.current?.focus(), 0);
      }}
    >
      <input
        type="checkbox"
        checked={selected}
        onChange={(e) => {
          e.stopPropagation();
          onSelect(event.id, e.target.checked);
        }}
        onClick={(e) => e.stopPropagation()}
      />
      {event.icon && <span className="text-2xl">{event.icon}</span>}
      <div className="flex-1 flex flex-col gap-1">
        {editing ? (
          <input
            ref={inputRef}
            className="font-bold text-lg text-yellow-200 bg-black/30 rounded px-1"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => {
              setEditing(false);
              saveInline();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setEditing(false);
                saveInline();
              }
            }}
            disabled={saving}
          />
        ) : (
          <div
            className="font-bold text-lg text-yellow-200 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              setEditing(true);
              setTimeout(() => inputRef.current?.focus(), 0);
            }}
          >
            {name}
          </div>
        )}
        <div className="flex gap-2 items-center">
          {editing ? (
            <>
              <input
                className="text-xs text-gray-400 bg-black/30 rounded px-1"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                onBlur={saveInline}
                onKeyDown={(e) => {
                  if (e.key === "Enter") saveInline();
                }}
                disabled={saving}
                style={{ width: 90 }}
              />
              <select
                className="text-xs text-gray-400 bg-black/30 rounded px-1"
                value={type}
                onChange={(e) => setType(e.target.value)}
                onBlur={saveInline}
                disabled={saving}
              >
                {EVENT_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </>
          ) : (
            <>
              <span className="text-xs text-gray-400">{date}</span>
              <span className="text-xs text-gray-400">
                {type ? `• ${type}` : ""}
              </span>
            </>
          )}
        </div>
        <div className="text-sm text-white/80 mt-1">
          {typeof event.description === "object"
            ? event.description.uk
            : event.description}
        </div>
        <div className="flex gap-2 mt-1 flex-wrap">
          {(event.relatedLoreIds || []).map((lid: string) => {
            const l = lore.find((x: any) => x.id === lid);
            return l ? (
              <Popover
                key={lid}
                open={previewLore?.id === lid}
                onOpenChange={(v) => setPreviewLore(v ? l : null)}
              >
                <PopoverTrigger asChild>
                  <span
                    className="px-2 py-0.5 bg-yellow-900/40 rounded text-xs text-yellow-200 cursor-pointer hover:bg-yellow-700/60"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreviewLore(l);
                    }}
                  >
                    {typeof l.name === "object" ? l.name.uk : l.name}
                  </span>
                </PopoverTrigger>
                <PopoverContent className="max-w-xs bg-black/90 text-white p-4 rounded shadow-lg">
                  <div className="font-bold mb-1">
                    {typeof l.name === "object" ? l.name.uk : l.name}
                  </div>
                  {l.image && (
                    <img
                      src={l.image}
                      alt=""
                      className="w-24 h-24 object-cover rounded mb-2"
                    />
                  )}
                  <div className="text-xs whitespace-pre-line">
                    {typeof l.description === "object"
                      ? l.description.uk
                      : l.description}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.location.href = `/lore#${l.id}`;
                    }}
                  >
                    Перейти до лору
                  </Button>
                </PopoverContent>
              </Popover>
            ) : null;
          })}
          {(event.relatedLocationIds || []).map((locid: string) => {
            const loc = locations.find((x: any) => x.id === locid);
            return loc ? (
              <Popover
                key={locid}
                open={previewLoc?.id === locid}
                onOpenChange={(v) => setPreviewLoc(v ? loc : null)}
              >
                <PopoverTrigger asChild>
                  <span
                    className="px-2 py-0.5 bg-blue-900/40 rounded text-xs text-blue-200 cursor-pointer hover:bg-blue-700/60"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreviewLoc(loc);
                    }}
                  >
                    {loc.name || loc.type || loc.id}
                  </span>
                </PopoverTrigger>
                <PopoverContent className="max-w-xs bg-black/90 text-white p-4 rounded shadow-lg">
                  <div className="font-bold mb-1">
                    {loc.name || loc.type || loc.id}
                  </div>
                  {loc.image && (
                    <img
                      src={loc.image}
                      alt=""
                      className="w-24 h-24 object-cover rounded mb-2"
                    />
                  )}
                  <div className="text-xs whitespace-pre-line">{loc.type}</div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.location.href = `/world-map#${loc.id}`;
                    }}
                  >
                    Перейти до карти
                  </Button>
                </PopoverContent>
              </Popover>
            ) : null;
          })}
          {(event.relatedScenarioIds || []).map((sid: string) => {
            const s = scenarios.find((x: any) => x.id === sid);
            return s ? (
              <Popover
                key={sid}
                open={previewScenario?.id === sid}
                onOpenChange={(v) => setPreviewScenario(v ? s : null)}
              >
                <PopoverTrigger asChild>
                  <span
                    className="px-2 py-0.5 bg-green-900/40 rounded text-xs text-green-200 cursor-pointer hover:bg-green-700/60"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreviewScenario(s);
                    }}
                  >
                    {typeof s.name === "object" ? s.name.uk : s.name}
                  </span>
                </PopoverTrigger>
                <PopoverContent className="max-w-xs bg-black/90 text-white p-4 rounded shadow-lg">
                  <div className="font-bold mb-1">
                    {typeof s.name === "object" ? s.name.uk : s.name}
                  </div>
                  {s.icon && <span className="text-2xl">{s.icon}</span>}
                  <div className="text-xs whitespace-pre-line">
                    {typeof s.description === "object"
                      ? s.description.uk
                      : s.description}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-2"
                    onClick={() => {
                      window.location.href = `/scenarios#${s.id}`;
                    }}
                  >
                    Перейти до сценарію
                  </Button>
                </PopoverContent>
              </Popover>
            ) : null;
          })}
        </div>
        <div className="flex items-center gap-2">
          {scenario && (
            <Tooltip>
              <TooltipTrigger asChild>
                <span
                  className={`px-2 py-0.5 rounded text-xs flex items-center gap-1 ${
                    scenarioType === "main"
                      ? "bg-blue-700/60 text-blue-100"
                      : scenarioType === "alt"
                      ? "bg-green-700/60 text-green-100"
                      : "bg-yellow-700/60 text-yellow-100"
                  }`}
                >
                  {typeof scenario.name === "object"
                    ? scenario.name.uk
                    : scenario.name}
                  {scenarioStatus === "archived" && (
                    <Lock className="w-3 h-3 inline ml-1" />
                  )}
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <div className="font-bold mb-1">
                  {typeof scenario.name === "object"
                    ? scenario.name.uk
                    : scenario.name}
                </div>
                <div className="text-xs whitespace-pre-line">
                  {typeof scenario.description === "object"
                    ? scenario.description.uk
                    : scenario.description}
                </div>
                {scenarioStatus === "archived" && (
                  <div className="text-xs text-yellow-400 mt-1 flex items-center gap-1">
                    <Lock className="w-3 h-3 inline" /> Архів (read-only)
                  </div>
                )}
              </TooltipContent>
            </Tooltip>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={() => onEdit(event)}
            disabled={scenarioStatus === "archived"}
          >
            ✏️
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => onDelete(event.id)}
            disabled={scenarioStatus === "archived"}
          >
            🗑️
          </Button>
        </div>
      </div>
      {event.image && (
        <img
          src={event.image}
          alt=""
          className="w-20 h-20 object-cover rounded border border-yellow-400"
        />
      )}
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
