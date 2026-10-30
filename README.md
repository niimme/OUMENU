# 🍽️ OU Dining Menus

## 🌟 Features

- **Day-by-Day Menu Selector**: Switch effortlessly between Monday through Sunday menus with auto-detection for the current day.
- **Split Meal View & Individual Meal Filters**: Seamlessly toggle between **Split View (All)**, **Breakfast**, **Lunch**, and **Dinner** cards across all venues.
- **Archive Menus**: Option to view between past weeks to get an idea of what each dining hall provides.

---

## 📍 Covered Dining Locations

1. **Residential Colleges** (Dunham College &amp; Headington College)
2. **Couch Restaurants** (Couch Center)
3. **Wagner Dining Hall** (Located inside **Headington Hall** &ndash; *not to be confused with Headington College*)

---

## 🛠️ Tech Stack & Architecture

- **Frontend**: React 18, HTML5, and clean modern minimalist CSS (responsive grid layouts, monochromatic typography, and smooth transitions).
- **Hosting & Deployment**: [Vercel](https://vercel.com) ([https://oumenu.vercel.app](https://oumenu.vercel.app)).
- **Scraper & Data Pipeline**: Python script (`scrape_menus.py`) with `BeautifulSoup` to parse official University of Oklahoma dining pages into structured `data/menu_data.json`.
