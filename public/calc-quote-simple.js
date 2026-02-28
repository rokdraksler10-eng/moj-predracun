// Simple Calculator → Quote integration
// Add this to the Alpine.js app() function

// Initialize measurement with quote properties
initMeasurementWithQuoteProps() {
  return {
    type: 'floor',
    name: '',
    length: '',
    width: '',
    quantity: 1,
    // For quote integration
    selectedWorkItem: '',
    difficulty: 'medium',
    calculatedPrice: 0,
    addedToQuote: false,
    quoteItemName: ''
  };
},

// Update price when work item or difficulty changes
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

// Add measurement to quote
addMeasurementToQuote(index) {
  const m = this.measurements[index];
  
  if (!m.selectedWorkItem) {
    alert('Najprej izberi delo');
    return;
  }
  
  const workItem = this.workItems.find(i => i.id == m.selectedWorkItem);
  if (!workItem) return;
  
  // Add to quote items (create new quote if needed)
  if (!this.currentQuote || this.currentQuote.items.length === 0 && !this.currentQuote.project_name) {
    this.newQuote();
    this.currentQuote.project_name = m.name || 'Projekt iz kalkulatorja';
  }
  
  let factor = 1.0;
  switch(m.difficulty) {
    case 'easy': factor = workItem.difficulty_easy_factor || 0.8; break;
    case 'hard': factor = workItem.difficulty_hard_factor || 1.3; break;
    default: factor = workItem.difficulty_medium_factor || 1.0;
  }
  
  const pricePerUnit = workItem.base_price * factor;
  
  this.currentQuote.items.push({
    work_item_id: workItem.id,
    quantity: m.area,
    difficulty: m.difficulty,
    price_per_unit: pricePerUnit,
    notes: `${m.typeLabel || 'Površina'}: ${m.name}`,
    subtotal: m.calculatedPrice,
    workItemName: workItem.name
  });
  
  this.calculateTotals();
  
  // Mark as added
  m.addedToQuote = true;
  m.quoteItemName = workItem.name;
  this.saveCalculatorData();
  
  // Switch to quotes page
  this.page = 'quotes';
  alert(`Dodano: ${workItem.name} - ${m.calculatedPrice.toFixed(2)}€`);
},

// Remove from quote (if needed)
removeMeasurementFromQuote(index) {
  const m = this.measurements[index];
  m.addedToQuote = false;
  m.quoteItemName = '';
  this.saveCalculatorData();
}