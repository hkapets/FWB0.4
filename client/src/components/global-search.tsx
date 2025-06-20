import React, { useState } from "react";
import { Search } from "lucide-react";

const MOCK_DATA = [
  { type: "character", name: "Ельрік", description: "Маг з Альдора" },
  { type: "location", name: "Темний ліс", description: "Містичний ліс" },
  {
    type: "lore",
    name: "Артефакт: Меч Світла",
    description: "Легендарний меч",
  },
  { type: "event", name: "Битва при Долині", description: "Велика битва" },
  { type: "note", name: "План подорожі", description: "Зустрітися з гідом" },
  {
    type: "scenario",
    name: "Втеча з фортеці",
    description: "Сценарій для гри",
  },
];

const TYPE_LABELS: Record<string, string> = {
  character: "Персонажі",
  location: "Локації",
  lore: "Лор",
  event: "Події",
  note: "Нотатки",
  scenario: "Сценарії",
};

export default function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);

  const results =
    query.length > 1
      ? MOCK_DATA.filter(
          (item) =>
            item.name.toLowerCase().includes(query.toLowerCase()) ||
            item.description.toLowerCase().includes(query.toLowerCase())
        )
      : [];

  // Групування результатів за типом
  const grouped = results.reduce<Record<string, typeof results>>(
    (acc, item) => {
      acc[item.type] = acc[item.type] || [];
      acc[item.type].push(item);
      return acc;
    },
    {}
  );

  return (
    <div className="relative w-72">
      <div className="flex items-center bg-purple-900/80 border border-yellow-400 rounded-lg px-3 py-2 shadow-md focus-within:ring-2 ring-yellow-400 transition-all">
        <Search className="h-5 w-5 text-yellow-300 mr-2" />
        <input
          type="text"
          className="bg-transparent outline-none text-yellow-100 placeholder:text-yellow-400 flex-1"
          placeholder="Пошук..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
        />
      </div>
      {focused && query.length > 1 && (
        <div className="absolute left-0 mt-2 w-full bg-gray-900 border border-yellow-400 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto animate-fade-in">
          {results.length === 0 ? (
            <div className="p-4 text-center text-yellow-300">
              Нічого не знайдено
            </div>
          ) : (
            Object.entries(grouped).map(([type, items]) => (
              <div key={type}>
                <div className="px-4 py-2 text-xs uppercase text-yellow-400 font-bold bg-purple-900/60 rounded-t">
                  {TYPE_LABELS[type]}
                </div>
                {items.map((item, idx) => (
                  <div
                    key={item.name + idx}
                    className="px-4 py-2 hover:bg-yellow-400/10 cursor-pointer border-b border-yellow-900 last:border-b-0 transition-colors"
                    onMouseDown={() => alert(`Перейти до: ${item.name}`)}
                  >
                    <div className="font-semibold text-yellow-200">
                      {item.name}
                    </div>
                    <div className="text-xs text-gray-300">
                      {item.description}
                    </div>
                  </div>
                ))}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
