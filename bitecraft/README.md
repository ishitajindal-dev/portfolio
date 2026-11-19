# BiteCraft 🍽️

A responsive recipe discovery app built with React, JavaScript, and CSS. Search meals, browse categories, view full recipes, and save favourites.

## Features

- **Live recipe search** by meal name
- **Category browsing** powered by the TheMealDB REST API
- **Recipe detail modal** with ingredients, measurements, instructions, cuisine, and source link
- **Random recipe discovery** with the “Surprise me” action
- **Saved recipes** persisted in browser local storage
- **Responsive UI** for desktop, tablet, and mobile
- **Loading, empty, and error states** for API-driven screens
- **Reusable React components** for cards, icons, and recipe details

## Tech stack

- React 18
- JavaScript (ES modules)
- Vite
- HTML5 and CSS3
- Fetch API / REST API
- Browser localStorage

## Getting started

Requires Node.js 18 or newer.

```bash
cd bitecraft
npm install
npm run dev
```

Open the local URL printed by Vite.

## Production build

```bash
npm run build
npm run preview
```

The optimized static site is generated in `dist/`.

## API

Recipe content is retrieved from [TheMealDB](https://www.themealdb.com/api.php), using its free developer test key and V1 endpoints:

- `categories.php` — recipe categories
- `filter.php?c=...` — meals by category
- `search.php?s=...` — search meals by name
- `lookup.php?i=...` — full meal details
- `random.php` — a random recipe

TheMealDB's free test key is intended for development and educational projects. Check its API guide for current usage and production requirements.

## Project structure

```text
bitecraft/
├── index.html
├── package.json
├── vite.config.js
├── .gitignore
└── src/
    ├── App.jsx
    ├── main.jsx
    └── styles.css
```

## Notes

- Saved recipes are stored locally in the current browser; they are not synced to an account or server.
- The API must be reachable for live search and recipe details.
- Recipe images and data are supplied by TheMealDB.

---

Built as a frontend portfolio project by **Ishita Jindal**.
