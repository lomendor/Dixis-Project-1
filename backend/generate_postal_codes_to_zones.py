#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import csv
import pandas as pd
import requests
import os

# URL for the postal codes data
GRPOSTCODES_URL = "https://raw.githubusercontent.com/MentatInnovations/grpostcodes/master/data/postcode_lat_long_output_file.csv" # Corrected branch and filename

# Predefined remote areas (example - needs updating with real data)
# Source: User should provide a comprehensive list from courier websites (ACS, Geniki Taxydromiki, etc.)
REMOTE_AREAS = [
    "19014", "63088", "85107", "72057", "49081", "85003", "81401", "82102", "73003", "85100",
    # Add more known remote postal codes here based on courier lists
    # Example: "84001", "84002", ...
]

# Prefixes for Zone 6 (Athens) and Zone 7 (Thessaloniki)
ATHENS_PREFIXES = ["10", "11", "12", "13", "14", "15", "16", "17", "18", "19"]
THESSALONIKI_PREFIXES = ["54", "55", "56", "57"]

# Postal codes for Zone 2 (Mainland regional capitals)
MAINLAND_CAPITALS = {
    "Αγρίνιο": ["30100", "30131", "30132"], # Added common variations
    "Αλεξανδρούπολη": ["68100", "68131", "68132"],
    "Άρτα": ["47100", "47131", "47132"],
    "Βέροια": ["59100", "59131", "59132"],
    "Βόλος": ["38001", "38221", "38222", "38333", "38334", "38445", "38446", "38500"], # Expanded range
    "Γρεβενά": ["51100"],
    "Δράμα": ["66100", "66131", "66132"],
    "Έδεσσα": ["58200"],
    "Ηγουμενίτσα": ["46100"],
    "Ιωάννινα": ["45000", "45110", "45221", "45332", "45333", "45444", "45445", "45500"], # Expanded range
    "Καβάλα": ["65110", "65201", "65302", "65403", "65404", "65500"], # Expanded range
    "Καλαμάτα": ["24100", "24131", "24132", "24133"],
    "Καρδίτσα": ["43100", "43131", "43132"],
    "Καρπενήσι": ["36100"],
    "Καστοριά": ["52100", "52057"], # Added nearby
    "Κατερίνη": ["60100", "60131", "60132", "60133", "60134"],
    "Κιλκίς": ["61100"],
    "Κοζάνη": ["50100", "50131", "50132"],
    "Κομοτηνή": ["69100", "69131", "69132", "69133"],
    "Κόρινθος": ["20100", "20131", "20132"],
    "Λαμία": ["35100", "35131", "35132", "35133"],
    "Λάρισα": ["40000", "41000", "41110", "41221", "41222", "41223", "41334", "41335", "41336", "41447", "41500"], # Expanded range
    "Λιβαδειά": ["32100", "32131", "32132"],
    "Μεσολόγγι": ["30200"],
    "Ναύπακτος": ["30300"],
    "Ναύπλιο": ["21100"],
    "Ξάνθη": ["67100", "67131", "67132", "67133"],
    "Πάτρα": ["26000", "26110", "26221", "26222", "26223", "26224", "26225", "26331", "26332", "26333", "26334", "26335", "26441", "26442", "26443", "26444", "26500", "26504"], # Expanded range
    "Πολύγυρος": ["63100"],
    "Πρέβεζα": ["48100"],
    "Πύργος": ["27100", "27131"],
    "Σέρρες": ["62100", "62121", "62122", "62123", "62124", "62125"],
    "Σπάρτη": ["23100"],
    "Τρίκαλα": ["42100", "42131", "42132"],
    "Τρίπολη": ["22100", "22131", "22132"],
    "Φλώρινα": ["53100"],
    "Χαλκίδα": ["34100", "34131", "34132", "34133"]
}

# Prefixes for Zone 4 (Islands) - More specific approach
# These cover major island groups. Needs refinement for edge cases.
ISLAND_PREFIXES = [
    "28", # Kefalonia, Zakynthos
    "29", # Zakynthos
    "49", # Corfu, Paxoi
    "70", "71", "72", "73", "74", # Crete
    "80", # Kythira
    "81", # Lesvos, Limnos, Agios Efstratios
    "82", # Chios, Psara, Oinousses
    "83", # Samos, Ikaria, Fournoi
    "84", # Cyclades (most)
    "85"  # Dodecanese (most)
]

def download_grpostcodes():
    """Downloads the postal code data from GitHub."""
    print("Downloading postal code data from GitHub...")
    try:
        response = requests.get(GRPOSTCODES_URL, timeout=30)
        response.raise_for_status()  # Raise an exception for bad status codes
        # Use StringIO to read the CSV content directly into pandas
        from io import StringIO
        csv_data = StringIO(response.text)
        # Assuming the actual CSV has columns like 'POSTAL CODE', 'LATITUDE', 'LONGITUDE', 'AREA', etc.
        # We need to adjust the column name used later if it's not 'postal_code'
        # Let's inspect the columns after loading
        df = pd.read_csv(csv_data)
        print(f"Downloaded data columns: {df.columns.tolist()}") # Print columns to verify
        # Attempt to rename the postal code column if it's different
        # Common variations: 'POSTAL CODE', 'TK', 'POSTALCODE', 'tk' (lowercase)
        possible_pc_columns = ['POSTAL CODE', 'TK', 'POSTALCODE', 'postal_code', 'tk'] # Added 'tk' lowercase
        actual_pc_column = None
        for col in possible_pc_columns:
            if col in df.columns:
                actual_pc_column = col
                break

        if actual_pc_column and actual_pc_column != 'postal_code':
            print(f"Renaming column '{actual_pc_column}' to 'postal_code'")
            df.rename(columns={actual_pc_column: 'postal_code'}, inplace=True)
        elif 'postal_code' not in df.columns:
             print("Error: Could not find a suitable postal code column in the downloaded data.")
             return None

        print("Download successful and processed.")
        return df
    except requests.exceptions.RequestException as e:
        print(f"Error downloading postal code data: {e}")
        return None
    except Exception as e:
        print(f"An error occurred while processing downloaded data: {e}")
        return None

def categorize_postal_code(postal_code, mainland_capitals_flat, island_prefixes, remote_areas):
    """Categorizes a postal code into a shipping zone."""
    postal_code = str(postal_code).strip()

    # Priority 1: Remote Areas
    if postal_code in remote_areas:
        return 5  # Zone 5: Remote

    # Priority 2: Zone 6 (Athens)
    if any(postal_code.startswith(prefix) for prefix in ATHENS_PREFIXES):
        return 6  # Zone 6: Athens

    # Priority 3: Zone 7 (Thessaloniki)
    if any(postal_code.startswith(prefix) for prefix in THESSALONIKI_PREFIXES):
        return 7  # Zone 7: Thessaloniki

    # Priority 4: Zone 2 (Mainland Capitals)
    if postal_code in mainland_capitals_flat:
        return 2  # Zone 2: Mainland Capitals

    # Priority 5: Zone 4 (Islands)
    if any(postal_code.startswith(prefix) for prefix in island_prefixes):
        # Check again if it's a remote island postal code that might have been missed
        if postal_code in remote_areas:
             return 5
        return 4  # Zone 4: Islands

    # Default: Zone 3 (Rest of Mainland & Evia)
    return 3  # Zone 3: Rest of Mainland

def create_postal_codes_to_zones_csv(output_dir="."):
    """Creates the postal_codes_to_zones.csv file."""
    df = download_grpostcodes()
    if df is None:
        print("Could not retrieve postal code data. Aborting CSV creation.")
        return

    # Flatten the mainland capitals dictionary for faster lookup
    mainland_capitals_flat = {code for codes in MAINLAND_CAPITALS.values() for code in codes}
    remote_areas_set = set(REMOTE_AREAS)

    output_path = os.path.join(output_dir, "postal_codes_to_zones.csv")

    # Ensure the output directory exists
    os.makedirs(output_dir, exist_ok=True)

    unique_postal_codes = df['postal_code'].astype(str).str.strip().unique()
    print(f"Found {len(unique_postal_codes)} unique postal codes.")

    categorized_data = []
    processed_count = 0
    for postal_code in unique_postal_codes:
        if not postal_code.isdigit() or len(postal_code) != 5:
            # print(f"Skipping invalid postal code format: {postal_code}")
            continue # Skip non-standard formats if any

        zone = categorize_postal_code(postal_code, mainland_capitals_flat, ISLAND_PREFIXES, remote_areas_set)
        categorized_data.append([postal_code, zone])
        processed_count += 1
        if processed_count % 1000 == 0:
            print(f"Processed {processed_count}/{len(unique_postal_codes)} postal codes...")

    print(f"Finished processing {processed_count} postal codes.")

    try:
        with open(output_path, 'w', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            writer.writerow(["postal_code", "zone"])  # Write header
            writer.writerows(categorized_data)  # Write all data at once
        print(f"Successfully created {output_path}")
    except IOError as e:
        print(f"Error writing CSV file: {e}")
    except Exception as e:
        print(f"An unexpected error occurred during CSV writing: {e}")


if __name__ == "__main__":
    # Define the target directory relative to the script location (backend/)
    target_directory = os.path.dirname(os.path.abspath(__file__))
    create_postal_codes_to_zones_csv(output_dir=target_directory)
