#!/bin/bash

# Χρωματισμός κειμένου για καλύτερη εμφάνιση
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Εμφάνιση βοήθειας
show_help() {
    echo -e "${YELLOW}Βοήθεια:${NC}"
    echo "  ./run_migrations.sh             - Εκτέλεση όλων των migrations"
    echo "  ./run_migrations.sh seed        - Εκτέλεση όλων των migrations και seeders"
    echo "  ./run_migrations.sh seed-media  - Εκτέλεση seeder για producer media"
    echo "  ./run_migrations.sh seed-qa     - Εκτέλεση seeder για producer questions"
    echo "  ./run_migrations.sh seed-env    - Εκτέλεση seeder για environmental stats"
    echo "  ./run_migrations.sh seed-season - Εκτέλεση seeder για product seasonality"
    echo "  ./run_migrations.sh fresh       - Εκτέλεση migrate:fresh (προσοχή: διαγράφει όλα τα δεδομένα)"
    echo "  ./run_migrations.sh fresh-seed  - Εκτέλεση migrate:fresh --seed (προσοχή: διαγράφει όλα τα δεδομένα)"
    echo "  ./run_migrations.sh help        - Εμφάνιση αυτής της βοήθειας"
}

# Εκτέλεση migrate
run_migrate() {
    echo -e "${YELLOW}Εκτέλεση migrations για τα νέα χαρακτηριστικά της σελίδας παραγωγού...${NC}"
    php artisan migrate
    echo -e "${GREEN}Τα migrations ολοκληρώθηκαν με επιτυχία!${NC}"
}

# Εκτέλεση seeder για producer media
run_seed_media() {
    echo -e "${YELLOW}Προσθήκη δοκιμαστικών δεδομένων για τα media των παραγωγών...${NC}"
    php artisan db:seed --class=ProducerMediaSeeder
    echo -e "${GREEN}Τα δοκιμαστικά δεδομένα για τα media προστέθηκαν με επιτυχία!${NC}"
}

# Εκτέλεση seeder για producer questions
run_seed_qa() {
    echo -e "${YELLOW}Προσθήκη δοκιμαστικών ερωτήσεων για τους παραγωγούς...${NC}"
    php artisan db:seed --class=ProducerQuestionsSeeder
    echo -e "${GREEN}Οι δοκιμαστικές ερωτήσεις προστέθηκαν με επιτυχία!${NC}"
}

# Εκτέλεση seeder για environmental stats
run_seed_env() {
    echo -e "${YELLOW}Προσθήκη δοκιμαστικών περιβαλλοντικών στατιστικών...${NC}"
    php artisan db:seed --class=ProducerEnvironmentalStatsSeeder
    echo -e "${GREEN}Τα περιβαλλοντικά στατιστικά προστέθηκαν με επιτυχία!${NC}"
}

# Εκτέλεση seeder για product seasonality
run_seed_season() {
    echo -e "${YELLOW}Προσθήκη δοκιμαστικών δεδομένων εποχικότητας για τα προϊόντα...${NC}"
    php artisan db:seed --class=ProductSeasonalitySeeder
    echo -e "${GREEN}Τα δεδομένα εποχικότητας προστέθηκαν με επιτυχία!${NC}"
}

# Εκτέλεση όλων των seeders
run_all_seeds() {
    run_seed_media
    run_seed_qa
    run_seed_env
    run_seed_season
}

# Έλεγχος παραμέτρων
if [ $# -eq 0 ]; then
    run_migrate
elif [ "$1" == "seed" ]; then
    run_migrate
    run_all_seeds
    echo -e "${GREEN}Όλα τα migrations και seeders ολοκληρώθηκαν με επιτυχία!${NC}"
elif [ "$1" == "seed-media" ]; then
    run_seed_media
elif [ "$1" == "seed-qa" ]; then
    run_seed_qa
elif [ "$1" == "seed-env" ]; then
    run_seed_env
elif [ "$1" == "seed-season" ]; then
    run_seed_season
elif [ "$1" == "fresh" ]; then
    echo -e "${YELLOW}ΠΡΟΣΟΧΗ: Αυτή η ενέργεια θα διαγράψει όλα τα δεδομένα της βάσης. Είστε σίγουροι; (y/n)${NC}"
    read confirm
    if [ "$confirm" == "y" ] || [ "$confirm" == "Y" ]; then
        echo -e "${YELLOW}Εκτέλεση migrate:fresh...${NC}"
        php artisan migrate:fresh
        echo -e "${GREEN}Η βάση δεδομένων ανανεώθηκε με επιτυχία!${NC}"
    else
        echo "Η ενέργεια ακυρώθηκε."
    fi
elif [ "$1" == "fresh-seed" ]; then
    echo -e "${YELLOW}ΠΡΟΣΟΧΗ: Αυτή η ενέργεια θα διαγράψει όλα τα δεδομένα της βάσης. Είστε σίγουροι; (y/n)${NC}"
    read confirm
    if [ "$confirm" == "y" ] || [ "$confirm" == "Y" ]; then
        echo -e "${YELLOW}Εκτέλεση migrate:fresh --seed...${NC}"
        php artisan migrate:fresh --seed
        echo -e "${GREEN}Η βάση δεδομένων ανανεώθηκε και προστέθηκαν τα αρχικά δεδομένα με επιτυχία!${NC}"
    else
        echo "Η ενέργεια ακυρώθηκε."
    fi
elif [ "$1" == "help" ]; then
    show_help
else
    echo -e "${YELLOW}Άγνωστη παράμετρος: $1${NC}"
    show_help
fi