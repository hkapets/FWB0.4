export interface WorldTemplate {
  id: string;
  name: string;
  icon: string;
  description: string;
  features: string[];
  races: string[];
  classes: string[];
  magic: string[];
  locations: string[];
  bestiary: string[];
  artifacts: string[];
}

export const worldTemplates: WorldTemplate[] = [
  {
    id: "classic",
    name: "Класичне фентезі",
    icon: "🏰",
    description:
      "Королівства, лицарі, магія, ельфи, гноми, орки. Світ у стилі Толкіна чи D&D.",
    features: ["⚔️ Воїни", "🧙‍♂️ Магія", "🌳 Ліси", "🐉 Дракони"],
    races: ["Люди", "Ельфи", "Гноми", "Орки", "Гобліни", "Гобіти"],
    classes: ["Воїн", "Маг", "Злодій", "Клерик", "Рейнджер", "Паладін"],
    magic: ["Елементальна", "Світла", "Темна", "Друїдна"],
    locations: [
      "Континент",
      "Королівство",
      "Ліс",
      "Гора",
      "Місто",
      "Підземелля",
    ],
    bestiary: ["Дракони", "Грифони", "Тролі", "Гобліни", "Елементалі"],
    artifacts: ["Мечі", "Амулети", "Кільця", "Посохи"],
  },
  {
    id: "dark",
    name: "Темне фентезі",
    icon: "☠️",
    description: "Демони, прокляття, некроманти, жорстокість. Похмурий світ.",
    features: ["🌑 Темрява", "🩸 Кров", "🦇 Вампіри", "🧙‍♂️ Некроманти"],
    races: ["Люди", "Вампіри", "Перевертні", "Демони", "Відьми"],
    classes: [
      "Некромант",
      "Мисливець",
      "Відьмак",
      "Чаклун",
      "Лицар-інквізитор",
    ],
    magic: ["Некромантія", "Кров", "Тінь", "Демонологія"],
    locations: ["Руїни", "Занепале місто", "Темний ліс", "Болото", "Катакомби"],
    bestiary: ["Відьми", "Упирі", "Демони", "Чудовиська ночі"],
    artifacts: ["Прокляті клинки", "Книги тіней", "Амулети крові"],
  },
  {
    id: "high-magic",
    name: "Висока магія",
    icon: "✨",
    description:
      "Магічні академії, літаючі острови, портали. Світ, де магія всюдисуща.",
    features: ["🪄 Чарівна паличка", "🔮 Кришталева куля", "🌌 Зоряне небо"],
    races: ["Люди", "Ельфи", "Драконороджені", "Феї", "Елементалі"],
    classes: ["Архімаг", "Заклинач", "Алхімік", "Магічний інженер"],
    magic: ["Просторова", "Часова", "Алхімія", "Ілюзії", "Трансмутація"],
    locations: [
      "Літаючий острів",
      "Магічне місто",
      "Портал",
      "Кристалічна печера",
    ],
    bestiary: ["Фенікси", "Мантикори", "Магічні створіння"],
    artifacts: ["Кристали сили", "Магічні книги", "Артефакти часу"],
  },
  {
    id: "urban",
    name: "Міське/сучасне фентезі",
    icon: "🌆",
    description: "Магія у сучасному суспільстві. Міста, техномагія, демони.",
    features: ["🚇 Метро", "🧑‍💻 Техномагія", "🦸‍♂️ Герої"],
    races: ["Люди", "Вампіри", "Перевертні", "Феї", "Демони"],
    classes: ["Маг-детектив", "Мисливець", "Техномаг", "Шаман"],
    magic: ["Техномагія", "Ілюзії", "Міська магія", "Ритуали"],
    locations: ["Місто", "Підземка", "Хмарочос", "Фабрика"],
    bestiary: ["Демони", "Духи", "Міські легенди"],
    artifacts: ["Техномагічні пристрої", "Амулети", "Ритуальні предмети"],
  },
  {
    id: "postapoc",
    name: "Постапокаліптичне фентезі",
    icon: "☢️",
    description: "Світ після катастрофи. Мутанти, руїни, магія виживання.",
    features: ["🏚️ Руїни", "🤖 Кіборги", "🌪️ Пустки"],
    races: ["Мутанти", "Вижилі люди", "Кіборги", "Духи"],
    classes: ["Виживальник", "Шаман", "Техномаг", "Рейдер"],
    magic: ["Радіаційна", "Техномагія", "Шаманізм"],
    locations: ["Руїни міста", "Пустка", "Заражена зона", "Підземелля"],
    bestiary: ["Мутанти", "Кібер-звірі", "Духи катастрофи"],
    artifacts: [
      "Стародавні технології",
      "Артефакти минулого",
      "Магічні реліквії",
    ],
  },
  {
    id: "custom",
    name: "Користувацький шаблон",
    icon: "➕",
    description:
      "Почати з чистого аркуша. Додайте свої раси, класи, магію, локації тощо.",
    features: ["🛠️ Повна свобода"],
    races: [],
    classes: [],
    magic: [],
    locations: [],
    bestiary: [],
    artifacts: [],
  },
];

// === Повний експорт шаблону світу ===
export async function exportFullWorldTemplate(worldId: number) {
  const [
    world,
    races,
    classes,
    magic,
    locations,
    creatures,
    artifacts,
    lore,
    characters,
    events,
    regions,
    relations,
  ] = await Promise.all([
    fetch(`/api/worlds/${worldId}`).then((r) => r.json()),
    fetch(`/api/worlds/${worldId}/races`).then((r) => r.json()),
    fetch(`/api/worlds/${worldId}/classes`).then((r) => r.json()),
    fetch(`/api/worlds/${worldId}/magic`).then((r) => r.json()),
    fetch(`/api/worlds/${worldId}/locations`).then((r) => r.json()),
    fetch(`/api/worlds/${worldId}/creatures`).then((r) => r.json()),
    fetch(`/api/worlds/${worldId}/artifacts`).then((r) => r.json()),
    fetch(`/api/worlds/${worldId}/lore`).then((r) => r.json()),
    fetch(`/api/worlds/${worldId}/characters`).then((r) => r.json()),
    fetch(`/api/worlds/${worldId}/events`).then((r) => r.json()),
    fetch(`/api/worlds/${worldId}/regions`).then((r) => r.json()),
    fetch(`/api/worlds/${worldId}/relations`)
      .then((r) => r.json())
      .catch(() => []),
  ]);

  const template = {
    name: world.name,
    description: world.description,
    icon: world.icon,
    features: world.features || [],
    races,
    classes,
    magic,
    locations,
    creatures,
    artifacts,
    lore,
    characters,
    events,
    regions,
    relations,
  };
  return template;
}

export async function saveWorldTemplateLocallyAndRemotely(worldId: number) {
  const template = await exportFullWorldTemplate(worldId);
  // Зберігаємо у localStorage
  const saved = JSON.parse(
    localStorage.getItem("customWorldTemplates") || "[]"
  );
  localStorage.setItem(
    "customWorldTemplates",
    JSON.stringify([...saved, template])
  );
  // Відправляємо на сервер
  await fetch("/api/world-templates", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(template),
  });
  return template;
}
