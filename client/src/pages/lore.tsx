import { useTranslation } from "@/lib/i18n";
import { useEffect, useState } from "react";

export default function LorePage() {
  const t = useTranslation();
  const [scenarios, setScenarios] = useState<any[]>([]);
  const [filterScenario, setFilterScenario] = useState("");
  const worldId = 1; // TODO: замінити на актуальний спосіб отримання worldId
  const [lore, setLore] = useState<any[]>([]);

  useEffect(() => {
    if (!worldId) return;
    fetch(`/api/worlds/${worldId}/scenarios`)
      .then((r) => r.json())
      .then(setScenarios);
    fetch(`/api/worlds/${worldId}/lore`)
      .then((r) => r.json())
      .then(setLore);
  }, [worldId]);

  const filteredLore = lore.filter(
    (l: any) =>
      !filterScenario || (l.relatedScenarioIds || []).includes(filterScenario)
  );

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">{t.navigation.lore}</h1>
      <div className="flex gap-2 mb-4 flex-wrap">
        <select
          value={filterScenario}
          onChange={(e) => setFilterScenario(e.target.value)}
          className="px-2 py-1 rounded border bg-black/40 text-white"
        >
          <option value="">Всі сценарії</option>
          {scenarios.map((s) => (
            <option key={s.id} value={s.id}>
              {typeof s.name === "object" ? s.name.uk : s.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        {filteredLore.map((l: any) => (
          <div key={l.id} className="p-2 mb-2 bg-black/10 rounded">
            <div className="font-bold">
              {typeof l.name === "object" ? l.name.uk : l.name}
            </div>
            <div className="text-xs text-gray-400">{l.type}</div>
            <div className="text-sm">
              {typeof l.description === "object"
                ? l.description.uk
                : l.description}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
