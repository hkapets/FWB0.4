export interface FilterConfig {
  key: string;
  label: string;
  type: "select" | "search" | "date";
  options?: { value: string; label: string }[];
  placeholder?: string;
}

export function filterData<T>(
  data: T[],
  filters: Record<string, any>,
  searchFields: (keyof T)[]
): T[] {
  return data.filter((item) => {
    // Пошук
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      const hasMatch = searchFields.some((field) => {
        const value = item[field];
        if (typeof value === "string") {
          return value.toLowerCase().includes(searchTerm);
        }
        if (typeof value === "object" && value !== null) {
          // Для об'єктів з uk/en полями
          if ("uk" in value && typeof value.uk === "string") {
            return value.uk.toLowerCase().includes(searchTerm);
          }
          if ("en" in value && typeof value.en === "string") {
            return value.en.toLowerCase().includes(searchTerm);
          }
        }
        return false;
      });
      if (!hasMatch) return false;
    }

    // Фільтри по типу
    for (const [key, value] of Object.entries(filters)) {
      if (key === "search" || !value) continue;

      const itemValue = (item as any)[key];
      if (itemValue !== value) {
        return false;
      }
    }

    return true;
  });
}

export function sortData<T>(
  data: T[],
  sortBy: keyof T | null,
  sortOrder: "asc" | "desc" = "asc"
): T[] {
  if (!sortBy) return data;

  return [...data].sort((a, b) => {
    const aValue = (a as any)[sortBy];
    const bValue = (b as any)[sortBy];

    // Для об'єктів з uk/en полями
    let aCompare = aValue;
    let bCompare = bValue;

    if (typeof aValue === "object" && aValue !== null) {
      if ("uk" in aValue && typeof aValue.uk === "string") {
        aCompare = aValue.uk;
      } else if ("en" in aValue && typeof aValue.en === "string") {
        aCompare = aValue.en;
      }
    }

    if (typeof bValue === "object" && bValue !== null) {
      if ("uk" in bValue && typeof bValue.uk === "string") {
        bCompare = bValue.uk;
      } else if ("en" in bValue && typeof bValue.en === "string") {
        bCompare = bValue.en;
      }
    }

    if (typeof aCompare === "string" && typeof bCompare === "string") {
      const comparison = aCompare.localeCompare(bCompare);
      return sortOrder === "asc" ? comparison : -comparison;
    }

    if (typeof aCompare === "number" && typeof bCompare === "number") {
      return sortOrder === "asc" ? aCompare - bCompare : bCompare - aCompare;
    }

    return 0;
  });
}

// Утиліти для створення фільтрів для різних типів даних
export function createCreatureFilters() {
  return [
    {
      key: "type",
      label: "Тип",
      type: "select" as const,
      options: [
        { value: "beast", label: "Звір" },
        { value: "humanoid", label: "Гуманоїд" },
        { value: "monster", label: "Монстр" },
        { value: "dragon", label: "Дракон" },
        { value: "undead", label: "Нежить" },
        { value: "elemental", label: "Стихія" },
      ],
    },
    {
      key: "dangerLevel",
      label: "Рівень небезпеки",
      type: "select" as const,
      options: [
        { value: "low", label: "Низький" },
        { value: "medium", label: "Середній" },
        { value: "high", label: "Високий" },
        { value: "deadly", label: "Смертельний" },
      ],
    },
  ];
}

export function createArtifactFilters() {
  return [
    {
      key: "type",
      label: "Тип",
      type: "select" as const,
      options: [
        { value: "weapon", label: "Зброя" },
        { value: "armor", label: "Броня" },
        { value: "tool", label: "Інструмент" },
        { value: "decoration", label: "Прикраса" },
        { value: "magical", label: "Магічний" },
      ],
    },
    {
      key: "rarity",
      label: "Рідкість",
      type: "select" as const,
      options: [
        { value: "common", label: "Звичайний" },
        { value: "uncommon", label: "Незвичайний" },
        { value: "rare", label: "Рідкісний" },
        { value: "legendary", label: "Легендарний" },
      ],
    },
  ];
}

export function createEventFilters() {
  return [
    {
      key: "type",
      label: "Тип",
      type: "select" as const,
      options: [
        { value: "battle", label: "Битва" },
        { value: "discovery", label: "Відкриття" },
        { value: "birth", label: "Народження" },
        { value: "death", label: "Смерть" },
        { value: "coronation", label: "Коронація" },
        { value: "catastrophe", label: "Катастрофа" },
      ],
    },
  ];
}

export function createLocationFilters() {
  return [
    {
      key: "type",
      label: "Тип",
      type: "select" as const,
      options: [
        { value: "city", label: "Місто" },
        { value: "village", label: "Село" },
        { value: "castle", label: "Замок" },
        { value: "dungeon", label: "Підземелля" },
        { value: "forest", label: "Ліс" },
        { value: "mountain", label: "Гора" },
        { value: "lake", label: "Озеро" },
        { value: "ruins", label: "Руїни" },
      ],
    },
    {
      key: "dangerLevel",
      label: "Рівень небезпеки",
      type: "select" as const,
      options: [
        { value: "safe", label: "Безпечно" },
        { value: "low", label: "Низький" },
        { value: "medium", label: "Середній" },
        { value: "high", label: "Високий" },
        { value: "deadly", label: "Смертельний" },
      ],
    },
  ];
}
