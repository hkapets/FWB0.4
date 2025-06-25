import React, { useState } from "react";
import { Search, ArrowRight } from "lucide-react";

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
    <div className="relative w-80">
      <div className="flex items-center bg-gradient-to-r from-purple-900/90 to-purple-800/90 border border-yellow-400/60 rounded-lg px-4 py-3 shadow-lg backdrop-blur-sm focus-within:ring-2 focus-within:ring-yellow-400/50 focus-within:border-yellow-300 transition-all duration-300">
        <Search className="h-5 w-5 text-yellow-300 mr-3 flex-shrink-0" />
        <input
          type="text"
          className="bg-transparent outline-none text-yellow-100 placeholder:text-yellow-400/70 flex-1 font-medium"
          placeholder="Глобальний пошук..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="ml-2 text-yellow-400/60 hover:text-yellow-300 transition-colors"
          >
            ×
          </button>
        )}
      </div>
      {focused && query.length > 1 && (
        <div className="absolute left-0 mt-3 w-full bg-gradient-to-br from-gray-900/95 to-purple-900/95 border border-yellow-400/60 rounded-xl shadow-2xl backdrop-blur-md z-50 max-h-96 overflow-hidden animate-fade-in">
          {results.length === 0 ? (
            <div className="p-6 text-center">
              <Search className="h-12 w-12 text-yellow-400/50 mx-auto mb-3" />
              <p className="text-yellow-300/80 font-medium">Нічого не знайдено</p>
              <p className="text-yellow-400/50 text-sm mt-1">Спробуйте інший запит</p>
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto custom-scrollbar">
              {Object.entries(grouped).map(([type, items]) => (
                <div key={type} className="border-b border-yellow-900/30 last:border-b-0">
                  <div className="px-5 py-3 text-xs uppercase text-yellow-400 font-bold bg-purple-900/40 border-b border-yellow-900/20">
                    {TYPE_LABELS[type]} ({items.length})
                  </div>
                  {items.map((item, idx) => (
                    <div
                      key={item.name + idx}
                      className="px-5 py-4 hover:bg-gradient-to-r hover:from-yellow-400/10 hover:to-purple-600/10 cursor-pointer transition-all duration-200 border-b border-yellow-900/10 last:border-b-0 group"
                      onMouseDown={() => alert(`Перейти до: ${item.name}`)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-semibold text-yellow-200 group-hover:text-yellow-100 mb-1">
                            {item.name}
                          </div>
                          <div className="text-sm text-gray-300/80 group-hover:text-gray-200/90 truncate">
                            {item.description}
                          </div>
                        </div>
                        <ArrowRight className="h-4 w-4 text-yellow-400/50 group-hover:text-yellow-300 ml-3 flex-shrink-0" />
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
