# 🚀 Гід по розгортанню Fantasy World Builder

## 📋 Огляд

Fantasy World Builder підтримує кілька режимів розгортання:

- **🖥️ Офлайн режим** - SQLite + локальний Ollama (безкоштовно)
- **☁️ Онлайн режим** - PostgreSQL + Ollama (для production)
- **🎯 Демо режим** - In-memory зберігання (для тестування)
- **🐳 Docker** - Легке розгортання в контейнерах

## 🖥️ Офлайн режим (Рекомендований)

### Вимоги

- Node.js 18+
- Ollama (опціонально для ШІ)

### Встановлення

```bash
# Клонування репозиторію
git clone <repository-url>
cd fantasy-world-builder

# Встановлення залежностей
npm install

# Збірка проекту
npm run build

# Запуск в офлайн режимі
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

## 🐳 Docker розгортання

### Швидкий старт

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

### Збірка власного образу

```bash
# Збірка
docker build -t fantasy-world-builder .

# Запуск
docker run -p 8080:8080 fantasy-world-builder
```

## ☁️ Хмарне розгортання

### Railway (Рекомендований)

```bash
# Встановлення Railway CLI
npm install -g @railway/cli

# Логін
railway login

# Ініціалізація проекту
railway init

# Додавання змінних середовища
railway variables set NODE_ENV=production
railway variables set STORAGE_TYPE=postgresql
railway variables set DATABASE_URL=${{Postgres.DATABASE_URL}}

# Деплой
railway up
```

### Render

```bash
# Створення нового Web Service
# Connect your GitHub repository
# Environment variables:
NODE_ENV=production
STORAGE_TYPE=postgresql
DATABASE_URL=<your-postgres-url>
```

### Vercel

```bash
# Встановлення Vercel CLI
npm install -g vercel

# Деплой
vercel --prod
```

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

### Режими додатку

#### Development

```bash
npm run dev
```

#### Offline (SQLite)

```bash
npm run start:offline
```

#### Production (PostgreSQL)

```bash
npm run start:postgres
```

#### Demo (In-memory)

```bash
npm run start:demo
```

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

# Або вручну
psql -d fantasy_worlds -f migrations/001_initial.sql
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

## 🔒 Безпека

### Production налаштування

- Використовуйте HTTPS
- Налаштуйте CORS
- Обмежте доступ до API
- Використовуйте змінні середовища для секретів

### Docker безпека

- Не запускайте як root
- Використовуйте .dockerignore
- Оновлюйте базові образи

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

---

**Підтримка**: Створіть issue в GitHub для допомоги
**Документація**: Дивіться `/docs` для детальної інформації
