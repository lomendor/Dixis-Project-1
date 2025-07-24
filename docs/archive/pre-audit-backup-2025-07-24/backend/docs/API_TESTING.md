# Οδηγός Δοκιμής των API Endpoints για τα Νέα Χαρακτηριστικά της Σελίδας Παραγωγού

Αυτό το έγγραφο παρέχει οδηγίες για το πώς να δοκιμάσετε τα νέα API endpoints που υλοποιήθηκαν για τα χαρακτηριστικά της σελίδας παραγωγού. Μπορείτε να χρησιμοποιήσετε εργαλεία όπως το [Postman](https://www.postman.com/) ή το [cURL](https://curl.se/) για να κάνετε τις δοκιμές.

## Προετοιμασία

1. Βεβαιωθείτε ότι το Laravel backend εκτελείται.
2. Εκτελέστε το script `run_migrations.sh` για να εφαρμόσετε τα migrations.
3. Εκτελέστε το script `run_migrations.sh seed` για να προσθέσετε δοκιμαστικά δεδομένα.

## 1. Media Showcase API Endpoints

### 1.1 Λήψη Media για Παραγωγό

- **URL**: `GET /v1/producers/{id}/media`
- **Παράδειγμα**: `GET http://localhost:8000/v1/producers/1/media`
- **Αναμενόμενη απάντηση**:
  ```json
  {
    "data": [
      {
        "id": 1,
        "producer_id": 1,
        "type": "image",
        "file_path": "producers/media/farm1.jpg",
        "title": "Η φάρμα μας",
        "description": "Μια εικόνα από τη φάρμα μας στους πρόποδες του βουνού.",
        "order": 1,
        "created_at": "2023-05-12T10:30:00Z",
        "updated_at": "2023-05-12T10:30:00Z"
      },
      // Περισσότερα media items...
    ]
  }
  ```

### 1.2 Ανέβασμα Νέου Media (Απαιτεί πιστοποίηση παραγωγού)

- **URL**: `POST /v1/producer/media/upload`
- **Headers**: 
  - Content-Type: multipart/form-data
  - Authorization: Bearer {token}
- **Body**:
  - files[]: [αρχείο1.jpg, αρχείο2.jpg]
  - title: "Τίτλος του media"
  - description: "Περιγραφή του media"
- **cURL Παράδειγμα**:
  ```bash
  curl -X POST http://localhost:8000/v1/producer/media/upload \
    -H "Authorization: Bearer {token}" \
    -F "files[]=@/path/to/image.jpg" \
    -F "title=Νέα Εικόνα" \
    -F "description=Περιγραφή της εικόνας"
  ```

### 1.3 Ενημέρωση Media (Απαιτεί πιστοποίηση παραγωγού)

- **URL**: `PUT /v1/producer/media/{media_id}`
- **Headers**: 
  - Content-Type: application/json
  - Authorization: Bearer {token}
- **Body**:
  ```json
  {
    "title": "Ενημερωμένος τίτλος",
    "description": "Ενημερωμένη περιγραφή"
  }
  ```

### 1.4 Διαγραφή Media (Απαιτεί πιστοποίηση παραγωγού)

- **URL**: `DELETE /v1/producer/media/{media_id}`
- **Headers**: 
  - Authorization: Bearer {token}

### 1.5 Αλλαγή Σειράς Media (Απαιτεί πιστοποίηση παραγωγού)

- **URL**: `PUT /v1/producer/media/reorder`
- **Headers**: 
  - Content-Type: application/json
  - Authorization: Bearer {token}
- **Body**:
  ```json
  {
    "items": [
      { "id": 1, "order": 2 },
      { "id": 2, "order": 1 },
      { "id": 3, "order": 3 }
    ]
  }
  ```

## 2. Q&A System API Endpoints

### 2.1 Λήψη Ερωτήσεων για Παραγωγό

- **URL**: `GET /v1/producers/{id}/questions`
- **Παράδειγμα**: `GET http://localhost:8000/v1/producers/1/questions?page=1&per_page=10`
- **Αναμενόμενη απάντηση**:
  ```json
  {
    "data": [
      {
        "id": 1,
        "producer_id": 1,
        "user_id": 2,
        "user_name": "Γιώργος Π.",
        "question": "Χρησιμοποιείτε φυτοφάρμακα στις καλλιέργειες σας;",
        "answer": "Όχι, καλλιεργούμε αποκλειστικά με βιολογικές μεθόδους και χρησιμοποιούμε μόνο φυσικά σκευάσματα για την προστασία των φυτών.",
        "is_public": true,
        "created_at": "2023-05-12T10:30:00Z",
        "updated_at": "2023-05-13T15:45:00Z",
        "answered_at": "2023-05-13T15:45:00Z"
      },
      // Περισσότερες ερωτήσεις...
    ],
    "current_page": 1,
    "last_page": 5,
    "per_page": 10,
    "total": 42
  }
  ```

### 2.2 Υποβολή Νέας Ερώτησης (Απαιτεί πιστοποίηση χρήστη)

- **URL**: `POST /v1/producers/{id}/questions`
- **Headers**: 
  - Content-Type: application/json
  - Authorization: Bearer {token}
- **Body**:
  ```json
  {
    "question": "Πώς μπορώ να επισκεφθώ το αγρόκτημά σας;",
    "is_public": true
  }
  ```

### 2.3 Λήψη Όλων των Ερωτήσεων για τον Παραγωγό (Απαιτεί πιστοποίηση παραγωγού)

- **URL**: `GET /v1/producer/questions`
- **Headers**: 
  - Authorization: Bearer {token}
- **Παράδειγμα**: `GET http://localhost:8000/v1/producer/questions?status=unanswered&page=1&per_page=10`

### 2.4 Απάντηση σε Ερώτηση (Απαιτεί πιστοποίηση παραγωγού)

- **URL**: `POST /v1/producer/questions/{id}/answer`
- **Headers**: 
  - Content-Type: application/json
  - Authorization: Bearer {token}
- **Body**:
  ```json
  {
    "answer": "Μπορείτε να επισκεφθείτε το αγρόκτημά μας κάθε Σάββατο και Κυριακή από τις 10:00 έως τις 18:00. Είναι καλύτερο να μας ενημερώσετε πριν την επίσκεψή σας στο τηλέφωνο 123-456-7890."
  }
  ```

### 2.5 Λήψη Στατιστικών Ερωτήσεων (Απαιτεί πιστοποίηση παραγωγού)

- **URL**: `GET /v1/producer/questions/stats`
- **Headers**: 
  - Authorization: Bearer {token}
- **Αναμενόμενη απάντηση**:
  ```json
  {
    "total": 95,
    "answered": 80,
    "unanswered": 15,
    "response_rate": 84,
    "average_response_time": "2 days"
  }
  ```

## 3. Seasonality Calendar API Endpoints

### 3.1 Λήψη Εποχικότητας Προϊόντων για Παραγωγό

- **URL**: `GET /v1/producers/{id}/seasonality`
- **Παράδειγμα**: `GET http://localhost:8000/v1/producers/1/seasonality`
- **Αναμενόμενη απάντηση**:
  ```json
  {
    "products": [
      {
        "id": 1,
        "name": "Τομάτες",
        "category": "Λαχανικά",
        "seasonality": {
          "Ιανουάριος": "none",
          "Φεβρουάριος": "none",
          "Μάρτιος": "low",
          "Απρίλιος": "medium",
          "Μάιος": "high",
          "Ιούνιος": "high",
          "Ιούλιος": "high",
          "Αύγουστος": "high",
          "Σεπτέμβριος": "medium",
          "Οκτώβριος": "low",
          "Νοέμβριος": "none",
          "Δεκέμβριος": "none"
        }
      },
      // Περισσότερα προϊόντα...
    ]
  }
  ```

### 3.2 Ενημέρωση Εποχικότητας (Απαιτεί πιστοποίηση παραγωγού)

- **URL**: `POST /v1/producer/seasonality`
- **Headers**: 
  - Content-Type: application/json
  - Authorization: Bearer {token}
- **Body**:
  ```json
  {
    "seasonality": {
      "1": {
        "Ιανουάριος": "none",
        "Φεβρουάριος": "none",
        "Μάρτιος": "low",
        "Απρίλιος": "medium",
        "Μάιος": "high",
        "Ιούνιος": "high",
        "Ιούλιος": "high",
        "Αύγουστος": "high",
        "Σεπτέμβριος": "medium",
        "Οκτώβριος": "low",
        "Νοέμβριος": "none",
        "Δεκέμβριος": "none"
      },
      "2": {
        "Ιανουάριος": "none",
        "Φεβρουάριος": "none",
        "Μάρτιος": "none",
        "Απρίλιος": "low",
        "Μάιος": "medium",
        "Ιούνιος": "high",
        "Ιούλιος": "high",
        "Αύγουστος": "high",
        "Σεπτέμβριος": "medium",
        "Οκτώβριος": "low",
        "Νοέμβριος": "none",
        "Δεκέμβριος": "none"
      }
    }
  }
  ```

## 4. Carbon Footprint Calculator API Endpoints

### 4.1 Λήψη Περιβαλλοντικών Δεδομένων για Παραγωγό

- **URL**: `GET /v1/producers/{id}/environmental`
- **Παράδειγμα**: `GET http://localhost:8000/v1/producers/1/environmental`
- **Αναμενόμενη απάντηση**:
  ```json
  {
    "stats": {
      "distance": 35,
      "co2_saved": 0.75,
      "water_saved": 120,
      "packaging_saved": 0.3
    },
    "comparison": {
      "conventional": {
        "distance": 1250,
        "co2_emitted": 0.9,
        "water_usage": 180,
        "packaging_usage": 0.4
      },
      "local": {
        "distance": 35,
        "co2_emitted": 0.15,
        "water_usage": 60,
        "packaging_usage": 0.1
      }
    }
  }
  ```

### 4.2 Ενημέρωση Περιβαλλοντικών Δεδομένων (Απαιτεί πιστοποίηση διαχειριστή)

- **URL**: `PUT /v1/admin/producers/{id}/environmental`
- **Headers**: 
  - Content-Type: application/json
  - Authorization: Bearer {token} (admin token)
- **Body**:
  ```json
  {
    "stats": {
      "distance": 35,
      "co2_saved": 0.75,
      "water_saved": 120,
      "packaging_saved": 0.3
    }
  }
  ```

## Αντιμετώπιση Προβλημάτων

Αν αντιμετωπίσετε προβλήματα κατά τη δοκιμή των API endpoints, ακολουθήστε τα παρακάτω βήματα:

1. **Σφάλματα Πιστοποίησης**:
   - Βεβαιωθείτε ότι έχετε ένα έγκυρο token και ότι έχει συμπεριληφθεί στο header `Authorization: Bearer {token}`.
   - Για endpoints παραγωγού, βεβαιωθείτε ότι ο χρήστης έχει ρόλο 'producer'.
   - Για endpoints διαχειριστή, βεβαιωθείτε ότι ο χρήστης έχει ρόλο 'admin'.

2. **Σφάλματα Επικύρωσης**:
   - Ελέγξτε τις απαντήσεις των σφαλμάτων για λεπτομερείς πληροφορίες σχετικά με το τι πήγε στραβά.
   - Βεβαιωθείτε ότι στέλνετε όλα τα απαιτούμενα πεδία και ότι τα δεδομένα έχουν τη σωστή μορφή.

3. **Σφάλματα Βάσης Δεδομένων**:
   - Βεβαιωθείτε ότι έχετε εκτελέσει όλα τα migrations και ότι οι πίνακες υπάρχουν στη βάση δεδομένων.
   - Ελέγξτε τα αρχεία καταγραφής του Laravel για σφάλματα σχετικά με τη βάση δεδομένων.

4. **Άλλα Προβλήματα**:
   - Ελέγξτε τα αρχεία καταγραφής του Laravel στο `storage/logs/laravel.log` για λεπτομερείς πληροφορίες σχετικά με τα σφάλματα του server.
   - Αυξήστε το επίπεδο καταγραφής για περισσότερες λεπτομέρειες, αλλάζοντας το `LOG_LEVEL` σε `debug` στο αρχείο `.env`.