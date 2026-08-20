import re
from typing import List, Dict, Tuple, Optional
from thefuzz import process, fuzz

# Standard Product Catalog with Hindi Synonyms & Categories
STANDARD_CATALOG = {
    "p1": {"name": "Fresh Potato (Aloo)", "aliases": ["aloo", "aalu", "potato", "aaloo", "potatoes"], "default_unit": "kg", "price": 30.0},
    "p2": {"name": "Fresh Onion (Pyaaz)", "aliases": ["pyaaz", "pyaj", "onion", "kanda", "onions"], "default_unit": "kg", "price": 40.0},
    "p3": {"name": "Fresh Tomato (Tamatar)", "aliases": ["tamatar", "tamater", "tomato", "tomatoes"], "default_unit": "kg", "price": 35.0},
    "p4": {"name": "Brown Bread", "aliases": ["brown bread", "bread", "white bread", "pav"], "default_unit": "packet", "price": 45.0},
    "p5": {"name": "Amul Full Cream Milk", "aliases": ["amul doodh", "milk", "doodh", "amul milk", "full cream"], "default_unit": "packet", "price": 66.0},
    "p6": {"name": "Basmati Rice", "aliases": ["basmati rice", "chawal", "rice", "basmati chawal"], "default_unit": "kg", "price": 120.0},
    "p7": {"name": "Fortune Sunflower Oil", "aliases": ["fortune oil", "tel", "refined oil", "sunflower oil", "mustard oil"], "default_unit": "liter", "price": 150.0},
    "p8": {"name": "Aashirvaad Atta", "aliases": ["aashirvaad atta", "atta", "gehu ka atta", "flour"], "default_unit": "kg", "price": 220.0}
}

FRACTION_MAP = {
    "paav": 0.25, "pao": 0.25, "pawa": 0.25,
    "aadha": 0.5, "adha": 0.5, "half": 0.5,
    "poun": 0.75, "paun": 0.75,
    "sawa": 1.25, "dedh": 1.5, "derh": 1.5,
    "dhai": 2.5, "dhaai": 2.5
}

NUMBER_MAP = {
    "ek": 1, "one": 1, "do": 2, "two": 2, "teen": 3, "three": 3,
    "char": 4, "chaar": 4, "four": 4, "paanch": 5, "panch": 5, "five": 5,
    "chhah": 6, "che": 6, "six": 6, "saat": 7, "seven": 7,
    "aath": 8, "eight": 8, "nau": 9, "nine": 9, "das": 10, "ten": 10
}

UNIT_MAP = {
    "kilo": "kg", "kg": "kg", "killoo": "kg", "kgs": "kg", "kilogram": "kg",
    "gram": "gram", "gm": "gram", "grams": "gram", "gms": "gram",
    "packet": "packet", "pkt": "packet", "pouch": "packet", "packets": "packet",
    "liter": "liter", "litre": "liter", "l": "liter", "liters": "liter", "ltr": "liter",
    "dabba": "box", "piece": "piece", "pc": "piece", "pcs": "piece"
}

NOISE_WORDS = [
    "bhaiya", "uncle", "chahiye", "de do", "de dena", "daal do", 
    "pack kar do", "pack karo", "bhejo", "bhej do", "kripya", "please", 
    "saath me", "bhi", "arre", "sunna", "aur kuch nahi", "bas", "jaldi"
]

def resolve_product_match(raw_name: str) -> Optional[Dict]:
    """Uses fuzzy logic to match raw Hinglish names to standard catalog items."""
    all_aliases = []
    alias_to_id = {}
    
    for pid, meta in STANDARD_CATALOG.items():
        for alias in meta["aliases"]:
            all_aliases.append(alias)
            alias_to_id[alias] = pid

    match_result = process.extractOne(raw_name.lower(), all_aliases, scorer=fuzz.token_sort_ratio)
    
    if match_result:
        best_match, score = match_result[0], match_result[1]
        if score >= 65:  # Confidence threshold
            matched_id = alias_to_id[best_match]
            return {
                "product_id": matched_id,
                "product_name": STANDARD_CATALOG[matched_id]["name"],
                "unit_price": STANDARD_CATALOG[matched_id]["price"],
                "default_unit": STANDARD_CATALOG[matched_id]["default_unit"]
            }
    return None

def parse_voice_advanced(transcript: str) -> Tuple[List[Dict], str]:
    cleaned = transcript.lower()
    for noise in NOISE_WORDS:
        cleaned = re.sub(rf"\b{noise}\b", "", cleaned)
    
    # Split compound clauses
    clauses = re.split(r"\baur\b|\band\b|,|\+", cleaned)
    extracted_items = []

    for clause in clauses:
        clause = clause.strip()
        if not clause:
            continue

        words = clause.split()
        qty = 1.0
        unit = ""
        item_words = []

        # Handle 'saadhe teen' (3.5) patterns
        for idx, w in enumerate(words):
            if w in ["saadhe", "sadhe"] and idx + 1 < len(words) and words[idx+1] in NUMBER_MAP:
                qty = NUMBER_MAP[words[idx+1]] + 0.5
                words[idx] = ""
                words[idx+1] = ""

        for word in words:
            if not word:
                continue
            if word in FRACTION_MAP:
                qty = FRACTION_MAP[word]
            elif word.replace(".", "", 1).isdigit():
                qty = float(word)
            elif word in NUMBER_MAP:
                qty = float(NUMBER_MAP[word])
            elif word in UNIT_MAP:
                unit = UNIT_MAP[word]
            else:
                item_words.append(word)

        raw_item_name = " ".join(item_words).strip()
        if not raw_item_name:
            continue

        # Fuzzy match with catalog
        catalog_match = resolve_product_match(raw_item_name)

        if catalog_match:
            final_unit = unit if unit else catalog_match["default_unit"]
            # Conversion: 500 gram -> 0.5 kg
            if final_unit == "gram" and catalog_match["default_unit"] == "kg":
                qty = qty / 1000.0
                final_unit = "kg"

            extracted_items.append({
                "product_id": catalog_match["product_id"],
                "product_name": catalog_match["product_name"],
                "quantity": qty,
                "unit": final_unit,
                "unit_price": catalog_match["unit_price"]
            })
        else:
            # Fallback for unlisted grocery items
            final_unit = unit if unit else "unit"
            extracted_items.append({
                "product_id": f"custom_{int(qty*100)}_{raw_item_name[:4]}",
                "product_name": raw_item_name.title(),
                "quantity": qty,
                "unit": final_unit,
                "unit_price": 50.0
            })

    if extracted_items:
        items_summary = ", ".join([f"{it['quantity']} {it['unit']} {it['product_name']}" for it in extracted_items])
        reply = f"Cart me successfully add ho gaya: {items_summary}."
    else:
        reply = "Kripya item ka naam aur quantity spasht bole."

    return extracted_items, reply
