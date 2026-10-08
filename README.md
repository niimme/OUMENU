# 🍽️ OU Dining Menus

I created this website to combine all the OU restarant menus into one website so I don't have to click through multiple website to check the menu at the dining halls

## 🌟 Features

- 🥞 **Breakfast, Lunch & Dinner Coverage**: Full daily breakfast offerings including made-to-order omelets & sandwiches at Residential Colleges, The Breakfast Club at Couch, and scraped hot line scrambles & pancakes at Wagner.
- 📅 **Day-by-Day Menu Selector**: Switch effortlessly between Monday through Sunday menus with auto-detection for the current day.
- 🍱 **Split Meal View & Individual Meal Filters**: Seamlessly toggle between **Split View (All)**, **🥞 Breakfast**, **☀️ Lunch**, and **🌙 Dinner** cards across all venues.
- 🔍 **Instant Dish Search**: Real-time fuzzy searching across all stations, entrees, sides, breakfast specialties, and dietary needs.
- 🥗 **Dietary Filters & Badges**: Filter menus by Vegetarian, Vegan, Meat, Poultry, and Seafood tags.
- 🏛️ **Everyday Stations Guide**: Quick modal access to daily permanent stations (Couch's all-you-care-to-eat Chick-fil-A, Athens Café, Dunham Grill, Salad Bars, Waffle & Omelet bars, etc.).
- 🖨️ **Print-Ready Styles**: Clean print layout formatted for physical copies or offline reading.
- 📱 **Mobile & Responsive**: Built with responsive vanilla CSS and modern typography.

---

## 📍 Covered Dining Locations

1. **Residential Colleges** (Dunham College &amp; Headington College)
2. **Couch Restaurants** (Couch Center)
3. **Wagner Dining Hall** (Located inside **Headington Hall** &ndash; *not to be confused with Headington College*)

---

## 🛠️ Tech Stack & Architecture

- **Frontend**: Vanilla HTML5, CSS3 (modern custom properties, responsive flex/grid layouts), and Vanilla JavaScript (ES6+).
- **Hosting & Deployment**: [Vercel](https://vercel.com) ([https://oumenu.vercel.app](https://oumenu.vercel.app)).
- **Scraper & Data Pipeline**: Python script (`scrape_menus.py`) with `BeautifulSoup` to parse official University of Oklahoma dining pages into structured `data/menu_data.json`.
