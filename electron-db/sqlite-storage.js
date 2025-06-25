const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const { app } = require('electron');

class SQLiteStorage {
  constructor() {
    // Отримуємо шлях до директорії користувача
    const userDataPath = app ? app.getPath('userData') : './data';
    const dbDir = path.join(userDataPath, 'fantasy-world-builder');
    
    // Створюємо директорію якщо не існує
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
    
    const dbPath = path.join(dbDir, 'worlds.db');
    console.log('SQLite database path:', dbPath);
    
    this.db = new Database(dbPath);
    this.db.pragma('journal_mode = WAL');
    this.initializeTables();
  }

  initializeTables() {
    // Створюємо всі необхідні таблиці
    const tables = `
      -- Користувачі
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT,
        password_hash TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Світи
      CREATE TABLE IF NOT EXISTS worlds (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER REFERENCES users(id),
        name TEXT NOT NULL,
        description TEXT,
        template TEXT,
        settings TEXT, -- JSON
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Персонажі
      CREATE TABLE IF NOT EXISTS characters (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        world_id INTEGER REFERENCES worlds(id) ON DELETE CASCADE,
        name TEXT NOT NULL, -- JSON {uk: string, en: string}
        description TEXT, -- JSON
        race TEXT,
        class TEXT,
        level INTEGER DEFAULT 1,
        stats TEXT, -- JSON
        image TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Локації
      CREATE TABLE IF NOT EXISTS locations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        world_id INTEGER REFERENCES worlds(id) ON DELETE CASCADE,
        name TEXT NOT NULL, -- JSON
        description TEXT, -- JSON
        type TEXT,
        coordinates TEXT, -- JSON {x: number, y: number}
        climate TEXT,
        population INTEGER,
        government TEXT,
        image TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Істоти
      CREATE TABLE IF NOT EXISTS creatures (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        world_id INTEGER REFERENCES worlds(id) ON DELETE CASCADE,
        name TEXT NOT NULL, -- JSON
        description TEXT, -- JSON
        type TEXT,
        size TEXT,
        challenge_rating TEXT,
        stats TEXT, -- JSON
        abilities TEXT, -- JSON
        image TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Події
      CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        world_id INTEGER REFERENCES worlds(id) ON DELETE CASCADE,
        timeline_id INTEGER,
        name TEXT NOT NULL, -- JSON
        description TEXT, -- JSON
        date TEXT,
        type TEXT,
        importance INTEGER DEFAULT 1,
        order_index INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Артефакти
      CREATE TABLE IF NOT EXISTS artifacts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        world_id INTEGER REFERENCES worlds(id) ON DELETE CASCADE,
        name TEXT NOT NULL, -- JSON
        description TEXT, -- JSON
        type TEXT,
        rarity TEXT,
        properties TEXT, -- JSON
        history TEXT, -- JSON
        image TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Раси
      CREATE TABLE IF NOT EXISTS races (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        world_id INTEGER REFERENCES worlds(id) ON DELETE CASCADE,
        name TEXT NOT NULL, -- JSON
        description TEXT, -- JSON
        traits TEXT, -- JSON
        abilities TEXT, -- JSON
        culture TEXT, -- JSON
        lifespan INTEGER,
        image TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Класи
      CREATE TABLE IF NOT EXISTS classes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        world_id INTEGER REFERENCES worlds(id) ON DELETE CASCADE,
        name TEXT NOT NULL, -- JSON
        description TEXT, -- JSON
        hit_die INTEGER,
        primary_ability TEXT,
        proficiencies TEXT, -- JSON
        features TEXT, -- JSON
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Магічні школи/типи
      CREATE TABLE IF NOT EXISTS magic_types (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        world_id INTEGER REFERENCES worlds(id) ON DELETE CASCADE,
        name TEXT NOT NULL, -- JSON
        description TEXT, -- JSON
        type TEXT,
        source TEXT,
        restrictions TEXT, -- JSON
        spells TEXT, -- JSON
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Лор
      CREATE TABLE IF NOT EXISTS lore (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        world_id INTEGER REFERENCES worlds(id) ON DELETE CASCADE,
        name TEXT NOT NULL, -- JSON
        description TEXT, -- JSON
        type TEXT, -- note, mythology, religion, politics, history, etc.
        category TEXT,
        tags TEXT, -- JSON array
        content TEXT, -- JSON for detailed content
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Регіони
      CREATE TABLE IF NOT EXISTS regions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        world_id INTEGER REFERENCES worlds(id) ON DELETE CASCADE,
        name TEXT NOT NULL, -- JSON
        description TEXT, -- JSON
        type TEXT,
        climate TEXT,
        terrain TEXT,
        dangers TEXT, -- JSON
        resources TEXT, -- JSON
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Часові лінії
      CREATE TABLE IF NOT EXISTS timelines (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        world_id INTEGER REFERENCES worlds(id) ON DELETE CASCADE,
        name TEXT NOT NULL, -- JSON
        description TEXT, -- JSON
        start_date TEXT,
        end_date TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Індекси для оптимізації
      CREATE INDEX IF NOT EXISTS idx_characters_world_id ON characters(world_id);
      CREATE INDEX IF NOT EXISTS idx_locations_world_id ON locations(world_id);
      CREATE INDEX IF NOT EXISTS idx_creatures_world_id ON creatures(world_id);
      CREATE INDEX IF NOT EXISTS idx_events_world_id ON events(world_id);
      CREATE INDEX IF NOT EXISTS idx_artifacts_world_id ON artifacts(world_id);
      CREATE INDEX IF NOT EXISTS idx_races_world_id ON races(world_id);
      CREATE INDEX IF NOT EXISTS idx_classes_world_id ON classes(world_id);
      CREATE INDEX IF NOT EXISTS idx_magic_types_world_id ON magic_types(world_id);
      CREATE INDEX IF NOT EXISTS idx_lore_world_id ON lore(world_id);
      CREATE INDEX IF NOT EXISTS idx_regions_world_id ON regions(world_id);
      CREATE INDEX IF NOT EXISTS idx_timelines_world_id ON timelines(world_id);
    `;

    // Виконуємо створення таблиць
    this.db.exec(tables);

    // Створюємо тестового користувача якщо не існує
    const userExists = this.db.prepare('SELECT COUNT(*) as count FROM users').get();
    if (userExists.count === 0) {
      this.db.prepare(`
        INSERT INTO users (username, email) 
        VALUES (?, ?)
      `).run('desktop_user', 'user@local.app');
    }
  }

  // Універсальні методи для роботи з даними
  getAll(table, worldId) {
    const query = `SELECT * FROM ${table} WHERE world_id = ? ORDER BY created_at DESC`;
    return this.db.prepare(query).all(worldId);
  }

  getById(table, id) {
    const query = `SELECT * FROM ${table} WHERE id = ?`;
    return this.db.prepare(query).get(id);
  }

  create(table, data) {
    const keys = Object.keys(data);
    const placeholders = keys.map(() => '?').join(', ');
    const query = `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`;
    
    const result = this.db.prepare(query).run(...Object.values(data));
    return { id: result.lastInsertRowid, ...data };
  }

  update(table, id, data) {
    const keys = Object.keys(data);
    const setClause = keys.map(key => `${key} = ?`).join(', ');
    const query = `UPDATE ${table} SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
    
    this.db.prepare(query).run(...Object.values(data), id);
    return this.getById(table, id);
  }

  delete(table, id) {
    const query = `DELETE FROM ${table} WHERE id = ?`;
    const result = this.db.prepare(query).run(id);
    return result.changes > 0;
  }

  // Спеціальні методи для світів
  getWorlds(userId = 1) {
    return this.db.prepare('SELECT * FROM worlds WHERE user_id = ? ORDER BY created_at DESC').all(userId);
  }

  getWorld(id) {
    return this.db.prepare('SELECT * FROM worlds WHERE id = ?').get(id);
  }

  createWorld(data) {
    const result = this.db.prepare(`
      INSERT INTO worlds (user_id, name, description, template, settings)
      VALUES (?, ?, ?, ?, ?)
    `).run(data.userId || 1, data.name, data.description, data.template, JSON.stringify(data.settings || {}));
    
    return { id: result.lastInsertRowid, ...data };
  }

  // Методи для пошуку
  searchAll(worldId, query) {
    const searchQuery = `%${query}%`;
    const results = [];

    // Шукаємо в персонажах
    const characters = this.db.prepare(`
      SELECT id, name, description, 'character' as type FROM characters 
      WHERE world_id = ? AND (name LIKE ? OR description LIKE ?)
    `).all(worldId, searchQuery, searchQuery);
    results.push(...characters);

    // Шукаємо в локаціях
    const locations = this.db.prepare(`
      SELECT id, name, description, 'location' as type FROM locations 
      WHERE world_id = ? AND (name LIKE ? OR description LIKE ?)
    `).all(worldId, searchQuery, searchQuery);
    results.push(...locations);

    // Шукаємо в істотах
    const creatures = this.db.prepare(`
      SELECT id, name, description, 'creature' as type FROM creatures 
      WHERE world_id = ? AND (name LIKE ? OR description LIKE ?)
    `).all(worldId, searchQuery, searchQuery);
    results.push(...creatures);

    return results;
  }

  // Експорт світу
  exportWorld(worldId) {
    const world = this.getWorld(worldId);
    if (!world) return null;

    return {
      world,
      characters: this.getAll('characters', worldId),
      locations: this.getAll('locations', worldId),
      creatures: this.getAll('creatures', worldId),
      events: this.getAll('events', worldId),
      artifacts: this.getAll('artifacts', worldId),
      races: this.getAll('races', worldId),
      classes: this.getAll('classes', worldId),
      magic_types: this.getAll('magic_types', worldId),
      lore: this.getAll('lore', worldId),
      regions: this.getAll('regions', worldId),
      timelines: this.getAll('timelines', worldId),
    };
  }

  close() {
    this.db.close();
  }
}

module.exports = SQLiteStorage;