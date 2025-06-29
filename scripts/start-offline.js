#!/usr/bin/env node

const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

console.log("🚀 Запуск Fantasy World Builder в офлайн режимі...");

// Створюємо директорію для даних якщо не існує
const dataDir = path.join(process.cwd(), "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
  console.log("📁 Створено директорію для даних:", dataDir);
}

// Встановлюємо змінні середовища для офлайн режиму
process.env.NODE_ENV = "production";
process.env.APP_MODE = "offline";
process.env.STORAGE_TYPE = "sqlite";
process.env.SQLITE_PATH = path.join(dataDir, "offline-worlds.db");
process.env.AI_PROVIDER = "ollama";
process.env.OLLAMA_URL = "http://localhost:11434";
process.env.PORT = "3001";

console.log("⚙️  Конфігурація:");
console.log("   - Зберігання: SQLite");
console.log("   - ШІ: Ollama (локальний)");
console.log("   - Порт: 3001");
console.log("   - База даних:", process.env.SQLITE_PATH);

// Перевіряємо чи запущений Ollama
const checkOllama = spawn("curl", ["-f", "http://localhost:11434/api/tags"], {
  stdio: "pipe",
});

checkOllama.on("error", () => {
  console.log(
    "⚠️  Ollama не знайдено. Запустіть Ollama окремо для ШІ функцій."
  );
  console.log("   Команда: ollama serve");
});

checkOllama.on("close", (code) => {
  if (code === 0) {
    console.log("✅ Ollama запущений і готовий до роботи");
  } else {
    console.log("⚠️  Ollama не доступний. ШІ функції будуть недоступні.");
  }

  // Запускаємо сервер
  startServer();
});

function startServer() {
  console.log("🌐 Запуск сервера...");

  const server = spawn("node", ["dist/index.js"], {
    stdio: "inherit",
    env: process.env,
  });

  server.on("error", (error) => {
    console.error("❌ Помилка запуску сервера:", error);
    process.exit(1);
  });

  server.on("close", (code) => {
    console.log(`\n👋 Сервер зупинено з кодом: ${code}`);
    process.exit(code);
  });

  // Обробка сигналів для коректного завершення
  process.on("SIGINT", () => {
    console.log("\n🛑 Отримано сигнал завершення...");
    server.kill("SIGINT");
  });

  process.on("SIGTERM", () => {
    console.log("\n🛑 Отримано сигнал завершення...");
    server.kill("SIGTERM");
  });
}

console.log("📋 Інструкції:");
console.log("   1. Відкрийте браузер: http://localhost:3001");
console.log("   2. Для ШІ функцій запустіть: ollama serve");
console.log("   3. Для зупинки натисніть Ctrl+C");
