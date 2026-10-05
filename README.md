# 🍽️ OU Dining Menus

Live Website: **[https://oumenu.vercel.app](https://oumenu.vercel.app)**

A modern, fast, and responsive web application providing daily menus and nutritional options across all University of Oklahoma campus dining facilities.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-oumenu.vercel.app-crimson?style=for-the-badge&logo=vercel)](https://oumenu.vercel.app)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

---

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

---

## 🚀 Local Development

1. **Clone the repository:**
   ```bash
   git clone https://github.com/niimme/OUMENU.git
   cd OUMENU
   ```

2. **Run a local static server:**
   ```bash
   # Using Python
   python3 -m http.server 8000

   # Or using npx serve
   npx serve .
   ```

3. Open your browser at `http://localhost:8000`.

---

## 🔄 Updating Menus

### 🤖 Automatic Updates (GitHub Actions)
The repository includes an automated workflow ([`.github/workflows/update-menu.yml`](.github/workflows/update-menu.yml)) that runs weekly via GitHub Actions:
- **Schedule**: Automatically runs every Monday at 11:00 AM Central Time (16:00 UTC / Norman, OK).
- **Execution**: Checks out the repo, sets up Python, installs dependencies, runs `scrape_menus.py`, and commits changes to `data/menu_data.json` if new items or weeks are found.
- **Auto-Deployment**: When GitHub Actions pushes changes to `main`, Vercel immediately deploys the new menu live to [oumenu.vercel.app](https://oumenu.vercel.app).
- **Manual Trigger**: You can also trigger an update at any time directly in GitHub by navigating to the **Actions** tab → **Update Dining Menus** → click **Run workflow**.

> **Note on Permissions**: Ensure your GitHub repository allows actions to write commits:  
> Go to **Settings** → **Actions** → **General** → **Workflow permissions** → Select **"Read and write permissions"** and click **Save**.

### 💻 Manual Local Update
To refresh dining menu data locally from official OU sources:

```bash
pip install -r requirements.txt
python3 scrape_menus.py
```
This updates `data/menu_data.json` with the latest scraped weekly offerings.

