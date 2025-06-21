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
  Download,
} from "lucide-react";
import type { World, Location, Character, Creature } from "@shared/schema";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import React, { useState, useEffect, useRef } from "react";
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
import { useTranslation } from "@/lib/i18n";
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
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import html2canvas from "html2canvas";

export default function WorldMap({
  currentWorldId,
}: {
  currentWorldId?: number | null;
}) {
  const t = useTranslation();
  const { data: worlds = [] } = useQuery<World[]>({
    queryKey: ["/api/worlds"],
  });

  // Use currentWorldId if provided, otherwise use first world
  const currentWorld = currentWorldId
    ? worlds.find((w) => w.id === currentWorldId)
    : worlds.length > 0
    ? worlds[0]
    : null;
  const worldId = currentWorld?.id ?? undefined;

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

  // Marker type options with better icons
  const markerTypes = [
    {
      value: "city",
      label: t.mapTypes.city,
      icon: "🏰",
      color: "text-blue-400",
    },
    {
      value: "dungeon",
      label: t.mapTypes.dungeon,
      icon: "⚔️",
      color: "text-red-400",
    },
    {
      value: "forest",
      label: t.mapTypes.forest,
      icon: "🌲",
      color: "text-green-400",
    },
    {
      value: "custom",
      label: t.mapTypes.custom,
      icon: "📍",
      color: "text-yellow-400",
    },
    {
      value: "character",
      label: "Character",
      icon: "👤",
      color: "text-purple-400",
    },
    { value: "event", label: "Event", icon: "⚡", color: "text-orange-400" },
    {
      value: "artifact",
      label: "Artifact",
      icon: "💎",
      color: "text-cyan-400",
    },
  ];

  const PERIODS = [
    { value: "ancient", label: t.periods.ancient },
    { value: "middle", label: t.periods.middle },
    { value: "modern", label: t.periods.modern },
    { value: "future", label: t.periods.future },
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

  // Route planning state
  const [routeMode, setRouteMode] = useState(false);
  const [routePoints, setRoutePoints] = useState<
    { x: number; y: number; name: string }[]
  >([]);
  const [routeName, setRouteName] = useState("");
  const [routeDescription, setRouteDescription] = useState("");

  // Hover state for location details
  const [hoveredLocation, setHoveredLocation] = useState<Location | null>(null);
  const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 });

  // Draft state for character, event, artifact IDs
  const [draftCharacterId, setDraftCharacterId] = useState<number | undefined>(
    undefined
  );
  const [draftEventId, setDraftEventId] = useState<number | undefined>(
    undefined
  );
  const [draftArtifactId, setDraftArtifactId] = useState<number | undefined>(
    undefined
  );

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
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/worlds", worldId, "locations"],
      });
      toast({ title: "Location created successfully" });
    },
  });

  const updateLocation = useMutation({
    mutationFn: async (data: Partial<Location> & { id: number }) => {
      const res = await fetch(`/api/worlds/${worldId}/locations/${data.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update location");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/worlds", worldId, "locations"],
      });
      toast({ title: "Location updated successfully" });
    },
  });

  const deleteLocation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/worlds/${worldId}/locations/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete location");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/worlds", worldId, "locations"],
      });
      toast({ title: "Location deleted successfully" });
    },
  });

  // Undo/Redo functionality
  function pushUndo() {
    setUndoStack((prev) => [...prev, locations]);
    setRedoStack([]);
  }

  function handleUndo() {
    if (undoStack.length === 0) return;
    const lastState = undoStack[undoStack.length - 1];
    setRedoStack((prev) => [...prev, locations]);
    setUndoStack((prev) => prev.slice(0, -1));
    syncLocationsWithBackend(lastState);
  }

  function handleRedo() {
    if (redoStack.length === 0) return;
    const nextState = redoStack[redoStack.length - 1];
    setUndoStack((prev) => [...prev, locations]);
    setRedoStack((prev) => prev.slice(0, -1));
    syncLocationsWithBackend(nextState);
  }

  async function syncLocationsWithBackend(newLocs: Location[]) {
    // This would sync the local state with backend
    // For now, just update the query cache
    queryClient.setQueryData(["/api/worlds", worldId, "locations"], newLocs);
  }

  // Keyboard shortcuts
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case "z":
            e.preventDefault();
            if (e.shiftKey) {
              handleRedo();
            } else {
              handleUndo();
            }
            break;
        }
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [undoStack, redoStack, locations]);

  function withUndo(action: () => void) {
    pushUndo();
    action();
  }

  function handleMapClick(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    if (selectMode || routeMode) return;
    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 800;
    const y = ((e.clientY - rect.top) / rect.height) * 600;
    setDraftCoords({ x, y });
    setDraftName("");
    setDraftType("location");
    setDraftDescription("");
    setDraftLoreId(undefined);
    setEditingMarker(null);
    setModalOpen(true);
  }

  function handleSaveMarker() {
    if (!draftCoords || !draftName.trim()) return;

    const markerData = {
      name: draftName,
      type: draftType,
      description: draftDescription,
      x: draftCoords.x,
      y: draftCoords.y,
      loreId: draftLoreId,
      characterId: draftCharacterId,
      eventId: draftEventId,
      artifactId: draftArtifactId,
    };

    if (editingMarker) {
      updateLocation.mutate({ id: Number(editingMarker.id), ...markerData });
    } else {
      createLocation.mutate(markerData);
    }

    setModalOpen(false);
    setDraftCoords(null);
    setDraftName("");
    setDraftType("location");
    setDraftDescription("");
    setDraftLoreId(undefined);
    setDraftCharacterId(undefined);
    setDraftEventId(undefined);
    setDraftArtifactId(undefined);
    setEditingMarker(null);
  }

  function handleEditMarker(marker: Location) {
    setEditingMarker({
      id: marker.id.toString(),
      x: marker.x || 400,
      y: marker.y || 300,
      name: { uk: marker.name, en: marker.name },
      type: marker.type,
      description: marker.description
        ? { uk: marker.description, en: marker.description }
        : undefined,
      loreId: marker.loreId || undefined,
      imageUrl: marker.imageUrl || undefined,
    });
    setDraftName(marker.name);
    setDraftType(marker.type);
    setDraftDescription(marker.description || "");
    setDraftLoreId(marker.loreId || undefined);
    setDraftCharacterId(marker.characterId || undefined);
    setDraftEventId(marker.eventId || undefined);
    setDraftArtifactId(marker.artifactId || undefined);
    setDraftCoords({ x: marker.x || 400, y: marker.y || 300 });
    setModalOpen(true);
  }

  function handleDeleteMarker() {
    if (!editingMarker) return;
    deleteLocation.mutate(Number(editingMarker.id));
    setModalOpen(false);
    setEditingMarker(null);
  }

  function handleMarkerMouseDown(e: React.MouseEvent, marker: Location) {
    if (selectMode) return;
    e.preventDefault();
    setDraggedId(marker.id.toString());
    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });

    function handleMouseMove(ev: MouseEvent) {
      if (!draggedId) return;
      const container = document.getElementById("map-container");
      if (!container) return;
      const containerRect = container.getBoundingClientRect();
      const x =
        ((ev.clientX - containerRect.left - dragOffset.x) /
          containerRect.width) *
        800;
      const y =
        ((ev.clientY - containerRect.top - dragOffset.y) /
          containerRect.height) *
        600;

      // Update marker position
      const updatedLocations = locations.map((loc) =>
        loc.id.toString() === draggedId
          ? {
              ...loc,
              x: Math.max(0, Math.min(800, x)),
              y: Math.max(0, Math.min(600, y)),
            }
          : loc
      );
      queryClient.setQueryData(
        ["/api/worlds", worldId, "locations"],
        updatedLocations
      );
    }

    function handleMouseUp() {
      setDraggedId(null);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    }

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  }

  function handleMarkerSelect(marker: Location, e: React.MouseEvent) {
    if (!selectMode) return;
    e.preventDefault();
    const markerId = Number(marker.id);
    setSelectedMarkers((prev) =>
      prev.includes(markerId)
        ? prev.filter((id) => id !== markerId)
        : [...prev, markerId]
    );
  }

  function handleSelectAll() {
    setSelectedMarkers(locations.map((l) => Number(l.id)));
  }

  function handleClearSelection() {
    setSelectedMarkers([]);
  }

  function handleDeleteSelected() {
    withUndo(() => {
      selectedMarkers.forEach((id) => deleteLocation.mutate(id));
    });
    setSelectedMarkers([]);
  }

  function handleGroupMouseDown(e: React.MouseEvent, marker: Location) {
    if (!selectMode) return;
    e.preventDefault();
    const markerId = Number(marker.id);
    if (!selectedMarkers.includes(markerId)) return;

    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
    const startX = e.clientX - rect.left;
    const startY = e.clientY - rect.top;

    function handleMouseMove(ev: MouseEvent) {
      const deltaX = ev.clientX - rect.left - startX;
      const deltaY = ev.clientY - rect.top - startY;

      const updatedLocations = locations.map((loc) => {
        if (selectedMarkers.includes(Number(loc.id))) {
          const newX = (loc.x || 400) + (deltaX / rect.width) * 800;
          const newY = (loc.y || 300) + (deltaY / rect.height) * 600;
          return {
            ...loc,
            x: Math.max(0, Math.min(800, newX)),
            y: Math.max(0, Math.min(600, newY)),
          };
        }
        return loc;
      });
      queryClient.setQueryData(
        ["/api/worlds", worldId, "locations"],
        updatedLocations
      );
    }

    function handleMouseUp() {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    }

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  }

  function handleChangeTypeAll(newType: string) {
    withUndo(() => {
      selectedMarkers.forEach((id) => {
        updateLocation.mutate({ id, type: newType });
      });
    });
  }

  // Route planning functions
  function startRoutePlanning() {
    setRouteMode(true);
    setRoutePoints([]);
    setRouteName("");
    setRouteDescription("");
  }

  function addRoutePoint(x: number, y: number, name: string) {
    setRoutePoints((prev) => [...prev, { x, y, name }]);
  }

  function finishRoutePlanning() {
    if (routePoints.length < 2) {
      toast({
        title: "Route too short",
        description: "Route must have at least 2 points",
        variant: "destructive",
      });
      return;
    }
    setRouteMode(false);
    // Here you would save the route to backend
    toast({
      title: "Route created",
      description: `Route "${routeName}" with ${routePoints.length} points`,
    });
  }

  function cancelRoutePlanning() {
    setRouteMode(false);
    setRoutePoints([]);
  }

  // Region drawing functionality
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

  const [regions, setRegions] = useState<Region[]>([]);
  const [drawingRegion, setDrawingRegion] = useState<Region | null>(null);
  const [regionModalOpen, setRegionModalOpen] = useState(false);
  const [regionDraft, setRegionDraft] = useState<Partial<Region>>({});

  const regionTypes = [
    { value: "kingdom", label: "Kingdom" },
    { value: "empire", label: "Empire" },
    { value: "forest", label: "Forest" },
    { value: "mountain", label: "Mountain" },
    { value: "ocean", label: "Ocean" },
  ];

  const filteredRegions = regions.filter((region) =>
    visibleTypes.includes(region.type)
  );

  function startDrawRegion() {
    setDrawingRegion({
      id: "",
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
    setDrawingRegion((prev) =>
      prev ? { ...prev, points: [...prev.points, { x, y }] } : null
    );
  }

  function finishDrawRegion() {
    if (!drawingRegion || drawingRegion.points.length < 3) return;
    setRegionDraft(drawingRegion);
    setRegionModalOpen(true);
    setDrawingRegion(null);
  }

  function saveRegion() {
    if (!regionDraft.name || !regionDraft.color || !regionDraft.points) return;
    const newRegion = {
      ...regionDraft,
      id: Date.now().toString(),
    } as Region;
    setRegions((prev) => [...prev, newRegion]);
    setRegionModalOpen(false);
    setRegionDraft({});
  }

  function deleteRegionHandler(id: number) {
    setRegions((prev) => prev.filter((r) => r.id !== id.toString()));
  }

  function editRegion(region: any) {
    setRegionDraft(region);
    setRegionModalOpen(true);
  }

  function updateRegionHandler() {
    if (!regionDraft.id) return;
    setRegions((prev) =>
      prev.map((r) => (r.id === regionDraft.id ? { ...r, ...regionDraft } : r))
    );
    setRegionModalOpen(false);
    setRegionDraft({});
  }

  // Map image upload
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  function handleMapDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const url = e.target?.result as string;
          // Handle the dropped image
          console.log("Dropped image:", url);
        };
        reader.readAsDataURL(file);
      }
    }
  }

  // Touch support for mobile
  function handleMarkerTouchStart(e: React.TouchEvent, marker: Location) {
    if (selectMode) return;
    e.preventDefault();
    const touch = e.touches[0];
    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
    setDragOffset({
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top,
    });
    setDraggedId(marker.id.toString());

    function handleTouchMove(ev: TouchEvent) {
      if (!draggedId) return;
      const touch = ev.touches[0];
      const container = document.getElementById("map-container");
      if (!container) return;
      const containerRect = container.getBoundingClientRect();
      const x =
        ((touch.clientX - containerRect.left - dragOffset.x) /
          containerRect.width) *
        800;
      const y =
        ((touch.clientY - containerRect.top - dragOffset.y) /
          containerRect.height) *
        600;

      const updatedLocations = locations.map((loc) =>
        loc.id.toString() === draggedId
          ? {
              ...loc,
              x: Math.max(0, Math.min(800, x)),
              y: Math.max(0, Math.min(600, y)),
            }
          : loc
      );
      queryClient.setQueryData(
        ["/api/worlds", worldId, "locations"],
        updatedLocations
      );
    }

    function handleTouchEnd() {
      setDraggedId(null);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    }

    document.addEventListener("touchmove", handleTouchMove);
    document.addEventListener("touchend", handleTouchEnd);
  }

  async function handleMapImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !worldId) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await fetch("/api/upload/map-image", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const { url } = await response.json();
        // Update world with new map image URL
        await fetch(`/api/worlds/${worldId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mapImageUrl: url }),
        });
        queryClient.invalidateQueries({ queryKey: ["/api/worlds"] });
        toast({
          title: "Map image uploaded",
          description: "Map background updated successfully",
        });
      } else {
        throw new Error("Upload failed");
      }
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to upload map image",
        variant: "destructive",
      });
    }
    setUploading(false);
  }

  // Export map as image
  async function exportMapAsImage() {
    const mapContainer = document.getElementById("map-container");
    if (!mapContainer) return;

    try {
      const canvas = await html2canvas(mapContainer, {
        backgroundColor: "#1a1a1a",
        scale: 2,
        useCORS: true,
        allowTaint: true,
      });

      const link = document.createElement("a");
      link.download = `${currentWorld?.name || "world"}-map.png`;
      link.href = canvas.toDataURL();
      link.click();

      toast({
        title: "Map exported",
        description: "Map saved as image successfully",
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Failed to export map as image",
        variant: "destructive",
      });
    }
  }

  // Додаю селектори для персонажів, подій, артефактів
  const [events, setEvents] = useState<any[]>([]);
  const [artifacts, setArtifacts] = useState<any[]>([]);
  useEffect(() => {
    if (!worldId) return;
    fetch(`/api/worlds/${worldId}/events`)
      .then((r) => r.json())
      .then(setEvents);
    fetch(`/api/worlds/${worldId}/artifacts`)
      .then((r) => r.json())
      .then(setArtifacts);
  }, [worldId]);

  // Додаю стейт для діалогу підтвердження видалення
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Додаю підрахунок кількості маркерів кожного типу
  const markerTypeCounts = {
    location: locations.filter((m) => m.type === "location").length,
    character: locations.filter((m) => m.type === "character").length,
    event: locations.filter((m) => m.type === "event").length,
    artifact: locations.filter((m) => m.type === "artifact").length,
  };

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
    <div className="flex h-full bg-gray-900 text-white">
      {/* Left Tools Panel */}
      <Card className="w-1/4 min-w-[250px] max-w-[350px] bg-gray-800/50 border-gray-700/50 flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center text-fantasy-gold-400 font-fantasy">
            <Compass className="mr-2" />
            Карта Світу
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto space-y-4 scroll-fantasy p-4">
          <div>
            <label
              htmlFor="map-upload"
              className="fantasy-button w-full text-center cursor-pointer px-4 py-2"
            >
              Завантажити карту
            </label>
            <input
              id="map-upload"
              type="file"
              className="hidden"
              onChange={handleMapImageUpload}
              accept="image/*"
            />
          </div>

          {/* Search and Filters */}
          <div className="space-y-2">
            <Input
              type="text"
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                {markerTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterDanger} onValueChange={setFilterDanger}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by danger level" />
              </SelectTrigger>
              <SelectContent>
                {dangerLevels.map((level) => (
                  <SelectItem key={level.value} value={level.value}>
                    {level.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterLore} onValueChange={setFilterLore}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by lore" />
              </SelectTrigger>
              <SelectContent>
                {lore.map((l) => (
                  <SelectItem key={l.id} value={l.id.toString()}>
                    {l.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Other tools */}
        </CardContent>
      </Card>

      {/* Main Map Area */}
      <div className="flex-1 relative" ref={mapContainerRef}>
        {uploading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="text-center">
              <p className="text-lg font-semibold">Завантаження карти...</p>
            </div>
          </div>
        )}
        <TransformWrapper>
          <TransformComponent
            wrapperStyle={{ width: "100%", height: "100%" }}
            contentStyle={{ width: "100%", height: "100%" }}
          >
            <div
              className="relative w-full h-full bg-gray-700 bg-center bg-no-repeat bg-cover"
              onClick={handleMapClick}
              onDrop={handleMapDrop}
              onDragOver={(e) => e.preventDefault()}
              style={{
                backgroundImage: currentWorld?.mapImageUrl
                  ? `url(${currentWorld.mapImageUrl})`
                  : "none",
              }}
            >
              {/* Markers, regions, routes render here */}
              {filteredLocations.map((marker) => (
                <Tooltip key={marker.id}>
                  <TooltipTrigger asChild>
                    <div
                      key={marker.id}
                      className="absolute"
                      style={{
                        left: `${marker.x}%`,
                        top: `${marker.y}%`,
                        transform: "translate(-50%, -50%)",
                      }}
                      onMouseDown={(e) => handleMarkerMouseDown(e, marker)}
                      onTouchStart={(e) => handleMarkerTouchStart(e, marker)}
                    >
                      <div
                        className={`text-2xl cursor-pointer transition-transform duration-200 hover:scale-125 ${
                          selectedMarkers.includes(marker.id)
                            ? "ring-2 ring-yellow-400 rounded-full"
                            : ""
                        }`}
                        onClick={(e) => handleMarkerSelect(marker, e)}
                      >
                        {markerTypes.find((t) => t.value === marker.type)?.icon}
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{marker.name}</p>
                  </TooltipContent>
                </Tooltip>
              ))}

              {/* ... other elements ... */}
            </div>
          </TransformComponent>
        </TransformWrapper>
      </div>
    </div>
  );
}
