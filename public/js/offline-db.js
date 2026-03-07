// IndexedDB Wrapper - Moj Predračun
// Omogoča offline delo in sinhronizacijo

const DB_NAME = 'MojPredracunDB';
const DB_VERSION = 1;

// Object store names
const STORES = {
  QUOTES: 'quotes',
  CLIENTS: 'clients',
  WORK_ITEMS: 'workItems',
  MATERIALS: 'materials',
  SYNC_QUEUE: 'syncQueue',
  SETTINGS: 'settings'
};

class OfflineDB {
  constructor() {
    this.db = null;
    this.isOnline = navigator.onLine;
    this.syncInProgress = false;
    
    // Track online status
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.triggerSync();
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }
  
  // Initialize database
  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        console.log('[IndexedDB] Database opened successfully');
        resolve(this.db);
      };
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Quotes store
        if (!db.objectStoreNames.contains(STORES.QUOTES)) {
          const quoteStore = db.createObjectStore(STORES.QUOTES, { keyPath: 'id' });
          quoteStore.createIndex('syncStatus', 'syncStatus', { unique: false });
          quoteStore.createIndex('updatedAt', 'updatedAt', { unique: false });
        }
        
        // Clients store
        if (!db.objectStoreNames.contains(STORES.CLIENTS)) {
          const clientStore = db.createObjectStore(STORES.CLIENTS, { keyPath: 'id' });
          clientStore.createIndex('syncStatus', 'syncStatus', { unique: false });
        }
        
        // Work items store
        if (!db.objectStoreNames.contains(STORES.WORK_ITEMS)) {
          const itemStore = db.createObjectStore(STORES.WORK_ITEMS, { keyPath: 'id' });
          itemStore.createIndex('category', 'category', { unique: false });
          itemStore.createIndex('syncStatus', 'syncStatus', { unique: false });
        }
        
        // Materials store
        if (!db.objectStoreNames.contains(STORES.MATERIALS)) {
          const matStore = db.createObjectStore(STORES.MATERIALS, { keyPath: 'id' });
          matStore.createIndex('category', 'category', { unique: false });
          matStore.createIndex('syncStatus', 'syncStatus', { unique: false });
        }
        
        // Sync queue for pending changes
        if (!db.objectStoreNames.contains(STORES.SYNC_QUEUE)) {
          const syncStore = db.createObjectStore(STORES.SYNC_QUEUE, { 
            keyPath: 'id', 
            autoIncrement: true 
          });
          syncStore.createIndex('store', 'store', { unique: false });
          syncStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
        
        // Settings store
        if (!db.objectStoreNames.contains(STORES.SETTINGS)) {
          db.createObjectStore(STORES.SETTINGS, { keyPath: 'key' });
        }
        
        console.log('[IndexedDB] Database schema created');
      };
    });
  }
  
  // ==================== QUOTES ====================
  
  async saveQuote(quote) {
    // Add metadata
    const quoteWithMeta = {
      ...quote,
      updatedAt: new Date().toISOString(),
      syncStatus: this.isOnline ? 'synced' : 'pending'
    };
    
    // If offline, generate temporary ID
    if (!this.isOnline && !quote.id) {
      quoteWithMeta.id = 'local_' + Date.now();
      quoteWithMeta.isLocal = true;
    }
    
    await this.put(STORES.QUOTES, quoteWithMeta);
    
    // Add to sync queue if offline
    if (!this.isOnline) {
      await this.addToSyncQueue(STORES.QUOTES, quoteWithMeta.id, 'save');
    }
    
    return quoteWithMeta;
  }
  
  async getQuotes() {
    return await this.getAll(STORES.QUOTES);
  }
  
  async getQuote(id) {
    return await this.get(STORES.QUOTES, id);
  }
  
  async deleteQuote(id) {
    await this.delete(STORES.QUOTES, id);
    
    if (!this.isOnline) {
      await this.addToSyncQueue(STORES.QUOTES, id, 'delete');
    }
  }
  
  async getPendingQuotes() {
    return await this.getByIndex(STORES.QUOTES, 'syncStatus', 'pending');
  }
  
  // ==================== CLIENTS ====================
  
  async saveClient(client) {
    const clientWithMeta = {
      ...client,
      updatedAt: new Date().toISOString(),
      syncStatus: this.isOnline ? 'synced' : 'pending'
    };
    
    if (!this.isOnline && !client.id) {
      clientWithMeta.id = 'local_client_' + Date.now();
      clientWithMeta.isLocal = true;
    }
    
    await this.put(STORES.CLIENTS, clientWithMeta);
    
    if (!this.isOnline) {
      await this.addToSyncQueue(STORES.CLIENTS, clientWithMeta.id, 'save');
    }
    
    return clientWithMeta;
  }
  
  async getClients() {
    return await this.getAll(STORES.CLIENTS);
  }
  
  async getClient(id) {
    return await this.get(STORES.CLIENTS, id);
  }
  
  // ==================== WORK ITEMS ====================
  
  async saveWorkItem(item) {
    const itemWithMeta = {
      ...item,
      updatedAt: new Date().toISOString(),
      syncStatus: this.isOnline ? 'synced' : 'pending'
    };
    
    if (!this.isOnline && !item.id) {
      itemWithMeta.id = 'local_item_' + Date.now();
      itemWithMeta.isLocal = true;
    }
    
    await this.put(STORES.WORK_ITEMS, itemWithMeta);
    
    if (!this.isOnline) {
      await this.addToSyncQueue(STORES.WORK_ITEMS, itemWithMeta.id, 'save');
    }
    
    return itemWithMeta;
  }
  
  async getWorkItems() {
    return await this.getAll(STORES.WORK_ITEMS);
  }
  
  async getWorkItemsByCategory(category) {
    return await this.getByIndex(STORES.WORK_ITEMS, 'category', category);
  }
  
  // ==================== MATERIALS ====================
  
  async saveMaterial(material) {
    const matWithMeta = {
      ...material,
      updatedAt: new Date().toISOString(),
      syncStatus: this.isOnline ? 'synced' : 'pending'
    };
    
    if (!this.isOnline && !material.id) {
      matWithMeta.id = 'local_mat_' + Date.now();
      matWithMeta.isLocal = true;
    }
    
    await this.put(STORES.MATERIALS, matWithMeta);
    
    if (!this.isOnline) {
      await this.addToSyncQueue(STORES.MATERIALS, matWithMeta.id, 'save');
    }
    
    return matWithMeta;
  }
  
  async getMaterials() {
    return await this.getAll(STORES.MATERIALS);
  }
  
  // ==================== SYNC QUEUE ====================
  
  async addToSyncQueue(store, recordId, action) {
    const queueItem = {
      store,
      recordId,
      action,
      timestamp: new Date().toISOString(),
      retryCount: 0
    };
    
    await this.put(STORES.SYNC_QUEUE, queueItem);
    console.log('[IndexedDB] Added to sync queue:', queueItem);
  }
  
  async getSyncQueue() {
    return await this.getAll(STORES.SYNC_QUEUE);
  }
  
  async clearSyncQueue() {
    const queue = await this.getSyncQueue();
    for (const item of queue) {
      await this.delete(STORES.SYNC_QUEUE, item.id);
    }
  }
  
  async removeFromSyncQueue(id) {
    await this.delete(STORES.SYNC_QUEUE, id);
  }
  
  // ==================== SYNC LOGIC ====================
  
  async triggerSync() {
    if (this.syncInProgress || !this.isOnline) {
      return;
    }
    
    this.syncInProgress = true;
    console.log('[IndexedDB] Starting sync...');
    
    try {
      // Show sync notification
      if (window.showToast) {
        showToast('🔄 Sinhroniziram podatke...', 'info');
      }
      
      // 1. Sync quotes
      const pendingQuotes = await this.getPendingQuotes();
      for (const quote of pendingQuotes) {
        await this.syncQuote(quote);
      }
      
      // 2. Sync clients
      const pendingClients = await this.getByIndex(STORES.CLIENTS, 'syncStatus', 'pending');
      for (const client of pendingClients) {
        await this.syncClient(client);
      }
      
      // 3. Fetch latest data from server
      await this.fetchLatestData();
      
      // Clear sync queue
      await this.clearSyncQueue();
      
      // Update all pending to synced
      await this.markAllAsSynced();
      
      if (window.showToast) {
        showToast('✅ Sinhronizacija zaključena', 'success');
      }
      
      // Trigger UI refresh
      if (window.dispatchEvent) {
        window.dispatchEvent(new CustomEvent('sync-complete'));
      }
      
    } catch (error) {
      console.error('[IndexedDB] Sync failed:', error);
      if (window.showToast) {
        showToast('⚠️ Sinhronizacija ni uspela', 'error');
      }
    } finally {
      this.syncInProgress = false;
    }
  }
  
  async syncQuote(quote) {
    try {
      const response = await fetch('/api/quotes', {
        method: quote.isLocal ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(quote)
      });
      
      if (response.ok) {
        const result = await response.json();
        // Update local record with server ID
        quote.id = result.id || quote.id;
        quote.syncStatus = 'synced';
        quote.isLocal = false;
        await this.put(STORES.QUOTES, quote);
      }
    } catch (error) {
      console.error('Failed to sync quote:', error);
    }
  }
  
  async syncClient(client) {
    try {
      const response = await fetch('/api/clients', {
        method: client.isLocal ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(client)
      });
      
      if (response.ok) {
        const result = await response.json();
        client.id = result.id || client.id;
        client.syncStatus = 'synced';
        client.isLocal = false;
        await this.put(STORES.CLIENTS, client);
      }
    } catch (error) {
      console.error('Failed to sync client:', error);
    }
  }
  
  async fetchLatestData() {
    try {
      // Fetch work items
      const itemsResponse = await fetch('/api/work-items');
      if (itemsResponse.ok) {
        const items = await itemsResponse.json();
        for (const item of items) {
          item.syncStatus = 'synced';
          await this.put(STORES.WORK_ITEMS, item);
        }
      }
      
      // Fetch materials
      const matsResponse = await fetch('/api/materials');
      if (matsResponse.ok) {
        const materials = await matsResponse.json();
        for (const mat of materials) {
          mat.syncStatus = 'synced';
          await this.put(STORES.MATERIALS, mat);
        }
      }
    } catch (error) {
      console.error('Failed to fetch latest data:', error);
    }
  }
  
  async markAllAsSynced() {
    const stores = [STORES.QUOTES, STORES.CLIENTS, STORES.WORK_ITEMS, STORES.MATERIALS];
    
    for (const storeName of stores) {
      const items = await this.getByIndex(storeName, 'syncStatus', 'pending');
      for (const item of items) {
        item.syncStatus = 'synced';
        await this.put(storeName, item);
      }
    }
  }
  
  // ==================== SETTINGS ====================
  
  async setSetting(key, value) {
    await this.put(STORES.SETTINGS, { key, value });
  }
  
  async getSetting(key) {
    const result = await this.get(STORES.SETTINGS, key);
    return result ? result.value : null;
  }
  
  // ==================== LOW-LEVEL OPERATIONS ====================
  
  async put(storeName, data) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(data);
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
  
  async get(storeName, id) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(id);
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
  
  async getAll(storeName) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
  
  async getByIndex(storeName, indexName, value) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const index = store.index(indexName);
      const request = index.getAll(value);
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
  
  async delete(storeName, id) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(id);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
  
  // ==================== UTILITY ====================
  
  async clearAllData() {
    const stores = Object.values(STORES);
    for (const storeName of stores) {
      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      await store.clear();
    }
    console.log('[IndexedDB] All data cleared');
  }
  
  async getStats() {
    const stats = {};
    const stores = Object.values(STORES);
    
    for (const storeName of stores) {
      const items = await this.getAll(storeName);
      stats[storeName] = items.length;
    }
    
    return stats;
  }
}

// Create global instance
const offlineDB = new OfflineDB();

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
  try {
    await offlineDB.init();
    console.log('[IndexedDB] Ready');
    
    // Initial sync if online
    if (navigator.onLine) {
      offlineDB.triggerSync();
    }
  } catch (error) {
    console.error('[IndexedDB] Initialization failed:', error);
  }
});

// Export for use in app
window.offlineDB = offlineDB;
