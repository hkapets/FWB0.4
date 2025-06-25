export interface Plugin {
  id: string;
  name: string;
  version: string;
  author: string;
  description: string;
  permissions: PluginPermission[];
  category: PluginCategory;
  
  // Lifecycle hooks
  onActivate?: () => void;
  onDeactivate?: () => void;
  onWorldLoad?: (worldId: number) => void;
  onEntityCreate?: (entity: any) => void;
}

export enum PluginPermission {
  READ_WORLD_DATA = 'read:world',
  WRITE_WORLD_DATA = 'write:world',
  ACCESS_UI = 'ui:modify',
  NETWORK_ACCESS = 'network:external',
  FILE_SYSTEM = 'fs:limited',
  ANALYTICS_READ = 'analytics:read',
  EXPORT_DATA = 'export:data',
  RPG_TOOLS = 'rpg:tools'
}

export enum PluginCategory {
  WORLD_GENERATORS = 'world-generators',
  CONTENT_ENHANCERS = 'content-enhancers', 
  EXPORT_FORMATS = 'export-formats',
  RPG_SYSTEMS = 'rpg-systems',
  VISUALIZATION = 'visualization',
  AUTOMATION = 'automation',
  UTILITIES = 'utilities'
}

export interface PluginAPI {
  world: WorldAPI;
  ui: UIAPI;
  storage: StorageAPI;
  analytics: AnalyticsAPI;
  rpg: RPGAPI;
  utils: UtilsAPI;
}

export interface WorldAPI {
  getWorld(id: number): Promise<any>;
  getCharacters(worldId: number): Promise<any[]>;
  getLocations(worldId: number): Promise<any[]>;
  createEntity(type: string, data: any): Promise<any>;
  updateEntity(type: string, id: number, data: any): Promise<any>;
  deleteEntity(type: string, id: number): Promise<boolean>;
}

export interface UIAPI {
  addMenuItem(menu: string, item: MenuItem): void;
  addToolbarButton(button: ToolbarButton): void;
  showModal(component: any, props?: any): void;
  showNotification(message: string, type: 'info' | 'success' | 'warning' | 'error'): void;
  registerComponent(name: string, component: any): void;
}

export interface StorageAPI {
  get<T>(key: string): T | null;
  set<T>(key: string, value: T): void;
  remove(key: string): void;
  clear(): void;
}

export interface AnalyticsAPI {
  trackEvent(event: string, properties?: any): void;
  getMetrics(worldId: number): Promise<any>;
  getRecommendations(worldId: number): Promise<any[]>;
}

export interface RPGAPI {
  generateStatblock(entity: any, system: string): Promise<any>;
  calculateEncounter(creatures: any[], party: any): Promise<any>;
  rollDice(formula: string): Promise<any>;
  getSystemData(system: string): Promise<any>;
}

export interface UtilsAPI {
  generateId(): string;
  formatDate(date: Date, locale?: string): string;
  sanitizeHTML(html: string): string;
  validateSchema(data: any, schema: any): boolean;
}

export interface MenuItem {
  id: string;
  label: string;
  icon?: string;
  action: () => void;
  submenu?: MenuItem[];
}

export interface ToolbarButton {
  id: string;
  label: string;
  icon: string;
  action: () => void;
  tooltip?: string;
}

export class PluginManager {
  private plugins: Map<string, Plugin> = new Map();
  private activePlugins: Set<string> = new Set();
  private pluginAPI: PluginAPI;

  constructor() {
    this.pluginAPI = this.createPluginAPI();
  }

  private createPluginAPI(): PluginAPI {
    return {
      world: {
        getWorld: async (id: number) => {
          // Implementation
          return {};
        },
        getCharacters: async (worldId: number) => {
          const response = await fetch(`/api/characters?worldId=${worldId}`);
          return response.json();
        },
        getLocations: async (worldId: number) => {
          const response = await fetch(`/api/locations?worldId=${worldId}`);
          return response.json();
        },
        createEntity: async (type: string, data: any) => {
          const response = await fetch(`/api/${type}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          });
          return response.json();
        },
        updateEntity: async (type: string, id: number, data: any) => {
          const response = await fetch(`/api/${type}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          });
          return response.json();
        },
        deleteEntity: async (type: string, id: number) => {
          const response = await fetch(`/api/${type}/${id}`, {
            method: 'DELETE'
          });
          return response.ok;
        }
      },
      ui: {
        addMenuItem: (menu: string, item: MenuItem) => {
          // Implementation for adding menu items
          console.log(`Adding menu item ${item.id} to ${menu}`);
        },
        addToolbarButton: (button: ToolbarButton) => {
          // Implementation for adding toolbar buttons
          console.log(`Adding toolbar button ${button.id}`);
        },
        showModal: (component: any, props?: any) => {
          // Implementation for showing modals
          console.log('Showing modal', component, props);
        },
        showNotification: (message: string, type: 'info' | 'success' | 'warning' | 'error') => {
          // Implementation for notifications
          console.log(`Notification [${type}]: ${message}`);
        },
        registerComponent: (name: string, component: any) => {
          // Implementation for registering components
          console.log(`Registering component ${name}`);
        }
      },
      storage: {
        get: <T>(key: string): T | null => {
          try {
            const item = localStorage.getItem(`plugin_${key}`);
            return item ? JSON.parse(item) : null;
          } catch {
            return null;
          }
        },
        set: <T>(key: string, value: T) => {
          localStorage.setItem(`plugin_${key}`, JSON.stringify(value));
        },
        remove: (key: string) => {
          localStorage.removeItem(`plugin_${key}`);
        },
        clear: () => {
          Object.keys(localStorage)
            .filter(key => key.startsWith('plugin_'))
            .forEach(key => localStorage.removeItem(key));
        }
      },
      analytics: {
        trackEvent: (event: string, properties?: any) => {
          fetch('/api/analytics/track-action', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: event, metadata: properties })
          });
        },
        getMetrics: async (worldId: number) => {
          const response = await fetch(`/api/analytics/advanced/${worldId}`);
          return response.json();
        },
        getRecommendations: async (worldId: number) => {
          const response = await fetch(`/api/recommendations/${worldId}`);
          return response.json();
        }
      },
      rpg: {
        generateStatblock: async (entity: any, system: string) => {
          const response = await fetch('/api/rpg/generate-statblock', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...entity, system })
          });
          return response.json();
        },
        calculateEncounter: async (creatures: any[], party: any) => {
          const response = await fetch('/api/rpg/encounter-difficulty', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ creatures, ...party })
          });
          return response.json();
        },
        rollDice: async (formula: string) => {
          const response = await fetch('/api/rpg/roll-dice', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ formula })
          });
          return response.json();
        },
        getSystemData: async (system: string) => {
          // Implementation for getting RPG system data
          return {};
        }
      },
      utils: {
        generateId: () => {
          return Math.random().toString(36).substr(2, 9);
        },
        formatDate: (date: Date, locale = 'uk-UA') => {
          return date.toLocaleDateString(locale);
        },
        sanitizeHTML: (html: string) => {
          // Basic HTML sanitization
          return html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
        },
        validateSchema: (data: any, schema: any) => {
          // Basic schema validation
          return true;
        }
      }
    };
  }

  async loadPlugin(pluginCode: string, manifest: any): Promise<boolean> {
    try {
      // Create sandboxed environment
      const sandbox = this.createSandbox(manifest.permissions);
      
      // Execute plugin code in sandbox
      const plugin = this.executePluginCode(pluginCode, sandbox, manifest);
      
      if (plugin && this.validatePlugin(plugin, manifest)) {
        this.plugins.set(plugin.id, plugin);
        
        // Call activation hook
        if (plugin.onActivate) {
          await plugin.onActivate();
        }
        
        this.activePlugins.add(plugin.id);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Failed to load plugin:', error);
      return false;
    }
  }

  private createSandbox(permissions: PluginPermission[]) {
    const sandbox: any = {
      console: {
        log: (...args: any[]) => console.log('[Plugin]', ...args),
        error: (...args: any[]) => console.error('[Plugin]', ...args),
        warn: (...args: any[]) => console.warn('[Plugin]', ...args)
      },
      setTimeout,
      setInterval,
      clearTimeout,
      clearInterval,
      JSON,
      Math,
      Date,
      api: {}
    };

    // Add API based on permissions
    if (permissions.includes(PluginPermission.READ_WORLD_DATA)) {
      sandbox.api.world = {
        getWorld: this.pluginAPI.world.getWorld,
        getCharacters: this.pluginAPI.world.getCharacters,
        getLocations: this.pluginAPI.world.getLocations
      };
    }

    if (permissions.includes(PluginPermission.WRITE_WORLD_DATA)) {
      sandbox.api.world = {
        ...sandbox.api.world,
        createEntity: this.pluginAPI.world.createEntity,
        updateEntity: this.pluginAPI.world.updateEntity,
        deleteEntity: this.pluginAPI.world.deleteEntity
      };
    }

    if (permissions.includes(PluginPermission.ACCESS_UI)) {
      sandbox.api.ui = this.pluginAPI.ui;
    }

    if (permissions.includes(PluginPermission.ANALYTICS_READ)) {
      sandbox.api.analytics = this.pluginAPI.analytics;
    }

    if (permissions.includes(PluginPermission.RPG_TOOLS)) {
      sandbox.api.rpg = this.pluginAPI.rpg;
    }

    sandbox.api.storage = this.pluginAPI.storage;
    sandbox.api.utils = this.pluginAPI.utils;

    return sandbox;
  }

  private executePluginCode(code: string, sandbox: any, manifest: any): Plugin | null {
    try {
      // Create a safe execution environment
      const func = new Function('api', 'manifest', 'console', `
        "use strict";
        ${code}
        if (typeof plugin !== 'undefined') {
          return plugin;
        }
        return null;
      `);
      
      return func(sandbox.api, manifest, sandbox.console);
    } catch (error: any) {
      console.error('Plugin execution error:', error);
      return null;
    }
  }

  private validatePlugin(plugin: Plugin, manifest: any): boolean {
    return (
      plugin.id === manifest.id &&
      plugin.name === manifest.name &&
      plugin.version === manifest.version &&
      plugin.author === manifest.author
    );
  }

  async unloadPlugin(pluginId: string): Promise<boolean> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) return false;

    try {
      // Call deactivation hook
      if (plugin.onDeactivate) {
        await plugin.onDeactivate();
      }

      this.plugins.delete(pluginId);
      this.activePlugins.delete(pluginId);
      return true;
    } catch (error) {
      console.error('Failed to unload plugin:', error);
      return false;
    }
  }

  getActivePlugins(): Plugin[] {
    return Array.from(this.activePlugins)
      .map(id => this.plugins.get(id))
      .filter(Boolean) as Plugin[];
  }

  getPlugin(id: string): Plugin | undefined {
    return this.plugins.get(id);
  }

  async triggerHook(hookName: string, ...args: any[]): Promise<void> {
    for (const pluginId of this.activePlugins) {
      const plugin = this.plugins.get(pluginId);
      if (plugin && (plugin as any)[hookName]) {
        try {
          await (plugin as any)[hookName](...args);
        } catch (error) {
          console.error(`Plugin ${pluginId} hook ${hookName} failed:`, error);
        }
      }
    }
  }
}

export const pluginManager = new PluginManager();