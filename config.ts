export interface AppConfig {
  storage: {
    type: "postgresql" | "sqlite" | "memory";
    url?: string;
    filePath?: string;
  };
  ai: {
    provider: "ollama" | "openai" | "none";
    ollamaUrl?: string;
    openaiKey?: string;
  };
  server: {
    port: number;
    host: string;
  };
  client: {
    apiUrl: string;
  };
}

// Конфігурація для різних середовищ
const configs: Record<string, AppConfig> = {
  development: {
    storage: {
      type: "sqlite",
      filePath: "./data/dev-worlds.db",
    },
    ai: {
      provider: "ollama",
      ollamaUrl: "http://localhost:11434",
    },
    server: {
      port: 3001,
      host: "localhost",
    },
    client: {
      apiUrl: "http://localhost:3001",
    },
  },

  production: {
    storage: {
      type: "postgresql",
      url: process.env.DATABASE_URL,
    },
    ai: {
      provider: "ollama",
      ollamaUrl: process.env.OLLAMA_URL || "http://localhost:11434",
    },
    server: {
      port: parseInt(process.env.PORT || "8080"),
      host: "0.0.0.0",
    },
    client: {
      apiUrl: process.env.API_URL || "/api",
    },
  },

  offline: {
    storage: {
      type: "sqlite",
      filePath: "./data/offline-worlds.db",
    },
    ai: {
      provider: "ollama",
      ollamaUrl: "http://localhost:11434",
    },
    server: {
      port: 3001,
      host: "localhost",
    },
    client: {
      apiUrl: "http://localhost:3001",
    },
  },

  demo: {
    storage: {
      type: "memory",
    },
    ai: {
      provider: "none",
    },
    server: {
      port: 8080,
      host: "0.0.0.0",
    },
    client: {
      apiUrl: "/api",
    },
  },
};

// Отримання конфігурації на основі середовища
export function getConfig(): AppConfig {
  const env = process.env.NODE_ENV || "development";
  const mode = process.env.APP_MODE || env;

  return configs[mode] || configs.development;
}

// Експорт змінних середовища для зручності
export function getEnvVars() {
  const config = getConfig();

  return {
    STORAGE_TYPE: config.storage.type,
    DATABASE_URL: config.storage.url,
    SQLITE_PATH: config.storage.filePath,
    AI_PROVIDER: config.ai.provider,
    OLLAMA_URL: config.ai.ollamaUrl,
    OPENAI_API_KEY: config.ai.openaiKey,
    PORT: config.server.port.toString(),
    API_URL: config.client.apiUrl,
  };
}
