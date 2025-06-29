# Multi-stage build для оптимізації розміру
FROM node:18-alpine AS base

# Встановлюємо залежності для SQLite
RUN apk add --no-cache sqlite

# Встановлюємо залежності для збірки
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Збірка клієнта
FROM base AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Фінальний образ
FROM base AS runner
WORKDIR /app

# Створюємо користувача для безпеки
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Копіюємо залежності
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public

# Створюємо директорію для даних
RUN mkdir -p /app/data && chown nextjs:nodejs /app/data

# Копіюємо конфігураційні файли
COPY --from=builder /app/config.ts ./
COPY --from=builder /app/package.json ./

# Переключаємося на користувача
USER nextjs

# Відкриваємо порт
EXPOSE 8080

# Змінні середовища за замовчуванням
ENV NODE_ENV=production
ENV STORAGE_TYPE=sqlite
ENV SQLITE_PATH=/app/data/worlds.db
ENV PORT=8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/api/health || exit 1

# Запуск додатку
CMD ["node", "dist/index.js"]