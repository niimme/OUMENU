#!/usr/bin/env python3
"""
OU Dining Menu Scraper
Fetches and structures dining menus from the 6 official University of Oklahoma dining pages:
- Residential Colleges Lunch & Dinner
- Couch Restaurants Lunch & Dinner
- Wagner Dining Hall Lunch & Dinner
"""

import urllib.request
import json
import re
import os
from bs4 import BeautifulSoup

URLS = {
    'res_dinner': {
        'url': 'https://www.ou.edu/housingandfood/dining/restaurants-and-catering/residential-colleges-dinner-menu',
        'location': 'residential_colleges',
        'meal': 'dinner'
    },
    'res_lunch': {
        'url': 'https://www.ou.edu/housingandfood/dining/restaurants-and-catering/residential-colleges-lunch-menu',
        'location': 'residential_colleges',
        'meal': 'lunch'
    },
    'couch_dinner': {
        'url': 'https://www.ou.edu/housingandfood/dining/restaurants-and-catering/couch-restaurants-dinner',
        'location': 'couch_restaurants',
        'meal': 'dinner'
    },
    'couch_lunch': {
        'url': 'https://www.ou.edu/housingandfood/dining/restaurants-and-catering/couch-restaurants-lunch',
        'location': 'couch_restaurants',
        'meal': 'lunch'
    },
    'wagner_dinner': {
        'url': 'https://www.ou.edu/housingandfood/dining/restaurants-and-catering/wagner-dining-hall-dinner',
        'location': 'wagner_dining_hall',
        'meal': 'dinner'
    },
    'wagner_lunch': {
        'url': 'https://www.ou.edu/housingandfood/dining/restaurants-and-catering/wagner-dining-hall-lunch',
        'location': 'wagner_dining_hall',
        'meal': 'lunch'
    }
}

DAYS_ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
STOP_MARKERS = [
    'Menu subject to change', 'Ingredients and nutritional', 'Housing and Food Services',
    '1524 Asp Ave', 'Norman, OK', 'Accessibility', 'Copyright', 'Updated', 'Deep-fried foods',
    'For those customers', 'If you have a food allergy'
]

def clean_text(t):
    return re.sub(r'\s+', ' ', t).strip()

def fetch_lines(url):
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
    with urllib.request.urlopen(req, timeout=15) as resp:
        html = resp.read().decode('utf-8', errors='ignore')
    soup = BeautifulSoup(html, 'html.parser')
    body = soup.find('body')
    raw_lines = [clean_text(line) for line in body.get_text('\n').split('\n') if clean_text(line)]
    return raw_lines

def parse_residential(lines, meal):
    data = {
        'week_info': '',
        'chefs_rotation': {},
        'everyday_stations': [],
        'daily_hot_line': {}
    }
    
    curr_section = None
    curr_day = None
    
    for line in lines:
        if any(marker in line for marker in STOP_MARKERS):
            break
            
        if 'Week of' in line:
            data['week_info'] = line
            continue
            
        if "Chef's Line Rotation" in line:
            curr_section = 'rotation'
            curr_day = None
            continue
            
        if 'Everyday Menu' in line:
            curr_section = 'everyday'
            curr_day = None
            continue
            
        if 'Hot Line Menu' in line:
            curr_section = 'hotline'
            curr_day = None
            continue
            
        upper_line = line.upper()
        if upper_line in [d.upper() for d in DAYS_ORDER]:
            curr_day = upper_line.capitalize()
            if curr_day not in data['daily_hot_line']:
                data['daily_hot_line'][curr_day] = []
            continue
            
        if curr_section == 'rotation' and ' - ' in line:
            parts = line.split(' - ', 1)
            day_name = parts[0].strip().capitalize()
            data['chefs_rotation'][day_name] = parts[1].strip()
        elif curr_section == 'everyday' and curr_day is None:
            if line not in data['everyday_stations']:
                data['everyday_stations'].append(line)
        elif curr_day:
            if line not in data['daily_hot_line'][curr_day]:
                data['daily_hot_line'][curr_day].append(line)
            
    return data

def parse_couch(lines, meal):
    data = {
        'week_info': '',
        'chefs_choice': {},
        'shanghai_stir_fry': {},
        'specialties': []
    }
    
    curr_section = None
    curr_day = None
    seen_specialties = set()
    
    i = 0
    while i < len(lines):
        line = lines[i]
        
        if any(marker in line for marker in STOP_MARKERS):
            break
            
        if 'Week of' in line:
            data['week_info'] = line
            i += 1
            continue
            
        if "Chef's Choice" in line:
            curr_section = 'chefs_choice'
            curr_day = None
            i += 1
            continue
            
        if 'Shanghai Stir-Fry' in line:
            curr_section = 'shanghai'
            curr_day = None
            i += 1
            continue
            
        known_stations = [
            'Chick-fil-A', 'Main Street', 'Vegetation Station', 'Athens Café', "Dot's Deli",
            'Casa Del Sol', 'Breakfast Club', 'The Crimson Creamery',
            'Sooner Smokehouse', 'La Roma', 'La Roma Pizza & Pasta', "Chef Roy's Ramen",
            'Salad Sensations', 'Sooner Sweet Shoppe'
        ]
        
        station_match = None
        for st in known_stations:
            if line.startswith(st) or line == st:
                station_match = st
                break
                
        if station_match:
            curr_section = 'specialties'
            curr_day = None
            desc = ''
            if i + 1 < len(lines) and not any(lines[i+1].startswith(s) for s in known_stations) and lines[i+1].upper() not in [d.upper() for d in DAYS_ORDER] and 'Shanghai' not in lines[i+1]:
                desc = lines[i+1]
                i += 1
            
            clean_name = "La Roma Pizza & Pasta" if "La Roma" in station_match else station_match
            if clean_name not in seen_specialties:
                seen_specialties.add(clean_name)
                data['specialties'].append({
                    'name': clean_name,
                    'description': desc
                })
            i += 1
            continue
            
        upper_line = line.upper()
        if upper_line in [d.upper() for d in DAYS_ORDER]:
            curr_day = upper_line.capitalize()
            if curr_section == 'chefs_choice':
                if curr_day not in data['chefs_choice']:
                    data['chefs_choice'][curr_day] = []
            elif curr_section == 'shanghai':
                if curr_day not in data['shanghai_stir_fry']:
                    data['shanghai_stir_fry'][curr_day] = []
            i += 1
            continue
            
        if curr_day:
            if curr_section == 'chefs_choice':
                if line not in data['chefs_choice'][curr_day]:
                    data['chefs_choice'][curr_day].append(line)
            elif curr_section == 'shanghai':
                if line not in data['shanghai_stir_fry'][curr_day]:
                    data['shanghai_stir_fry'][curr_day].append(line)
                
        i += 1
        
    return data

def parse_wagner(lines, meal):
    data = {
        'week_info': '',
        'daily_menu': {}
    }
    
    curr_day = None
    
    for line in lines:
        if any(marker in line for marker in STOP_MARKERS):
            break
            
        if 'Week of' in line:
            data['week_info'] = line
            continue
            
        upper_line = line.upper()
        if upper_line in [d.upper() for d in DAYS_ORDER]:
            curr_day = upper_line.capitalize()
            if curr_day not in data['daily_menu']:
                data['daily_menu'][curr_day] = {
                    'entrees_and_sides': [],
                    'made_to_order': []
                }
            continue
            
        if curr_day:
            if 'Made to Order:' in line or 'Made To Order:' in line or 'Make Your Own:' in line:
                if line not in data['daily_menu'][curr_day]['made_to_order']:
                    data['daily_menu'][curr_day]['made_to_order'].append(line)
            else:
                if line not in data['daily_menu'][curr_day]['entrees_and_sides']:
                    data['daily_menu'][curr_day]['entrees_and_sides'].append(line)
                
    return data

def detect_dietary_tags(dish_name):
    tags = []
    d = dish_name.lower()
    
    # Vegan tags
    if any(k in d for k in ['vegan', 'tofu', 'seitan', 'plant-based', 'pad thai', 'five-spice fried rice with edamame']):
        tags.append('vegan')
        
    # Vegetarian
    veg_keywords = [
        'vegetarian', 'cheese', 'macaroni and cheese', 'lasagna', 'vegetable', 'meatless',
        'eggplant', 'falafel', 'hummus', 'broccoli', 'carrots', 'squash', 'zucchini',
        'potatoes', 'okra', 'brussels sprouts', 'cauliflower', 'corn on the cob', 'mushrooms'
    ]
    if any(k in d for k in veg_keywords) and 'vegan' not in tags:
        # Avoid tagging meat dishes that just have a vegetable side
        if not any(m in d for m in ['chicken', 'steak', 'pork', 'beef', 'salmon', 'tilapia', 'catfish', 'cod', 'shrimp', 'bacon', 'ham', 'meatloaf', 'ribs']):
            tags.append('vegetarian')
            
    # Seafood
    if any(k in d for k in ['salmon', 'tilapia', 'catfish', 'cod', 'shrimp', 'fish', 'seafood']):
        tags.append('seafood')
        
    # Poultry
    if any(k in d for k in ['chicken', 'chick-fil-a', 'rotisserie', 'cordon bleu']):
        tags.append('poultry')
        
    # Meat (Beef / Pork)
    if any(k in d for k in ['beef', 'steak', 'short ribs', 'meatloaf', 'pork', 'bacon', 'ham', 'sausage']):
        tags.append('meat')
        
    return tags

def build_combined_matrix(raw_parsed):
    locations_meta = {
        'residential_colleges': {
            'id': 'residential_colleges',
            'name': 'Residential Colleges',
            'sub': 'Headington & Dunham Dining Hall',
            'icon': '🏛️',
            'url_lunch': URLS['res_lunch']['url'],
            'url_dinner': URLS['res_dinner']['url'],
            'hours': 'Lunch: 11:00 AM - 2:00 PM | Dinner: 4:30 PM - 8:00 PM',
            'summary': 'Dunham features daily rotating hot entrees & vegan specialties. Headington hosts specialty bars (Wing Bar, Seafood Bar, Mac & Cheese) plus everyday made-to-order classics.'
        },
        'couch_restaurants': {
            'id': 'couch_restaurants',
            'name': 'Couch Restaurants',
            'sub': 'All-You-Care-To-Eat Dining Center',
            'icon': '🍽️',
            'url_lunch': URLS['couch_lunch']['url'],
            'url_dinner': URLS['couch_dinner']['url'],
            'hours': 'Lunch: 10:30 AM - 2:30 PM | Dinner: 4:30 PM - 9:00 PM',
            'summary': 'The legendary OU dining center with the world’s only all-you-care-to-eat Chick-fil-A, Shanghai Stir-Fry, Chef’s Choice entrees, Casa Del Sol, Athens Café, and Crimson Creamery.'
        },
        'wagner_dining_hall': {
            'id': 'wagner_dining_hall',
            'name': 'Wagner Dining Hall',
            'sub': 'Athletics & Student Dining',
            'icon': '🏆',
            'url_lunch': URLS['wagner_lunch']['url'],
            'url_dinner': URLS['wagner_dinner']['url'],
            'hours': 'Lunch: 11:00 AM - 1:30 PM | Dinner (Sun-Thu): 5:00 PM - 7:30 PM',
            'summary': 'High-performance nutrition featuring daily scratch-made hot entrees, seasoned meats & grains, custom Made-to-Order stir-fry/pasta/grill/curry, and fresh deli/salad bars.'
        }
    }

    week_title = raw_parsed['res_dinner'].get('week_info', 'Current Week')
    
    rows = []
    
    for day in DAYS_ORDER:
        for meal in ['lunch', 'dinner']:
            row_id = f"{day.lower()}_{meal}"
            row = {
                'id': row_id,
                'day': day,
                'meal': meal,
                'meal_label': 'Lunch' if meal == 'lunch' else 'Dinner',
                'locations': {}
            }
            
            # 1. Residential Colleges
            res_data = raw_parsed[f'res_{meal}']
            res_hotline = res_data['daily_hot_line'].get(day, [])
            res_rotation = res_data['chefs_rotation'].get(day, '')
            res_everyday = res_data.get('everyday_stations', [])
            
            res_stations = []
            if res_hotline:
                res_stations.append({
                    'title': 'Dunham Hot Line',
                    'badge': 'Featured Entrees',
                    'items': [{'name': item, 'tags': detect_dietary_tags(item)} for item in res_hotline]
                })
            if res_rotation:
                res_stations.append({
                    'title': "Headington Chef's Rotation",
                    'badge': 'Specialty Bar',
                    'items': [{'name': res_rotation, 'tags': detect_dietary_tags(res_rotation)}]
                })
            if res_everyday:
                res_stations.append({
                    'title': 'Everyday Classics',
                    'badge': 'Daily Stations',
                    'items': [{'name': st, 'tags': []} for st in res_everyday[:6]]
                })
                
            row['locations']['residential_colleges'] = {
                'available': bool(res_hotline or res_rotation),
                'note': 'Closed for this meal' if not (res_hotline or res_rotation) else '',
                'stations': res_stations
            }
            
            # 2. Couch Restaurants
            couch_data = raw_parsed[f'couch_{meal}']
            couch_chefs = couch_data['chefs_choice'].get(day, [])
            couch_shanghai = couch_data['shanghai_stir_fry'].get(day, [])
            couch_specialties = couch_data.get('specialties', [])
            
            couch_stations = []
            if couch_chefs:
                couch_stations.append({
                    'title': "Chef's Choice Entrees",
                    'badge': 'Featured Entrees',
                    'items': [{'name': item, 'tags': detect_dietary_tags(item)} for item in couch_chefs]
                })
            if couch_shanghai:
                couch_stations.append({
                    'title': 'Shanghai Stir-Fry',
                    'badge': 'Asian Cuisine',
                    'items': [{'name': item, 'tags': detect_dietary_tags(item)} for item in couch_shanghai]
                })
            if couch_specialties:
                top_specialties = [
                    'Chick-fil-A', 'Casa Del Sol', 'Athens Café', 'La Roma Pizza & Pasta',
                    'Sooner Smokehouse', 'Chef Roy\'s Ramen', 'Vegetation Station', 'Dot\'s Deli', 'The Crimson Creamery'
                ]
                filtered = [s for s in couch_specialties if s['name'] in top_specialties]
                couch_stations.append({
                    'title': 'Restaurant Stations',
                    'badge': 'All-You-Care-To-Eat',
                    'items': [{'name': s['name'], 'tags': ['all-you-care-to-eat']} for s in filtered]
                })
                
            is_couch_open = True
            couch_note = ''
            if not couch_chefs and not couch_shanghai:
                couch_note = 'Open with Weekend Stations & Crimson Creamery'
                
            row['locations']['couch_restaurants'] = {
                'available': is_couch_open,
                'note': couch_note,
                'stations': couch_stations
            }
            
            # 3. Wagner Dining Hall
            wagner_data = raw_parsed[f'wagner_{meal}']
            wagner_day_entry = wagner_data['daily_menu'].get(day, None)
            
            wagner_stations = []
            if wagner_day_entry:
                entrees = wagner_day_entry.get('entrees_and_sides', [])
                mto = wagner_day_entry.get('made_to_order', [])
                if entrees:
                    wagner_stations.append({
                        'title': 'Hot Line Entrées & Sides',
                        'badge': 'Daily Entrees',
                        'items': [{'name': item, 'tags': detect_dietary_tags(item)} for item in entrees]
                    })
                if mto:
                    wagner_stations.append({
                        'title': 'Made To Order',
                        'badge': 'Custom Kitchen',
                        'items': [{'name': item, 'tags': ['custom']} for item in mto]
                    })
                    
            is_wagner_open = bool(wagner_day_entry and (wagner_day_entry['entrees_and_sides'] or wagner_day_entry['made_to_order']))
            row['locations']['wagner_dining_hall'] = {
                'available': is_wagner_open,
                'note': 'Closed (Dinner served Sun-Thu only; Closed weekends)' if not is_wagner_open else '',
                'stations': wagner_stations
            }
            
            rows.append(row)
            
    return {
        'week_info': week_title,
        'last_updated': 'Current Weekly Rotation',
        'locations_meta': locations_meta,
        'days_order': DAYS_ORDER,
        'rows': rows
    }

def main():
    os.makedirs('data', exist_ok=True)
    raw_parsed = {}
    
    print("Scraping OU dining menus...")
    for key, info in URLS.items():
        print(f"Fetching {key} ({info['location']} - {info['meal']})...")
        lines = fetch_lines(info['url'])
        if info['location'] == 'residential_colleges':
            raw_parsed[key] = parse_residential(lines, info['meal'])
        elif info['location'] == 'couch_restaurants':
            raw_parsed[key] = parse_couch(lines, info['meal'])
        elif info['location'] == 'wagner_dining_hall':
            raw_parsed[key] = parse_wagner(lines, info['meal'])
            
    matrix_data = build_combined_matrix(raw_parsed)
    
    output_path = os.path.join('data', 'menu_data.json')
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(matrix_data, f, indent=2, ensure_ascii=False)
        
    print(f"Saved complete matrix data to {output_path}!")
    print(f"Total rows generated: {len(matrix_data['rows'])}")

if __name__ == '__main__':
    main()
