-- MANUAL CATEGORY CREATION SCRIPT
-- ✅ SAFE - Creates 10 simplified categories
-- 🛡️ No data deletion, no automation

-- Mark old categories as inactive (SAFE - doesn't delete)
UPDATE product_categories SET is_active = 0 WHERE type = 'product';

-- Create 10 new simplified categories
INSERT INTO product_categories (name, slug, description, type, is_active, `order`, created_at, updated_at) VALUES
('Ελαιόλαδο & Ελιές', 'elaiolado-elies', 'Εξαιρετικό παρθένο ελαιόλαδο, επιτραπέζιες ελιές και προϊόντα ελιάς', 'product', 1, 1, NOW(), NOW()),
('Μέλι & Προϊόντα Μελιού', 'meli-proionta-meliou', 'Θυμαρίσιο μέλι, γύρη, πρόπολη και άλλα προϊόντα κυψέλης', 'product', 1, 2, NOW(), NOW()),
('Τυριά & Γαλακτοκομικά', 'tiria-galaktokomika', 'Παραδοσιακά τυριά, γιαούρτι και γαλακτοκομικά προϊόντα', 'product', 1, 3, NOW(), NOW()),
('Όσπρια', 'ospria', 'Φασόλια, φακές, ρεβίθια και άλλα όσπρια από όλη την Ελλάδα', 'product', 1, 4, NOW(), NOW()),
('Ζυμαρικά & Δημητριακά', 'zimarika-dimitriaka', 'Χειροποίητα ζυμαρικά, άλευρα και προϊόντα δημητριακών', 'product', 1, 5, NOW(), NOW()),
('Ποτά', 'pota', 'Κρασιά, τσίπουρο, ούζο και άλλα παραδοσιακά ποτά', 'product', 1, 6, NOW(), NOW()),
('Ξηροί Καρποί & Αποξηραμένα', 'ksiri-karpi-apoksiramena', 'Αμύγδαλα, καρύδια, σταφίδες και αποξηραμένα φρούτα', 'product', 1, 7, NOW(), NOW()),
('Μπαχαρικά & Βότανα', 'mpakharika-botana', 'Ρίγανη, θυμάρι, μπαχαρικά και αρωματικά βότανα', 'product', 1, 8, NOW(), NOW()),
('Γλυκά & Αλείμματα', 'glika-aleimmata', 'Μαρμελάδες, γλυκά κουταλιού και παραδοσιακά αλείμματα', 'product', 1, 9, NOW(), NOW()),
('Καλλυντικά & Περιποίηση', 'kallintika-peripiisi', 'Φυσικά σαπούνια, κρέμες και προϊόντα περιποίησης', 'product', 1, 10, NOW(), NOW());

-- Keep functional categories active
UPDATE product_categories SET is_active = 1 WHERE type = 'functional';