# Етап 10: RPG інтеграції - Покроковий план

## 📋 ЗАГАЛЬНИЙ ОГЛЯД

**Мета**: Перетворити Fantasy World Builder на професійний інструмент для майстрів гри з інтеграцією популярних RPG систем.

**Тривалість**: 3-4 тижні  
**Складність**: Висока (інтеграція зовнішніх API та ігрових механік)

---

## 🎲 КРОК 1: D&D 5e Статблоки (Дні 1-3)

### Технічна реалізація:
```typescript
// Нова схема БД
statblocks (
  id, entity_id, system, 
  hp, ac, speed, str, dex, con, int, wis, cha,
  saving_throws, skills, damage_resistances,
  senses, languages, challenge_rating, attacks
)
```

### Компоненти:
- `StatblockGenerator.tsx` - UI для створення статблоків
- `DnD5eConverter.tsx` - конвертація персонажів у D&D формат
- `MonsterManual.tsx` - база даних створінь з статблоками

### API інтеграція:
- Open5e API для SRD даних
- Автоматичний CR розрахунок
- Експорт у D&D Beyond формат

---

## ⚔️ КРОК 2: Encounter Builder (Дні 4-6)

### Механіки:
- **CR балансування** - автоматичний розрахунок складності бою
- **Action Economy** - аналіз дій у раунді
- **Terrain модифікатори** - вплив місцевості на бій
- **Treasure розподіл** - автоматична генерація нагород

### Компоненти:
- `EncounterBuilder.tsx` - конструктор зустрічей
- `TreasureGenerator.tsx` - генератор скарбів
- `TrapDesigner.tsx` - створення пасток

---

## 🎯 КРОК 3: VTT інтеграція (Дні 7-9)

### Roll20 експорт:
```json
{
  "name": "Fantasy World",
  "maps": [...],
  "characters": [...],
  "handouts": [...]
}
```

### Foundry VTT:
- Компендіуми для акторів, предметів, заклинань
- Модульна система з автоматичним інсталятором
- World пакети з повною інтеграцією

### Компоненти:
- `VTTExporter.tsx` - вибір формату та налаштувань
- `MapExporter.tsx` - конвертація карт із сіткою
- `TokenGenerator.tsx` - автоматичні токени

---

## 🎲 КРОК 4: Універсальний Dice Roller (Дні 10-11)

### Підтримувані системи:
- **D&D/Pathfinder**: d20 + модифікатори
- **World of Darkness**: dice pools з успіхами
- **FATE**: Fudge кубики ±
- **Savage Worlds**: exploding dice

### Компоненти:
- `DiceRoller.tsx` - універсальний роллер
- `MacroManager.tsx` - збережені формули
- `ProbabilityCalculator.tsx` - аналіз ймовірностей

---

## 🏰 КРОК 5: Campaign Management (Дні 12-14)

### Функціональність:
- **Session Tracker** - планування та нотатки сесій
- **Player Handouts** - матеріали для гравців
- **Quest Log** - відстеження завдань
- **XP Calculator** - розподіл досвіду

### База даних:
```sql
campaigns (id, world_id, name, start_date, status)
sessions (id, campaign_id, date, notes, participants, xp_awarded)
quests (id, campaign_id, name, status, rewards, description)
handouts (id, session_id, title, content, player_visible)
```

---

## 🔧 КРОК 6: Pathfinder підтримка (Дні 15-16)

### Особливості PF2e:
- **Three Action Economy** 
- **Ancestry/Background/Class** структура
- **Degrees of Success** (критичні успіхи/невдачі)
- **Hazards** замість простих пасток

### Конвертація:
- D&D → Pathfinder статблоки
- Автоматичний розрахунок PF2e DC
- Spell конвертація між системами

---

## 🔌 КРОК 7: API та розширення (Дні 17-18)

### Відкритий API:
```typescript
/api/rpg/statblock/{entityId}/{system}
/api/rpg/encounter/generate
/api/rpg/export/{format}
/api/rpg/dice/roll
```

### Webhook інтеграції:
- Discord bot для dice rolling
- Slack сповіщення про сесії
- Auto-backup після кожної сесії

---

## 📊 ТЕХНІЧНІ ВИМОГИ

### Нові залежності:
```bash
npm install --save
  dice-roller      # Універсальний dice engine
  jspdf-autotable  # PDF таблиці для статблоків  
  xml2js           # Roll20 XML експорт
  archiver         # ZIP архіви для Foundry
```

### Database міграції:
- 4 нові таблиці для RPG даних
- Індекси для швидкого пошуку
- Foreign keys для цілісності

### Performance оптимізації:
- Кешування статблоків
- Lazy loading великих компендіумів
- Background processing для експорту

---

## 🎯 КРИТЕРІЇ УСПІХУ

1. **Функціональність**:
   - Генерація D&D статблоків за 30 секунд
   - Експорт у Roll20 без помилок
   - Балансування зустрічей з точністю 90%

2. **Юзабіліті**:
   - Інтуїтивний інтерфейс для майстрів гри
   - Швидкий експорт (< 2 хвилини)
   - Підтримка українських назв у статблоках

3. **Інтеграція**:
   - Сумісність з Roll20 та Foundry VTT
   - API для сторонніх розробників
   - Discord/Slack боти працюють

---

## 🚀 ПЛАН ВПРОВАДЖЕННЯ

**Тиждень 1**: Кроки 1-2 (D&D статблоки + Encounter Builder)
**Тиждень 2**: Кроки 3-4 (VTT експорт + Dice Roller)  
**Тиждень 3**: Кроки 5-6 (Campaign Management + Pathfinder)
**Тиждень 4**: Крок 7 + тестування (API + багфікси)

**Готовий продукт**: Professional RPG toolkit для майстрів гри з повною інтеграцією VTT платформ.