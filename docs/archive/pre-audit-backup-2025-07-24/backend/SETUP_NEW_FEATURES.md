# Οδηγός Εγκατάστασης και Εφαρμογής των Νέων Χαρακτηριστικών

Αυτό το έγγραφο παρέχει οδηγίες για την εγκατάσταση και εφαρμογή των νέων χαρακτηριστικών για τη σελίδα παραγωγού στο Dixis Project.

## Επισκόπηση

Τα νέα χαρακτηριστικά που έχουμε υλοποιήσει είναι:

1. **Media Showcase**: Επιτρέπει στους παραγωγούς να προσθέτουν και να διαχειρίζονται εικόνες και βίντεο.
2. **Q&A System**: Επιτρέπει στους χρήστες να υποβάλλουν ερωτήσεις στους παραγωγούς και στους παραγωγούς να απαντούν.
3. **Seasonality Calendar**: Επιτρέπει στους παραγωγούς να δείχνουν πότε είναι διαθέσιμα τα προϊόντα τους.
4. **Carbon Footprint Calculator**: Δείχνει το περιβαλλοντικό όφελος από την αγορά τοπικών προϊόντων.

## Προαπαιτούμενα

- Laravel 10.x ή νεότερο
- MySQL ή PostgreSQL
- PHP 8.1 ή νεότερο
- Composer

## Βήματα Εγκατάστασης

### 1. Αντιγραφή νέων αρχείων

Τα ακόλουθα αρχεία έχουν προστεθεί ή τροποποιηθεί:

#### Models
- `app/Models/ProducerMedia.php`
- `app/Models/ProducerQuestion.php`
- `app/Models/ProducerEnvironmentalStat.php`
- Τροποποίηση του `app/Models/Producer.php` (προσθήκη σχέσεων)
- Τροποποίηση του `app/Models/Product.php` (προσθήκη του πεδίου seasonality)

#### Controllers
- `app/Http/Controllers/Api/ProducerMediaController.php`
- `app/Http/Controllers/Api/ProducerQuestionsController.php`
- `app/Http/Controllers/Api/Producer/QuestionsController.php`
- `app/Http/Controllers/Api/ProducerSeasonalityController.php`
- `app/Http/Controllers/Api/Producer/SeasonalityController.php`
- `app/Http/Controllers/Api/ProducerEnvironmentalController.php`
- `app/Http/Controllers/Api/Admin/ProducerEnvironmentalController.php`

#### Migrations
- `database/migrations/2025_05_12_100000_create_producer_media_table.php`
- `database/migrations/2025_05_12_100001_create_producer_questions_table.php`
- `database/migrations/2025_05_12_100002_add_seasonality_to_products_table.php`
- `database/migrations/2025_05_12_100003_create_producer_environmental_stats_table.php`

#### Seeders
- `database/seeders/ProducerMediaSeeder.php`
- `database/seeders/ProducerQuestionsSeeder.php`
- `database/seeders/ProducerEnvironmentalStatsSeeder.php`
- `database/seeders/ProductSeasonalitySeeder.php`
- Τροποποίηση του `database/seeders/DatabaseSeeder.php`

#### Tests
- `tests/Feature/Producer/MediaShowcaseTest.php`
- `tests/Feature/Producer/QASystemTest.php`
- `tests/Feature/Producer/SeasonalityCalendarTest.php`
- `tests/Feature/Producer/CarbonFootprintCalculatorTest.php`

#### Routes
- Τροποποίηση του `routes/api.php` (προσθήκη νέων routes)

#### Scripts
- `run_migrations.sh` (script για εκτέλεση migrations και seeders)

### 2. Εκτέλεση Migrations

Για να εφαρμόσετε τα νέα migrations, χρησιμοποιήστε το script `run_migrations.sh`:

```bash
# Για εκτέλεση των migrations (χωρίς seeding)
./run_migrations.sh

# ΓΙα εκτέλεση των migrations και όλων των seeders
./run_migrations.sh seed
```

Εναλλακτικά, μπορείτε να εκτελέσετε τα παρακάτω απευθείας:

```bash
# Εκτέλεση migrations
php artisan migrate

# Εκτέλεση seeds (προαιρετικά)
php artisan db:seed --class=ProducerMediaSeeder
php artisan db:seed --class=ProducerQuestionsSeeder
php artisan db:seed --class=ProducerEnvironmentalStatsSeeder
php artisan db:seed --class=ProductSeasonalitySeeder
```

### 3. Δοκιμή των API Endpoints

Για να δοκιμάσετε τα νέα API endpoints, μπορείτε να:

1. Εκτελέσετε τα αυτοματοποιημένα tests:

```bash
php artisan test --filter=MediaShowcaseTest
php artisan test --filter=QASystemTest
php artisan test --filter=SeasonalityCalendarTest
php artisan test --filter=CarbonFootprintCalculatorTest
```

2. Χρησιμοποιήσετε το Postman ή το cURL. Αναλυτικές οδηγίες υπάρχουν στο αρχείο `docs/API_TESTING.md`.

### 4. Ρύθμιση Αποθήκευσης Αρχείων

Για τη λειτουργία του Media Showcase, βεβαιωθείτε ότι η αποθήκευση αρχείων είναι σωστά ρυθμισμένη:

1. Ρυθμίστε τον disk 'public' στο `config/filesystems.php`
2. Δημιουργήστε symbolic link για το public storage:

```bash
php artisan storage:link
```

3. Βεβαιωθείτε ότι οι φάκελοι αποθήκευσης έχουν τα κατάλληλα δικαιώματα:

```bash
chmod -R 775 storage/app/public
chown -R www-data:www-data storage/app/public # Χρησιμοποιήστε τον κατάλληλο χρήστη web server
```

## Σύνδεση με το Frontend

Το frontend έχει ήδη υλοποιηθεί και είναι έτοιμο να συνδεθεί με το backend API. Τα components που θα χρησιμοποιούν τα νέα API endpoints είναι:

- `src/components/producers/MediaShowcase.tsx`
- `src/components/producers/QASystem.tsx`
- `src/components/producers/SeasonalityCalendar.tsx`
- `src/components/producers/CarbonFootprintCalculator.tsx`

Τα API endpoints είναι ορισμένα στο `src/lib/apiConstants.ts` και θα πρέπει να ταιριάζουν με αυτά που υλοποιήσαμε στο backend.

## Αντιμετώπιση Προβλημάτων

### CORS Issues

Αν αντιμετωπίζετε προβλήματα CORS, προσθέστε το frontend domain στο αρχείο `config/cors.php`:

```php
'allowed_origins' => ['http://localhost:3000', 'https://yourdomain.com'],
```

### Permissions Issues

Αν αντιμετωπίζετε προβλήματα με τα δικαιώματα στην αποθήκευση αρχείων:

```bash
# Ορίστε τα σωστά δικαιώματα
chmod -R 775 storage
chmod -R 775 bootstrap/cache
chown -R www-data:www-data storage
chown -R www-data:www-data bootstrap/cache
```

### Database Issues

Αν αντιμετωπίζετε προβλήματα με το σχήμα της βάσης δεδομένων, δοκιμάστε να κάνετε refresh το schema:

```bash
php artisan migrate:fresh
```

**Προσοχή**: Αυτή η εντολή θα διαγράψει όλα τα δεδομένα της βάσης. Χρησιμοποιήστε τη μόνο σε περιβάλλον ανάπτυξης.

## Επιπλέον Πληροφορίες

- Δείτε το αρχείο `docs/API_IMPLEMENTATION.md` για λεπτομερείς πληροφορίες σχετικά με τα API endpoints και τους πίνακες της βάσης δεδομένων.
- Δείτε το αρχείο `docs/API_TESTING.md` για οδηγίες σχετικά με τη δοκιμή των API endpoints.

## Support

Για ερωτήσεις ή προβλήματα, επικοινωνήστε με την ομάδα ανάπτυξης στο [support@dixis.com]().