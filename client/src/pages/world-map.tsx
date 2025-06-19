import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Map,
  MapPin,
  Users,
  Crown,
  Compass,
  Trash2,
  Undo2,
  Redo2,
  MousePointerClick,
} from "lucide-react";
import type { World, Location, Character, Creature } from "@shared/schema";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "../hooks/use-toast";
// @ts-ignore
import { SketchPicker } from "react-color";
import { useI18n } from "../lib/i18n";

export default function WorldMap() {
  const { data: worlds = [] } = useQuery<World[]>({
    queryKey: ["/api/worlds"],
  });

  // Use the first world as current world for now
  const currentWorld = worlds.length > 0 ? worlds[0] : null;
  const worldId = currentWorld?.id || null;

  const { data: locations = [] } = useQuery<Location[]>({
    queryKey: ["/api/worlds", worldId, "locations"],
    enabled: !!worldId,
  });

  const { data: characters = [] } = useQuery<Character[]>({
    queryKey: ["/api/worlds", worldId, "characters"],
    enabled: !!worldId,
  });

  const { data: creatures = [] } = useQuery<Creature[]>({
    queryKey: ["/api/worlds", worldId, "creatures"],
    enabled: !!worldId,
  });

  // Lore elements for select
  const { data: lore = [] } = useQuery<any[]>({
    queryKey: ["/api/worlds", worldId, "lore"],
    enabled: !!worldId,
  });

  // Marker type options
  const markerTypes = [
    { value: "city", label: "City" },
    { value: "dungeon", label: "Dungeon" },
    { value: "forest", label: "Forest" },
    { value: "custom", label: "Custom" },
  ];

  const PERIODS = [
    { value: "ancient", label: "Ancient" },
    { value: "middle", label: "Middle Ages" },
    { value: "modern", label: "Modern" },
    { value: "future", label: "Future" },
  ];

  type Marker = {
    id: string;
    x: number;
    y: number;
    name: { uk: string; en: string };
    type: string;
    description?: { uk: string; en: string };
    loreId?: number;
    imageUrl?: string;
    periods?: string[];
  };
  const [markers, setMarkers] = useState<Marker[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMarker, setEditingMarker] = useState<Marker | null>(null);
  const [draftName, setDraftName] = useState("");
  const [draftType, setDraftType] = useState("city");
  const [draftDescription, setDraftDescription] = useState("");
  const [draftLoreId, setDraftLoreId] = useState<number | undefined>(undefined);
  const [draftCoords, setDraftCoords] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const [selectMode, setSelectMode] = useState(false);
  const [selectedMarkers, setSelectedMarkers] = useState<number[]>([]);
  const [undoStack, setUndoStack] = useState<any[]>([]);
  const [redoStack, setRedoStack] = useState<any[]>([]);

  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Bulk description
  const [descModalOpen, setDescModalOpen] = useState(false);
  const [bulkDescription, setBulkDescription] = useState("");
  function handleBulkDescriptionApply() {
    withUndo(() => {
      selectedMarkers.forEach((id) => {
        updateLocation.mutate({ id, description: bulkDescription });
      });
    });
    setDescModalOpen(false);
    setBulkDescription("");
  }
  // Bulk dangerLevel
  function handleChangeDangerLevelAll(newLevel: string) {
    withUndo(() => {
      selectedMarkers.forEach((id) => {
        updateLocation.mutate({ id, dangerLevel: newLevel });
      });
    });
  }
  const dangerLevels = [
    { value: "normal", label: "Normal" },
    { value: "dangerous", label: "Dangerous" },
    { value: "deadly", label: "Deadly" },
    { value: "unknown", label: "Unknown" },
  ];

  // Layers (видимість типів)
  const [visibleTypes, setVisibleTypes] = useState<string[]>(
    markerTypes.map((t) => t.value)
  );
  function toggleType(type: string) {
    setVisibleTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  }
  // Пошук/фільтрація
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterDanger, setFilterDanger] = useState("");
  const [filterLore, setFilterLore] = useState("");
  const [currentPeriod, setCurrentPeriod] = useState(PERIODS[0].value);
  const filteredLocations = locations.filter(
    (marker) =>
      visibleTypes.includes(marker.type) &&
      (!search || marker.name.toLowerCase().includes(search.toLowerCase())) &&
      (!filterType || marker.type === filterType) &&
      (!filterDanger || marker.dangerLevel === filterDanger) &&
      (!filterLore || String(marker.loreId) === filterLore)
  );

  // CRUD mutations
  const createLocation = useMutation({
    mutationFn: async (data: Partial<Location>) => {
      const res = await fetch(`/api/worlds/${worldId}/locations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create location");
      return res.json();
    },
    onMutate: async (newLoc) => {
      await queryClient.cancelQueries({
        queryKey: ["/api/worlds", worldId, "locations"],
      });
      const previous = queryClient.getQueryData([
        "/api/worlds",
        worldId,
        "locations",
      ]);
      queryClient.setQueryData(
        ["/api/worlds", worldId, "locations"],
        (old: any) => [...(old || []), { ...newLoc, id: Date.now() }]
      );
      return { previous };
    },
    onError: (err, _newLoc, context) => {
      toast({
        title: "Error",
        description: "Failed to create marker",
        variant: "destructive",
      });
      if (context?.previous)
        queryClient.setQueryData(
          ["/api/worlds", worldId, "locations"],
          context.previous
        );
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Marker created" });
    },
    onSettled: () =>
      queryClient.invalidateQueries({
        queryKey: ["/api/worlds", worldId, "locations"],
      }),
  });
  const updateLocation = useMutation({
    mutationFn: async ({ id, ...data }: Partial<Location> & { id: number }) => {
      const res = await fetch(`/api/locations/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update location");
      return res.json();
    },
    onMutate: async (updLoc) => {
      await queryClient.cancelQueries({
        queryKey: ["/api/worlds", worldId, "locations"],
      });
      const previous = queryClient.getQueryData([
        "/api/worlds",
        worldId,
        "locations",
      ]);
      queryClient.setQueryData(
        ["/api/worlds", worldId, "locations"],
        (old: any) =>
          (old || []).map((l: any) =>
            l.id === updLoc.id ? { ...l, ...updLoc } : l
          )
      );
      return { previous };
    },
    onError: (err, _updLoc, context) => {
      toast({
        title: "Error",
        description: "Failed to update marker",
        variant: "destructive",
      });
      if (context?.previous)
        queryClient.setQueryData(
          ["/api/worlds", worldId, "locations"],
          context.previous
        );
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Marker updated" });
    },
    onSettled: () =>
      queryClient.invalidateQueries({
        queryKey: ["/api/worlds", worldId, "locations"],
      }),
  });
  const deleteLocation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/locations/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete location");
      return true;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({
        queryKey: ["/api/worlds", worldId, "locations"],
      });
      const previous = queryClient.getQueryData([
        "/api/worlds",
        worldId,
        "locations",
      ]);
      queryClient.setQueryData(
        ["/api/worlds", worldId, "locations"],
        (old: any) => (old || []).filter((l: any) => l.id !== id)
      );
      return { previous };
    },
    onError: (err, _id, context) => {
      toast({
        title: "Error",
        description: "Failed to delete marker",
        variant: "destructive",
      });
      if (context?.previous)
        queryClient.setQueryData(
          ["/api/worlds", worldId, "locations"],
          context.previous
        );
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Marker deleted" });
    },
    onSettled: () =>
      queryClient.invalidateQueries({
        queryKey: ["/api/worlds", worldId, "locations"],
      }),
  });

  // Undo/Redo helpers
  function pushUndo() {
    setUndoStack((stack) => [
      locations.map((l) => ({ ...l })),
      ...stack.slice(0, 49),
    ]); // max 50
    setRedoStack([]);
  }
  function handleUndo() {
    if (undoStack.length === 0) return;
    setRedoStack((stack) => [locations.map((l) => ({ ...l })), ...stack]);
    const prev = undoStack[0];
    setUndoStack((stack) => stack.slice(1));
    // Масово синхронізувати з бекендом
    syncLocationsWithBackend(prev);
  }
  function handleRedo() {
    if (redoStack.length === 0) return;
    setUndoStack((stack) => [locations.map((l) => ({ ...l })), ...stack]);
    const next = redoStack[0];
    setRedoStack((stack) => stack.slice(1));
    syncLocationsWithBackend(next);
  }
  async function syncLocationsWithBackend(newLocs: Location[]) {
    // Видалити всі, що зникли
    const currentIds = new Set(locations.map((l) => l.id));
    const newIds = new Set(newLocs.map((l) => l.id));
    for (const l of locations) {
      if (!newIds.has(l.id)) await deleteLocation.mutateAsync(l.id);
    }
    // Додати/оновити всі, що з'явились/змінились
    for (const l of newLocs) {
      const existing = locations.find((x) => x.id === l.id);
      if (!existing) {
        await createLocation.mutateAsync(l);
      } else if (
        existing.x !== l.x ||
        existing.y !== l.y ||
        existing.name !== l.name ||
        existing.type !== l.type ||
        existing.description !== l.description ||
        existing.loreId !== l.loreId
      ) {
        await updateLocation.mutateAsync({ ...l, id: l.id });
      }
    }
    queryClient.invalidateQueries({
      queryKey: ["/api/worlds", worldId, "locations"],
    });
  }

  // Гарячі клавіші
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        e.preventDefault();
        handleUndo();
      } else if (
        (e.ctrlKey || e.metaKey) &&
        (e.key === "y" || (e.shiftKey && e.key === "z"))
      ) {
        e.preventDefault();
        handleRedo();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  // Перед кожною дією пушимо у undoStack
  function withUndo(action: () => void) {
    pushUndo();
    action();
  }

  // Add marker on map click
  function handleMapClick(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    if ((e.target as HTMLElement).closest(".marker-pin")) return;
    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 800;
    const y = ((e.clientY - rect.top) / rect.height) * 600;
    setDraftCoords({ x, y });
    setDraftName("");
    setDraftType("city");
    setDraftDescription("");
    setDraftLoreId(undefined);
    setEditingMarker(null);
    setModalOpen(true);
  }

  // Save marker (create or update)
  function handleSaveMarker() {
    if (!draftCoords || !draftName.trim()) return;
    const dangerLevel = "normal";
    withUndo(() => {
      if (editingMarker) {
        updateLocation.mutate({
          id: Number(editingMarker.id),
          name: draftName,
          type: draftType,
          description: draftDescription,
          x: Math.round(draftCoords.x),
          y: Math.round(draftCoords.y),
          worldId,
          dangerLevel,
          loreId: draftLoreId ?? null,
        });
      } else {
        createLocation.mutate({
          name: draftName,
          type: draftType,
          description: draftDescription,
          x: Math.round(draftCoords.x),
          y: Math.round(draftCoords.y),
          worldId,
          dangerLevel,
          loreId: draftLoreId ?? null,
        });
      }
    });
    setModalOpen(false);
    setEditingMarker(null);
    setDraftCoords(null);
    setDraftName("");
    setDraftType("city");
    setDraftDescription("");
    setDraftLoreId(undefined);
  }

  // Edit marker
  function handleEditMarker(marker: Location) {
    setEditingMarker(marker as any);
    setDraftCoords({ x: Number(marker.x ?? 400), y: Number(marker.y ?? 300) });
    setDraftName(marker.name || "");
    setDraftType(marker.type);
    setDraftDescription(marker.description || "");
    setDraftLoreId(undefined);
    setModalOpen(true);
  }

  // Delete marker
  function handleDeleteMarker() {
    if (editingMarker) {
      withUndo(() => deleteLocation.mutate(Number(editingMarker.id)));
      setModalOpen(false);
      setEditingMarker(null);
      setDraftCoords(null);
      setDraftName("");
      setDraftType("city");
      setDraftDescription("");
      setDraftLoreId(undefined);
    }
  }

  // Drag&drop logic
  function handleMarkerMouseDown(e: React.MouseEvent, marker: Location) {
    if (selectMode) return;
    e.stopPropagation();
    setDraggedId(marker.id.toString());
    setDragOffset({
      x: Number(marker.x ?? 400) - Number(e.nativeEvent.offsetX),
      y: Number(marker.y ?? 300) - Number(e.nativeEvent.offsetY),
    });
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    function handleMouseMove(ev: MouseEvent) {
      if (!draggedId) return;
      const rect =
        (e.currentTarget as HTMLElement).getBoundingClientRect?.() ??
        document.querySelector(".w-[800px].h-[600px]")?.getBoundingClientRect();
      if (!rect) return;
      const x = ((ev.clientX - rect.left) / rect.width) * 800;
      const y = ((ev.clientY - rect.top) / rect.height) * 600;
      withUndo(() =>
        updateLocation.mutate({
          id: Number(marker.id),
          x: Math.round(x),
          y: Math.round(y),
        })
      );
    }
    function handleMouseUp() {
      setDraggedId(null);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    }
  }

  // Масове виділення
  function handleMarkerSelect(marker: Location, e: React.MouseEvent) {
    e.stopPropagation();
    if (!selectMode) return handleEditMarker(marker);
    setSelectedMarkers((prev) =>
      prev.includes(Number(marker.id))
        ? prev.filter((id) => id !== Number(marker.id))
        : [...prev, Number(marker.id)]
    );
  }
  function handleSelectAll() {
    setSelectedMarkers(locations.map((m) => Number(m.id)));
  }
  function handleClearSelection() {
    setSelectedMarkers([]);
  }
  function handleDeleteSelected() {
    if (selectedMarkers.length === 0) return;
    withUndo(() => selectedMarkers.forEach((id) => deleteLocation.mutate(id)));
    setSelectedMarkers([]);
  }

  // Масове переміщення
  function handleGroupMouseDown(e: React.MouseEvent, marker: Location) {
    if (!selectMode || !selectedMarkers.includes(Number(marker.id))) return;
    e.stopPropagation();
    const startX = e.clientX;
    const startY = e.clientY;
    const selected = locations.filter((m) => selectedMarkers.includes(Number(m.id)));
    const startCoords = selected.map((m) => ({
      id: Number(m.id),
      x: m.x ?? 400,
      y: m.y ?? 300,
    }));
    function handleMouseMove(ev: MouseEvent) {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      withUndo(() => {
        startCoords.forEach((m) => {
          updateLocation.mutate({
            id: m.id,
            x: Math.round(m.x + dx),
            y: Math.round(m.y + dy),
          });
        });
      });
    }
    function handleMouseUp() {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    }
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  }

  // Масова зміна типу
  function handleChangeTypeAll(newType: string) {
    withUndo(() => {
      selectedMarkers.forEach((id) => {
        updateLocation.mutate({ id, type: newType });
      });
    });
  }

  // Regions (області) через бекенд
  const { data: regions = [] } = useQuery<any[]>({
    queryKey: ["/api/worlds", worldId, "regions"],
    enabled: !!worldId,
  });
  const createRegion = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch(`/api/worlds/${worldId}/regions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create region");
      return res.json();
    },
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["/api/worlds", worldId, "regions"],
      }),
  });
  const updateRegion = useMutation({
    mutationFn: async ({ id, ...data }: any) => {
      const res = await fetch(`/api/regions/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update region");
      return res.json();
    },
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["/api/worlds", worldId, "regions"],
      }),
  });
  const deleteRegion = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/regions/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete region");
      return true;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["/api/worlds", worldId, "regions"],
      }),
  });

  // Regions (області)
  type Region = {
    id: string;
    name: { uk: string; en: string };
    color: string;
    points: { x: number; y: number }[];
    type: string;
    description?: { uk: string; en: string };
    loreId?: number;
    imageUrl?: string;
    periods?: string[];
  };
  const [drawingRegion, setDrawingRegion] = useState<Region | null>(null);
  const [regionModalOpen, setRegionModalOpen] = useState(false);
  const [regionDraft, setRegionDraft] = useState<Partial<Region>>({
    name: { uk: '', en: '' },
    description: { uk: '', en: '' },
    color: '',
    points: [],
    type: '',
    loreId: undefined,
    imageUrl: '',
    periods: [],
  });
  const regionTypes = [
    { value: "kingdom", label: "Kingdom" },
    { value: "biome", label: "Biome" },
    { value: "zone", label: "Zone" },
    { value: "custom", label: "Custom" },
  ];

  function startDrawRegion() {
    setDrawingRegion({
      id: Date.now().toString(),
      name: { uk: "", en: "" },
      color: "#a3e635",
      points: [],
      type: "kingdom",
    });
  }
  function handleMapClickForRegion(
    e: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) {
    if (!drawingRegion) return;
    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 800;
    const y = ((e.clientY - rect.top) / rect.height) * 600;
    setDrawingRegion({
      ...drawingRegion,
      points: [...drawingRegion.points, { x, y }],
    });
  }
  function finishDrawRegion() {
    if (drawingRegion && drawingRegion.points.length >= 3) {
      setRegionDraft({ ...drawingRegion });
      setRegionModalOpen(true);
    } else {
      setDrawingRegion(null);
    }
  }
  function saveRegion() {
    if (
      !regionDraft.name ||
      !regionDraft.color ||
      !regionDraft.points ||
      regionDraft.points.length < 3
    )
      return;
    createRegion.mutate({
      name: regionDraft.name,
      color: regionDraft.color,
      points: regionDraft.points,
      type: regionDraft.type,
      loreId: regionDraft.loreId,
    });
    setRegionModalOpen(false);
    setDrawingRegion(null);
    setRegionDraft({ color: "#a3e635", type: "kingdom" });
  }
  function deleteRegionHandler(id: number) {
    deleteRegion.mutate(id);
  }
  function editRegion(region: any) {
    setRegionDraft(region);
    setRegionModalOpen(true);
  }
  function updateRegionHandler() {
    if (
      !regionDraft.id ||
      !regionDraft.name ||
      !regionDraft.color ||
      !regionDraft.points ||
      regionDraft.points.length < 3
    )
      return;
    updateRegion.mutate({
      id: regionDraft.id,
      name: regionDraft.name,
      color: regionDraft.color,
      points: regionDraft.points,
      type: regionDraft.type,
      loreId: regionDraft.loreId,
    });
    setRegionModalOpen(false);
    setDrawingRegion(null);
    setRegionDraft({ color: "#a3e635", type: "kingdom" });
  }

  // Drag&drop upload на карту
  function handleMapDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file || !file.type.startsWith("image/")) return;
    const formData = new FormData();
    formData.append("image", file);
    fetch("/api/upload/map-image", {
      method: "POST",
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => {
        // Якщо є виділений маркер — додаємо imageUrl
        if (editingMarker) {
          updateLocation.mutate({
            id: Number(editingMarker.id),
            imageUrl: data.url,
          });
        }
        // Якщо є виділена область — додаємо imageUrl
        if (regionDraft && regionModalOpen) {
          setRegionDraft((rd) => ({ ...rd, imageUrl: data.url }));
        }
      });
  }

  // Фільтрація областей за періодом
  const filteredRegions = regions.filter(region =>
    !region.periods || region.periods.length === 0 || region.periods.includes(currentPeriod)
  );

  const { language } = useI18n();

  // Touch drag&drop для маркерів
  function handleMarkerTouchStart(e: React.TouchEvent, marker: Location) {
    if (selectMode) return;
    e.stopPropagation();
    const touch = e.touches[0];
    setDraggedId(marker.id.toString());
    setDragOffset({ x: Number(marker.x ?? 400) - touch.clientX, y: Number(marker.y ?? 300) - touch.clientY });
    function handleTouchMove(ev: TouchEvent) {
      if (!draggedId) return;
      const rect = (e.target as HTMLElement).closest('.relative')?.getBoundingClientRect();
      if (!rect) return;
      const t = ev.touches[0];
      const x = ((t.clientX - rect.left) / rect.width) * 800;
      const y = ((t.clientY - rect.top) / rect.height) * 600;
      withUndo(() => updateLocation.mutate({ id: Number(marker.id), x: Math.round(x), y: Math.round(y) }));
    }
    function handleTouchEnd() {
      setDraggedId(null);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    }
    window.addEventListener("touchmove", handleTouchMove);
    window.addEventListener("touchend", handleTouchEnd);
  }

  if (!currentWorld) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <Map className="w-24 h-24 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-fantasy font-bold text-yellow-200 mb-2">
            No World Selected
          </h2>
          <p className="text-gray-300">
            Please select or create a world to view the map.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-fantasy font-bold text-yellow-200 mb-2">
            World Map
          </h1>
          <p className="text-lg text-gray-300">
            Visual overview of {currentWorld.name}
          </p>
        </div>

        <div className="flex items-center gap-4 mb-4">
          <button
            className={`flex items-center px-3 py-1 rounded ${
              selectMode
                ? "bg-yellow-700 text-white"
                : "bg-gray-800 text-gray-200"
            }`}
            onClick={() => setSelectMode((m) => !m)}
            title="Select markers"
          >
            <MousePointerClick className="w-4 h-4 mr-1" />{" "}
            {selectMode ? "Exit select" : "Select"}
          </button>
          {selectMode && (
            <>
              <button
                className="px-2 py-1 rounded bg-gray-700 text-gray-200"
                onClick={handleSelectAll}
              >
                Select all
              </button>
              <button
                className="px-2 py-1 rounded bg-gray-700 text-gray-200"
                onClick={handleClearSelection}
              >
                Clear
              </button>
              <button
                className="px-2 py-1 rounded bg-red-700 text-white"
                onClick={handleDeleteSelected}
                disabled={selectedMarkers.length === 0}
              >
                <Trash2 className="w-4 h-4 inline mr-1" /> Delete selected
              </button>
              <span className="ml-4">Change type:</span>
              <select
                className="ml-2 px-2 py-1 rounded bg-gray-800 text-gray-100"
                onChange={(e) => handleChangeTypeAll(e.target.value)}
                defaultValue=""
              >
                <option value="" disabled>
                  Type…
                </option>
                {markerTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              <span className="ml-4">Change danger:</span>
              <select
                className="ml-2 px-2 py-1 rounded bg-gray-800 text-gray-100"
                onChange={(e) => handleChangeDangerLevelAll(e.target.value)}
                defaultValue=""
              >
                <option value="" disabled>
                  Danger…
                </option>
                {dangerLevels.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </select>
              <Button
                className="ml-4"
                variant="outline"
                size="sm"
                onClick={() => setDescModalOpen(true)}
                disabled={selectedMarkers.length === 0}
              >
                Change description
              </Button>
              <Dialog open={descModalOpen} onOpenChange={setDescModalOpen}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Change description for selected</DialogTitle>
                  </DialogHeader>
                  <Textarea
                    value={bulkDescription}
                    onChange={(e) => setBulkDescription(e.target.value)}
                    placeholder="New description..."
                  />
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setDescModalOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleBulkDescriptionApply}
                      disabled={!bulkDescription.trim()}
                    >
                      Apply
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </>
          )}
        </div>
        <div className="flex items-center gap-2 mb-4">
          <button
            className="px-2 py-1 rounded bg-gray-700 text-gray-200"
            onClick={handleUndo}
            disabled={undoStack.length === 0}
          >
            <Undo2 className="w-4 h-4 inline mr-1" /> Undo
          </button>
          <button
            className="px-2 py-1 rounded bg-gray-700 text-gray-200"
            onClick={handleRedo}
            disabled={redoStack.length === 0}
          >
            <Redo2 className="w-4 h-4 inline mr-1" /> Redo
          </button>
        </div>

        {/* Панель фільтрів і шарів */}
        <div className="flex flex-wrap gap-2 mb-4 items-center">
          <span className="font-bold text-yellow-200">Layers:</span>
          {markerTypes.map((type) => (
            <label key={type.value} className="flex items-center gap-1 text-sm">
              <input
                type="checkbox"
                checked={visibleTypes.includes(type.value)}
                onChange={() => toggleType(type.value)}
              />
              {type.label}
            </label>
          ))}
          <span className="ml-4 font-bold text-yellow-200">Search:</span>
          <input
            className="px-2 py-1 rounded bg-gray-800 text-gray-100"
            placeholder="Name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <span className="ml-2">Type:</span>
          <select
            className="px-1 py-1 rounded bg-gray-800 text-gray-100"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="">All</option>
            {markerTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
          <span className="ml-2">Danger:</span>
          <select
            className="px-1 py-1 rounded bg-gray-800 text-gray-100"
            value={filterDanger}
            onChange={(e) => setFilterDanger(e.target.value)}
          >
            <option value="">All</option>
            {dangerLevels.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>
          <span className="ml-2">Lore:</span>
          <select
            className="px-1 py-1 rounded bg-gray-800 text-gray-100"
            value={filterLore}
            onChange={(e) => setFilterLore(e.target.value)}
          >
            <option value="">All</option>
            {lore.map((l) => (
              <option key={l.id} value={String(l.id)}>
                {l.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <span className="font-bold text-yellow-200">Period:</span>
          <select className="px-2 py-1 rounded bg-gray-800 text-gray-100" value={currentPeriod} onChange={e => setCurrentPeriod(e.target.value)}>
            {PERIODS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
        </div>

        <div className="mb-4 flex gap-2">
          <Button
            variant="outline"
            onClick={startDrawRegion}
            disabled={!!drawingRegion}
          >
            Draw region
          </Button>
          {drawingRegion && (
            <span className="text-green-400">
              Click to add points, double click to finish
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Map Visualization */}
          <div className="lg:col-span-3">
            <Card className="fantasy-border h-[600px]">
              <CardHeader>
                <CardTitle className="flex items-center text-yellow-200 font-fantasy">
                  <Compass className="mr-2" />
                  Interactive Map
                </CardTitle>
              </CardHeader>
              <CardContent className="h-full">
                <div className="w-full h-full bg-gradient-to-br from-green-900/20 via-brown-900/20 to-blue-900/20 rounded-lg flex items-center justify-center relative overflow-hidden">
                  {/* Zoom/Pan Controls */}
                  <div className="absolute top-2 right-2 z-10 bg-black/60 rounded px-3 py-1 text-xs text-gray-200 font-mono pointer-events-auto select-none">
                    Scroll — zoom, drag — move
                  </div>
                  <TransformWrapper
                    minScale={0.5}
                    maxScale={3}
                    wheel={{ step: 0.1 }}
                  >
                    {({
                      zoomIn,
                      zoomOut,
                      resetTransform,
                    }: {
                      zoomIn: () => void;
                      zoomOut: () => void;
                      resetTransform: () => void;
                    }) => (
                      <TransformComponent
                        wrapperClass="w-full h-full"
                        contentClass="w-full h-full"
                      >
                        <div
                          className="relative w-full max-w-[clamp(320px,90vw,900px)] h-[clamp(300px,60vw,700px)] mx-auto"
                          onClick={drawingRegion ? handleMapClickForRegion : handleMapClick}
                          onDoubleClick={drawingRegion ? finishDrawRegion : undefined}
                          style={{ cursor: drawingRegion ? "crosshair" : "pointer" }}
                          onDrop={handleMapDrop}
                          onDragOver={e => e.preventDefault()}
                          role="region"
                          aria-label="World map interactive area"
                        >
                          {/* SVG regions */}
                          <svg
                            className="absolute inset-0 w-full h-full pointer-events-none"
                            viewBox="0 0 800 600"
                          >
                            {filteredRegions.map((region) => (
                              <g key={region.id}>
                                <polygon
                                  points={region.points
                                    .map((p: any) => `${p.x},${p.y}`)
                                    .join(" ")}
                                  fill={region.color}
                                  fillOpacity={0.3}
                                  stroke={region.color}
                                  strokeWidth={2}
                                  onClick={() => editRegion(region)}
                                />
                                {region.imageUrl &&
                                  region.points.length > 0 && (
                                    <image
                                      href={region.imageUrl}
                                      x={region.points[0].x - 24}
                                      y={region.points[0].y - 24}
                                      width="48"
                                      height="48"
                                    />
                                  )}
                              </g>
                            ))}
                            {drawingRegion &&
                              drawingRegion.points.length > 1 && (
                                <polyline
                                  points={drawingRegion.points
                                    .map((p) => `${p.x},${p.y}`)
                                    .join(" ")}
                                  fill="none"
                                  stroke={drawingRegion.color}
                                  strokeWidth={2}
                                />
                              )}
                          </svg>
                          {/* Stylized fantasy map background */}
                          <div className="absolute inset-0 opacity-10 pointer-events-none select-none">
                            <svg
                              viewBox="0 0 800 600"
                              className="w-full h-full"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              {/* Decorative fantasy map elements */}
                              <defs>
                                <pattern
                                  id="mapTexture"
                                  patternUnits="userSpaceOnUse"
                                  width="40"
                                  height="40"
                                >
                                  <rect width="40" height="40" fill="#1a1a1a" />
                                  <circle
                                    cx="20"
                                    cy="20"
                                    r="1"
                                    fill="#4a5568"
                                  />
                                </pattern>
                              </defs>
                              <rect
                                width="800"
                                height="600"
                                fill="url(#mapTexture)"
                              />

                              {/* Mountain ranges */}
                              <path
                                d="M100 200 L150 150 L200 200 L250 150 L300 200"
                                stroke="#68D391"
                                strokeWidth="2"
                                fill="none"
                              />
                              <path
                                d="M400 300 L450 250 L500 300 L550 250 L600 300"
                                stroke="#68D391"
                                strokeWidth="2"
                                fill="none"
                              />

                              {/* Rivers */}
                              <path
                                d="M0 350 Q200 320 400 350 T800 350"
                                stroke="#63B3ED"
                                strokeWidth="3"
                                fill="none"
                              />
                              <path
                                d="M150 0 Q180 200 200 400 T250 600"
                                stroke="#63B3ED"
                                strokeWidth="2"
                                fill="none"
                              />
                            </svg>
                          </div>

                          {/* Location markers (from API) */}
                          {filteredLocations.map((marker) => (
                            <div
                              key={marker.id}
                              className={`absolute marker-pin transform -translate-x-1/2 -translate-y-1/2 group z-10 ${selectMode && selectedMarkers.includes(Number(marker.id)) ? "ring-4 ring-yellow-400" : ""}`}
                              style={{ left: `${marker.x ?? 400}px`, top: `${marker.y ?? 300}px`, touchAction: "none" }}
                              onMouseDown={selectMode && selectedMarkers.includes(Number(marker.id)) ? (e) => handleGroupMouseDown(e, marker) : (!selectMode ? (e) => handleMarkerMouseDown(e, marker) : undefined)}
                              onTouchStart={e => handleMarkerTouchStart(e, marker)}
                              onClick={(e) => handleMarkerSelect(marker, e)}
                              tabIndex={0}
                              aria-label={marker.name || "Marker"}
                              onKeyDown={e => { if (e.key === "Enter") handleMarkerSelect(marker, e as any); }}
                            >
                              {('imageUrl' in marker) && marker.imageUrl && <img src={marker.imageUrl} alt={marker.name || ""} className="w-14 h-14 object-contain absolute -top-14 left-1/2 -translate-x-1/2" />}
                              <div
                                className={`bg-yellow-500 rounded-full p-2 shadow-lg cursor-pointer hover:bg-yellow-400 transition-colors ${selectMode ? "border-2 border-yellow-300" : ""}`}
                              >
                                <MapPin className="h-4 w-4 text-white" />
                              </div>
                              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black bg-opacity-75 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                {marker.name || "Unnamed"}
                                {('loreId' in marker) && marker.loreId && (
                                  <div className="mt-1 text-[10px] text-blue-200">
                                    {
                                      lore.find((l) => l.id === marker.loreId)
                                        ?.name
                                    }
                                  </div>
                                )}
                              </div>
                              {selectMode && (
                                <div className="absolute -top-3 -right-3 bg-yellow-400 rounded-full w-4 h-4 flex items-center justify-center text-xs font-bold text-black border border-white">
                                  {selectedMarkers.includes(Number(marker.id))
                                    ? "✓"
                                    : ""}
                                </div>
                              )}
                            </div>
                          ))}

                          {locations.length === 0 && markers.length === 0 && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                              <Map className="w-16 h-16 mx-auto mb-4 opacity-50" />
                              <p className="text-lg font-fantasy">
                                Your map awaits locations...
                              </p>
                              <p className="text-sm">
                                Add locations to see them appear on the map
                              </p>
                            </div>
                          )}
                        </div>
                      </TransformComponent>
                    )}
                  </TransformWrapper>
                  {/* Marker Modal */}
                  <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>
                          {editingMarker ? "Edit Marker" : "Add Marker"}
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <Input
                          placeholder="Marker name (uk)"
                          value={draftName}
                          onChange={(e) => setDraftName(e.target.value)}
                          autoFocus
                        />
                        <Input
                          placeholder="Marker name (en)"
                          value={draftName}
                          onChange={(e) => setDraftName(e.target.value)}
                        />
                        <Select value={draftType} onValueChange={setDraftType}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Type" />
                          </SelectTrigger>
                          <SelectContent>
                            {markerTypes.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Textarea
                          placeholder="Description (uk)"
                          value={draftDescription}
                          onChange={(e) => setDraftDescription(e.target.value)}
                        />
                        <Textarea
                          placeholder="Description (en)"
                          value={draftDescription}
                          onChange={(e) => setDraftDescription(e.target.value)}
                        />
                        <Select
                          value={
                            draftLoreId !== undefined
                              ? String(draftLoreId)
                              : undefined
                          }
                          onValueChange={(val) =>
                            setDraftLoreId(val ? Number(val) : undefined)
                          }
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Link to Lore (optional)" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">None</SelectItem>
                            {lore.map((l) => (
                              <SelectItem key={l.id} value={String(l.id)}>
                                {l.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {draftCoords && (
                          <div className="text-xs text-gray-400">
                            x: {draftCoords.x.toFixed(0)}, y:{" "}
                            {draftCoords.y.toFixed(0)}
                          </div>
                        )}
                      </div>
                      <DialogFooter className="flex flex-row gap-2 justify-between mt-4">
                        {editingMarker && (
                          <Button
                            variant="destructive"
                            onClick={handleDeleteMarker}
                            type="button"
                          >
                            Delete
                          </Button>
                        )}
                        <div className="flex-1 text-right">
                          <Button
                            variant="outline"
                            onClick={() => setModalOpen(false)}
                            type="button"
                            className="mr-2"
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={handleSaveMarker}
                            type="button"
                            disabled={!draftName.trim()}
                          >
                            Save
                          </Button>
                        </div>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Map Legend and Info */}
          <div className="space-y-6">
            {/* Legend */}
            <Card className="fantasy-border">
              <CardHeader>
                <CardTitle className="text-yellow-200 font-fantasy">
                  Legend
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="bg-purple-600 rounded-full p-1">
                    <MapPin className="h-3 w-3 text-white" />
                  </div>
                  <span className="text-sm text-gray-300">Locations</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="bg-green-600 rounded-full p-1">
                    <Users className="h-3 w-3 text-white" />
                  </div>
                  <span className="text-sm text-gray-300">Characters</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="bg-red-600 rounded-full p-1">
                    <Crown className="h-3 w-3 text-white" />
                  </div>
                  <span className="text-sm text-gray-300">Creatures</span>
                </div>
              </CardContent>
            </Card>

            {/* Map Statistics */}
            <Card className="fantasy-border">
              <CardHeader>
                <CardTitle className="text-yellow-200 font-fantasy">
                  Map Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-300">Locations</span>
                  <span className="text-purple-400 font-semibold">
                    {locations.length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Characters</span>
                  <span className="text-green-400 font-semibold">
                    {characters.length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Creatures</span>
                  <span className="text-red-400 font-semibold">
                    {creatures.length}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Recent Locations */}
            {locations.length > 0 && (
              <Card className="fantasy-border">
                <CardHeader>
                  <CardTitle className="text-yellow-200 font-fantasy">
                    Recent Locations
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {locations
                    .slice(-5)
                    .reverse()
                    .map((location) => (
                      <div
                        key={location.id}
                        className="flex items-center space-x-2 p-2 rounded bg-purple-900/20 hover:bg-purple-900/30 transition-colors cursor-pointer"
                      >
                        <MapPin className="h-3 w-3 text-purple-400" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">
                            {location.name}
                          </p>
                          <p className="text-xs text-gray-400">
                            {location.type}
                          </p>
                        </div>
                      </div>
                    ))}
                </CardContent>
              </Card>
            )}

            {/* Map Controls */}
            <Card className="fantasy-border">
              <CardHeader>
                <CardTitle className="text-yellow-200 font-fantasy">
                  Map Controls
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-gray-400">
                  Interactive map features coming soon:
                </p>
                <ul className="text-xs text-gray-500 space-y-1">
                  <li>• Zoom and pan</li>
                  <li>• Location details on hover</li>
                  <li>• Custom markers</li>
                  <li>• Route planning</li>
                  <li>• Terrain layers</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      {/* Модалка для збереження/редагування області */}
      <Dialog open={regionModalOpen} onOpenChange={setRegionModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {regionDraft.id ? "Edit region" : "Save region"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input placeholder="Name (uk)" value={regionDraft.name?.uk || ''} onChange={e => setRegionDraft(rd => ({ ...rd, name: { uk: e.target.value, en: rd.name?.en ?? '' } }))} />
              <Input placeholder="Name (en)" value={regionDraft.name?.en || ''} onChange={e => setRegionDraft(rd => ({ ...rd, name: { uk: rd.name?.uk ?? '', en: e.target.value } }))} />
            </div>
            <div className="flex gap-2">
              <Textarea placeholder="Description (uk)" value={regionDraft.description?.uk || ''} onChange={e => setRegionDraft(rd => ({ ...rd, description: { uk: e.target.value, en: rd.description?.en ?? '' } }))} />
              <Textarea placeholder="Description (en)" value={regionDraft.description?.en || ''} onChange={e => setRegionDraft(rd => ({ ...rd, description: { uk: rd.description?.uk ?? '', en: e.target.value } }))} />
            </div>
            <span>Color:</span>
            <SketchPicker
              color={regionDraft.color || "#a3e635"}
              onChange={(c) =>
                setRegionDraft((rd) => ({ ...rd, color: c.hex }))
              }
            />
            <span>Type:</span>
            <select
              className="w-full"
              value={regionDraft.type}
              onChange={(e) =>
                setRegionDraft((rd) => ({ ...rd, type: e.target.value }))
              }
            >
              {regionTypes.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
            <span>Lore:</span>
            <select
              className="w-full"
              value={regionDraft.loreId ?? ""}
              onChange={e => setRegionDraft(rd => ({ ...rd, loreId: e.target.value ? Number(e.target.value) : undefined }))}
            >
              <option value="">None</option>
              {lore.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
            <div>
            <Input
              placeholder="Image URL"
              value={regionDraft.imageUrl || ""}
              onChange={(e) =>
                setRegionDraft((rd) => ({ ...rd, imageUrl: e.target.value }))
              }
            />
          </div>
          <DialogFooter>
            {regionDraft.id && (
              <Button
                variant="destructive"
                onClick={() => {
                  if (regionDraft.id) deleteRegionHandler(regionDraft.id);
                  setRegionModalOpen(false);
                }}
              >
                Delete
              </Button>
            )}
            <Button variant="outline" onClick={() => setRegionModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={regionDraft.id ? updateRegionHandler : saveRegion}
              disabled={
                !regionDraft.name ||
                !regionDraft.color ||
                !regionDraft.points ||
                regionDraft.points.length < 3
              }
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
