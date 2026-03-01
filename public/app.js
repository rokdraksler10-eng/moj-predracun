function app() {
  return {
    // State
    page: 'quotes',
    quotes: [],
    workItems: [],
    materials: [],
    clients: [],
    company: {},
    categories: [],
    
    // UI State
    loading: false,
    showSplash: true,
    showWelcome: false,
    searchQuery: '',
    filterStatus: '',
    filteredQuotes: [],
    darkMode: false,
    
    // User favorites (persisted in localStorage)
    favoriteItems: [],
    
    // Quote form state
    currentQuote: null,
    showAddItem: false,
    showNewItem: false,
    showNewMaterial: false,
    saving: false,
    
    // Add item modal state
    selectedCategory: '',
    selectedItem: '',
    newItemQuantity: 1,
    newItemDifficulty: 'medium',
    newItemNotes: '',
    filteredItems: [],
    
    // New item creation
    showAddItemMenu: false,
    showCreateItemForm: false,
    showMarketItems: false,
    newItemForm: {
      name: '',
      category: '',
      unit: 'm²',
      base_price: 0,
      description: ''
    },
    marketItems: [],
    selectedMarketItem: null,
    
    // Edit item
    showEditItemForm: false,
    editingItemId: null,
    editItemForm: {
      name: '',
      category: '',
      unit: 'm²',
      base_price: 0,
      description: ''
    },
    
    // Materials
    showMaterialModal: false,
    editingMaterial: false,
    editingMaterialId: null,
    materialForm: {
      name: '',
      category: '',
      unit: 'kg',
      unit_price: 0,
      description: ''
    },
    
    // Calculator
    measurements: [],
    newMeasurement: {
      type: 'floor',
      name: '',
      length: '',
      width: '',
      quantity: 1
    },
    calculatorNotes: '',
    totalArea: 0,
    
    // Search
    searchQuery: '',
    materialSearchQuery: '',
    filteredMaterials: [],
    
    // Calculator to Quote
    showCalculatorQuoteModal: false,
    showAddSingleItemModal: false,
    calculatorQuoteItems: [],
    calculatorQuoteTotal: 0,
    calculatorQuoteTotalArea: 0,
    selectedMeasurementForItem: null,
    selectedMeasurementIndex: null,
    
    // Sync
    syncCode: null,
    syncExpires: null,
    enterSyncCode: '',
    syncError: null,
    syncSuccess: null,
    
    // User preferences
    confirmDelete: localStorage.getItem('gradbeniApp_confirmDelete') !== null 
      ? localStorage.getItem('gradbeniApp_confirmDelete') === 'true' 
      : true, // Potrdi pred izbrisom (true/false)
    singleItemCategory: '',
    singleItemWorkItemId: '',
    singleItemDifficulty: 'medium',
    singleItemPricePerUnit: 0,
    singleItemSubtotal: 0,
    filteredItemsForSingleModal: [],
    
    // Init
    async init() {
      this.loadFavorites();
      this.loadDarkMode(); // Load dark mode preference
      await this.loadData();
      await this.loadQuotes(); // Load all quotes
      this.loadCustomItems(); // Load user-added items
      this.loadMaterials(); // Load saved materials
      this.loadCalculatorData(); // Load calculator data
      
      // Add demo data if first time user (no items at all)
      this.addDemoDataIfNeeded();
      
      this.extractCategories(); // Extract after loading items
      this.filteredItems = this.getSortedItems();
      this.filteredMaterials = [...this.materials];
      
      // Watch for confirmDelete changes and save to localStorage
      this.$watch('confirmDelete', (value) => {
        localStorage.setItem('gradbeniApp_confirmDelete', value ? 'true' : 'false');
      });
      
      feather.replace();
      console.log('App initialized with', this.workItems.length, 'items,', this.materials.length, 'materials,', this.quotes.length, 'quotes and', this.categories.length, 'categories');
    },
    
    // Add demo data for first-time users
    addDemoDataIfNeeded() {
      // Check if user has any items or materials
      const hasItems = this.workItems.length > 0;
      const hasMaterials = this.materials.length > 0;
      const demoShown = localStorage.getItem('gradbeniApp_demoShown');
      
      if (!hasItems && !hasMaterials && !demoShown) {
        console.log('Adding demo data for first-time user');
        
        // Demo work items
        this.workItems = [
          {
            id: 'demo_1',
            name: 'Polaganje keramičnih ploščic',
            category: 'Keramika',
            unit: 'm²',
            base_price: 25.00,
            description: 'Polaganje ploščic na tleh in stenah',
            difficulty_easy_factor: 0.8,
            difficulty_medium_factor: 1.0,
            difficulty_hard_factor: 1.3,
            isDemo: true
          },
          {
            id: 'demo_2',
            name: 'Montaža suhomontaže',
            category: 'Suhomontaža',
            unit: 'm²',
            base_price: 18.00,
            description: 'Montaža GK sten in stropov',
            difficulty_easy_factor: 0.8,
            difficulty_medium_factor: 1.0,
            difficulty_hard_factor: 1.3,
            isDemo: true
          },
          {
            id: 'demo_3',
            name: 'Barvanje sten',
            category: 'Pleskarija',
            unit: 'm²',
            base_price: 8.50,
            description: 'Dva sloja barve na stene',
            difficulty_easy_factor: 0.8,
            difficulty_medium_factor: 1.0,
            difficulty_hard_factor: 1.3,
            isDemo: true
          },
          {
            id: 'demo_4',
            name: 'Elektro inštalacija',
            category: 'Elektro',
            unit: 'točka',
            base_price: 45.00,
            description: 'Vtičnica, stikalo ali priključek',
            difficulty_easy_factor: 0.8,
            difficulty_medium_factor: 1.0,
            difficulty_hard_factor: 1.3,
            isDemo: true
          }
        ];
        
        // Demo materials
        this.materials = [
          {
            id: 'demo_mat_1',
            name: 'Keramične ploščice',
            category: 'Keramika',
            unit: 'm²',
            unit_price: 15.00,
            description: 'Standardne keramične ploščice'
          },
          {
            id: 'demo_mat_2',
            name: 'Sádrokarton plošča',
            category: 'Suhomontaža',
            unit: 'm²',
            unit_price: 4.50,
            description: 'GK plošča 12.5mm'
          },
          {
            id: 'demo_mat_3',
            name: 'Disperzijska barva',
            category: 'Pleskarija',
            unit: 'L',
            unit_price: 8.00,
            description: 'Notranja bela barva'
          }
        ];
        
        // Mark demo as shown
        localStorage.setItem('gradbeniApp_demoShown', 'true');
        
        // Auto-favorite demo items
        this.workItems.forEach(item => {
          this.favoriteItems.push(item.id);
        });
        this.saveFavorites();
        this.saveCustomItems();
        this.saveMaterials();
        
        // Show welcome modal (only if not shown before)
        const welcomeShown = localStorage.getItem('gradbeniApp_welcomeShown');
        if (!welcomeShown) {
          setTimeout(() => {
            this.showWelcome = true;
          }, 300);
        }
      }
      
      // Hide splash screen after initialization
      setTimeout(() => {
        this.showSplash = false;
      }, 1000);
    },
    
    // Load favorites from localStorage
    loadFavorites() {
      try {
        const saved = localStorage.getItem('gradbeniApp_favorites');
        if (saved) {
          this.favoriteItems = JSON.parse(saved);
        }
      } catch (e) {
        console.error('Error loading favorites:', e);
      }
    },
    
    // Save favorites to localStorage
    saveFavorites() {
      try {
        localStorage.setItem('gradbeniApp_favorites', JSON.stringify(this.favoriteItems));
      } catch (e) {
        console.error('Error saving favorites:', e);
      }
    },
    
    // Close welcome modal
    closeWelcome() {
      this.showWelcome = false;
      // Mark welcome as shown
      localStorage.setItem('gradbeniApp_welcomeShown', 'true');
    },
    
    // Toggle dark mode
    toggleDarkMode() {
      this.darkMode = !this.darkMode;
      this.applyDarkMode();
      localStorage.setItem('gradbeniApp_darkMode', this.darkMode ? 'true' : 'false');
    },
    
    // Toggle confirm delete setting
    toggleConfirmDelete() {
      this.confirmDelete = !this.confirmDelete;
      localStorage.setItem('gradbeniApp_confirmDelete', this.confirmDelete ? 'true' : 'false');
    },
    
    // Apply dark mode to document
    applyDarkMode() {
      if (this.darkMode) {
        document.documentElement.setAttribute('data-theme', 'dark');
      } else {
        document.documentElement.removeAttribute('data-theme');
      }
    },
    
    // Load dark mode preference
    loadDarkMode() {
      try {
        const saved = localStorage.getItem('gradbeniApp_darkMode');
        if (saved === 'true') {
          this.darkMode = true;
          this.applyDarkMode();
        }
      } catch (e) {
        console.error('Error loading dark mode:', e);
      }
    },
    
    // Load all quotes
    async loadQuotes() {
      try {
        const res = await fetch('/api/quotes');
        this.quotes = await res.json();
        this.filterQuotes(); // Initialize filtered quotes
      } catch (error) {
        console.error('Error loading quotes:', error);
      }
    },
    
    // Filter quotes based on search and status
    filterQuotes() {
      let filtered = this.quotes;
      
      // Filter by search query
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        filtered = filtered.filter(q => 
          (q.project_name || '').toLowerCase().includes(query) ||
          (q.client_name || '').toLowerCase().includes(query) ||
          (q.project_address || '').toLowerCase().includes(query)
        );
      }
      
      // Filter by status
      if (this.filterStatus) {
        filtered = filtered.filter(q => q.status === this.filterStatus);
      }
      
      this.filteredQuotes = filtered;
    },
    
    // Toggle favorite status
    toggleFavorite(itemId) {
      const index = this.favoriteItems.indexOf(itemId);
      if (index === -1) {
        this.favoriteItems.push(itemId);
      } else {
        this.favoriteItems.splice(index, 1);
      }
      this.saveFavorites();
      
      // Re-sort items
      this.filteredItems = this.getSortedItems();
    },
    
    // Check if item is favorite
    isFavorite(itemId) {
      return this.favoriteItems.includes(itemId);
    },
    
    // Get items grouped by category, with favorites first in each category
    getGroupedItems() {
      const grouped = {};
      
      // Group by category
      this.workItems.forEach(item => {
        if (!grouped[item.category]) {
          grouped[item.category] = [];
        }
        grouped[item.category].push(item);
      });
      
      // Sort within each category: favorites first, then by name
      Object.keys(grouped).forEach(category => {
        grouped[category].sort((a, b) => {
          const aFav = this.isFavorite(a.id);
          const bFav = this.isFavorite(b.id);
          
          if (aFav && !bFav) return -1;
          if (!aFav && bFav) return 1;
          return a.name.localeCompare(b.name);
        });
      });
      
      return grouped;
    },
    
    // Get market items grouped by category
    getMarketItemsGrouped() {
      const grouped = {};
      this.marketItems.forEach(item => {
        if (!grouped[item.category]) {
          grouped[item.category] = [];
        }
        grouped[item.category].push(item);
      });
      return grouped;
    },
    
    // Get only favorite items
    getFavoriteItems() {
      return this.workItems.filter(item => this.isFavorite(item.id));
    },
    
    // Load all data
    async loadData() {
      try {
        const [itemsRes, materialsRes, clientsRes, companyRes] = await Promise.all([
          fetch('/api/work-items'),
          fetch('/api/materials'),
          fetch('/api/clients'),
          fetch('/api/company')
        ]);
        
        this.workItems = await itemsRes.json();
        this.materials = await materialsRes.json();
        this.clients = await clientsRes.json();
        this.company = await companyRes.json();
      } catch (error) {
        console.error('Error loading data:', error);
      }
    },
    
    // Extract unique categories
    extractCategories() {
      console.log('Extracting categories from', this.workItems.length, 'items');
      const cats = new Set(this.workItems.map(i => i.category));
      this.categories = Array.from(cats).sort();
      console.log('Categories found:', this.categories);
    },
    
    // Filter items by category
    filterItems() {
      if (!this.selectedCategory) {
        this.filteredItems = this.getSortedItems();
      } else {
        this.filteredItems = this.workItems.filter(i => i.category === this.selectedCategory);
      }
    },
    
    // Filter items for quote (by selected category)
    filterItemsForQuote() {
      console.log('Filtering items, selected category:', this.selectedCategory);
      console.log('Total work items:', this.workItems.length);
      
      // Reset selected item when category changes
      this.selectedItem = '';
      
      // Create a copy of workItems to avoid modifying original
      let items = [...this.workItems];
      
      // Filter by category if selected
      if (this.selectedCategory && this.selectedCategory !== '') {
        items = items.filter(i => i.category === this.selectedCategory);
        console.log('Filtered by category, count:', items.length);
      }
      
      // Sort: favorites first, then by name
      items.sort((a, b) => {
        const aFav = this.isFavorite(a.id);
        const bFav = this.isFavorite(b.id);
        
        if (aFav && !bFav) return -1;
        if (!aFav && bFav) return 1;
        return a.name.localeCompare(b.name);
      });
      
      this.filteredItems = items;
      console.log('Final filtered items:', this.filteredItems.length);
    },
    
    // Create new quote
    newQuote() {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 30);
      
      this.currentQuote = {
        id: null,
        project_name: '',
        project_address: '',
        client_name: '',
        valid_until: tomorrow.toISOString().split('T')[0],
        items: [],
        subtotal: 0,
        tax_amount: 0,
        total: 0,
        material_total: 0,
        labor_total: 0
      };
      
      // Reset filters
      this.selectedCategory = '';
      this.selectedItem = '';
      this.newItemQuantity = 1;
      this.newItemDifficulty = 'medium';
      this.newItemNotes = '';
      
      // Update categories and items
      this.extractCategories();
      this.filterItemsForQuote();
    },
    
    // Load existing quote
    async loadQuote(id) {
      try {
        const res = await fetch(`/api/quotes/${id}`);
        const quote = await res.json();
        this.currentQuote = quote;
      } catch (error) {
        console.error('Error loading quote:', error);
      }
    },
    
    // Get work item name by ID
    getWorkItemName(id) {
      // First check if it's stored in the quote item
      const quoteItem = this.currentQuote?.items?.find(i => i.work_item_id == id);
      if (quoteItem && quoteItem.workItemName) {
        return quoteItem.workItemName;
      }
      // Otherwise look up in workItems
      const item = this.workItems.find(i => i.id == id);
      return item ? item.name : (quoteItem ? 'Shranjena postavka' : 'Neznana postavka');
    },
    
    // Get work item by ID
    getWorkItem(id) {
      return this.workItems.find(i => i.id == id);
    },
    
    // Calculate item subtotal
    calculateItem(item) {
      // Calculate subtotal from current price and quantity
      // Don't reset price - let user edit it manually
      item.subtotal = Math.round(item.quantity * item.price_per_unit * 100) / 100;
      
      this.calculateTotals();
    },
    
    // Recalculate price from work item base price (when adding new item)
    recalculateItemPrice(item) {
      const workItem = this.getWorkItem(item.work_item_id);
      if (!workItem) return;
      
      // Apply difficulty factor
      let factor = 1.0;
      switch(item.difficulty) {
        case 'easy': factor = workItem.difficulty_easy_factor || 0.8; break;
        case 'hard': factor = workItem.difficulty_hard_factor || 1.3; break;
        default: factor = workItem.difficulty_medium_factor || 1.0;
      }
      
      item.price_per_unit = Math.round(workItem.base_price * factor * 100) / 100;
      item.subtotal = Math.round(item.quantity * item.price_per_unit * 100) / 100;
      
      this.calculateTotals();
    },
    
    // Calculate quote totals
    calculateTotals() {
      let subtotal = 0;
      let materialTotal = 0;
      let laborTotal = 0;
      
      this.currentQuote.items.forEach(item => {
        const workItem = this.getWorkItem(item.work_item_id);
        if (!workItem) return;
        
        // Labor cost
        laborTotal += item.subtotal || 0;
        
        // Material cost
        const materialRatio = 0.6;
        materialTotal += (item.subtotal || 0) * materialRatio;
      });
      
      subtotal = laborTotal + materialTotal;
      const taxRate = 22;
      const taxAmount = subtotal * (taxRate / 100);
      const total = subtotal + taxAmount;
      
      this.currentQuote.subtotal = Math.round(subtotal * 100) / 100;
      this.currentQuote.tax_amount = Math.round(taxAmount * 100) / 100;
      this.currentQuote.total = Math.round(total * 100) / 100;
      this.currentQuote.material_total = Math.round(materialTotal * 100) / 100;
      this.currentQuote.labor_total = Math.round(laborTotal * 100) / 100;
    },
    
    // Add item to quote
    addItemToQuote() {
      if (!this.selectedItem) {
        alert('Izberi postavko');
        return;
      }
      
      const workItem = this.getWorkItem(this.selectedItem);
      if (!workItem) {
        alert('Postavka ni najdena');
        return;
      }
      
      // Calculate initial price with difficulty factor
      let factor = 1.0;
      switch(this.newItemDifficulty) {
        case 'easy': factor = workItem.difficulty_easy_factor || 0.8; break;
        case 'hard': factor = workItem.difficulty_hard_factor || 1.3; break;
        default: factor = workItem.difficulty_medium_factor || 1.0;
      }
      
      const pricePerUnit = Math.round(workItem.base_price * factor * 100) / 100;
      const quantity = parseFloat(this.newItemQuantity) || 1;
      const subtotal = Math.round(quantity * pricePerUnit * 100) / 100;
      
      this.currentQuote.items.push({
        work_item_id: this.selectedItem,
        quantity: quantity,
        difficulty: this.newItemDifficulty,
        price_per_unit: pricePerUnit,
        notes: this.newItemNotes,
        subtotal: subtotal,
        workItemName: workItem.name // Store name for display
      });
      
      this.calculateTotals();
      
      // Reset modal
      this.showAddItem = false;
      this.selectedItem = '';
      this.newItemQuantity = 1;
      this.newItemDifficulty = 'medium';
      this.newItemNotes = '';
      this.selectedCategory = '';
    },
    
    // Remove item from quote
    removeItem(index) {
      this.currentQuote.items.splice(index, 1);
      this.calculateTotals();
    },
    
    // Save quote
    async saveQuote() {
      this.saving = true;
      
      try {
        let clientId = this.currentQuote.client_id;
        
        // If client_name is provided but no client_id, create client first
        if (this.currentQuote.client_name && !clientId) {
          try {
            const clientRes = await fetch('/api/clients', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                name: this.currentQuote.client_name,
                address: this.currentQuote.project_address || ''
              })
            });
            if (!clientRes.ok) {
              throw new Error('Napaka pri ustvarjanju stranke');
            }
            const clientResult = await clientRes.json();
            if (clientResult.id) {
              clientId = clientResult.id;
              this.currentQuote.client_id = clientId;
            }
          } catch (clientError) {
            console.error('Client creation error:', clientError);
            // Continue without client - database allows NULL
          }
        }
        
        // Prepare data for API - ensure items is an array
        const quoteData = {
          ...this.currentQuote,
          client_id: clientId,
          items: this.currentQuote.items || []
        };
        
        console.log('Saving quote:', quoteData); // Debug log
        
        const res = await fetch('/api/quotes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(quoteData)
        });
        
        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(errorText || 'Server error');
        }
        
        const result = await res.json();
        
        if (result.id) {
          this.currentQuote.id = result.id;
          this.loadQuotes(); // Refresh list
          if (window.showToast) {
            window.showToast('✅ Predračun uspešno shranjen!', 'success');
          } else {
            alert('✅ Predračun shranjen!');
          }
        } else {
          const errorMsg = '❌ Napaka pri shranjevanju: ' + (result.error || 'Neznana napaka');
          if (window.showToast) {
            window.showToast(errorMsg, 'error');
          } else {
            alert(errorMsg);
          }
        }
      } catch (error) {
        console.error('Error saving quote:', error);
        const errorMsg = '❌ Napaka pri shranjevanju: ' + error.message;
        if (window.showToast) {
          window.showToast(errorMsg, 'error');
        } else {
          alert(errorMsg);
        }
      } finally {
        this.saving = false;
      }
    },
    
    // Generate PDF
    generatePDF(type) {
      if (!this.currentQuote.id) {
        if (window.showToast) {
          window.showToast('❌ Najprej shrani predračun', 'error');
        } else {
          alert('Najprej shrani predračun');
        }
        return;
      }
      
      const url = `/api/quotes/${this.currentQuote.id}/pdf/${type}`;
      window.open(url, '_blank');
    },
    
    // Print quote
    printQuote() {
      if (!this.currentQuote) {
        if (window.showToast) {
          window.showToast('❌ Ni predračuna za tiskanje', 'error');
        } else {
          alert('Ni predračuna za tiskanje');
        }
        return;
      }
      
      // Create print-friendly HTML
      const printWindow = window.open('', '_blank');
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Predračun ${this.currentQuote.project_name || ''}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
            h1 { color: #2563eb; border-bottom: 3px solid #2563eb; padding-bottom: 10px; }
            .header { margin-bottom: 30px; }
            .company { font-size: 24px; font-weight: bold; color: #1e293b; }
            .info { margin: 20px 0; }
            .info-row { display: flex; margin: 8px 0; }
            .info-label { width: 150px; font-weight: bold; color: #64748b; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th { background: #f1f5f9; padding: 12px; text-align: left; font-weight: 600; }
            td { padding: 10px 12px; border-bottom: 1px solid #e2e8f0; }
            tr:nth-child(even) { background: #fafafa; }
            .total { font-size: 18px; font-weight: bold; text-align: right; margin-top: 20px; padding: 15px; background: #dbeafe; border-radius: 8px; }
            .footer { margin-top: 40px; padding-top: 20px; border-top: 2px solid #e2e8f0; font-size: 12px; color: #64748b; }
            @media print { body { padding: 20px; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company">${this.company.name || 'Moje Gradbeno Podjetje'}</div>
            <div>${this.company.address || ''}</div>
            <div>Tel: ${this.company.phone || ''} | Email: ${this.company.email || ''}</div>
          </div>
          
          <h1>PREDRAČUN #${this.currentQuote.id}</h1>
          
          <div class="info">
            <div class="info-row">
              <div class="info-label">Projekt:</div>
              <div>${this.currentQuote.project_name || 'Brez naziva'}</div>
            </div>
            <div class="info-row">
              <div class="info-label">Stranka:</div>
              <div>${this.currentQuote.client_name || 'Brez stranke'}</div>
            </div>
            <div class="info-row">
              <div class="info-label">Lokacija:</div>
              <div>${this.currentQuote.project_address || ''}</div>
            </div>
            <div class="info-row">
              <div class="info-label">Datum:</div>
              <div>${new Date().toLocaleDateString('sl-SI')}</div>
            </div>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Postavka</th>
                <th style="text-align: center;">Kol.</th>
                <th style="text-align: right;">Cena</th>
                <th style="text-align: right;">Znesek</th>
              </tr>
            </thead>
            <tbody>
              ${this.currentQuote.items?.map(item => `
                <tr>
                  <td>${this.getWorkItemName(item.work_item_id)}</td>
                  <td style="text-align: center;">${item.quantity} ${item.work_item_unit || 'm²'}</td>
                  <td style="text-align: right;">${item.price_per_unit?.toFixed(2)} €</td>
                  <td style="text-align: right;">${item.subtotal?.toFixed(2)} €</td>
                </tr>
              `).join('') || ''}
            </tbody>
          </table>
          
          <div class="total">
            SKUPAJ: ${this.currentQuote.total?.toFixed(2)} € (z DDV)
          </div>
          
          <div class="footer">
            <p>Hvala za zaupanje!</p>
            <p>${this.company.name || ''} | ${this.company.phone || ''} | ${this.company.email || ''}</p>
          </div>
          
          <script>
            window.onload = function() { window.print(); };
          </script>
        </body>
        </html>
      `;
      
      printWindow.document.write(html);
      printWindow.document.close();
    },
    
    // Export to CSV
    exportCSV() {
      if (!this.currentQuote) {
        if (window.showToast) {
          window.showToast('❌ Ni predračuna za izvoz', 'error');
        } else {
          alert('Ni predračuna za izvoz');
        }
        return;
      }
      
      // Create CSV content
      let csv = 'Postavka,Kolicina,Enota,Cena na enoto,Znesek\n';
      
      this.currentQuote.items?.forEach(item => {
        const name = this.getWorkItemName(item.work_item_id);
        const quantity = item.quantity;
        const unit = item.work_item_unit || 'm²';
        const price = item.price_per_unit?.toFixed(2);
        const total = item.subtotal?.toFixed(2);
        csv += `"${name}",${quantity},"${unit}",${price},${total}\n`;
      });
      
      csv += `\nSkupaj brez DDV,,,,${this.currentQuote.subtotal?.toFixed(2)}\n`;
      csv += `DDV (22%),,,,${this.currentQuote.tax_amount?.toFixed(2)}\n`;
      csv += `SKUPAJ,,,,${this.currentQuote.total?.toFixed(2)}\n`;
      
      // Download CSV
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `predracun-${this.currentQuote.id || 'nov'}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      if (window.showToast) {
        window.showToast('✅ CSV izvožen!', 'success');
      }
    },
    
    // Save company settings
    async saveCompany() {
      try {
        const res = await fetch('/api/company', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(this.company)
        });
        
        if (res.ok) {
          if (window.showToast) {
            window.showToast('✅ Nastavitve shranjene!', 'success');
          } else {
            alert('Nastavitve shranjene!');
          }
        } else {
          if (window.showToast) {
            window.showToast('❌ Napaka pri shranjevanju', 'error');
          } else {
            alert('Napaka pri shranjevanju');
          }
        }
      } catch (error) {
        console.error('Error saving company:', error);
        if (window.showToast) {
          window.showToast('❌ Napaka pri shranjevanju', 'error');
        } else {
          alert('Napaka pri shranjevanju');
        }
      }
    },
    
    // SYNC FUNCTIONS
    async generateSyncCode() {
      try {
        // Prepare data to sync
        const syncData = {
          quotes: this.quotes,
          workItems: this.workItems,
          materials: this.materials,
          clients: this.clients,
          company: this.company,
          syncDate: new Date().toISOString()
        };
        
        const res = await fetch('/api/sync/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: syncData })
        });
        
        if (res.ok) {
          const result = await res.json();
          this.syncCode = result.code;
          this.syncExpires = new Date(result.expiresAt).toLocaleString('sl-SI');
          if (window.showToast) {
            window.showToast('✅ Koda ustvarjena! Veljavna 24 ur.', 'success');
          }
        } else {
          if (window.showToast) {
            window.showToast('❌ Napaka pri ustvarjanju kode', 'error');
          }
        }
      } catch (error) {
        console.error('Error generating sync code:', error);
        if (window.showToast) {
          window.showToast('❌ Napaka pri sinhronizaciji', 'error');
        }
      }
    },
    
    async retrieveSyncData() {
      try {
        if (!this.enterSyncCode || this.enterSyncCode.length < 4) {
          this.syncError = 'Vnesi veljavno kodo';
          return;
        }
        
        this.syncError = null;
        this.syncSuccess = null;
        
        const res = await fetch('/api/sync/retrieve', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: this.enterSyncCode.trim() })
        });
        
        if (res.ok) {
          const result = await res.json();
          const data = result.data;
          
          // Confirm before overwriting
          if (!confirm('⚠️ To bo prepisalo vse trenutne podatke s podatki iz druge naprave. Nadaljujem?')) {
            return;
          }
          
          // Update all data
          if (data.quotes) this.quotes = data.quotes;
          if (data.workItems) this.workItems = data.workItems;
          if (data.materials) this.materials = data.materials;
          if (data.clients) this.clients = data.clients;
          if (data.company) this.company = data.company;
          
          // Save to local database
          await this.saveSyncedData();
          
          this.syncSuccess = '✅ Podatki uspešno sinhronizirani!';
          this.enterSyncCode = '';
          if (window.showToast) {
            window.showToast('✅ Sinhronizacija uspešna!', 'success');
          }
        } else {
          const error = await res.json();
          this.syncError = error.error || 'Neveljavna ali potekla koda';
        }
      } catch (error) {
        console.error('Error retrieving sync data:', error);
        this.syncError = 'Napaka pri sinhronizaciji. Poskusi znova.';
      }
    },
    
    async saveSyncedData() {
      // Save company settings
      await fetch('/api/company', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(this.company)
      });
      
      // Note: Quotes, items, materials would need individual API calls
      // For simplicity, we'll reload the page to refresh from DB
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    },
    
    // Format price
    formatPrice(price) {
      return new Intl.NumberFormat('sl-SI', {
        style: 'currency',
        currency: 'EUR'
      }).format(price || 0);
    },
    
    // Format date
    formatDate(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleDateString('sl-SI');
    },
    
    // Format date short (for list view)
    formatDateShort(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleDateString('sl-SI', { day: 'numeric', month: 'short' });
    },
    
    // ===== ADD NEW ITEM FEATURES =====
    
    // Open add item menu
    openAddItemMenu() {
      this.showAddItemMenu = true;
    },
    
    // Show create item form
    showCreateForm() {
      this.showAddItemMenu = false;
      this.showCreateItemForm = true;
      this.newItemForm = {
        name: '',
        category: '',
        unit: 'm²',
        base_price: 0,
        description: ''
      };
    },
    
    // Show market items
    showMarketDatabase() {
      this.showAddItemMenu = false;
      this.showMarketItems = true;
      this.loadMarketItems();
    },
    
    // Load market items with +10% prices
    loadMarketItems() {
      // Pre-made items with current Slovenian market prices + 10%
      this.marketItems = [
        // KERAMIKA
        { id: 'm1', name: 'Polaganje keramičnih ploščic', category: 'Keramika', unit: 'm²', base_price: 27.5, description: 'Polaganje talnih in stenskih ploščic' },
        { id: 'm2', name: 'Polaganje mozaika', category: 'Keramika', unit: 'm²', base_price: 35.2, description: 'Polaganje mozaičnih ploščic' },
        { id: 'm3', name: 'Silikoniranje fug', category: 'Keramika', unit: 'm²', base_price: 8.8, description: 'Silikoniranje med ploščicami' },
        { id: 'm4', name: 'Demontaža starih ploščic', category: 'Keramika', unit: 'm²', base_price: 16.5, description: 'Odstranjevanje starih ploščic' },
        
        // SUHOMONTAŽA
        { id: 'm5', name: 'Montaža GK stene', category: 'Suhomontaža', unit: 'm²', base_price: 22, description: 'Predelna stena iz sádrokartona' },
        { id: 'm6', name: 'Montaža GK stropa', category: 'Suhomontaža', unit: 'm²', base_price: 19.8, description: 'Spuščen strop iz sádrokartona' },
        { id: 'm7', name: 'Kitanje in brušenje GK', category: 'Suhomontaža', unit: 'm²', base_price: 13.2, description: 'Kitanje spojev in brušenje' },
        { id: 'm8', name: 'Montaža obrob', category: 'Suhomontaža', unit: 'm', base_price: 4.4, description: 'Kovinske obrobe za GK' },
        
        // PLESKARIJA
        { id: 'm9', name: 'Barvanje sten - 2x', category: 'Pleskarija', unit: 'm²', base_price: 11, description: 'Dva sloja barve na stene' },
        { id: 'm10', name: 'Barvanje stropa - 2x', category: 'Pleskarija', unit: 'm²', base_price: 13.2, description: 'Dva sloja barve na strop' },
        { id: 'm11', name: 'Temeljno barvanje', category: 'Pleskarija', unit: 'm²', base_price: 5.5, description: 'Temeljni premaz pred barvanjem' },
        { id: 'm12', name: 'Odstranjevanje starih tapet', category: 'Pleskarija', unit: 'm²', base_price: 8.8, description: 'Odstranjevanje in čiščenje' },
        
        // ELEKTRO
        { id: 'm13', name: 'Vticnica IP44', category: 'Elektro', unit: 'kos', base_price: 49.5, description: 'Montaža vtičnice za kopalnico' },
        { id: 'm14', name: 'Stikalo za luč', category: 'Elektro', unit: 'kos', base_price: 44, description: 'Navadno stikalo za razsvetljavo' },
        { id: 'm15', name: 'Montaža svetila', category: 'Elektro', unit: 'kos', base_price: 71.5, description: 'Vgradnja notranjega svetila' },
        { id: 'm16', name: 'Prenos vtičnice', category: 'Elektro', unit: 'kos', base_price: 82.5, description: 'Premik vtičnice na novo mesto' },
        
        // VODOVOD
        { id: 'm17', name: 'Montaža umivalnika', category: 'Vodovod', unit: 'kos', base_price: 165, description: 'Priklop umivalnika z armaturami' },
        { id: 'm18', name: 'Montaža WC školjke', category: 'Vodovod', unit: 'kos', base_price: 198, description: 'Namestitev WC-ja z geberitom' },
        { id: 'm19', name: 'Montaža tuš kabine', category: 'Vodovod', unit: 'kos', base_price: 275, description: 'Polna montaža tuš kabine' },
        { id: 'm20', name: 'Priklop pralnega stroja', category: 'Vodovod', unit: 'kos', base_price: 110, description: 'Priklop na vodo in odtok' },
        
        // TALNE OBLOGE
        { id: 'm21', name: 'Polaganje laminata', category: 'Talne obloge', unit: 'm²', base_price: 16.5, description: 'Montaža laminatnih podov' },
        { id: 'm22', name: 'Polaganje vinila', category: 'Talne obloge', unit: 'm²', base_price: 19.8, description: 'Vgradnja vinilnih talnih oblog' },
        { id: 'm23', name: 'Polaganje parketa', category: 'Talne obloge', unit: 'm²', base_price: 30.8, description: 'Masivni ali vezen parket' },
        { id: 'm24', name: 'Postavitev podloge', category: 'Talne obloge', unit: 'm²', base_price: 8.8, description: 'Polaganje izolacijske podlage' },
        
        // IZOLACIJE
        { id: 'm25', name: 'Hidroizolacija flex', category: 'Izolacije', unit: 'm²', base_price: 19.8, description: 'Flexibilna hidroizolacija 2-komponentna' },
        { id: 'm26', name: 'Termoizolacija stene', category: 'Izolacije', unit: 'm²', base_price: 27.5, description: 'Stiropor + lepilo + mrežica' },
        { id: 'm27', name: 'Zvočna izolacija', category: 'Izolacije', unit: 'm²', base_price: 22, description: 'Zvočno izoliranje podov ali sten' },
        
        // OKNA IN VRATA
        { id: 'm28', name: 'Montaža PVC okna', category: 'Okna in vrata', unit: 'kos', base_price: 220, description: 'Vgradnja okna z odstranitvijo starega' },
        { id: 'm29', name: 'Montaža vhodnih vrat', category: 'Okna in vrata', unit: 'kos', base_price: 385, description: 'Polna montaža vhodnih vrat' },
        { id: 'm30', name: 'Montaža notranjih vrat', category: 'Okna in vrata', unit: 'kos', base_price: 165, description: 'Vgradnja sobnega vrata s podboji' }
      ];
    },
    
    // Create custom item
    createCustomItem() {
      if (!this.newItemForm.name || !this.newItemForm.category) {
        alert('Vnesi ime in kategorijo postavke');
        return;
      }
      
      // Generate temporary ID
      const tempId = 'custom_' + Date.now();
      
      const newItem = {
        id: tempId,
        name: this.newItemForm.name,
        category: this.newItemForm.category,
        unit: this.newItemForm.unit,
        base_price: parseFloat(this.newItemForm.base_price) || 0,
        description: this.newItemForm.description,
        difficulty_easy_factor: 0.8,
        difficulty_medium_factor: 1.0,
        difficulty_hard_factor: 1.3,
        isCustom: true
      };
      
      // Add to work items
      this.workItems.push(newItem);
      
      // Auto-favorite it
      this.toggleFavorite(tempId);
      
      // Save to localStorage
      this.saveCustomItems();
      
      // Reset and close
      this.showCreateItemForm = false;
      this.extractCategories();
      
      // Refresh items
      this.filteredItems = this.getSortedItems();
      
      // If we're in a quote, also add it to the quote
      if (this.currentQuote) {
        const pricePerUnit = parseFloat(this.newItemForm.base_price) || 0;
        const quantity = 1;
        const subtotal = pricePerUnit;
        
        this.currentQuote.items.push({
          work_item_id: tempId,
          quantity: quantity,
          difficulty: 'medium',
          price_per_unit: pricePerUnit,
          notes: '',
          subtotal: subtotal,
          workItemName: this.newItemForm.name
        });
        
        this.calculateTotals();
        alert('Postavka ustvarjena in dodana v predračun!');
      } else {
        alert('Postavka uspešno dodana!');
      }
    },
    
    // Add market item to database
    addMarketItem(item) {
      // Check if already exists
      const exists = this.workItems.find(i => i.name === item.name);
      if (exists) {
        alert('Ta postavka že obstaja!');
        return;
      }
      
      // Generate temporary ID
      const tempId = 'market_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      
      const newItem = {
        id: tempId,
        name: item.name,
        category: item.category,
        unit: item.unit,
        base_price: item.base_price,
        description: item.description,
        difficulty_easy_factor: 0.8,
        difficulty_medium_factor: 1.0,
        difficulty_hard_factor: 1.3,
        isMarketItem: true
      };
      
      // Add to work items
      this.workItems.push(newItem);
      
      // Auto-favorite it
      this.toggleFavorite(tempId);
      
      // Save to localStorage
      this.saveCustomItems();
      
      alert(`Postavka "${item.name}" dodana!`);
    },
    
    // Save all items to localStorage
    saveCustomItems() {
      try {
        localStorage.setItem('gradbeniApp_allItems', JSON.stringify(this.workItems));
      } catch (e) {
        console.error('Error saving items:', e);
      }
    },
    
    // Load all items from localStorage
    loadCustomItems() {
      try {
        const saved = localStorage.getItem('gradbeniApp_allItems');
        if (saved) {
          const savedItems = JSON.parse(saved);
          // Replace workItems with saved items
          if (savedItems.length > 0) {
            this.workItems = savedItems;
          }
        }
      } catch (e) {
        console.error('Error loading items:', e);
      }
    },
    
    // Close all add item modals
    closeAddItemModals() {
      this.showAddItemMenu = false;
      this.showCreateItemForm = false;
      this.showMarketItems = false;
      this.showEditItemForm = false;
    },
    
    // For quote - show create form and add directly to quote
    showCreateItemForQuote() {
      this.showCreateItemForm = true;
      this.newItemForm = {
        name: '',
        category: '',
        unit: 'm²',
        base_price: 0,
        description: ''
      };
    },
    
    // For quote - show market items and add directly to quote
    showMarketItemsForQuote() {
      this.showMarketItems = true;
      this.loadMarketItems();
    },
    
    // Show select existing item modal
    showSelectExisting: false,
    showSelectExistingItem() {
      this.showSelectExisting = true;
      this.filteredItems = this.getSortedItems();
      this.selectedCategory = '';
      this.selectedItem = '';
      this.newItemQuantity = 1;
      this.newItemDifficulty = 'medium';
      this.newItemNotes = '';
    },
    
    // Close quote item modals
    closeQuoteItemModals() {
      this.showSelectExisting = false;
      this.showAddItem = false;
    },
    
    // Add market item directly to quote
    addMarketItemToQuote(marketItem) {
      // Add to work items first
      const tempId = 'market_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      const newItem = {
        id: tempId,
        name: marketItem.name,
        category: marketItem.category,
        unit: marketItem.unit,
        base_price: marketItem.base_price,
        description: marketItem.description,
        difficulty_easy_factor: 0.8,
        difficulty_medium_factor: 1.0,
        difficulty_hard_factor: 1.3,
        isMarketItem: true
      };
      
      this.workItems.push(newItem);
      this.saveCustomItems();
      this.extractCategories();
      
      // Now add to quote
      let factor = 1.0;
      switch(this.newItemDifficulty) {
        case 'easy': factor = 0.8; break;
        case 'hard': factor = 1.3; break;
        default: factor = 1.0;
      }
      
      const pricePerUnit = Math.round(marketItem.base_price * factor * 100) / 100;
      const quantity = parseFloat(this.newItemQuantity) || 1;
      const subtotal = Math.round(quantity * pricePerUnit * 100) / 100;
      
      this.currentQuote.items.push({
        work_item_id: tempId,
        quantity: quantity,
        difficulty: this.newItemDifficulty,
        price_per_unit: pricePerUnit,
        notes: this.newItemNotes,
        subtotal: subtotal,
        workItemName: marketItem.name
      });
      
      this.calculateTotals();
      
      // Reset
      this.showMarketItems = false;
      this.newItemQuantity = 1;
      this.newItemDifficulty = 'medium';
      this.newItemNotes = '';
      
      alert(`Postavka "${marketItem.name}" dodana v predračun!`);
    },
    
    // Check if item can be edited/deleted (all items are editable)
    canEditItem(itemId) {
      return true; // All items can be edited and deleted
    },
    
    // Open edit form
    openEditItem(item) {
      if (!this.canEditItem(item.id)) {
        alert('Te postavke ni mogoče urejati. Lahko urejaš samo postavke, ki si jih sam dodal.');
        return;
      }
      
      this.editingItemId = item.id;
      this.editItemForm = {
        name: item.name,
        category: item.category,
        unit: item.unit,
        base_price: item.base_price,
        description: item.description || ''
      };
      this.showEditItemForm = true;
    },
    
    // Save edited item
    saveEditedItem() {
      if (!this.editItemForm.name || !this.editItemForm.category) {
        alert('Vnesi ime in kategorijo postavke');
        return;
      }
      
      const itemIndex = this.workItems.findIndex(i => i.id === this.editingItemId);
      if (itemIndex === -1) {
        alert('Postavka ni najdena');
        return;
      }
      
      // Update item
      this.workItems[itemIndex] = {
        ...this.workItems[itemIndex],
        name: this.editItemForm.name,
        category: this.editItemForm.category,
        unit: this.editItemForm.unit,
        base_price: parseFloat(this.editItemForm.base_price) || 0,
        description: this.editItemForm.description
      };
      
      // Save to localStorage
      this.saveCustomItems();
      
      // Refresh categories
      this.extractCategories();
      
      // Close modal
      this.showEditItemForm = false;
      this.editingItemId = null;
      
      alert('Postavka posodobljena!');
    },
    
    // Delete item
    deleteItem(itemId) {
      if (!this.canEditItem(itemId)) {
        alert('Te postavke ni mogoče izbrisati.');
        return;
      }
      
      const item = this.workItems.find(i => i.id === itemId);
      if (this.confirmDelete && !confirm(`Ali res želiš izbrisati postavko "${item.name}"?`)) {
        return;
      }
      
      // Remove from workItems
      this.workItems = this.workItems.filter(i => i.id !== itemId);
      
      // Remove from favorites if it was favorited
      if (this.isFavorite(itemId)) {
        this.toggleFavorite(itemId);
      }
      
      // Save to localStorage
      this.saveCustomItems();
      
      // Refresh categories
      this.extractCategories();
      
      alert('Postavka izbrisana!');
    },
    
    // ===== MATERIALS MANAGEMENT =====
    
    // Open add material modal
    openAddMaterial() {
      this.editingMaterial = false;
      this.editingMaterialId = null;
      this.materialForm = {
        name: '',
        category: '',
        unit: 'kg',
        unit_price: 0,
        description: ''
      };
      this.showMaterialModal = true;
    },
    
    // Edit material
    editMaterial(material) {
      this.editingMaterial = true;
      this.editingMaterialId = material.id;
      this.materialForm = {
        name: material.name,
        category: material.category || '',
        unit: material.unit,
        unit_price: material.unit_price,
        description: material.description || ''
      };
      this.showMaterialModal = true;
    },
    
    // Save material (add or edit)
    saveMaterial() {
      if (!this.materialForm.name) {
        alert('Vnesi naziv materiala');
        return;
      }
      
      if (this.editingMaterial) {
        // Update existing
        const index = this.materials.findIndex(m => m.id === this.editingMaterialId);
        if (index !== -1) {
          this.materials[index] = {
            ...this.materials[index],
            name: this.materialForm.name,
            category: this.materialForm.category,
            unit: this.materialForm.unit,
            unit_price: parseFloat(this.materialForm.unit_price) || 0,
            description: this.materialForm.description
          };
          alert('Material posodobljen!');
        }
      } else {
        // Add new
        const newMaterial = {
          id: 'mat_' + Date.now(),
          name: this.materialForm.name,
          category: this.materialForm.category,
          unit: this.materialForm.unit,
          unit_price: parseFloat(this.materialForm.unit_price) || 0,
          description: this.materialForm.description
        };
        this.materials.push(newMaterial);
        alert('Material dodan!');
      }
      
      // Save to localStorage
      this.saveMaterials();
      
      // Close modal
      this.showMaterialModal = false;
    },
    
    // Delete material
    deleteMaterial(materialId) {
      const material = this.materials.find(m => m.id === materialId);
      if (!material) return;
      
      if (!confirm(`Ali res želiš izbrisati material "${material.name}"?`)) {
        return;
      }
      
      this.materials = this.materials.filter(m => m.id !== materialId);
      this.saveMaterials();
      alert('Material izbrisan!');
    },
    
    // Close material modal
    closeMaterialModal() {
      this.showMaterialModal = false;
    },
    
    // Save materials to localStorage
    saveMaterials() {
      try {
        localStorage.setItem('gradbeniApp_materials', JSON.stringify(this.materials));
      } catch (e) {
        console.error('Error saving materials:', e);
      }
    },
    
    // Load materials from localStorage
    loadMaterials() {
      try {
        const saved = localStorage.getItem('gradbeniApp_materials');
        if (saved) {
          const savedMaterials = JSON.parse(saved);
          if (savedMaterials.length > 0) {
            this.materials = savedMaterials;
          }
        }
      } catch (e) {
        console.error('Error loading materials:', e);
      }
    },
    
    // ===== CALCULATOR =====
    
    // Add measurement
    addMeasurement() {
      if (!this.newMeasurement.length || !this.newMeasurement.width) {
        alert('Vnesi ' + (this.newMeasurement.type === 'wall' ? 'širino in višino' : 'dolžino in širino'));
        return;
      }
      
      const length = parseFloat(this.newMeasurement.length) || 0;
      const width = parseFloat(this.newMeasurement.width) || 0;
      const quantity = parseInt(this.newMeasurement.quantity) || 1;
      const area = length * width * quantity;
      
      const typeLabels = {
        'floor': 'Tla',
        'ceiling': 'Strop',
        'wall': 'Stena'
      };
      
      this.measurements.push({
        type: this.newMeasurement.type,
        typeLabel: typeLabels[this.newMeasurement.type],
        name: this.newMeasurement.name || 'Brez naziva',
        length: length,
        width: width,
        quantity: quantity,
        area: area,
        // For quote integration
        selectedWorkItem: '',
        difficulty: 'medium',
        calculatedPrice: 0,
        addedToQuote: false,
        quoteItemName: ''
      });
      
      this.calculateTotalArea();
      
      // Reset form (keep type)
      const currentType = this.newMeasurement.type;
      this.newMeasurement = {
        type: currentType,
        name: '',
        length: '',
        width: '',
        quantity: 1
      };
      
      this.saveCalculatorData();
    },
    
    // Remove measurement
    removeMeasurement(index) {
      this.measurements.splice(index, 1);
      this.calculateTotalArea();
      this.saveCalculatorData();
    },
    
    // Calculate total area
    calculateTotalArea() {
      this.totalArea = this.measurements.reduce((sum, m) => sum + m.area, 0);
    },
    
    // Save calculator data
    saveCalculatorNotes() {
      this.saveCalculatorData();
      alert('Shranjeno!');
    },
    
    // Save calculator to localStorage
    saveCalculatorData() {
      try {
        const data = {
          measurements: this.measurements,
          notes: this.calculatorNotes
        };
        localStorage.setItem('gradbeniApp_calculator', JSON.stringify(data));
      } catch (e) {
        console.error('Error saving calculator data:', e);
      }
    },
    
    // Load calculator from localStorage
    loadCalculatorData() {
      try {
        const saved = localStorage.getItem('gradbeniApp_calculator');
        if (saved) {
          const data = JSON.parse(saved);
          this.measurements = data.measurements || [];
          this.calculatorNotes = data.notes || '';
          this.calculateTotalArea();
        }
      } catch (e) {
        console.error('Error loading calculator data:', e);
      }
    },
    
    // Clear calculator
    clearCalculator() {
      if (!confirm('Ali res želiš počistiti vse meritve in opombe?')) {
        return;
      }
      this.measurements = [];
      this.calculatorNotes = '';
      this.totalArea = 0;
      this.saveCalculatorData();
    },
    
    // Create quote from calculator
    createQuoteFromCalculator() {
      if (this.measurements.length === 0) {
        alert('Dodaj vsaj eno meritev');
        return;
      }
      
      // Create new quote
      this.newQuote();
      
      // Add calculator notes to project notes
      const measurementsByType = {};
      this.measurements.forEach(m => {
        if (!measurementsByType[m.typeLabel]) {
          measurementsByType[m.typeLabel] = [];
        }
        measurementsByType[m.typeLabel].push(m);
      });
      
      let measurementsSummary = '';
      for (const [type, items] of Object.entries(measurementsByType)) {
        measurementsSummary += `\n${type.toUpperCase()}:\n`;
        items.forEach(m => {
          measurementsSummary += `- ${m.name}: ${m.length}m × ${m.width}m × ${m.quantity} = ${m.area.toFixed(2)}m²\n`;
        });
      }
      
      this.currentQuote.project_name = 'Projekt iz kalkulatorja';
      this.currentQuote.notes = `MERITVE (skupaj ${this.totalArea.toFixed(2)}m²):\n${measurementsSummary}\n\nOPOMBE:\n${this.calculatorNotes || 'Brez opombe'}`;
      
      // Switch to quotes page
      this.page = 'quotes';
      
      alert(`Ustvarjen nov predračun s skupno površino ${this.totalArea.toFixed(2)}m².\n\nDodaj postavke in cene.`);
    },
    
    // ===== SEARCH =====
    
    // Filter items by search query
    filterItemsBySearch() {
      if (!this.searchQuery) {
        this.filteredItems = this.getSortedItems();
        return;
      }
      
      const query = this.searchQuery.toLowerCase();
      this.filteredItems = this.workItems.filter(item => 
        item.name.toLowerCase().includes(query) || 
        (item.category && item.category.toLowerCase().includes(query)) ||
        (item.description && item.description.toLowerCase().includes(query))
      ).sort((a, b) => {
        const aFav = this.isFavorite(a.id);
        const bFav = this.isFavorite(b.id);
        if (aFav && !bFav) return -1;
        if (!aFav && bFav) return 1;
        return a.name.localeCompare(b.name);
      });
    },
    
    // Filter materials by search query
    filterMaterialsBySearch() {
      if (!this.materialSearchQuery) {
        this.filteredMaterials = [...this.materials];
        return;
      }
      
      const query = this.materialSearchQuery.toLowerCase();
      this.filteredMaterials = this.materials.filter(mat => 
        mat.name.toLowerCase().includes(query) || 
        (mat.category && mat.category.toLowerCase().includes(query)) ||
        (mat.description && mat.description.toLowerCase().includes(query))
      );
    },
    
    // Group materials by category
    getMaterialsGrouped() {
      const grouped = {};
      
      // Sort materials: by category, then by name
      const sortedMaterials = [...this.materials].sort((a, b) => {
        const catA = a.category || 'Brez kategorije';
        const catB = b.category || 'Brez kategorije';
        
        if (catA !== catB) {
          return catA.localeCompare(catB);
        }
        return a.name.localeCompare(b.name);
      });
      
      sortedMaterials.forEach(material => {
        const category = material.category || 'Brez kategorije';
        if (!grouped[category]) {
          grouped[category] = [];
        }
        grouped[category].push(material);
      });
      
      return grouped;
    },
    
    // ===== CALCULATOR TO QUOTE FEATURES =====
    
    // Open the main calculator quote modal
    openAddQuoteItemsModal() {
      this.showCalculatorQuoteModal = true;
      this.calculateCalculatorQuoteTotals();
    },
    
    // Close calculator quote modal
    closeCalculatorQuoteModal() {
      this.showCalculatorQuoteModal = false;
    },
    
    // Open single item modal for a measurement
    openAddSingleItemModal(measurement, index) {
      this.selectedMeasurementForItem = measurement;
      this.selectedMeasurementIndex = index;
      this.singleItemCategory = '';
      this.singleItemWorkItemId = '';
      this.singleItemDifficulty = 'medium';
      this.singleItemPricePerUnit = 0;
      this.singleItemSubtotal = 0;
      this.filteredItemsForSingleModal = this.getSortedItems();
      this.showAddSingleItemModal = true;
    },
    
    // Close single item modal
    closeAddSingleItemModal() {
      this.showAddSingleItemModal = false;
      this.selectedMeasurementForItem = null;
      this.selectedMeasurementIndex = null;
    },
    
    // Filter items for single item modal
    filterItemsForSingleModal() {
      if (!this.singleItemCategory) {
        this.filteredItemsForSingleModal = this.getSortedItems();
      } else {
        this.filteredItemsForSingleModal = this.workItems
          .filter(i => i.category === this.singleItemCategory)
          .sort((a, b) => a.name.localeCompare(b.name));
      }
    },
    
    // Calculate single item preview
    calculateSingleItemPreview() {
      if (!this.singleItemWorkItemId || !this.selectedMeasurementForItem) {
        this.singleItemPricePerUnit = 0;
        this.singleItemSubtotal = 0;
        return;
      }
      
      const workItem = this.workItems.find(i => i.id === this.singleItemWorkItemId);
      if (!workItem) return;
      
      let factor = 1.0;
      switch(this.singleItemDifficulty) {
        case 'easy': factor = workItem.difficulty_easy_factor || 0.8; break;
        case 'hard': factor = workItem.difficulty_hard_factor || 1.3; break;
        default: factor = workItem.difficulty_medium_factor || 1.0;
      }
      
      this.singleItemPricePerUnit = Math.round(workItem.base_price * factor * 100) / 100;
      this.singleItemSubtotal = Math.round(this.selectedMeasurementForItem.area * this.singleItemPricePerUnit * 100) / 100;
    },
    
    // Add single item to quote items list
    addSingleItemToQuote() {
      if (!this.singleItemWorkItemId || !this.selectedMeasurementForItem) return;
      
      const workItem = this.workItems.find(i => i.id === this.singleItemWorkItemId);
      if (!workItem) return;
      
      this.calculatorQuoteItems.push({
        measurementIndex: this.selectedMeasurementIndex,
        measurementName: this.selectedMeasurementForItem.name,
        area: this.selectedMeasurementForItem.area,
        type: this.selectedMeasurementForItem.type,
        typeLabel: this.selectedMeasurementForItem.typeLabel,
        workItemId: this.singleItemWorkItemId,
        workItemName: workItem.name,
        difficulty: this.singleItemDifficulty,
        pricePerUnit: this.singleItemPricePerUnit,
        subtotal: this.singleItemSubtotal
      });
      
      this.calculateCalculatorQuoteTotals();
      this.closeAddSingleItemModal();
      this.openAddQuoteItemsModal(); // Show the main modal with all items
    },
    
    // Add another item for the last measurement
    addAnotherCalcQuoteItem() {
      if (this.measurements.length === 0) return;
      
      const lastMeasurement = this.measurements[this.measurements.length - 1];
      this.openAddSingleItemModal(lastMeasurement, this.measurements.length - 1);
    },
    
    // Update price when work item or difficulty changes in the list
    updateCalcQuoteItemPrice(index) {
      const item = this.calculatorQuoteItems[index];
      if (!item || !item.workItemId) return;
      
      const workItem = this.workItems.find(i => i.id === item.workItemId);
      if (!workItem) return;
      
      let factor = 1.0;
      switch(item.difficulty) {
        case 'easy': factor = workItem.difficulty_easy_factor || 0.8; break;
        case 'hard': factor = workItem.difficulty_hard_factor || 1.3; break;
        default: factor = workItem.difficulty_medium_factor || 1.0;
      }
      
      item.pricePerUnit = Math.round(workItem.base_price * factor * 100) / 100;
      item.subtotal = Math.round(item.area * item.pricePerUnit * 100) / 100;
      item.workItemName = workItem.name;
      
      this.calculateCalculatorQuoteTotals();
    },
    
    // Remove item from calculator quote list
    removeCalcQuoteItem(index) {
      this.calculatorQuoteItems.splice(index, 1);
      this.calculateCalculatorQuoteTotals();
    },
    
    // Calculate totals for calculator quote
    calculateCalculatorQuoteTotals() {
      this.calculatorQuoteTotal = this.calculatorQuoteItems.reduce((sum, item) => sum + (item.subtotal || 0), 0);
      this.calculatorQuoteTotalArea = this.calculatorQuoteItems.reduce((sum, item) => sum + (item.area || 0), 0);
    },
    
    // Check if all items have valid work items selected
    allCalcQuoteItemsValid() {
      return this.calculatorQuoteItems.every(item => item.workItemId && item.workItemId !== '');
    },
    
    // Create quote from calculator items
    createQuoteFromCalculatorItems() {
      if (this.calculatorQuoteItems.length === 0) {
        alert('Dodaj vsaj eno postavko');
        return;
      }
      
      if (!this.allCalcQuoteItemsValid()) {
        alert('Izberi delo za vse postavke');
        return;
      }
      
      // Create new quote
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 30);
      
      this.currentQuote = {
        id: null,
        project_name: 'Projekt iz kalkulatorja',
        project_address: '',
        client_name: '',
        valid_until: tomorrow.toISOString().split('T')[0],
        items: [],
        subtotal: 0,
        tax_amount: 0,
        total: 0,
        material_total: 0,
        labor_total: 0
      };
      
      // Group items by measurement for notes
      const itemsByMeasurement = {};
      this.measurements.forEach((m, idx) => {
        const items = this.calculatorQuoteItems.filter(i => i.measurementIndex === idx);
        if (items.length > 0) {
          itemsByMeasurement[m.name || 'Meritev ' + (idx + 1)] = {
            measurement: m,
            items: items
          };
        }
      });
      
      // Build notes
      let notes = `MERITVE (${this.totalArea.toFixed(2)} m² skupaj):\n\n`;
      for (const [name, data] of Object.entries(itemsByMeasurement)) {
        notes += `${data.measurement.typeLabel}: ${name}\n`;
        notes += `  Površina: ${data.measurement.area.toFixed(2)} m² (${data.measurement.length}m × ${data.measurement.width}m × ${data.measurement.quantity})\n`;
        data.items.forEach(item => {
          notes += `  - ${item.workItemName}: ${this.formatPrice(item.subtotal)}\n`;
        });
        notes += '\n';
      }
      
      if (this.calculatorNotes) {
        notes += `OPOMBE:\n${this.calculatorNotes}\n`;
      }
      
      this.currentQuote.notes = notes;
      
      // Add all items to quote
      this.calculatorQuoteItems.forEach(item => {
        this.currentQuote.items.push({
          work_item_id: item.workItemId,
          workItemName: item.workItemName,
          quantity: item.area,
          difficulty: item.difficulty,
          price_per_unit: item.pricePerUnit,
          notes: `${item.typeLabel}: ${item.measurementName}`,
          subtotal: item.subtotal
        });
      });
      
      // Calculate totals
      let laborTotal = this.calculatorQuoteTotal;
      let materialTotal = laborTotal * 0.6; // 60% material cost estimate
      let subtotal = laborTotal + materialTotal;
      let taxAmount = subtotal * 0.22;
      let total = subtotal + taxAmount;
      
      this.currentQuote.labor_total = Math.round(laborTotal * 100) / 100;
      this.currentQuote.material_total = Math.round(materialTotal * 100) / 100;
      this.currentQuote.subtotal = Math.round(subtotal * 100) / 100;
      this.currentQuote.tax_amount = Math.round(taxAmount * 100) / 100;
      this.currentQuote.total = Math.round(total * 100) / 100;
      
      // Reset and switch
      this.calculatorQuoteItems = [];
      this.calculatorQuoteTotal = 0;
      this.calculatorQuoteTotalArea = 0;
      this.showCalculatorQuoteModal = false;
      this.page = 'quotes';
      
      // Reset filters
      this.selectedCategory = '';
      this.selectedItem = '';
      this.newItemQuantity = 1;
      this.newItemDifficulty = 'medium';
      this.newItemNotes = '';
      this.extractCategories();
      this.filterItemsForQuote();
      
      alert(`Predračun ustvarjen z ${this.currentQuote.items.length} postavkami!\nSkupni znesek: ${this.formatPrice(total)}`);
    },
    
    // ===== SIMPLIFIED CALCULATOR → QUOTE =====
    
    // Update price for measurement
    updateMeasurementPrice(index) {
      const m = this.measurements[index];
      if (!m.selectedWorkItem) {
        m.calculatedPrice = 0;
        return;
      }
      
      const workItem = this.workItems.find(i => i.id == m.selectedWorkItem);
      if (!workItem) return;
      
      let factor = 1.0;
      switch(m.difficulty) {
        case 'easy': factor = workItem.difficulty_easy_factor || 0.8; break;
        case 'hard': factor = workItem.difficulty_hard_factor || 1.3; break;
        default: factor = workItem.difficulty_medium_factor || 1.0;
      }
      
      const pricePerUnit = workItem.base_price * factor;
      m.calculatedPrice = m.area * pricePerUnit;
    },
    
    // Add measurement directly to quote
    addMeasurementToQuote(index) {
      console.log('Adding measurement to quote, index:', index);
      
      const m = this.measurements[index];
      
      if (!m.selectedWorkItem) {
        alert('Najprej izberi delo');
        return;
      }
      
      const workItem = this.workItems.find(i => i.id == m.selectedWorkItem);
      if (!workItem) {
        alert('Delo ni najdeno');
        return;
      }
      
      console.log('Found work item:', workItem.name);
      
      // Create quote ONLY if it doesn't exist (first time)
      if (!this.currentQuote || !this.currentQuote.project_name) {
        this.newQuote();
        this.currentQuote.project_name = 'Projekt iz kalkulatorja';
        console.log('Created new quote:', this.currentQuote);
      } else {
        console.log('Using existing quote:', this.currentQuote.project_name);
      }
      
      let factor = 1.0;
      switch(m.difficulty) {
        case 'easy': factor = workItem.difficulty_easy_factor || 0.8; break;
        case 'hard': factor = workItem.difficulty_hard_factor || 1.3; break;
        default: factor = workItem.difficulty_medium_factor || 1.0;
      }
      
      const pricePerUnit = workItem.base_price * factor;
      
      // Add to quote items
      console.log('Adding item to quote:', workItem.name, 'price:', pricePerUnit, 'area:', m.area);
      
      this.currentQuote.items.push({
        work_item_id: workItem.id,
        quantity: m.area,
        difficulty: m.difficulty,
        price_per_unit: pricePerUnit,
        notes: `${m.typeLabel || 'Površina'}: ${m.name} (${m.length}m × ${m.width}m)`,
        subtotal: m.calculatedPrice,
        workItemName: workItem.name
      });
      
      console.log('Quote items now:', this.currentQuote.items.length);
      
      // Mark as added
      m.addedToQuote = true;
      m.quoteItemName = workItem.name;
      
      // Recalculate totals
      this.calculateTotals();
      
      console.log('Quote total:', this.currentQuote.total);
      
      // Save
      this.saveCalculatorData();
      
      // Show message with count of items in quote
      const itemCount = this.currentQuote.items.length;
      const totalPrice = this.currentQuote.total || m.calculatedPrice;
      alert(`✓ ${workItem.name} dodano!\nPostavk v predračunu: ${itemCount}\nSkupaj: ${totalPrice.toFixed(2)}€`);
    }
  };
}