#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import csv
import os

ZONES = [1, 2, 3, 4, 5, 6, 7]
DELIVERY_METHODS = ["HOME", "PICKUP", "LOCKER"]
# Define weight scales as tuples (from_kg, to_kg)
WEIGHT_SCALES = [(0, 2), (2.01, 5), (5.01, 10)] # Use kg for definition
PICKUP_MAX_WEIGHT_KG = 20
LOCKER_MAX_WEIGHT_KG = 10

# Indicative rates (base_rate, extra_kg_rate). Needs updating with real data.
# Rates are defined per zone, then per method, then per weight scale index.
# extra_kg_rate applies ONLY when weight > 10kg.
RATES = {
    # Zone 1: Urban Centers (Other than Athens/Thessaloniki)
    1: {
        "HOME":   [(3.50, 0), (4.50, 0), (6.00, 0)], # Rates for 0-2kg, 2.01-5kg, 5.01-10kg
        "PICKUP": [(2.50, 0), (3.50, 0), (5.00, 0)],
        "LOCKER": [(2.00, 0), (3.00, 0), (4.50, 0)], # Locker only up to 10kg
    },
    # Zone 2: Mainland Capitals
    2: {
        "HOME":   [(4.00, 0), (5.00, 0), (7.00, 0)],
        "PICKUP": [(3.00, 0), (4.00, 0), (6.00, 0)],
        "LOCKER": [(2.50, 0), (3.50, 0), (5.50, 0)],
    },
    # Zone 3: Rest of Mainland & Evia
    3: {
        "HOME":   [(4.50, 0), (5.50, 0), (8.00, 0)],
        "PICKUP": [(3.50, 0), (4.50, 0), (7.00, 0)],
        "LOCKER": [(3.00, 0), (4.00, 0), (6.50, 0)],
    },
    # Zone 4: Islands (Non-Remote)
    4: {
        "HOME":   [(5.50, 0), (7.00, 0), (10.00, 0)],
        "PICKUP": [(4.50, 0), (6.00, 0), (9.00, 0)],
        "LOCKER": [(4.00, 0), (5.50, 0), (8.50, 0)],
    },
    # Zone 5: Remote Areas
    5: {
        "HOME":   [(7.00, 0), (9.00, 0), (13.00, 0)],
        "PICKUP": [(6.00, 0), (8.00, 0), (12.00, 0)],
        "LOCKER": [(5.50, 0), (7.50, 0), (11.50, 0)],
    },
    # Zone 6: Athens
    6: {
        "HOME":   [(3.00, 0), (4.00, 0), (5.50, 0)],
        "PICKUP": [(2.00, 0), (3.00, 0), (4.50, 0)],
        "LOCKER": [(1.50, 0), (2.50, 0), (4.00, 0)],
    },
    # Zone 7: Thessaloniki
    7: {
        "HOME":   [(3.00, 0), (4.00, 0), (5.50, 0)],
        "PICKUP": [(2.00, 0), (3.00, 0), (4.50, 0)],
        "LOCKER": [(1.50, 0), (2.50, 0), (4.00, 0)],
    }
}

# Define extra kg rates per zone and method (applies when weight > 10kg)
EXTRA_KG_RATES = {
    1: {"HOME": 0.90, "PICKUP": 0.80, "LOCKER": 0.00}, # Example: 0.90 EUR per extra kg for HOME in Zone 1
    2: {"HOME": 1.00, "PICKUP": 0.90, "LOCKER": 0.00},
    3: {"HOME": 1.10, "PICKUP": 1.00, "LOCKER": 0.00},
    4: {"HOME": 1.30, "PICKUP": 1.20, "LOCKER": 0.00},
    5: {"HOME": 1.50, "PICKUP": 1.40, "LOCKER": 0.00},
    6: {"HOME": 0.80, "PICKUP": 0.70, "LOCKER": 0.00}, # Athens - lower rates
    7: {"HOME": 0.80, "PICKUP": 0.70, "LOCKER": 0.00}, # Thessaloniki - lower rates
}


def create_default_shipping_rates_csv(output_dir="."):
    """Creates the default_shipping_rates.csv file."""
    output_path = os.path.join(output_dir, "default_shipping_rates.csv")

    # Ensure the output directory exists
    os.makedirs(output_dir, exist_ok=True)

    try:
        with open(output_path, 'w', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            # Write header matching the PHP service expectations (using kg)
            writer.writerow(["zone", "weight_from_kg", "weight_to_kg", "delivery_method", "base_rate", "extra_kg_rate"])

            for zone in ZONES:
                for method in DELIVERY_METHODS:
                    # Write rates for defined scales (0-2, 2.01-5, 5.01-10)
                    for i, (weight_from, weight_to) in enumerate(WEIGHT_SCALES):
                        # Skip invalid combinations based on method limits
                        if method == "PICKUP" and weight_from > PICKUP_MAX_WEIGHT_KG:
                            continue
                        if method == "LOCKER" and weight_from > LOCKER_MAX_WEIGHT_KG:
                            continue # Skip scales entirely above locker limit

                        # Get base rate for the scale
                        base_rate, _ = RATES[zone][method][i] # Ignore extra_kg_rate defined here

                        # Get the specific extra_kg_rate for >10kg scenario for this zone/method
                        # This rate applies conceptually *after* the 10kg base rate is determined
                        extra_kg_rate_over_10 = EXTRA_KG_RATES[zone].get(method, 0.00)

                        # Write the row for the current scale
                        # The extra_kg_rate column in the CSV will store the rate applicable *if* weight exceeds 10kg
                        writer.writerow([zone, f"{weight_from:.2f}", f"{weight_to:.2f}", method, f"{base_rate:.2f}", f"{extra_kg_rate_over_10:.2f}"])

        print(f"Successfully created {output_path}")
    except IOError as e:
        print(f"Error writing CSV file: {e}")
    except Exception as e:
        print(f"An unexpected error occurred during CSV writing: {e}")

if __name__ == "__main__":
    # Define the target directory relative to the script location (backend/)
    target_directory = os.path.dirname(os.path.abspath(__file__))
    create_default_shipping_rates_csv(output_dir=target_directory)
