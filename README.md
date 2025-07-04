# 🌟 Fantasy World Builder

Потужний інструмент для створення та управління фентезійними світами. Підтримує онлайн та офлайн режими роботи без платних API.

## ✨ Особливості

- **🖥️ Офлайн режим** - SQLite + локальний Ollama (безкоштовно)
- **☁️ Онлайн режим** - PostgreSQL + Ollama (для production)
- **🎯 Демо режим** - In-memory зберігання (для тестування)
- **🤖 ШІ інтеграція** - Ollama для локального ШІ без платних API
- **🌍 Мультимовність** - Українська, англійська, польська
- **📱 Адаптивний дизайн** - Працює на всіх пристроях
- **🎨 Фентезійна тема** - Красивий темний інтерфейс

## 🚀 Швидкий старт

### Вимоги

- Node.js 18+
- Ollama (опціонально для ШІ функцій)

### Встановлення

```bash
# Клонування репозиторію
git clone <repository-url>
cd fantasy-world-builder

# Встановлення залежностей
npm install

# Швидкий тест системи
npm run test:quick

# Збірка проекту
npm run build

# Запуск в офлайн режимі (рекомендований)
npm run start:offline
```

### Налаштування Ollama (для ШІ функцій)

```bash
# Встановлення Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# Запуск Ollama
ollama serve

# Завантаження моделей (в новому терміналі)
ollama pull mistral
ollama pull llama2
```

### Доступ

- **Веб-інтерфейс**: http://localhost:3001
- **API**: http://localhost:3001/api
- **База даних**: `./data/offline-worlds.db`

## 🐳 Docker розгортання (Найпростіший спосіб)

### Швидкий старт з Docker

```bash
# Запуск з SQLite (безкоштовно)
docker-compose up -d

# Запуск з PostgreSQL
docker-compose --profile postgres up -d

# Запуск демо версії
docker-compose --profile demo up -d
```

### Доступ

- **SQLite версія**: http://localhost:8080
- **PostgreSQL версія**: http://localhost:8081
- **Демо версія**: http://localhost:8082

## 📋 Режими роботи

### Development

```bash
npm run dev
```

### Offline (SQLite) - Рекомендований

```bash
npm run start:offline
```

### Production (PostgreSQL)

```bash
npm run start:postgres
```

### Demo (In-memory)

```bash
npm run start:demo
```

## 🎮 Основні функції

### 1. Управління світами

- Створення світів з шаблонів
- Мультимовна підтримка
- Експорт/імпорт світів
- Глобальний пошук

### 2. Система лору (8 розділів)

- **Географія**: локації, регіони, картини
- **Бестіарій**: створіння, монстри
- **Система магії**: заклинання, школи магії
- **Артефакти**: магічні предмети
- **Події**: історичні події, часові лінії
- **Раси**: фентезійні раси
- **Системи письма**: мови, скрипти
- **Політика**: уряди, фракції

### 3. Управління персонажами

- Детальні профілі з відносинами
- Класи та прогресія
- Родинні дерева
- Завантаження портретів

### 4. ШІ-Асистент

- Генератор імен
- Генератор описів
- Аналіз зв'язків
- Генерація подій

### 5. RPG Інструменти

- D&D статблоки
- Калькулятор зустрічей
- Система кидання кубиків
- Експорт у VTT

## ⚙️ Конфігурація

### Змінні середовища

| Змінна         | Опис                 | За замовчуванням         |
| -------------- | -------------------- | ------------------------ |
| `NODE_ENV`     | Середовище           | `development`            |
| `APP_MODE`     | Режим додатку        | `development`            |
| `STORAGE_TYPE` | Тип зберігання       | `sqlite`                 |
| `DATABASE_URL` | URL PostgreSQL       | -                        |
| `SQLITE_PATH`  | Шлях до SQLite файлу | `./data/worlds.db`       |
| `AI_PROVIDER`  | Провайдер ШІ         | `ollama`                 |
| `OLLAMA_URL`   | URL Ollama           | `http://localhost:11434` |
| `PORT`         | Порт сервера         | `8080`                   |

## 🔧 Налаштування бази даних

### SQLite (Автоматично)

- Файл створюється автоматично
- Розташування: `./data/worlds.db`
- Міграції виконуються автоматично

### PostgreSQL

```bash
# Створення бази даних
createdb fantasy_worlds

# Запуск міграцій
npm run db:push
```

## 🎯 ШІ інтеграція

### Ollama (Рекомендований)

```bash
# Встановлення
curl -fsSL https://ollama.ai/install.sh | sh

# Запуск
ollama serve

# Завантаження моделей
ollama pull mistral
ollama pull llama2
ollama pull codellama
```

### Без ШІ

Встановіть `AI_PROVIDER=none` для роботи без ШІ функцій.

## 📊 Моніторинг

### Health Check

```bash
curl http://localhost:8080/api/health
```

### Логи

```bash
# Docker
docker-compose logs -f fantasy-world-builder

# Локально
npm run start:offline
```

## 🚨 Вирішення проблем

### Помилка з'єднання з базою даних

```bash
# Перевірте змінні середовища
echo $DATABASE_URL

# Перевірте підключення
psql $DATABASE_URL -c "SELECT 1"
```

### Ollama не працює

```bash
# Перевірте статус
curl http://localhost:11434/api/tags

# Перезапустіть
ollama serve
```

### Порт зайнятий

```bash
# Змініть порт
PORT=3001 npm run start:offline
```

## 📈 Масштабування

### Горизонтальне масштабування

- Використовуйте PostgreSQL
- Налаштуйте Redis для кешування
- Використовуйте CDN для статичних файлів

### Вертикальне масштабування

- Збільшіть ресурси сервера
- Оптимізуйте запити до бази даних
- Використовуйте кешування

## 🎉 Готово!

Ваш Fantasy World Builder готовий до використання!

**Наступні кроки:**

1. Відкрийте веб-інтерфейс
2. Створіть свій перший світ
3. Налаштуйте Ollama для ШІ функцій
4. Насолоджуйтесь створенням фентезійних світів!

## 📚 Документація

- [Гід по розгортанню](DEPLOYMENT_GUIDE.md)
- [Огляд проекту](PROJECT_OVERVIEW_UA.md)
- [API документація](openapi.json)

## 🤝 Підтримка

- Створіть issue в GitHub для допомоги
- Дивіться `/docs` для детальної інформації
- Перевірте [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) для розгортання

## 📄 Ліцензія

MIT License - дивіться [LICENSE](LICENSE) файл для деталей.

---

**Fantasy World Builder** - Створюйте неймовірні фентезійні світи без обмежень! 🌟
