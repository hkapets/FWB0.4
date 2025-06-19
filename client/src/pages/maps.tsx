import React, { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

// Демо SVG-карта (можна замінити на upload)
const DEMO_SVG = `<svg viewBox="0 0 800 600" width="800" height="600" xmlns="http://www.w3.org/2000/svg"><rect width="800" height="600" fill="#1e293b"/><ellipse cx="400" cy="300" rx="300" ry="200" fill="#334155"/><ellipse cx="500" cy="350" rx="120" ry="60" fill="#475569"/><ellipse cx="250" cy="200" rx="80" ry="40" fill="#64748b"/></svg>`;

const MAP_STORAGE_KEY = "fw-map-v1";

const MARKER_CATEGORIES = [
  { value: "city", label: "Місто", icon: "🏙️", color: "#3b82f6" },
  { value: "location", label: "Локація", icon: "📍", color: "#10b981" },
  { value: "event", label: "Подія", icon: "⭐", color: "#f59e42" },
  { value: "artifact", label: "Артефакт", icon: "🗡️", color: "#a21caf" },
  { value: "custom", label: "Custom", icon: "⚪", color: "#fbbf24" },
];

// Додаю типи шарів
const MAP_LAYERS = [
  { value: "base", label: "Базова карта" },
  { value: "relief", label: "Рельєф" },
  { value: "political", label: "Політична" },
  { value: "events", label: "Події" },
];

export default function MapsPage() {
  const { toast } = useToast();
  const svgRef = useRef<SVGSVGElement>(null);
  const [svg, setSvg] = useState<string>(DEMO_SVG);
  const [markers, setMarkers] = useState<any[]>([]);
  const [selectedMarker, setSelectedMarker] = useState<any | null>(null);
  const [addMode, setAddMode] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(
    null
  );
  const [lore, setLore] = useState<any[]>([]);
  const [markerFilter, setMarkerFilter] = useState<string>("all");
  const [layer, setLayer] = useState<
    "base" | "relief" | "political" | "events"
  >("base");
  const [polygonMode, setPolygonMode] = useState(false);
  const [polygonPoints, setPolygonPoints] = useState<
    { x: number; y: number }[]
  >([]);
  const [polygons, setPolygons] = useState<any[]>([]);
  const [selectedPolygon, setSelectedPolygon] = useState<any | null>(null);
  const [undoStack, setUndoStack] = useState<any[]>([]);
  const [redoStack, setRedoStack] = useState<any[]>([]);
  const [dropActive, setDropActive] = useState(false);
  const [hoveredPolygonId, setHoveredPolygonId] = useState<number | null>(null);

  // Завантаження маркерів та svg з localStorage
  useEffect(() => {
    const saved = localStorage.getItem(MAP_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setMarkers(parsed.markers || []);
        setSvg(parsed.svg || DEMO_SVG);
      } catch {}
    }
  }, []);
  // Збереження у localStorage
  useEffect(() => {
    localStorage.setItem(MAP_STORAGE_KEY, JSON.stringify({ svg, markers }));
  }, [svg, markers]);

  // Завантаження лору для прив'язки
  useEffect(() => {
    fetch("/api/worlds/1/lore")
      .then((r) => r.json())
      .then(setLore);
  }, []);

  // Zoom/pan
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setZoom((z) => Math.max(0.5, Math.min(3, z - e.deltaY * 0.001)));
  };
  const handleMouseDown = (e: React.MouseEvent) => {
    setDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (dragging && dragStart) {
      setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    }
  };
  const handleMouseUp = () => setDragging(false);

  // Обгортка для змін карти з undo
  const setMapWithUndo = (newMarkers: any[], newPolygons: any[]) => {
    setUndoStack((stack) => [...stack, { markers, polygons }]);
    setMarkers(newMarkers);
    setPolygons(newPolygons);
    setRedoStack([]);
  };
  const handleUndo = () => {
    if (undoStack.length === 0) return;
    setRedoStack((stack) => [{ markers, polygons }, ...stack]);
    const prev = undoStack[undoStack.length - 1];
    setMarkers(prev.markers);
    setPolygons(prev.polygons);
    setUndoStack((stack) => stack.slice(0, -1));
    toast({ title: "Undo", description: "Останню дію скасовано." });
  };
  const handleRedo = () => {
    if (redoStack.length === 0) return;
    setUndoStack((stack) => [...stack, { markers, polygons }]);
    const next = redoStack[0];
    setMarkers(next.markers);
    setPolygons(next.polygons);
    setRedoStack((stack) => stack.slice(1));
    toast({ title: "Redo", description: "Дію повернуто." });
  };

  // Додавання маркера
  const handleMapClick = (e: React.MouseEvent) => {
    if (!addMode || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - pan.x) / zoom;
    const y = (e.clientY - rect.top - pan.y) / zoom;
    setMapWithUndo(
      [
        ...markers,
        {
          id: Date.now(),
          x,
          y,
          name: "",
          loreId: "",
          type: "custom",
          category: "custom",
          layer,
        },
      ],
      polygons
    );
    setAddMode(false);
    toast({
      title: "Маркер додано",
      description: "Відредагуйте його властивості.",
    });
  };

  // CRUD маркера
  const handleMarkerEdit = (id: number, data: any) => {
    setMapWithUndo(
      markers.map((m) => (m.id === id ? { ...m, ...data } : m)),
      polygons
    );
    setSelectedMarker(null);
  };
  const handleMarkerDelete = (id: number) => {
    setMapWithUndo(
      markers.filter((m) => m.id !== id),
      polygons
    );
    setSelectedMarker(null);
  };
  const handleMarkerDrag = (id: number, x: number, y: number) => {
    setMapWithUndo(
      markers.map((m) => (m.id === id ? { ...m, x, y } : m)),
      polygons
    );
  };

  // Drag&drop зображення на карту
  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDropActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Помилка",
          description: "Можна лише зображення",
          variant: "destructive",
        });
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "Помилка",
          description: "Максимальний розмір 2MB",
          variant: "destructive",
        });
        return;
      }
      toast({ title: "Завантаження...", description: file.name });
      const formData = new FormData();
      formData.append("image", file);
      const res = await fetch("/api/upload/race-image", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.url) {
        // Визначаємо координати центру карти
        const rect = svgRef.current?.getBoundingClientRect();
        const x = rect ? (rect.width / 2 - pan.x) / zoom : 400;
        const y = rect ? (rect.height / 2 - pan.y) / zoom : 300;
        // Перевіряємо, чи дроп у полігон
        let foundPolyIdx = -1;
        for (let i = 0; i < polygons.length; i++) {
          const poly = polygons[i];
          if (poly.layer !== layer) continue;
          // Простий алгоритм: перевіряємо, чи точка (x, y) всередині полігону
          if (pointInPolygon({ x, y }, poly.points)) {
            foundPolyIdx = i;
            break;
          }
        }
        if (foundPolyIdx !== -1) {
          // Додаємо зображення до полігону
          const newPolygons = polygons.map((p, idx) =>
            idx === foundPolyIdx ? { ...p, image: data.url } : p
          );
          setMapWithUndo(markers, newPolygons);
          toast({ title: "Зображення додано до області" });
        } else {
          // Створюємо маркер із зображенням
          setMapWithUndo(
            [
              ...markers,
              {
                id: Date.now(),
                x,
                y,
                name: "",
                loreId: "",
                type: "custom",
                image: data.url,
                category: "custom",
                layer,
              },
            ],
            polygons
          );
          toast({
            title: "Зображення додано",
            description: "Маркер з картинкою створено.",
          });
        }
      } else {
        toast({
          title: "Помилка",
          description: data.message || "Upload failed",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex gap-2 mb-2">
        <Button
          onClick={() => setAddMode(true)}
          variant={addMode ? "default" : "outline"}
        >
          Додати маркер
        </Button>
        <Button
          onClick={() => setPolygonMode(true)}
          variant={polygonMode ? "default" : "outline"}
        >
          Додати область
        </Button>
        <Button
          onClick={() => {
            setMapWithUndo([], []);
            toast({ title: "Всі маркери та області видалено" });
          }}
          variant="destructive"
        >
          Очистити все
        </Button>
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
        <Button
          onClick={() => {
            const data = JSON.stringify({ svg, markers, polygons }, null, 2);
            const blob = new Blob([data], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "fantasy-map.json";
            a.click();
            URL.revokeObjectURL(url);
            toast({ title: "Експортовано карту", description: "JSON-файл збережено." });
          }}
          variant="outline"
        >
          Експорт
        </Button>
        <label className="inline-block">
          <input
            type="file"
            accept="application/json"
            style={{ display: "none" }}
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              try {
                const text = await file.text();
                const data = JSON.parse(text);
                if (!data || typeof data !== "object" || !Array.isArray(data.markers) || !Array.isArray(data.polygons) || typeof data.svg !== "string") {
                  toast({ title: "Помилка імпорту", description: "Некоректний формат файлу.", variant: "destructive" });
                  return;
                }
                if (!window.confirm("Імпорт перезапише поточну карту. Продовжити?")) return;
                setMarkers(data.markers);
                setPolygons(data.polygons);
                setSvg(data.svg);
                toast({ title: "Імпортовано карту", description: "Дані карти оновлено." });
              } catch (err) {
                toast({ title: "Помилка імпорту", description: "Не вдалося прочитати файл.", variant: "destructive" });
              }
              e.target.value = "";
            }}
            id="import-map-input"
          />
          <Button variant="outline" type="button" onClick={() => document.getElementById('import-map-input')?.click()}>
            Імпорт
          </Button>
        </label>
        {/* Фільтр категорій */}
        <select
          value={markerFilter}
          onChange={(e) => setMarkerFilter(e.target.value)}
          className="px-2 py-1 rounded border bg-black/40 text-white"
        >
          <option value="all">Всі категорії</option>
          {MARKER_CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.icon} {c.label}
            </option>
          ))}
        </select>
        {/* Шари */}
        <select
          value={layer}
          onChange={(e) => setLayer(e.target.value as any)}
          className="px-2 py-1 rounded border bg-black/40 text-white"
        >
          {MAP_LAYERS.map((l) => (
            <option key={l.value} value={l.value}>
              {l.label}
            </option>
          ))}
        </select>
      </div>
      <div
        className={`relative flex-1 bg-black/80 rounded overflow-hidden ${
          dropActive ? "ring-4 ring-yellow-400" : ""
        }`}
        style={{ minHeight: 500 }}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setDropActive(true);
        }}
        onDragLeave={(e) => {
          setDropActive(false);
        }}
      >
        <svg
          ref={svgRef}
          dangerouslySetInnerHTML={{
            __html: svg.replace(/<\/?svg[^>]*>/g, ""),
          }}
          width={800}
          height={600}
          style={{
            transform: `translate(${pan.x}px,${pan.y}px) scale(${zoom})`,
            transition: dragging ? "none" : "transform 0.2s",
            cursor: dragging
              ? "grabbing"
              : addMode
              ? "crosshair"
              : polygonMode
              ? "crosshair"
              : "grab",
            zIndex: 1,
          }}
          onClick={(e) => {
            if (polygonMode) {
              const rect = svgRef.current!.getBoundingClientRect();
              const x = (e.clientX - rect.left - pan.x) / zoom;
              const y = (e.clientY - rect.top - pan.y) / zoom;
              setPolygonPoints([...polygonPoints, { x, y }]);
            } else {
              handleMapClick(e);
            }
          }}
          onDoubleClick={(e) => {
            if (polygonMode && polygonPoints.length > 2) {
              setMapWithUndo(markers, [
                ...polygons,
                {
                  id: Date.now(),
                  points: polygonPoints,
                  name: "",
                  type: "region",
                  color: "#fbbf24",
                  loreId: "",
                  layer,
                  image: undefined,
                },
              ]);
              setPolygonPoints([]);
              setPolygonMode(false);
              toast({
                title: "Область додано",
                description: "Відредагуйте її властивості.",
              });
            }
          }}
        />
        {/* Маркери */}
        {markers
          .filter(
            (m: any) =>
              (markerFilter === "all" || m.category === markerFilter) &&
              m.layer === layer
          )
          .map((m: any) => (
            <Marker
              key={m.id}
              x={m.x}
              y={m.y}
              selected={selectedMarker?.id === m.id}
              onClick={() => setSelectedMarker(m)}
              onDrag={(x: number, y: number) => handleMarkerDrag(m.id, x, y)}
              category={m.category}
              image={m.image}
            />
          ))}
        {/* Відображення полігонів */}
        {polygons
          .filter((poly: any) => poly.layer === layer)
          .map((poly: any) => (
            <g key={poly.id}>
              <polygon
                points={poly.points.map((p: any) => `${p.x},${p.y}`).join(" ")}
                fill={poly.color}
                fillOpacity={0.3}
                stroke={
                  selectedPolygon?.id === poly.id ||
                  hoveredPolygonId === poly.id
                    ? "#fde68a"
                    : poly.color
                }
                strokeWidth={
                  selectedPolygon?.id === poly.id ||
                  hoveredPolygonId === poly.id
                    ? 4
                    : 2
                }
                style={{ position: "absolute", cursor: "pointer" }}
                onClick={(e) => {
                  setSelectedPolygon(poly);
                  e.stopPropagation();
                }}
                onMouseEnter={() => setHoveredPolygonId(poly.id)}
                onMouseLeave={() => setHoveredPolygonId(null)}
              />
              {/* Tooltip з назвою/типом */}
              {hoveredPolygonId === poly.id && (
                <foreignObject
                  x={Math.min(...poly.points.map((p: any) => p.x))}
                  y={Math.min(...poly.points.map((p: any) => p.y)) - 32}
                  width={200}
                  height={32}
                  style={{ pointerEvents: "none" }}
                >
                  <div
                    className="bg-black/80 text-yellow-200 px-2 py-1 rounded text-xs shadow-lg"
                    style={{
                      maxWidth: 180,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    <b>{poly.name || "Область"}</b>
                    {poly.type ? ` (${poly.type})` : ""}
                  </div>
                </foreignObject>
              )}
            </g>
          ))}
        {/* Відображення поточного полігону при малюванні */}
        {polygonMode && polygonPoints.length > 0 && (
          <polyline
            points={polygonPoints.map((p) => `${p.x},${p.y}`).join(" ")}
            fill="none"
            stroke="#fde68a"
            strokeWidth={2}
            style={{ position: "absolute", pointerEvents: "none" }}
          />
        )}
      </div>
      {/* Діалог редагування маркера */}
      {selectedMarker && (
        <Dialog
          open={!!selectedMarker}
          onOpenChange={() => setSelectedMarker(null)}
        >
          <DialogContent>
            <div className="flex flex-col gap-2">
              <label>Назва</label>
              <Input
                value={selectedMarker.name}
                onChange={(e) =>
                  handleMarkerEdit(selectedMarker.id, { name: e.target.value })
                }
              />
              <label>Категорія</label>
              <select
                value={selectedMarker.category || "custom"}
                onChange={(e) =>
                  handleMarkerEdit(selectedMarker.id, {
                    category: e.target.value,
                  })
                }
                className="fantasy-input"
              >
                {MARKER_CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.icon} {c.label}
                  </option>
                ))}
              </select>
              <label>Тип</label>
              <Input
                value={selectedMarker.type}
                onChange={(e) =>
                  handleMarkerEdit(selectedMarker.id, { type: e.target.value })
                }
              />
              <label>Прив'язати до лору</label>
              <select
                value={selectedMarker.loreId}
                onChange={(e) =>
                  handleMarkerEdit(selectedMarker.id, {
                    loreId: e.target.value,
                  })
                }
                className="fantasy-input"
              >
                <option value="">—</option>
                {lore.map((l) => (
                  <option key={l.id} value={l.id}>
                    {typeof l.name === "object" ? l.name.uk : l.name}
                  </option>
                ))}
              </select>
              <label>Шар</label>
              <select
                value={selectedMarker.layer || layer}
                onChange={(e) =>
                  handleMarkerEdit(selectedMarker.id, { layer: e.target.value })
                }
                className="fantasy-input"
              >
                {MAP_LAYERS.map((l) => (
                  <option key={l.value} value={l.value}>
                    {l.label}
                  </option>
                ))}
              </select>
              <div className="flex gap-2 mt-2">
                <Button
                  onClick={() => setSelectedMarker(null)}
                  variant="outline"
                >
                  Закрити
                </Button>
                <Button
                  onClick={() => handleMarkerDelete(selectedMarker.id)}
                  variant="destructive"
                >
                  Видалити
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
      {/* Діалог лору по кліку на маркер */}
      {selectedMarker && selectedMarker.loreId && (
        <Dialog
          open={!!selectedMarker.loreId}
          onOpenChange={() => setSelectedMarker(null)}
        >
          <DialogContent>
            {(() => {
              const l = lore.find((l) => l.id === selectedMarker.loreId);
              if (!l) return <div>Лор не знайдено</div>;
              return (
                <div>
                  <div className="font-bold text-lg mb-2">
                    {typeof l.name === "object" ? l.name.uk : l.name}
                  </div>
                  {l.image && (
                    <img
                      src={l.image}
                      alt=""
                      className="w-32 h-32 object-cover rounded mb-2"
                    />
                  )}
                  <div className="prose prose-invert max-w-none whitespace-pre-line">
                    {typeof l.description === "object"
                      ? l.description.uk
                      : l.description}
                  </div>
                </div>
              );
            })()}
          </DialogContent>
        </Dialog>
      )}
      {/* Діалог редагування області */}
      {selectedPolygon && (
        <>
          <div className="mb-2 text-xs text-yellow-200">
            Перетягуйте точки для зміни форми. Подвійний клік — видалити точку.
          </div>
          <PolygonEditor
            poly={selectedPolygon}
            onChange={(pts: { x: number; y: number }[]) =>
              setSelectedPolygon({ ...selectedPolygon, points: pts })
            }
          />
          {/* Drag&drop зона для зображення */}
          <div
            className="my-2 p-2 border-2 border-dashed border-yellow-400 rounded bg-black/30 flex flex-col items-center justify-center cursor-pointer hover:bg-yellow-900/20"
            onDragOver={(e) => e.preventDefault()}
            onDrop={async (e) => {
              e.preventDefault();
              const file = e.dataTransfer.files?.[0];
              if (!file || !file.type.startsWith("image/")) return;
              if (file.size > 2 * 1024 * 1024) return;
              const formData = new FormData();
              formData.append("image", file);
              const res = await fetch("/api/upload/race-image", {
                method: "POST",
                body: formData,
              });
              const data = await res.json();
              if (data.url) {
                setSelectedPolygon({ ...selectedPolygon, image: data.url });
              }
            }}
          >
            {selectedPolygon.image ? (
              <div className="flex flex-col items-center gap-2">
                <img src={selectedPolygon.image} alt="" className="w-32 h-32 object-cover rounded border border-yellow-400" />
                <Button size="sm" variant="destructive" onClick={() => setSelectedPolygon({ ...selectedPolygon, image: undefined })}>
                  Видалити зображення
                </Button>
              </div>
            ) : (
              <span className="text-yellow-200">Перетягніть зображення сюди для додавання до області</span>
            )}
          </div>
          <Dialog
            open={!!selectedPolygon}
            onOpenChange={() => setSelectedPolygon(null)}
          >
            <DialogContent>
              <div className="flex flex-col gap-2">
                <label>Назва</label>
                <Input
                  value={selectedPolygon.name}
                  onChange={(e) =>
                    setSelectedPolygon({
                      ...selectedPolygon,
                      name: e.target.value,
                    })
                  }
                />
                <label>Колір</label>
                <input
                  type="color"
                  value={selectedPolygon.color}
                  onChange={(e) =>
                    setSelectedPolygon({
                      ...selectedPolygon,
                      color: e.target.value,
                    })
                  }
                />
                <label>Тип</label>
                <Input
                  value={selectedPolygon.type}
                  onChange={(e) =>
                    setSelectedPolygon({
                      ...selectedPolygon,
                      type: e.target.value,
                    })
                  }
                />
                <label>Прив'язати до лору</label>
                <select
                  value={selectedPolygon.loreId}
                  onChange={(e) =>
                    setSelectedPolygon({
                      ...selectedPolygon,
                      loreId: e.target.value,
                    })
                  }
                  className="fantasy-input"
                >
                  <option value="">—</option>
                  {lore.map((l) => (
                    <option key={l.id} value={l.id}>
                      {typeof l.name === "object" ? l.name.uk : l.name}
                    </option>
                  ))}
                </select>
                <label>Шар</label>
                <select
                  value={selectedPolygon.layer || layer}
                  onChange={(e) =>
                    setSelectedPolygon({
                      ...selectedPolygon,
                      layer: e.target.value,
                    })
                  }
                  className="fantasy-input"
                >
                  {MAP_LAYERS.map((l) => (
                    <option key={l.value} value={l.value}>
                      {l.label}
                    </option>
                  ))}
                </select>
                <div className="flex gap-2 mt-2">
                  <Button
                    onClick={() => setSelectedPolygon(null)}
                    variant="outline"
                  >
                    Закрити
                  </Button>
                  <Button
                    onClick={() => {
                      setMapWithUndo(
                        markers,
                        polygons.filter((p: any) => p.id !== selectedPolygon.id)
                      );
                      setSelectedPolygon(null);
                    }}
                    variant="destructive"
                  >
                    Видалити
                  </Button>
                  <Button
                    onClick={() => {
                      setMapWithUndo(
                        markers,
                        polygons.map((p: any) =>
                          p.id === selectedPolygon.id ? selectedPolygon : p
                        )
                      );
                      setSelectedPolygon(null);
                    }}
                    variant="default"
                  >
                    Зберегти
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </>
      )}
      {/* Preview зображення у діалозі маркера */}
      {selectedMarker && selectedMarker.image && (
        <img
          src={selectedMarker.image}
          alt=""
          className="w-32 h-32 object-cover rounded mb-2"
        />
      )}
    </div>
  );
}

// Маркер на SVG
function Marker({
  x,
  y,
  selected,
  onClick,
  onDrag,
  category,
  image,
}: {
  x: number;
  y: number;
  selected?: boolean;
  onClick: () => void;
  onDrag: (x: number, y: number) => void;
  category?: string;
  image?: string;
}) {
  const [drag, setDrag] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const ref = useRef<HTMLDivElement>(null);
  const cat =
    MARKER_CATEGORIES.find((c) => c.value === category) ||
    MARKER_CATEGORIES[MARKER_CATEGORIES.length - 1];
  useEffect(() => {
    if (!drag) return;
    const handleMove = (e: MouseEvent) => {
      onDrag(x + (e.clientX - offset.x), y + (e.clientY - offset.y));
    };
    const handleUp = () => setDrag(false);
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
    };
  }, [drag, offset, x, y, onDrag]);
  return (
    <div
      ref={ref}
      style={{
        position: "absolute",
        left: x - 12,
        top: y - 24,
        zIndex: 2,
        cursor: drag ? "grabbing" : "pointer",
        transition: "box-shadow 0.2s",
        boxShadow: selected ? "0 0 0 4px #fde68a" : "0 1px 4px #0008",
      }}
      onMouseDown={(e) => {
        setDrag(true);
        setOffset({ x: e.clientX, y: e.clientY });
        e.stopPropagation();
      }}
      onClick={(e) => {
        onClick();
        e.stopPropagation();
      }}
    >
      <svg width={24} height={32} viewBox="0 0 24 32" fill="none">
        <ellipse
          cx={12}
          cy={20}
          rx={10}
          ry={10}
          fill={cat.color}
          stroke="#78350f"
          strokeWidth={2}
        />
        <circle cx={12} cy={20} r={4} fill="#78350f" />
        <text x={12} y={16} textAnchor="middle" fontSize="16" dy=".3em">
          {cat.icon}
        </text>
      </svg>
      {image && (
        <img
          src={image}
          alt=""
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: 24,
            height: 24,
            borderRadius: 6,
            objectFit: "cover",
            border: "2px solid #fde68a",
            background: "#222",
          }}
        />
      )}
    </div>
  );
}

// Drag&drop редагування точок полігону
function PolygonEditor({
  poly,
  onChange,
}: {
  poly: any;
  onChange: (points: { x: number; y: number }[]) => void;
}) {
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [offset, setOffset] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  useEffect(() => {
    if (dragIdx === null) return;
    const handleMove = (e: MouseEvent) => {
      const newPoints = poly.points.map((p: any, i: number) =>
        i === dragIdx
          ? { x: p.x + (e.clientX - offset.x), y: p.y + (e.clientY - offset.y) }
          : p
      );
      onChange(newPoints);
    };
    const handleUp = () => setDragIdx(null);
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
    };
  }, [dragIdx, offset, poly.points, onChange]);
  return (
    <>
      {poly.points.map((p: any, i: number) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r={8}
          fill="#fde68a"
          stroke="#78350f"
          strokeWidth={2}
          style={{ cursor: "pointer" }}
          onMouseDown={(e) => {
            setDragIdx(i);
            setOffset({ x: e.clientX, y: e.clientY });
            e.stopPropagation();
          }}
          onDoubleClick={(e) => {
            onChange(poly.points.filter((_: any, idx: number) => idx !== i));
            e.stopPropagation();
          }}
        />
      ))}
    </>
  );
}

// Функція для перевірки, чи точка всередині полігону
function pointInPolygon(point: { x: number; y: number }, vs: { x: number; y: number }[]) {
  let inside = false;
  for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
    const xi = vs[i].x, yi = vs[i].y;
    const xj = vs[j].x, yj = vs[j].y;
    const intersect = ((yi > point.y) !== (yj > point.y)) &&
      (point.x < ((xj - xi) * (point.y - yi)) / (yj - yi + 0.00001) + xi));
    if (intersect) inside = !inside;
  }
  return inside;
}
