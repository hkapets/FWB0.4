const express = require('express');
const path = require('path');
const cors = require('cors');
const SQLiteStorage = require('../electron-db/sqlite-storage');

class ElectronServer {
  constructor() {
    this.app = express();
    this.storage = new SQLiteStorage();
    this.setupMiddleware();
    this.setupRoutes();
  }

  setupMiddleware() {
    this.app.use(cors());
    this.app.use(express.json({ limit: '50mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '50mb' }));
    
    // Сервіс статичних файлів
    this.app.use(express.static(path.join(__dirname, '../dist')));
    this.app.use('/audio', express.static(path.join(__dirname, '../client/public/audio')));
  }

  setupRoutes() {
    // API роути
    this.app.get('/api/worlds', (req, res) => {
      try {
        const worlds = this.storage.getWorlds();
        res.json(worlds);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    this.app.get('/api/worlds/:id', (req, res) => {
      try {
        const world = this.storage.getWorld(req.params.id);
        if (!world) {
          return res.status(404).json({ error: 'World not found' });
        }
        res.json(world);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    this.app.post('/api/worlds', (req, res) => {
      try {
        const world = this.storage.createWorld(req.body);
        res.json(world);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // Універсальні CRUD роути для всіх сутностей
    const entities = ['characters', 'locations', 'creatures', 'events', 'artifacts', 'races', 'classes', 'magic_types', 'lore', 'regions', 'timelines'];
    
    entities.forEach(entity => {
      const table = entity === 'magic_types' ? 'magic_types' : entity;
      
      // GET всі елементи світу
      this.app.get(`/api/worlds/:worldId/${entity}`, (req, res) => {
        try {
          const items = this.storage.getAll(table, req.params.worldId);
          res.json(items.map(item => this.parseJsonFields(item)));
        } catch (error) {
          res.status(500).json({ error: error.message });
        }
      });

      // GET один елемент
      this.app.get(`/api/${entity}/:id`, (req, res) => {
        try {
          const item = this.storage.getById(table, req.params.id);
          if (!item) {
            return res.status(404).json({ error: `${entity} not found` });
          }
          res.json(this.parseJsonFields(item));
        } catch (error) {
          res.status(500).json({ error: error.message });
        }
      });

      // POST новий елемент
      this.app.post(`/api/worlds/:worldId/${entity}`, (req, res) => {
        try {
          const data = {
            ...req.body,
            world_id: req.params.worldId,
            name: JSON.stringify(req.body.name || {}),
            description: JSON.stringify(req.body.description || {}),
          };
          
          // Обробляємо специфічні поля
          if (data.stats) data.stats = JSON.stringify(data.stats);
          if (data.abilities) data.abilities = JSON.stringify(data.abilities);
          if (data.properties) data.properties = JSON.stringify(data.properties);
          if (data.traits) data.traits = JSON.stringify(data.traits);
          if (data.coordinates) data.coordinates = JSON.stringify(data.coordinates);
          if (data.tags) data.tags = JSON.stringify(data.tags);
          if (data.content) data.content = JSON.stringify(data.content);
          
          const item = this.storage.create(table, data);
          res.json(this.parseJsonFields(item));
        } catch (error) {
          res.status(500).json({ error: error.message });
        }
      });

      // PUT оновлення елемента
      this.app.put(`/api/${entity}/:id`, (req, res) => {
        try {
          const data = { ...req.body };
          
          // Перетворюємо об'єкти в JSON
          if (data.name) data.name = JSON.stringify(data.name);
          if (data.description) data.description = JSON.stringify(data.description);
          if (data.stats) data.stats = JSON.stringify(data.stats);
          if (data.abilities) data.abilities = JSON.stringify(data.abilities);
          if (data.properties) data.properties = JSON.stringify(data.properties);
          if (data.traits) data.traits = JSON.stringify(data.traits);
          if (data.coordinates) data.coordinates = JSON.stringify(data.coordinates);
          if (data.tags) data.tags = JSON.stringify(data.tags);
          if (data.content) data.content = JSON.stringify(data.content);
          
          const item = this.storage.update(table, req.params.id, data);
          res.json(this.parseJsonFields(item));
        } catch (error) {
          res.status(500).json({ error: error.message });
        }
      });

      // DELETE елемент
      this.app.delete(`/api/${entity}/:id`, (req, res) => {
        try {
          const success = this.storage.delete(table, req.params.id);
          res.json({ success });
        } catch (error) {
          res.status(500).json({ error: error.message });
        }
      });
    });

    // Пошук
    this.app.get('/api/worlds/:worldId/search', (req, res) => {
      try {
        const { q } = req.query;
        const results = this.storage.searchAll(req.params.worldId, q);
        res.json(results.map(item => this.parseJsonFields(item)));
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // Експорт світу
    this.app.get('/api/worlds/:worldId/export', (req, res) => {
      try {
        const worldData = this.storage.exportWorld(req.params.worldId);
        if (!worldData) {
          return res.status(404).json({ error: 'World not found' });
        }
        
        // Парсимо JSON поля
        Object.keys(worldData).forEach(key => {
          if (Array.isArray(worldData[key])) {
            worldData[key] = worldData[key].map(item => this.parseJsonFields(item));
          }
        });
        
        res.json(worldData);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // Fallback для SPA
    this.app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, '../dist/index.html'));
    });
  }

  parseJsonFields(item) {
    if (!item) return item;
    
    const parsed = { ...item };
    
    // Парсимо JSON поля
    const jsonFields = ['name', 'description', 'stats', 'abilities', 'properties', 'traits', 'coordinates', 'tags', 'content', 'settings'];
    
    jsonFields.forEach(field => {
      if (parsed[field] && typeof parsed[field] === 'string') {
        try {
          parsed[field] = JSON.parse(parsed[field]);
        } catch (e) {
          // Залишаємо як є якщо не JSON
        }
      }
    });
    
    return parsed;
  }

  start(port = 3001) {
    return new Promise((resolve) => {
      this.server = this.app.listen(port, '127.0.0.1', () => {
        console.log(`Electron server running on port ${port}`);
        resolve();
      });
    });
  }

  stop() {
    if (this.server) {
      this.server.close();
    }
    if (this.storage) {
      this.storage.close();
    }
  }
}

module.exports = ElectronServer;

// Якщо запускається напряму
if (require.main === module) {
  const server = new ElectronServer();
  server.start(process.env.PORT || 3001);
  
  process.on('SIGINT', () => {
    console.log('Shutting down server...');
    server.stop();
    process.exit(0);
  });
}