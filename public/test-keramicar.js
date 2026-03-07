// Test script for Moj Predracun - Keramičar scenario
// This tests the main user flows

console.log('🧪 Starting Keramičar Test Suite...');

// Test 1: Check if all required elements exist
function testElements() {
    const requiredElements = [
        'project-name',
        'customer',
        'quote-date',
        'valid-until',
        'quotes-tbody',
        'work-items-tbody',
        'materials-tbody',
        'btn-delete',
        'total-work',
        'total-materials',
        'subtotal',
        'vat-amount',
        'grand-total'
    ];
    
    let missing = [];
    requiredElements.forEach(id => {
        if (!document.getElementById(id)) {
            missing.push(id);
        }
    });
    
    if (missing.length > 0) {
        console.error('❌ Missing elements:', missing);
        return false;
    }
    console.log('✅ All required elements exist');
    return true;
}

// Test 2: Check if state is properly initialized
function testState() {
    if (typeof state === 'undefined') {
        console.error('❌ State is not defined');
        return false;
    }
    
    const required = ['quotes', 'workItems', 'materials', 'selectedWorkItems', 'selectedMaterials'];
    let missing = [];
    required.forEach(key => {
        if (!(key in state)) {
            missing.push(key);
        }
    });
    
    if (missing.length > 0) {
        console.error('❌ Missing state keys:', missing);
        return false;
    }
    console.log('✅ State properly initialized');
    return true;
}

// Test 3: Check if main functions exist
function testFunctions() {
    const requiredFunctions = [
        'createNewQuote',
        'saveQuote',
        'addWorkItem',
        'addMaterial',
        'updateTotals',
        'generatePDF',
        'showToast',
        'formatCurrency'
    ];
    
    let missing = [];
    requiredFunctions.forEach(fn => {
        if (typeof window[fn] !== 'function') {
            missing.push(fn);
        }
    });
    
    if (missing.length > 0) {
        console.error('❌ Missing functions:', missing);
        return false;
    }
    console.log('✅ All required functions exist');
    return true;
}

// Test 4: Simulate creating a quote (keramičar scenario)
async function testCreateQuote() {
    console.log('📝 Testing: Creating a tile setter quote...');
    
    try {
        // Step 1: Create new quote
        createNewQuote();
        console.log('  ✅ New quote created');
        
        // Step 2: Fill in project details
        document.getElementById('project-name').value = 'Prenova kopalnice Novak';
        document.getElementById('customer').value = 'Janez Novak';
        console.log('  ✅ Project details filled');
        
        // Step 3: Add work items (simulated)
        state.selectedWorkItems.push({
            name: 'Polaganje ploščic na tleh',
            unit: 'm²',
            price: 35,
            quantity: 12
        });
        state.selectedWorkItems.push({
            name: 'Polaganje ploščic na steni',
            unit: 'm²',
            price: 40,
            quantity: 18
        });
        renderWorkItems();
        console.log('  ✅ Work items added');
        
        // Step 4: Add materials (simulated)
        state.selectedMaterials.push({
            name: 'Keramične ploščice 30x60',
            unit: 'm²',
            price: 25,
            quantity: 30
        });
        state.selectedMaterials.push({
            name: 'Lepilo za ploščice',
            unit: 'vreča',
            price: 12,
            quantity: 5
        });
        state.selectedMaterials.push({
            name: 'Fuga siva',
            unit: 'kg',
            price: 8,
            quantity: 10
        });
        renderMaterials();
        console.log('  ✅ Materials added');
        
        // Step 5: Update totals
        updateTotals();
        console.log('  ✅ Totals calculated');
        
        // Step 6: Verify totals
        const workTotal = document.getElementById('total-work').textContent;
        const materialsTotal = document.getElementById('total-materials').textContent;
        const grandTotal = document.getElementById('grand-total').textContent;
        
        console.log('  📊 Work total:', workTotal);
        console.log('  📊 Materials total:', materialsTotal);
        console.log('  📊 Grand total:', grandTotal);
        
        if (grandTotal === '0,00 €' || grandTotal === '€0.00') {
            console.error('❌ Grand total is zero - calculation error!');
            return false;
        }
        
        console.log('✅ Quote creation test passed');
        return true;
        
    } catch (error) {
        console.error('❌ Error creating quote:', error);
        return false;
    }
}

// Test 5: Check button click handlers
function testButtons() {
    console.log('🔘 Testing button handlers...');
    
    const buttons = [
        { id: 'btn-delete', action: 'delete' },
        { selector: 'button[onclick="saveQuote(\'draft\')"]', action: 'save draft' },
        { selector: 'button[onclick="generatePDF()"]', action: 'generate PDF' }
    ];
    
    buttons.forEach(btn => {
        const element = btn.id ? document.getElementById(btn.id) : document.querySelector(btn.selector);
        if (element) {
            console.log(`  ✅ ${btn.action} button exists`);
        } else {
            console.error(`  ❌ ${btn.action} button NOT FOUND`);
        }
    });
}

// Run all tests
async function runAllTests() {
    console.log('='.repeat(50));
    console.log('MOJ PREDRAČUN - TEST RESULTS');
    console.log('='.repeat(50));
    
    const results = {
        elements: testElements(),
        state: testState(),
        functions: testFunctions(),
        quote: await testCreateQuote(),
    };
    
    testButtons();
    
    console.log('='.repeat(50));
    console.log('SUMMARY:');
    const allPassed = Object.values(results).every(r => r);
    if (allPassed) {
        console.log('✅ ALL TESTS PASSED');
    } else {
        console.log('❌ SOME TESTS FAILED');
        console.log('Failed:', Object.entries(results).filter(([k,v]) => !v).map(([k]) => k));
    }
    console.log('='.repeat(50));
    
    return allPassed;
}

// Auto-run when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runAllTests);
} else {
    runAllTests();
}
