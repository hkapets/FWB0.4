# Етап 10: RPG інтеграції та ігрові механіки

## Загальна мета
Інтегрувати Fantasy World Builder з популярними RPG системами та додати ігрові механіки для майстрів гри.

## 10.1 D&D 5e інтеграція (1 тиждень)

### Крок 1: Статблоки D&D
- **Monster Manual генератор** - автоматичні статблоки з HP, AC, атаки
- **NPC статистики** - конвертація персонажів у готові NPC
- **CR розрахунок** - автоматичний Challenge Rating
- **Spell список** - інтеграція заклинань з описами

### Крок 2: Encounter Builder
- **Бій-калькулятор** - балансування зустрічей за CR
- **Treasure генератор** - випадкові скарби за рівнем
- **Trap конструктор** - створення пасток з механіками
- **Loot таблиці** - налаштовувані таблиці дропу

### Крок 3: Campaign управління
- **Session трекер** - планування та нотатки сесій
- **Player handouts** - роздатковий матеріал для гравців
- **Quest log** - відстеження завдань та прогресу
- **XP калькулятор** - розподіл досвіду

## 10.2 Roll20/Foundry VTT експорт (5 днів)

### Крок 4: VTT формати
- **Roll20 JSON** - експорт карт та токенів
- **Foundry DB** - компендіуми для Foundry VTT
- **Module генератор** - готові модулі для встановлення
- **Asset менеджер** - зображення та звуки для VTT

### Крок 5: Карти для VTT
- **Battlemap експорт** - сітка та масштаб для бою
- **Token створення** - автоматичні токени персонажів
- **Dynamic lighting** - налаштування освітлення
- **Wall генератор** - автоматичні стіни та двері

## 10.3 Dice системи та автоматизація (5 днів)

### Крок 6: Вбудований Dice Roller
- **Підтримка систем** - D&D, Pathfinder, World of Darkness
- **Macro система** - збережені комбінації кубиків
- **Probability калькулятор** - аналіз ймовірностей
- **Roll історія** - збереження всіх кидків

### Крок 7: Генератори та таблиці
- **Random encounters** - випадкові зустрічі за біомом
- **Name генератори** - імена за расою та культурою
- **Weather система** - погода та сезони
- **Rumor tables** - чутки та інформація

## 10.4 Інші RPG системи (3 дні)

### Крок 8: Pathfinder підтримка
- **Статблоки PF2e** - конвертація у Pathfinder формат
- **Ancestry створення** - раси з traits та abilities
- **Hazard генератор** - небезпеки та пастки PF стилю

### Крок 9: Universal RPG підтримка
- **FATE Core** - експорт аспектів та skill pyramid
- **Savage Worlds** - конвертація у SW статистики
- **Custom systems** - налаштовувані RPG шаблони

## 10.5 API та розширення (2 дні)

### Крок 10: Plugin система
- **API endpoints** - відкритий API для розробників
- **Webhook система** - інтеграція з Discord/Slack
- **Third-party tools** - підключення інших інструментів
- **Community marketplace** - магазин розширень

## Технічні компоненти

### Database схеми
```sql
-- Статблоки D&D
statblocks (id, entity_id, system, hp, ac, attacks, abilities, cr, type)

-- Сесії та кампанії  
sessions (id, world_id, date, notes, participants, xp_awarded)
encounters (id, session_id, creatures, cr_total, treasure)

-- Dice макроси
dice_macros (id, name, formula, description, user_id)
roll_history (id, macro_id, result, timestamp, context)
```

### Frontend компоненти
- `StatblockGenerator.tsx` - D&D статблоки
- `EncounterBuilder.tsx` - конструктор зустрічей  
- `DiceRoller.tsx` - система кубиків
- `VTTExporter.tsx` - експорт для VTT
- `CampaignTracker.tsx` - управління кампанією

### API інтеграції
- D&D 5e SRD API - офіційні дані
- Open5e API - розширена база заклинань
- Roll20 API - експорт карт
- Foundry VTT modules - готові пакети

## Результат етапу
Повноцінна RPG платформа з підтримкою основних систем, готова для використання майстрами гри з експортом у популярні VTT платформи.

## Тестування
- Генерація статблоків для різних систем
- Експорт кампанії в Roll20
- Балансування зустрічей за CR
- Інтеграція з Discord для dice rolling