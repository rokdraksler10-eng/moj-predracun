-- ============================================-- FAZA 5: PROFESSIONAL CRM & PAYMENTS-- ============================================-- 1. ENHANCED CLIENTS (CRM)-- ============================================

-- Client notes and history
CREATE TABLE client_notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id INTEGER NOT NULL,
    note TEXT NOT NULL,
    created_by TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);

-- Client interactions (calls, meetings, emails)
CREATE TABLE client_interactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id INTEGER NOT NULL,
    type TEXT CHECK(type IN ('call', 'email', 'meeting', 'site_visit', 'other')) DEFAULT 'other',
    description TEXT,
    date DATE NOT NULL,
    follow_up_date DATE,
    created_by TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);

-- Client tags/categories
CREATE TABLE client_tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id INTEGER NOT NULL,
    tag TEXT NOT NULL,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);

-- Reminders for clients
CREATE TABLE client_reminders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    reminder_date DATE NOT NULL,
    is_completed BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);

-- ============================================-- 2. PAYMENT TRACKING-- ============================================

-- Payments for quotes
CREATE TABLE payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    quote_id INTEGER NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    payment_date DATE NOT NULL,
    payment_method TEXT CHECK(payment_method IN ('cash', 'bank_transfer', 'card', 'check', 'other')) DEFAULT 'bank_transfer',
    reference_number TEXT,
    notes TEXT,
    is_deposit BOOLEAN DEFAULT 0,  -- Is this a deposit/advance payment?
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (quote_id) REFERENCES quotes(id) ON DELETE CASCADE
);

-- Payment schedule (planned payments)
CREATE TABLE payment_schedules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    quote_id INTEGER NOT NULL,
    installment_number INTEGER NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    due_date DATE NOT NULL,
    description TEXT,
    is_paid BOOLEAN DEFAULT 0,
    paid_date DATE,
    FOREIGN KEY (quote_id) REFERENCES quotes(id) ON DELETE CASCADE
);

-- ============================================-- 3. EMAIL LOG-- ============================================

-- Track sent emails
CREATE TABLE email_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    quote_id INTEGER,
    client_id INTEGER,
    email_type TEXT CHECK(email_type IN ('quote', 'invoice', 'reminder', 'follow_up', 'thank_you', 'other')) DEFAULT 'quote',
    recipient_email TEXT NOT NULL,
    subject TEXT NOT NULL,
    body TEXT,
    pdf_path TEXT,  -- Path to attached PDF
    sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    status TEXT CHECK(status IN ('pending', 'sent', 'failed', 'delivered', 'opened')) DEFAULT 'pending',
    error_message TEXT,
    FOREIGN KEY (quote_id) REFERENCES quotes(id) ON DELETE SET NULL,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL
);

-- Email templates
CREATE TABLE email_templates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    subject TEXT NOT NULL,
    body TEXT NOT NULL,
    type TEXT CHECK(type IN ('quote', 'invoice', 'reminder', 'follow_up', 'thank_you', 'other')) DEFAULT 'quote',
    is_default BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================-- 4. PROJECT MANAGEMENT-- ============================================

-- Project phases/milestones
CREATE TABLE project_phases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    quote_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    start_date DATE,
    end_date DATE,
    status TEXT CHECK(status IN ('planned', 'in_progress', 'completed', 'delayed', 'cancelled')) DEFAULT 'planned',
    completion_percentage INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (quote_id) REFERENCES quotes(id) ON DELETE CASCADE
);

-- Work diary (daily logs)
CREATE TABLE work_diary (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    quote_id INTEGER NOT NULL,
    date DATE NOT NULL,
    description TEXT NOT NULL,
    hours_worked DECIMAL(5,2),
    workers_count INTEGER DEFAULT 1,
    materials_used TEXT,  -- JSON array
    weather_conditions TEXT,
    issues_encountered TEXT,
    photos TEXT,  -- JSON array of photo paths
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (quote_id) REFERENCES quotes(id) ON DELETE CASCADE
);

-- ============================================-- 5. EXPENSES & COSTS-- ============================================

-- Track actual expenses against quotes
CREATE TABLE expenses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    quote_id INTEGER,
    category TEXT NOT NULL,
    description TEXT,
    amount DECIMAL(12,2) NOT NULL,
    expense_date DATE NOT NULL,
    receipt_path TEXT,
    is_billable BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (quote_id) REFERENCES quotes(id) ON DELETE SET NULL
);

-- ============================================-- 6. SUPPLIERS & PURCHASES-- ============================================

-- Suppliers
CREATE TABLE suppliers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    contact_person TEXT,
    phone TEXT,
    email TEXT,
    address TEXT,
    website TEXT,
    notes TEXT,
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Purchase orders
CREATE TABLE purchase_orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    supplier_id INTEGER,
    quote_id INTEGER,
    order_number TEXT UNIQUE,
    status TEXT CHECK(status IN ('draft', 'sent', 'confirmed', 'received', 'cancelled')) DEFAULT 'draft',
    total_amount DECIMAL(12,2),
    order_date DATE,
    expected_delivery DATE,
    actual_delivery DATE,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL,
    FOREIGN KEY (quote_id) REFERENCES quotes(id) ON DELETE SET NULL
);

-- Purchase order items
CREATE TABLE purchase_order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    purchase_order_id INTEGER NOT NULL,
    material_id INTEGER,
    description TEXT NOT NULL,
    quantity DECIMAL(10,2) NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(12,2) NOT NULL,
    FOREIGN KEY (purchase_order_id) REFERENCES purchase_orders(id) ON DELETE CASCADE,
    FOREIGN KEY (material_id) REFERENCES materials(id) ON DELETE SET NULL
);

-- ============================================-- 7. INDICES FOR PERFORMANCE-- ============================================

CREATE INDEX idx_client_notes_client ON client_notes(client_id);
CREATE INDEX idx_client_interactions_client ON client_interactions(client_id);
CREATE INDEX idx_client_interactions_date ON client_interactions(date);
CREATE INDEX idx_client_reminders_date ON client_reminders(reminder_date);
CREATE INDEX idx_payments_quote ON payments(quote_id);
CREATE INDEX idx_payments_date ON payments(payment_date);
CREATE INDEX idx_payment_schedules_quote ON payment_schedules(quote_id);
CREATE INDEX idx_email_log_quote ON email_log(quote_id);
CREATE INDEX idx_email_log_client ON email_log(client_id);
CREATE INDEX idx_project_phases_quote ON project_phases(quote_id);
CREATE INDEX idx_work_diary_quote ON work_diary(quote_id);
CREATE INDEX idx_work_diary_date ON work_diary(date);
CREATE INDEX idx_expenses_quote ON expenses(quote_id);
CREATE INDEX idx_purchase_orders_supplier ON purchase_orders(supplier_id);

-- ============================================-- 8. DEFAULT DATA-- ============================================

-- Default email templates
INSERT INTO email_templates (name, subject, body, type, is_default) VALUES 
('quote_default', 
 'Predračun za {{project_name}}', 
 'Spoštovani {{client_name}},

v prilogi vam pošiljam predračun za projekt "{{project_name}}".

Skupni znesek: {{total_amount}} €
Veljavnost ponudbe: {{valid_until}}

Če imate kakršnakoli vprašanja, me prosim kontaktirajte.

Lep pozdrav,
{{company_name}}',
 'quote', 1);

INSERT INTO email_templates (name, subject, body, type, is_default) VALUES 
('payment_reminder',
 'Opomnik o plačilu - {{project_name}}',
 'Spoštovani {{client_name}},

opominjam vas na neplačan račun za projekt "{{project_name}}".

Znesek: {{amount_due}} €
Rok plačila: {{due_date}}

Prosim za čimprejšnje plačilo.

Hvala in lep pozdrav,
{{company_name}}',
 'reminder', 1);

INSERT INTO email_templates (name, subject, body, type, is_default) VALUES 
('thank_you',
 'Hvala za zaupanje - {{project_name}}',
 'Spoštovani {{client_name}},

hvala za zaupanje in izbiro naših storitev pri projektu "{{project_name}}".

Projekt je bil uspešno zaključen.

V primeru kakršnihkoli vprašanj sem vam na voljo.

Lep pozdrav,
{{company_name}}',
 'thank_you', 1);

-- Insert sample supplier
INSERT INTO suppliers (name, contact_person, phone, email, address, notes) VALUES 
('Bauhaus Slovenija', 'Trgovina', '01 421 40 00', 'info@bauhaus.si', 'Šmartinska cesta 152, Ljubljana', 'Gradbeni material'),
('Merkur Ljubljana', 'Trgovina', '01 530 60 00', 'info@merkur.si', 'Cesta Ljubljanske brigade 9, Ljubljana', 'Orodje in material'),
('OBI Slovenija', 'Trgovina', '01 500 10 50', 'info@obi.si', 'Zaloška cesta 183, Ljubljana', 'Naredi sam material');
