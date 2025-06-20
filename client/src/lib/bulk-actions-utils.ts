import {
  MoreHorizontal,
  Edit,
  Trash2,
  Settings,
  Tag,
  Shield,
  Star,
} from "lucide-react";

export interface BulkAction {
  key: string;
  label: string;
  icon: string;
  variant?: "default" | "destructive" | "outline";
  requiresConfirmation?: boolean;
  requiresInput?: boolean;
  inputType?: "select" | "text";
  inputOptions?: { value: string; label: string }[];
  inputLabel?: string;
  inputPlaceholder?: string;
}

// Загальні дії для всіх типів
export const commonBulkActions: BulkAction[] = [
  {
    key: "delete",
    label: "Видалити",
    icon: "Trash2",
    variant: "destructive",
    requiresConfirmation: true,
  },
];

// Специфічні дії для Bestiary
export const createBestiaryBulkActions = (): BulkAction[] => [
  ...commonBulkActions,
  {
    key: "changeType",
    label: "Змінити тип",
    icon: "Tag",
    requiresInput: true,
    inputType: "select",
    inputLabel: "Новий тип істоти",
    inputPlaceholder: "Оберіть тип",
    inputOptions: [
      { value: "beast", label: "Звір" },
      { value: "humanoid", label: "Гуманоїд" },
      { value: "monster", label: "Монстр" },
      { value: "dragon", label: "Дракон" },
      { value: "undead", label: "Нежить" },
      { value: "elemental", label: "Стихія" },
    ],
  },
  {
    key: "changeDangerLevel",
    label: "Змінити рівень небезпеки",
    icon: "Shield",
    requiresInput: true,
    inputType: "select",
    inputLabel: "Новий рівень небезпеки",
    inputPlaceholder: "Оберіть рівень",
    inputOptions: [
      { value: "low", label: "Низький" },
      { value: "medium", label: "Середній" },
      { value: "high", label: "Високий" },
      { value: "deadly", label: "Смертельний" },
    ],
  },
];

// Специфічні дії для Artifacts
export const createArtifactBulkActions = (): BulkAction[] => [
  ...commonBulkActions,
  {
    key: "changeType",
    label: "Змінити тип",
    icon: "Tag",
    requiresInput: true,
    inputType: "select",
    inputLabel: "Новий тип артефакту",
    inputPlaceholder: "Оберіть тип",
    inputOptions: [
      { value: "weapon", label: "Зброя" },
      { value: "armor", label: "Броня" },
      { value: "tool", label: "Інструмент" },
      { value: "decoration", label: "Прикраса" },
      { value: "magical", label: "Магічний" },
    ],
  },
  {
    key: "changeRarity",
    label: "Змінити рідкість",
    icon: "Star",
    requiresInput: true,
    inputType: "select",
    inputLabel: "Нова рідкість",
    inputPlaceholder: "Оберіть рідкість",
    inputOptions: [
      { value: "common", label: "Звичайний" },
      { value: "uncommon", label: "Незвичайний" },
      { value: "rare", label: "Рідкісний" },
      { value: "legendary", label: "Легендарний" },
    ],
  },
];

// Специфічні дії для Events
export const createEventBulkActions = (): BulkAction[] => [
  ...commonBulkActions,
  {
    key: "changeType",
    label: "Змінити тип",
    icon: "Tag",
    requiresInput: true,
    inputType: "select",
    inputLabel: "Новий тип події",
    inputPlaceholder: "Оберіть тип",
    inputOptions: [
      { value: "battle", label: "Битва" },
      { value: "discovery", label: "Відкриття" },
      { value: "birth", label: "Народження" },
      { value: "death", label: "Смерть" },
      { value: "coronation", label: "Коронація" },
      { value: "catastrophe", label: "Катастрофа" },
    ],
  },
];

// Специфічні дії для Geography
export const createGeographyBulkActions = (): BulkAction[] => [
  ...commonBulkActions,
  {
    key: "changeType",
    label: "Змінити тип",
    icon: "Tag",
    requiresInput: true,
    inputType: "select",
    inputLabel: "Новий тип локації",
    inputPlaceholder: "Оберіть тип",
    inputOptions: [
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
    key: "changeDangerLevel",
    label: "Змінити рівень небезпеки",
    icon: "Shield",
    requiresInput: true,
    inputType: "select",
    inputLabel: "Новий рівень небезпеки",
    inputPlaceholder: "Оберіть рівень",
    inputOptions: [
      { value: "safe", label: "Безпечно" },
      { value: "low", label: "Низький" },
      { value: "medium", label: "Середній" },
      { value: "high", label: "Високий" },
      { value: "deadly", label: "Смертельний" },
    ],
  },
];

// Специфічні дії для Magic
export const createMagicBulkActions = (): BulkAction[] => [
  ...commonBulkActions,
  {
    key: "changeType",
    label: "Змінити тип",
    icon: "Tag",
    requiresInput: true,
    inputType: "select",
    inputLabel: "Новий тип магії",
    inputPlaceholder: "Оберіть тип",
    inputOptions: [
      { value: "spell", label: "Закляття" },
      { value: "ritual", label: "Ритуал" },
      { value: "enchantment", label: "Зачарування" },
      { value: "curse", label: "Прокляття" },
      { value: "blessing", label: "Благословення" },
    ],
  },
  {
    key: "changeSchool",
    label: "Змінити школу",
    icon: "Settings",
    requiresInput: true,
    inputType: "select",
    inputLabel: "Нова школа магії",
    inputPlaceholder: "Оберіть школу",
    inputOptions: [
      { value: "fire", label: "Вогонь" },
      { value: "water", label: "Вода" },
      { value: "earth", label: "Земля" },
      { value: "air", label: "Повітря" },
      { value: "light", label: "Світло" },
      { value: "dark", label: "Темрява" },
      { value: "nature", label: "Природа" },
      { value: "arcane", label: "Аркана" },
    ],
  },
];

// Специфічні дії для Religion
export const createReligionBulkActions = (): BulkAction[] => [
  ...commonBulkActions,
  {
    key: "changeType",
    label: "Змінити тип",
    icon: "Tag",
    requiresInput: true,
    inputType: "select",
    inputLabel: "Новий тип релігії",
    inputPlaceholder: "Оберіть тип",
    inputOptions: [
      { value: "monotheistic", label: "Монотеїстична" },
      { value: "polytheistic", label: "Політеїстична" },
      { value: "pantheistic", label: "Пантеїстична" },
      { value: "animistic", label: "Анімістична" },
      { value: "shamanistic", label: "Шаманська" },
    ],
  },
  {
    key: "changeAlignment",
    label: "Змінити напрямок",
    icon: "Shield",
    requiresInput: true,
    inputType: "select",
    inputLabel: "Новий напрямок",
    inputPlaceholder: "Оберіть напрямок",
    inputOptions: [
      { value: "good", label: "Добрий" },
      { value: "neutral", label: "Нейтральний" },
      { value: "evil", label: "Злий" },
      { value: "chaotic", label: "Хаотичний" },
      { value: "lawful", label: "Законний" },
    ],
  },
];

// Специфічні дії для Mythology
export const createMythologyBulkActions = (): BulkAction[] => [
  ...commonBulkActions,
  {
    key: "changeType",
    label: "Змінити тип",
    icon: "Tag",
    requiresInput: true,
    inputType: "select",
    inputLabel: "Новий тип міфу",
    inputPlaceholder: "Оберіть тип",
    inputOptions: [
      { value: "creation", label: "Створення світу" },
      { value: "hero", label: "Героїчний міф" },
      { value: "trickster", label: "Міф про обманщика" },
      { value: "flood", label: "Потоп" },
      { value: "apocalypse", label: "Апокаліпсис" },
      { value: "love", label: "Любовний міф" },
    ],
  },
  {
    key: "changeCulture",
    label: "Змінити культуру",
    icon: "Settings",
    requiresInput: true,
    inputType: "select",
    inputLabel: "Нова культура",
    inputPlaceholder: "Оберіть культуру",
    inputOptions: [
      { value: "northern", label: "Північна" },
      { value: "southern", label: "Південна" },
      { value: "eastern", label: "Східна" },
      { value: "western", label: "Західна" },
      { value: "ancient", label: "Антична" },
      { value: "modern", label: "Сучасна" },
    ],
  },
];
