#!/usr/bin/env node

const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

console.log("🧪 Швидкий тест Fantasy World Builder...\n");

// Перевірка Node.js версії
const nodeVersion = process.version;
console.log(`✅ Node.js версія: ${nodeVersion}`);

// Перевірка наявності package.json
if (fs.existsSync("package.json")) {
  console.log("✅ package.json знайдено");
} else {
  console.log("❌ package.json не знайдено");
  process.exit(1);
}

// Перевірка наявності основних файлів
const requiredFiles = [
  "server/index.ts",
  "client/src/App.tsx",
  "shared/schema.ts",
  "vite.config.ts",
];

requiredFiles.forEach((file) => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file} знайдено`);
  } else {
    console.log(`❌ ${file} не знайдено`);
  }
});

// Перевірка залежностей
console.log("\n📦 Перевірка залежностей...");
const checkDeps = spawn("npm", ["list", "--depth=0"], { stdio: "pipe" });

checkDeps.on("close", (code) => {
  if (code === 0) {
    console.log("✅ Залежності встановлені");
  } else {
    console.log("❌ Проблеми з залежностями. Запустіть: npm install");
  }

  // Перевірка TypeScript
  checkTypeScript();
});

function checkTypeScript() {
  console.log("\n🔧 Перевірка TypeScript...");
  const checkTS = spawn("npx", ["tsc", "--noEmit"], { stdio: "pipe" });

  checkTS.on("close", (code) => {
    if (code === 0) {
      console.log("✅ TypeScript компіляція успішна");
    } else {
      console.log("❌ Помилки TypeScript");
    }

    // Перевірка збірки
    checkBuild();
  });
}

function checkBuild() {
  console.log("\n🏗️  Перевірка збірки...");
  const build = spawn("npm", ["run", "build"], { stdio: "pipe" });

  build.on("close", (code) => {
    if (code === 0) {
      console.log("✅ Збірка успішна");
    } else {
      console.log("❌ Помилка збірки");
    }

    // Перевірка Ollama
    checkOllama();
  });
}

function checkOllama() {
  console.log("\n🤖 Перевірка Ollama...");
  const checkOllama = spawn("curl", ["-f", "http://localhost:11434/api/tags"], {
    stdio: "pipe",
  });

  checkOllama.on("error", () => {
    console.log("⚠️  Ollama не запущений");
    console.log("   Для ШІ функцій запустіть: ollama serve");
  });

  checkOllama.on("close", (code) => {
    if (code === 0) {
      console.log("✅ Ollama доступний");
    } else {
      console.log("⚠️  Ollama не доступний");
    }

    // Фінальні рекомендації
    showRecommendations();
  });
}

function showRecommendations() {
  console.log("\n🎯 Рекомендації для запуску:");
  console.log("");
  console.log("1. Офлайн режим (рекомендований):");
  console.log("   npm run start:offline");
  console.log("");
  console.log("2. Docker (найпростіший):");
  console.log("   docker-compose up -d");
  console.log("");
  console.log("3. Development режим:");
  console.log("   npm run dev");
  console.log("");
  console.log("4. Для ШІ функцій:");
  console.log("   ollama serve");
  console.log("   ollama pull mistral");
  console.log("");
  console.log("🌐 Доступ: http://localhost:3001 (або 8080 для Docker)");
  console.log("");
  console.log("✅ Тест завершено!");
}
