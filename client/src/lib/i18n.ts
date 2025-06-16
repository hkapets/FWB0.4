import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Language = 'uk' | 'en' | 'pl';

interface I18nStore {
  language: Language;
  setLanguage: (language: Language) => void;
}

export const useI18n = create<I18nStore>()(
  persist(
    (set) => ({
      language: 'uk',
      setLanguage: (language) => set({ language }),
    }),
    {
      name: 'fantasy-world-builder-language',
    }
  )
);

// Translation keys type for better type safety
export interface Translations {
  // Navigation
  navigation: {
    dashboard: string;
    locations: string;
    characters: string;
    creatures: string;
    worldMap: string;
    settings: string;
    currentWorld: string;
    recentWorlds: string;
  };
  
  // Header
  header: {
    title: string;
    saveProject: string;
    export: string;
  };
  
  // Dashboard
  dashboard: {
    welcome: string;
    subtitle: string;
    createWorld: string;
    addLocation: string;
    createCharacter: string;
    addCreature: string;
    createWorldDesc: string;
    addLocationDesc: string;
    createCharacterDesc: string;
    addCreatureDesc: string;
    worldStats: string;
    recentActivity: string;
    quickHelp: string;
    recentLocations: string;
    recentCharacters: string;
    viewAll: string;
    locations: string;
    characters: string;
    creatures: string;
    totalElements: string;
    noRecentActivity: string;
    gettingStarted: string;
    gettingStartedDesc: string;
    worldMapHelp: string;
    worldMapHelpDesc: string;
    exportShare: string;
    exportShareDesc: string;
    noWorldSelected: string;
    welcomeToBuilder: string;
    createFirstWorld: string;
    createFirstWorldDesc: string;
    addedLocation: string;
    createdCharacter: string;
  };
  
  // Forms and Modals
  forms: {
    name: string;
    description: string;
    type: string;
    dangerLevel: string;
    race: string;
    class: string;
    level: string;
    abilities: string;
    create: string;
    cancel: string;
    save: string;
    creating: string;
    saving: string;
    required: string;
    optional: string;
    addAbility: string;
  };
  
  // World Types
  worldTypes: {
    highFantasy: string;
    darkFantasy: string;
    medieval: string;
    steampunk: string;
    modernFantasy: string;
    custom: string;
  };
  
  // Location Types
  locationTypes: {
    city: string;
    town: string;
    village: string;
    forest: string;
    mountain: string;
    cave: string;
    castle: string;
    dungeon: string;
    temple: string;
    ruins: string;
    desert: string;
    swamp: string;
    plains: string;
    river: string;
    lake: string;
    island: string;
    tower: string;
    mine: string;
    harbor: string;
    market: string;
  };
  
  // Danger Levels
  dangerLevels: {
    safe: string;
    protected: string;
    dangerous: string;
    harmless: string;
    low: string;
    moderate: string;
    high: string;
    extreme: string;
    legendary: string;
  };
  
  // Character Races
  races: {
    human: string;
    elf: string;
    dwarf: string;
    halfling: string;
    gnome: string;
    halfElf: string;
    halfOrc: string;
    tiefling: string;
    dragonborn: string;
    orc: string;
    goblin: string;
    fairy: string;
    angel: string;
    demon: string;
    vampire: string;
    werewolf: string;
  };
  
  // Character Classes
  classes: {
    warrior: string;
    wizard: string;
    rogue: string;
    cleric: string;
    ranger: string;
    bard: string;
    paladin: string;
    sorcerer: string;
    warlock: string;
    druid: string;
    barbarian: string;
    monk: string;
    assassin: string;
    knight: string;
    merchant: string;
    scholar: string;
    noble: string;
    peasant: string;
  };
  
  // Creature Types
  creatureTypes: {
    dragon: string;
    beast: string;
    undead: string;
    demon: string;
    angel: string;
    elemental: string;
    fey: string;
    giant: string;
    goblinoid: string;
    humanoid: string;
    magicalBeast: string;
    monster: string;
    spirit: string;
    construct: string;
    aberration: string;
    plant: string;
    ooze: string;
  };
  
  // Actions
  actions: {
    search: string;
    filter: string;
    add: string;
    edit: string;
    delete: string;
    view: string;
    clearFilters: string;
    loading: string;
  };
  
  // Messages
  messages: {
    noResultsFound: string;
    noResultsDesc: string;
    noLocationsYet: string;
    noLocationsDesc: string;
    noCharactersYet: string;
    noCharactersDesc: string;
    noCreaturesYet: string;
    noCreaturesDesc: string;
    addFirstLocation: string;
    addFirstCharacter: string;
    addFirstCreature: string;
    worldCreated: string;
    locationCreated: string;
    characterCreated: string;
    creatureCreated: string;
    error: string;
    errorDesc: string;
    showing: string;
    of: string;
    recently: string;
    justNow: string;
  };
  
  // Settings
  settings: {
    title: string;
    subtitle: string;
    appearance: string;
    darkMode: string;
    darkModeDesc: string;
    fantasyTheme: string;
    audioNotifications: string;
    soundEffects: string;
    soundEffectsDesc: string;
    notifications: string;
    notificationsDesc: string;
    autoSave: string;
    enableAutoSave: string;
    enableAutoSaveDesc: string;
    saveInterval: string;
    dataManagement: string;
    exportAllWorlds: string;
    importWorlds: string;
    resetAllData: string;
    resetDataDesc: string;
    saveSettings: string;
    about: string;
    version: string;
    features: string;
    settingsSaved: string;
    settingsSavedDesc: string;
    exportStarted: string;
    exportStartedDesc: string;
    importFeature: string;
    importFeatureDesc: string;
    resetConfirmation: string;
    resetConfirmationDesc: string;
    language: string;
    selectLanguage: string;
  };
  
  // World Map
  worldMap: {
    title: string;
    subtitle: string;
    interactiveMap: string;
    legend: string;
    mapOverview: string;
    recentLocations: string;
    mapControls: string;
    comingSoon: string;
    features: string;
    mapAwaits: string;
    mapAwaitsDesc: string;
  };
  
  // Time
  time: {
    minute: string;
    minutes: string;
    hour: string;
    hours: string;
    day: string;
    days: string;
    week: string;
    weeks: string;
    month: string;
    months: string;
    year: string;
    years: string;
    ago: string;
  };
  
  // Languages
  languages: {
    ukrainian: string;
    english: string;
    polish: string;
  };
}

export const translations: Record<Language, Translations> = {
  uk: {
    navigation: {
      dashboard: 'Головна',
      locations: 'Локації',
      characters: 'Персонажі',
      creatures: 'Істоти',
      worldMap: 'Карта світу',
      settings: 'Налаштування',
      currentWorld: 'Поточний світ',
      recentWorlds: 'Останні світи',
    },
    header: {
      title: 'Конструктор фентезійних світів',
      saveProject: 'Зберегти проект',
      export: 'Експорт',
    },
    dashboard: {
      welcome: 'Ласкаво просимо до вашого фентезійного світу',
      subtitle: 'Створюйте, досліджуйте та керуйте своїми містичними королівствами з потужними інструментами світобудування',
      createWorld: 'Створити світ',
      addLocation: 'Додати локацію',
      createCharacter: 'Створити персонажа',
      addCreature: 'Додати істоту',
      createWorldDesc: 'Почніть будувати нове фентезійне королівство',
      addLocationDesc: 'Створюйте міста, ліси та визначні місця',
      createCharacterDesc: 'Розробляйте героїв, лиходіїв та NPC',
      addCreatureDesc: 'Створюйте монстрів та міфічних істот',
      worldStats: 'Статистика світу',
      recentActivity: 'Останні дії',
      quickHelp: 'Швидка довідка',
      recentLocations: 'Останні локації',
      recentCharacters: 'Останні персонажі',
      viewAll: 'Переглянути все',
      locations: 'Локації',
      characters: 'Персонажі',
      creatures: 'Істоти',
      totalElements: 'Всього елементів',
      noRecentActivity: 'Немає останніх дій',
      gettingStarted: 'Початок роботи',
      gettingStartedDesc: 'Почніть з створення свого першого світу або виберіть існуючий',
      worldMapHelp: 'Карта світу',
      worldMapHelpDesc: 'Візуалізуйте свій світ за допомогою нашого інтерактивного інструменту карт',
      exportShare: 'Експорт та обмін',
      exportShareDesc: 'Експортуйте свій світ як JSON або форматований текст',
      noWorldSelected: 'Світ не вибрано',
      welcomeToBuilder: 'Ласкаво просимо до Конструктора фентезійних світів',
      createFirstWorld: 'Створіть свій перший світ',
      createFirstWorldDesc: 'Створіть свій перший фентезійний світ, щоб розпочати подорож світобудування. Додавайте локації, персонажів та істот, щоб оживити своє королівство.',
      addedLocation: 'Додано локацію',
      createdCharacter: 'Створено персонажа',
    },
    forms: {
      name: 'Назва',
      description: 'Опис',
      type: 'Тип',
      dangerLevel: 'Рівень небезпеки',
      race: 'Раса',
      class: 'Клас',
      level: 'Рівень',
      abilities: 'Здібності',
      create: 'Створити',
      cancel: 'Скасувати',
      save: 'Зберегти',
      creating: 'Створення...',
      saving: 'Збереження...',
      required: 'обов\'язково',
      optional: 'необов\'язково',
      addAbility: 'Додати здібність',
    },
    worldTypes: {
      highFantasy: 'Висока фентезі',
      darkFantasy: 'Темна фентезі',
      medieval: 'Середньовічний',
      steampunk: 'Стімпанк фентезі',
      modernFantasy: 'Сучасна фентезі',
      custom: 'Користувацький',
    },
    locationTypes: {
      city: 'Місто',
      town: 'Містечко',
      village: 'Село',
      forest: 'Ліс',
      mountain: 'Гора',
      cave: 'Печера',
      castle: 'Замок',
      dungeon: 'Підземелля',
      temple: 'Храм',
      ruins: 'Руїни',
      desert: 'Пустеля',
      swamp: 'Болото',
      plains: 'Рівнини',
      river: 'Річка',
      lake: 'Озеро',
      island: 'Острів',
      tower: 'Башта',
      mine: 'Шахта',
      harbor: 'Гавань',
      market: 'Ринок',
    },
    dangerLevels: {
      safe: 'Безпечно',
      protected: 'Захищено',
      dangerous: 'Небезпечно',
      harmless: 'Нешкідливо',
      low: 'Низький',
      moderate: 'Помірний',
      high: 'Високий',
      extreme: 'Екстремальний',
      legendary: 'Легендарний',
    },
    races: {
      human: 'Людина',
      elf: 'Ельф',
      dwarf: 'Дворф',
      halfling: 'Гобіт',
      gnome: 'Гном',
      halfElf: 'Напів-ельф',
      halfOrc: 'Напів-орк',
      tiefling: 'Тіфлінг',
      dragonborn: 'Драконародження',
      orc: 'Орк',
      goblin: 'Гоблін',
      fairy: 'Фея',
      angel: 'Ангел',
      demon: 'Демон',
      vampire: 'Вампір',
      werewolf: 'Перевертень',
    },
    classes: {
      warrior: 'Воїн',
      wizard: 'Чарівник',
      rogue: 'Злодій',
      cleric: 'Священик',
      ranger: 'Рейнджер',
      bard: 'Бард',
      paladin: 'Паладін',
      sorcerer: 'Чаклун',
      warlock: 'Варлок',
      druid: 'Друїд',
      barbarian: 'Варвар',
      monk: 'Монах',
      assassin: 'Асасин',
      knight: 'Лицар',
      merchant: 'Торговець',
      scholar: 'Вчений',
      noble: 'Дворянин',
      peasant: 'Селянин',
    },
    creatureTypes: {
      dragon: 'Дракон',
      beast: 'Звір',
      undead: 'Нежить',
      demon: 'Демон',
      angel: 'Ангел',
      elemental: 'Елементаль',
      fey: 'Фея',
      giant: 'Велетень',
      goblinoid: 'Гоблін',
      humanoid: 'Гуманоїд',
      magicalBeast: 'Магічний звір',
      monster: 'Монстр',
      spirit: 'Дух',
      construct: 'Конструкт',
      aberration: 'Аберація',
      plant: 'Рослина',
      ooze: 'Слиз',
    },
    actions: {
      search: 'Пошук',
      filter: 'Фільтр',
      add: 'Додати',
      edit: 'Редагувати',
      delete: 'Видалити',
      view: 'Переглянути',
      clearFilters: 'Очистити фільтри',
      loading: 'Завантаження',
    },
    messages: {
      noResultsFound: 'Результатів не знайдено',
      noResultsDesc: 'Спробуйте змінити пошукові терміни або налаштування фільтрів.',
      noLocationsYet: 'Локацій ще немає',
      noLocationsDesc: 'Почніть будувати свій світ, додавши локації, такі як міста, ліси, гори та інші визначні місця.',
      noCharactersYet: 'Персонажів ще немає',
      noCharactersDesc: 'Оживіть свій світ, створивши персонажів, таких як герої, лиходії, торговці та інші мешканці.',
      noCreaturesYet: 'Істот ще немає',
      noCreaturesDesc: 'Заселіть свій світ захоплюючими істотами, такими як дракони, єдинороги, гобліни та інші міфічні створіння.',
      addFirstLocation: 'Додайте свою першу локацію',
      addFirstCharacter: 'Створіть свого першого персонажа',
      addFirstCreature: 'Додайте свою першу істоту',
      worldCreated: 'Світ створено',
      locationCreated: 'Локацію створено',
      characterCreated: 'Персонажа створено',
      creatureCreated: 'Істоту створено',
      error: 'Помилка',
      errorDesc: 'Не вдалося виконати дію. Спробуйте ще раз.',
      showing: 'Показано',
      of: 'з',
      recently: 'Нещодавно',
      justNow: 'Щойно',
    },
    settings: {
      title: 'Налаштування',
      subtitle: 'Налаштуйте свій досвід роботи з Конструктором фентезійних світів',
      appearance: 'Зовнішній вигляд',
      darkMode: 'Темна тема',
      darkModeDesc: 'Використовувати темну тему для інтерфейсу',
      fantasyTheme: 'Фентезійна тема',
      audioNotifications: 'Аудіо та сповіщення',
      soundEffects: 'Звукові ефекти',
      soundEffectsDesc: 'Увімкнути звукові ефекти інтерфейсу',
      notifications: 'Сповіщення',
      notificationsDesc: 'Показувати системні сповіщення',
      autoSave: 'Автозбереження',
      enableAutoSave: 'Увімкнути автозбереження',
      enableAutoSaveDesc: 'Автоматично зберігати вашу роботу',
      saveInterval: 'Інтервал збереження (хвилини)',
      dataManagement: 'Управління даними',
      exportAllWorlds: 'Експортувати всі світи',
      importWorlds: 'Імпортувати світи',
      resetAllData: 'Скинути всі дані',
      resetDataDesc: 'Це назавжди видалить всі ваші світи, персонажів та локації.',
      saveSettings: 'Зберегти налаштування',
      about: 'Про Конструктор фентезійних світів',
      version: 'Інформація про версію',
      features: 'Функції',
      settingsSaved: 'Налаштування збережено',
      settingsSavedDesc: 'Ваші уподобання успішно збережено.',
      exportStarted: 'Експорт розпочато',
      exportStartedDesc: 'Ваші дані світу готуються до завантаження.',
      importFeature: 'Функція імпорту',
      importFeatureDesc: 'Функція імпорту даних незабаром з\'явиться.',
      resetConfirmation: 'Підтвердження скидання',
      resetConfirmationDesc: 'Ця дія назавжди видалить всі дані світу.',
      language: 'Мова',
      selectLanguage: 'Виберіть мову',
    },
    worldMap: {
      title: 'Карта світу',
      subtitle: 'Візуальний огляд',
      interactiveMap: 'Інтерактивна карта',
      legend: 'Легенда',
      mapOverview: 'Огляд карти',
      recentLocations: 'Останні локації',
      mapControls: 'Елементи керування картою',
      comingSoon: 'Функції інтерактивної карти незабаром:',
      features: 'Функції',
      mapAwaits: 'Ваша карта очікує локації...',
      mapAwaitsDesc: 'Додайте локації, щоб побачити їх на карті',
    },
    time: {
      minute: 'хвилина',
      minutes: 'хвилини',
      hour: 'година',
      hours: 'години',
      day: 'день',
      days: 'дні',
      week: 'тиждень',
      weeks: 'тижні',
      month: 'місяць',
      months: 'місяці',
      year: 'рік',
      years: 'роки',
      ago: 'тому',
    },
    languages: {
      ukrainian: 'Українська',
      english: 'English',
      polish: 'Polski',
    },
  },
  
  en: {
    navigation: {
      dashboard: 'Dashboard',
      locations: 'Locations',
      characters: 'Characters',
      creatures: 'Creatures',
      worldMap: 'World Map',
      settings: 'Settings',
      currentWorld: 'Current World',
      recentWorlds: 'Recent Worlds',
    },
    header: {
      title: 'Fantasy World Builder',
      saveProject: 'Save Project',
      export: 'Export',
    },
    dashboard: {
      welcome: 'Welcome to Your Fantasy World',
      subtitle: 'Build, explore, and manage your mystical realms with powerful world-building tools',
      createWorld: 'Create World',
      addLocation: 'Add Location',
      createCharacter: 'Create Character',
      addCreature: 'Add Creature',
      createWorldDesc: 'Start building a new fantasy realm',
      addLocationDesc: 'Create cities, forests, and landmarks',
      createCharacterDesc: 'Design heroes, villains, and NPCs',
      addCreatureDesc: 'Create monsters and mythical beings',
      worldStats: 'World Statistics',
      recentActivity: 'Recent Activity',
      quickHelp: 'Quick Help',
      recentLocations: 'Recent Locations',
      recentCharacters: 'Recent Characters',
      viewAll: 'View All',
      locations: 'Locations',
      characters: 'Characters',
      creatures: 'Creatures',
      totalElements: 'Total Elements',
      noRecentActivity: 'No recent activity',
      gettingStarted: 'Getting Started',
      gettingStartedDesc: 'Begin by creating your first world or selecting an existing one',
      worldMapHelp: 'World Map',
      worldMapHelpDesc: 'Visualize your world with our interactive map tool',
      exportShare: 'Export & Share',
      exportShareDesc: 'Export your world as JSON or formatted text',
      noWorldSelected: 'No World Selected',
      welcomeToBuilder: 'Welcome to Fantasy World Builder',
      createFirstWorld: 'Create Your First World',
      createFirstWorldDesc: 'Create your first fantasy world to begin your world-building journey. Add locations, characters, and creatures to bring your realm to life.',
      addedLocation: 'Added location',
      createdCharacter: 'Created character',
    },
    forms: {
      name: 'Name',
      description: 'Description',
      type: 'Type',
      dangerLevel: 'Danger Level',
      race: 'Race',
      class: 'Class',
      level: 'Level',
      abilities: 'Abilities',
      create: 'Create',
      cancel: 'Cancel',
      save: 'Save',
      creating: 'Creating...',
      saving: 'Saving...',
      required: 'required',
      optional: 'optional',
      addAbility: 'Add ability',
    },
    worldTypes: {
      highFantasy: 'High Fantasy',
      darkFantasy: 'Dark Fantasy',
      medieval: 'Medieval',
      steampunk: 'Steampunk Fantasy',
      modernFantasy: 'Modern Fantasy',
      custom: 'Custom',
    },
    locationTypes: {
      city: 'City',
      town: 'Town',
      village: 'Village',
      forest: 'Forest',
      mountain: 'Mountain',
      cave: 'Cave',
      castle: 'Castle',
      dungeon: 'Dungeon',
      temple: 'Temple',
      ruins: 'Ruins',
      desert: 'Desert',
      swamp: 'Swamp',
      plains: 'Plains',
      river: 'River',
      lake: 'Lake',
      island: 'Island',
      tower: 'Tower',
      mine: 'Mine',
      harbor: 'Harbor',
      market: 'Market',
    },
    dangerLevels: {
      safe: 'Safe',
      protected: 'Protected',
      dangerous: 'Dangerous',
      harmless: 'Harmless',
      low: 'Low',
      moderate: 'Moderate',
      high: 'High',
      extreme: 'Extreme',
      legendary: 'Legendary',
    },
    races: {
      human: 'Human',
      elf: 'Elf',
      dwarf: 'Dwarf',
      halfling: 'Halfling',
      gnome: 'Gnome',
      halfElf: 'Half-Elf',
      halfOrc: 'Half-Orc',
      tiefling: 'Tiefling',
      dragonborn: 'Dragonborn',
      orc: 'Orc',
      goblin: 'Goblin',
      fairy: 'Fairy',
      angel: 'Angel',
      demon: 'Demon',
      vampire: 'Vampire',
      werewolf: 'Werewolf',
    },
    classes: {
      warrior: 'Warrior',
      wizard: 'Wizard',
      rogue: 'Rogue',
      cleric: 'Cleric',
      ranger: 'Ranger',
      bard: 'Bard',
      paladin: 'Paladin',
      sorcerer: 'Sorcerer',
      warlock: 'Warlock',
      druid: 'Druid',
      barbarian: 'Barbarian',
      monk: 'Monk',
      assassin: 'Assassin',
      knight: 'Knight',
      merchant: 'Merchant',
      scholar: 'Scholar',
      noble: 'Noble',
      peasant: 'Peasant',
    },
    creatureTypes: {
      dragon: 'Dragon',
      beast: 'Beast',
      undead: 'Undead',
      demon: 'Demon',
      angel: 'Angel',
      elemental: 'Elemental',
      fey: 'Fey',
      giant: 'Giant',
      goblinoid: 'Goblinoid',
      humanoid: 'Humanoid',
      magicalBeast: 'Magical Beast',
      monster: 'Monster',
      spirit: 'Spirit',
      construct: 'Construct',
      aberration: 'Aberration',
      plant: 'Plant',
      ooze: 'Ooze',
    },
    actions: {
      search: 'Search',
      filter: 'Filter',
      add: 'Add',
      edit: 'Edit',
      delete: 'Delete',
      view: 'View',
      clearFilters: 'Clear Filters',
      loading: 'Loading',
    },
    messages: {
      noResultsFound: 'No Results Found',
      noResultsDesc: 'Try adjusting your search terms or filter settings.',
      noLocationsYet: 'No Locations Yet',
      noLocationsDesc: 'Start building your world by adding locations like cities, forests, mountains, and other landmarks.',
      noCharactersYet: 'No Characters Yet',
      noCharactersDesc: 'Bring your world to life by creating characters like heroes, villains, merchants, and other inhabitants.',
      noCreaturesYet: 'No Creatures Yet',
      noCreaturesDesc: 'Populate your world with fascinating creatures like dragons, unicorns, goblins, and other mythical beings.',
      addFirstLocation: 'Add Your First Location',
      addFirstCharacter: 'Create Your First Character',
      addFirstCreature: 'Add Your First Creature',
      worldCreated: 'World Created',
      locationCreated: 'Location Created',
      characterCreated: 'Character Created',
      creatureCreated: 'Creature Created',
      error: 'Error',
      errorDesc: 'Failed to perform action. Please try again.',
      showing: 'Showing',
      of: 'of',
      recently: 'Recently',
      justNow: 'Just now',
    },
    settings: {
      title: 'Settings',
      subtitle: 'Customize your Fantasy World Builder experience',
      appearance: 'Appearance',
      darkMode: 'Dark Mode',
      darkModeDesc: 'Use dark theme for the interface',
      fantasyTheme: 'Fantasy Theme',
      audioNotifications: 'Audio & Notifications',
      soundEffects: 'Sound Effects',
      soundEffectsDesc: 'Enable UI sound effects',
      notifications: 'Notifications',
      notificationsDesc: 'Show system notifications',
      autoSave: 'Auto-Save',
      enableAutoSave: 'Enable Auto-Save',
      enableAutoSaveDesc: 'Automatically save your work',
      saveInterval: 'Save Interval (minutes)',
      dataManagement: 'Data Management',
      exportAllWorlds: 'Export All Worlds',
      importWorlds: 'Import Worlds',
      resetAllData: 'Reset All Data',
      resetDataDesc: 'This will permanently delete all your worlds, characters, and locations.',
      saveSettings: 'Save Settings',
      about: 'About Fantasy World Builder',
      version: 'Version Information',
      features: 'Features',
      settingsSaved: 'Settings Saved',
      settingsSavedDesc: 'Your preferences have been saved successfully.',
      exportStarted: 'Export Started',
      exportStartedDesc: 'Your world data is being prepared for download.',
      importFeature: 'Import Feature',
      importFeatureDesc: 'Data import functionality coming soon.',
      resetConfirmation: 'Reset Confirmation',
      resetConfirmationDesc: 'This action would permanently delete all world data.',
      language: 'Language',
      selectLanguage: 'Select Language',
    },
    worldMap: {
      title: 'World Map',
      subtitle: 'Visual overview of',
      interactiveMap: 'Interactive Map',
      legend: 'Legend',
      mapOverview: 'Map Overview',
      recentLocations: 'Recent Locations',
      mapControls: 'Map Controls',
      comingSoon: 'Interactive map features coming soon:',
      features: 'Features',
      mapAwaits: 'Your map awaits locations...',
      mapAwaitsDesc: 'Add locations to see them appear on the map',
    },
    time: {
      minute: 'minute',
      minutes: 'minutes',
      hour: 'hour',
      hours: 'hours',
      day: 'day',
      days: 'days',
      week: 'week',
      weeks: 'weeks',
      month: 'month',
      months: 'months',
      year: 'year',
      years: 'years',
      ago: 'ago',
    },
    languages: {
      ukrainian: 'Українська',
      english: 'English',
      polish: 'Polski',
    },
  },
  
  pl: {
    navigation: {
      dashboard: 'Panel główny',
      locations: 'Lokacje',
      characters: 'Postacie',
      creatures: 'Stworzenia',
      worldMap: 'Mapa świata',
      settings: 'Ustawienia',
      currentWorld: 'Obecny świat',
      recentWorlds: 'Ostatnie światy',
    },
    header: {
      title: 'Kreator światów fantasy',
      saveProject: 'Zapisz projekt',
      export: 'Eksport',
    },
    dashboard: {
      welcome: 'Witaj w swoim świecie fantasy',
      subtitle: 'Buduj, eksploruj i zarządzaj swoimi mistycznymi królestwami dzięki potężnym narzędziom do tworzenia światów',
      createWorld: 'Stwórz świat',
      addLocation: 'Dodaj lokację',
      createCharacter: 'Stwórz postać',
      addCreature: 'Dodaj stworzenie',
      createWorldDesc: 'Zacznij budować nowe królestwo fantasy',
      addLocationDesc: 'Twórz miasta, lasy i punkty orientacyjne',
      createCharacterDesc: 'Projektuj bohaterów, złoczyńców i NPC',
      addCreatureDesc: 'Twórz potwory i mityczne istoty',
      worldStats: 'Statystyki świata',
      recentActivity: 'Ostatnia aktywność',
      quickHelp: 'Szybka pomoc',
      recentLocations: 'Ostatnie lokacje',
      recentCharacters: 'Ostatnie postacie',
      viewAll: 'Zobacz wszystko',
      locations: 'Lokacje',
      characters: 'Postacie',
      creatures: 'Stworzenia',
      totalElements: 'Wszystkie elementy',
      noRecentActivity: 'Brak ostatniej aktywności',
      gettingStarted: 'Pierwsze kroki',
      gettingStartedDesc: 'Zacznij od stworzenia swojego pierwszego świata lub wybierz istniejący',
      worldMapHelp: 'Mapa świata',
      worldMapHelpDesc: 'Wizualizuj swój świat za pomocą naszego interaktywnego narzędzia mapowego',
      exportShare: 'Eksport i udostępnianie',
      exportShareDesc: 'Eksportuj swój świat jako JSON lub sformatowany tekst',
      noWorldSelected: 'Nie wybrano świata',
      welcomeToBuilder: 'Witaj w Kreatorze światów fantasy',
      createFirstWorld: 'Stwórz swój pierwszy świat',
      createFirstWorldDesc: 'Stwórz swój pierwszy świat fantasy, aby rozpocząć swoją podróż tworzenia światów. Dodawaj lokacje, postacie i stworzenia, aby ożywić swoje królestwo.',
      addedLocation: 'Dodano lokację',
      createdCharacter: 'Stworzono postać',
    },
    forms: {
      name: 'Nazwa',
      description: 'Opis',
      type: 'Typ',
      dangerLevel: 'Poziom niebezpieczeństwa',
      race: 'Rasa',
      class: 'Klasa',
      level: 'Poziom',
      abilities: 'Umiejętności',
      create: 'Stwórz',
      cancel: 'Anuluj',
      save: 'Zapisz',
      creating: 'Tworzenie...',
      saving: 'Zapisywanie...',
      required: 'wymagane',
      optional: 'opcjonalne',
      addAbility: 'Dodaj umiejętność',
    },
    worldTypes: {
      highFantasy: 'Wysoka fantasy',
      darkFantasy: 'Mroczna fantasy',
      medieval: 'Średniowieczny',
      steampunk: 'Steampunk fantasy',
      modernFantasy: 'Nowoczesna fantasy',
      custom: 'Niestandardowy',
    },
    locationTypes: {
      city: 'Miasto',
      town: 'Miasteczko',
      village: 'Wioska',
      forest: 'Las',
      mountain: 'Góra',
      cave: 'Jaskinia',
      castle: 'Zamek',
      dungeon: 'Lochy',
      temple: 'Świątynia',
      ruins: 'Ruiny',
      desert: 'Pustynia',
      swamp: 'Bagno',
      plains: 'Równiny',
      river: 'Rzeka',
      lake: 'Jezioro',
      island: 'Wyspa',
      tower: 'Wieża',
      mine: 'Kopalnia',
      harbor: 'Port',
      market: 'Rynek',
    },
    dangerLevels: {
      safe: 'Bezpieczne',
      protected: 'Chronione',
      dangerous: 'Niebezpieczne',
      harmless: 'Nieszkodliwe',
      low: 'Niski',
      moderate: 'Umiarkowany',
      high: 'Wysoki',
      extreme: 'Ekstremalny',
      legendary: 'Legendarny',
    },
    races: {
      human: 'Człowiek',
      elf: 'Elf',
      dwarf: 'Krasnolud',
      halfling: 'Niziołek',
      gnome: 'Gnom',
      halfElf: 'Pół-elf',
      halfOrc: 'Pół-ork',
      tiefling: 'Tiefling',
      dragonborn: 'Smoczorodny',
      orc: 'Ork',
      goblin: 'Goblin',
      fairy: 'Wróżka',
      angel: 'Anioł',
      demon: 'Demon',
      vampire: 'Wampir',
      werewolf: 'Wilkołak',
    },
    classes: {
      warrior: 'Wojownik',
      wizard: 'Czarodziej',
      rogue: 'Łotrzyk',
      cleric: 'Kleryk',
      ranger: 'Strażnik',
      bard: 'Bard',
      paladin: 'Paladyn',
      sorcerer: 'Czarnoksiężnik',
      warlock: 'Warlock',
      druid: 'Druid',
      barbarian: 'Barbarzyńca',
      monk: 'Mnich',
      assassin: 'Asasyn',
      knight: 'Rycerz',
      merchant: 'Kupiec',
      scholar: 'Uczony',
      noble: 'Szlachcic',
      peasant: 'Chłop',
    },
    creatureTypes: {
      dragon: 'Smok',
      beast: 'Bestia',
      undead: 'Nieumarły',
      demon: 'Demon',
      angel: 'Anioł',
      elemental: 'Elementał',
      fey: 'Wróżka',
      giant: 'Olbrzym',
      goblinoid: 'Goblinoid',
      humanoid: 'Humanoid',
      magicalBeast: 'Magiczna bestia',
      monster: 'Potwór',
      spirit: 'Duch',
      construct: 'Konstrukt',
      aberration: 'Aberracja',
      plant: 'Roślina',
      ooze: 'Szlam',
    },
    actions: {
      search: 'Szukaj',
      filter: 'Filtr',
      add: 'Dodaj',
      edit: 'Edytuj',
      delete: 'Usuń',
      view: 'Zobacz',
      clearFilters: 'Wyczyść filtry',
      loading: 'Ładowanie',
    },
    messages: {
      noResultsFound: 'Nie znaleziono wyników',
      noResultsDesc: 'Spróbuj dostosować terminy wyszukiwania lub ustawienia filtrów.',
      noLocationsYet: 'Jeszcze brak lokacji',
      noLocationsDesc: 'Zacznij budować swój świat, dodając lokacje takie jak miasta, lasy, góry i inne punkty orientacyjne.',
      noCharactersYet: 'Jeszcze brak postaci',
      noCharactersDesc: 'Ożyw swój świat, tworząc postacie takie jak bohaterowie, złoczyńcy, kupcy i inni mieszkańcy.',
      noCreaturesYet: 'Jeszcze brak stworzeń',
      noCreaturesDesc: 'Zaludnij swój świat fascynującymi stworzeniami takimi jak smoki, jednorożce, gobliny i inne mityczne istoty.',
      addFirstLocation: 'Dodaj swoją pierwszą lokację',
      addFirstCharacter: 'Stwórz swoją pierwszą postać',
      addFirstCreature: 'Dodaj swoje pierwsze stworzenie',
      worldCreated: 'Świat utworzony',
      locationCreated: 'Lokacja utworzona',
      characterCreated: 'Postać utworzona',
      creatureCreated: 'Stworzenie utworzone',
      error: 'Błąd',
      errorDesc: 'Nie udało się wykonać działania. Spróbuj ponownie.',
      showing: 'Pokazywanie',
      of: 'z',
      recently: 'Niedawno',
      justNow: 'Właśnie teraz',
    },
    settings: {
      title: 'Ustawienia',
      subtitle: 'Dostosuj swoje doświadczenie z Kreatorem światów fantasy',
      appearance: 'Wygląd',
      darkMode: 'Tryb ciemny',
      darkModeDesc: 'Użyj ciemnego motywu dla interfejsu',
      fantasyTheme: 'Motyw fantasy',
      audioNotifications: 'Dźwięk i powiadomienia',
      soundEffects: 'Efekty dźwiękowe',
      soundEffectsDesc: 'Włącz efekty dźwiękowe interfejsu',
      notifications: 'Powiadomienia',
      notificationsDesc: 'Pokaż powiadomienia systemowe',
      autoSave: 'Automatyczny zapis',
      enableAutoSave: 'Włącz automatyczny zapis',
      enableAutoSaveDesc: 'Automatycznie zapisuj swoją pracę',
      saveInterval: 'Interwał zapisu (minuty)',
      dataManagement: 'Zarządzanie danymi',
      exportAllWorlds: 'Eksportuj wszystkie światy',
      importWorlds: 'Importuj światy',
      resetAllData: 'Resetuj wszystkie dane',
      resetDataDesc: 'To na stałe usunie wszystkie twoje światy, postacie i lokacje.',
      saveSettings: 'Zapisz ustawienia',
      about: 'O Kreatorze światów fantasy',
      version: 'Informacje o wersji',
      features: 'Funkcje',
      settingsSaved: 'Ustawienia zapisane',
      settingsSavedDesc: 'Twoje preferencje zostały pomyślnie zapisane.',
      exportStarted: 'Eksport rozpoczęty',
      exportStartedDesc: 'Twoje dane światów są przygotowywane do pobrania.',
      importFeature: 'Funkcja importu',
      importFeatureDesc: 'Funkcja importu danych pojawi się wkrótce.',
      resetConfirmation: 'Potwierdzenie resetowania',
      resetConfirmationDesc: 'Ta akcja na stałe usunie wszystkie dane światów.',
      language: 'Język',
      selectLanguage: 'Wybierz język',
    },
    worldMap: {
      title: 'Mapa świata',
      subtitle: 'Wizualny przegląd',
      interactiveMap: 'Interaktywna mapa',
      legend: 'Legenda',
      mapOverview: 'Przegląd mapy',
      recentLocations: 'Ostatnie lokacje',
      mapControls: 'Kontrolki mapy',
      comingSoon: 'Funkcje interaktywnej mapy wkrótce:',
      features: 'Funkcje',
      mapAwaits: 'Twoja mapa czeka na lokacje...',
      mapAwaitsDesc: 'Dodaj lokacje, aby zobaczyć je na mapie',
    },
    time: {
      minute: 'minuta',
      minutes: 'minuty',
      hour: 'godzina',
      hours: 'godziny',
      day: 'dzień',
      days: 'dni',
      week: 'tydzień',
      weeks: 'tygodnie',
      month: 'miesiąc',
      months: 'miesiące',
      year: 'rok',
      years: 'lata',
      ago: 'temu',
    },
    languages: {
      ukrainian: 'Українська',
      english: 'English',
      polish: 'Polski',
    },
  },
};

export const useTranslation = () => {
  const { language } = useI18n();
  return translations[language];
};