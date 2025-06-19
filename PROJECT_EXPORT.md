# Fantasy World Builder - Export Guide

## Інструкція для завантаження проекту на GitHub

1. Створіть папку `FantasyWorldBuilder2` на вашому комп'ютері
2. Скопіюйте всі файли з цього списку у відповідні папки
3. Структура проекту:

```
FantasyWorldBuilder2/
├── package.json
├── package-lock.json
├── .gitignore
├── .replit
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.ts
├── postcss.config.js
├── components.json
├── drizzle.config.ts
├── client/
│   ├── index.html
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       ├── index.css
│       ├── lib/
│       │   ├── queryClient.ts
│       │   ├── i18n.ts
│       │   └── utils.ts
│       ├── components/
│       │   ├── ui/
│       │   │   └── language-selector.tsx
│       │   ├── layout/
│       │   │   ├── header.tsx
│       │   │   └── sidebar.tsx
│       │   ├── cards/
│       │   │   ├── character-card.tsx
│       │   │   ├── creature-card.tsx
│       │   │   └── location-card.tsx
│       │   └── modals/
│       │       ├── create-world-modal.tsx
│       │       ├── create-location-modal.tsx
│       │       ├── create-character-modal.tsx
│       │       └── create-creature-modal.tsx
│       ├── pages/
│       │   ├── dashboard.tsx
│       │   ├── characters.tsx
│       │   ├── creatures.tsx
│       │   ├── locations.tsx
│       │   ├── settings.tsx
│       │   ├── world-map.tsx
│       │   └── not-found.tsx
│       └── hooks/
│           ├── use-mobile.tsx
│           └── use-toast.ts
├── server/
│   ├── index.ts
│   ├── routes.ts
│   ├── storage.ts
│   └── vite.ts
└── shared/
    └── schema.ts
```

## Команди для запуску після завантаження:

```bash
cd FantasyWorldBuilder2
npm install
npm run dev
```

Нижче знаходяться всі файли проекту для копіювання.