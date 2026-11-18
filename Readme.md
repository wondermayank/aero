<div align="center">

# 🌌 4K Wallpaper Site by wondermayank (AeroPaper)

**The ultimate 4K wallpaper site by wondermayank. Browse, edit, preview and download 3,200+ Ultra HD wallpapers in one click.**

[![Live](https://img.shields.io/badge/Live-wallpaper.wondermayank.in-573AFC?style=for-the-badge)](https://wallpaper.wondermayank.in/)
![Vanilla JS](https://img.shields.io/badge/Built%20with-Vanilla%20JS-f7df1e?style=for-the-badge&logo=javascript&logoColor=black)
![No Signup](https://img.shields.io/badge/Signup-Not%20needed-22c55e?style=for-the-badge)
![Wallpapers](https://img.shields.io/badge/Wallpapers-3200%2B-blueviolet?style=for-the-badge)

[🌐 Open 4K Wallpaper Site](https://wallpaper.wondermayank.in/) · [🐛 Report Issue](https://github.com/wondermayank/aero/issues) · [🧑‍💻 About the creator](#-about-the-creator)

</div>

---

## 📖 About

**AeroPaper** is a high-performance **4K wallpaper site by wondermayank** built with plain **HTML, CSS and vanilla JavaScript**. There is no framework, no build step and no backend — wallpapers live in lightweight client-side data files (`database.js` & `wallpapers.json`), so pages load fast and downloads start instantly.

🔗 **Live:** https://wallpaper.wondermayank.in/

---

## 🚀 Latest Updates

### 🎨 800+ New Curated 4K Wallpapers (Total 3,224+)

* **🏴‍☠️ One Piece Collection (227 Wallpapers)**: +206 new verified wallpapers featuring Gear 5 Sun God Nika, Monkey D. Luffy, Roronoa Zoro, Wano Country, Straw Hat Crew, Shanks, Sabo, Ace, Law, Mihawk, Boa Hancock, Doflamingo, Yamato, and Going Merry / Thousand Sunny.
* **🌸 Girls Wallpapers (302 Wallpapers)**: +235 new verified 4K anime girls & waifu art including Frieren, Fern, Makima, Power, Lucy, Chizuru, Komi, Asuka, Rei, Saber, Zero Two, 2B, Mai Sakurajima, and aesthetic scenes.
* **📲 Mobile Wallpapers (228 Wallpapers)**: Brand-new dedicated vertical 9:16 portrait collection featuring 4K iPhone/Android shots, AMOLED fluid vertical gradients, aesthetic mobile art, and minimal red phone wallpapers.
* **📱 Colourful Tablet Wallpapers (166 Wallpapers)**: +131 new vibrant, colourful wallpapers tailored for 4:3, 16:10, and 3:2 tablet screens (iPad Pro, iPad Air, Surface, Galaxy Tab) — Aura gradients, Crystal 3D, vivid minimalist art, Catppuccin pastel waves, and AMOLED horizontal fluid art.
* **✨ Live Total Count Loading Screen**: Upgraded splash screen displays a real-time animated count-up of the total wallpapers & collections in the database synced with the gradient progress bar.

### 🔍 Supercharged Search & Discovery

* **Weighted Relevance Scoring**: Results are ranked dynamically (exact title > character prefixes > smart tags > category matches) so you see the best wallpapers at the top.
* **Alias & Synonym Expansion**: Smart query matching (e.g. `onepiece` ↔ `One Piece`, `waifu` / `girl` ↔ `Girls Wallpapers`, `phone` / `iphone` / `android` ↔ `Mobile Wallpapers`, `ipad` / `tab` / `colourful` ↔ `Tablet Wallpapers`).
* **Quick-Search Trending Pills**: One-click pills directly under the search bar (`One Piece`, `Girls`, `Mobile`, `Colourful Tablet`, `Anime`, `4K Landscape`, `Cyberpunk`, `Minimalist`, `Space`, `GIFs`).
* **Global Keyboard Shortcuts**: Press `/` or `Ctrl + K` / `Cmd + K` anywhere to open search instantly; `Esc` to clear or close.
* **Deep Linking**: Search queries automatically sync to URL parameters (`?q=one+piece`) for instant sharing and bookmarking.
* **Active Search Badge & Empty State Recovery**: Header shows active search filter with 1-click reset; zero-match searches offer 8 clickable suggestions.
* **Tablet & Mobile Canvas Presets**: Built-in 9:16 phone crop, 4:3 tablet crop, and 2048x1536 resolution export in the image editor.

---

## ✨ Features

| | Feature | Details |
|---|---|---|
| ⚡ | **High performance** | Zero framework overhead, single-file `index.html` with viewport-priority loading and `wsrv.nl` WebP thumbnails |
| 🗃️ | **3,200+ 4K Wallpapers** | Stored in `database.js` & `wallpapers.json` — One Piece, Girls, Mobile, Colourful Tablet, Anime, 4K Landscapes, Minimalist, Space & more |
| 📊 | **Live Count Splash Screen** | Animated counter on startup displaying exact total wallpapers and collections ready |
| 🔍 | **Smart Search & Ranking** | Multi-token relevance engine, alias expansion, trending pills, hotkeys (`/`, `Ctrl+K`), and URL sync |
| 🎬 | **Shared Element Animation** | Smooth FLIP popup animation opening from thumbnail and gliding back into place |
| 📱 | **Responsive Grid & Device Editor** | In-browser canvas editor with 9:16 phone crop, 4:3 tablet crop, and Gaussian blurred fit |
| ⬇️ | **Instant downloads** | One click to save full-resolution 4K & custom device resolutions |
| 🎞️ | **Fullscreen Slideshow** | Autoplay slideshow with smooth fades and keyboard shortcuts |
| 🔗 | **SEO, AEO & GEO Optimized** | Complete Open Graph, Twitter cards, and Schema.org structured data |
| 🆓 | **100% free** | No account, no ads, no paywall |

---

## 🗂️ Project Structure

```
aero/
├── index.html      all-in-one page structure, styles, gallery logic, and SEO meta tags
├── database.js     client-side wallpaper database (window.WALLPAPER_DATA fallback)
├── wallpapers.json wallpaper dataset in pure JSON (3,224+ items)
├── data.json       mirror wallpaper dataset
├── favicon.svg     site icon
└── og-image.png    social sharing preview image
```

---

## ▶️ Run Locally

```bash
git clone https://github.com/wondermayank/aero.git
cd aero
```

Then open `index.html` in your browser, or use **Live Server** in VS Code.

> No install, no `npm`, no build — it is just static files.

---

## ➕ Adding Wallpapers

All wallpapers are indexed in **`database.js`** and **`wallpapers.json`**. To add one:

1. Open `database.js` or `wallpapers.json`
2. Copy an existing entry
3. Change its values (title, image URL, category and so on)
4. Save, commit and push — the live site updates after deploy

---

## 🧑‍💻 About the Creator

Hi, I'm **Thunder** (online as **Wondermayank**) — a developer and designer from India.

I build free educational web platforms, developer tools and creative web experiences under the **ThunderStudy** and **Wondermayank** brands.

* 🌐 Portfolio: [wondermayank.in](https://wondermayank.in)
* 𝕏 X (Twitter): [@wondermayankx](https://x.com/wondermayankx)
* 📸 Instagram: [@wondermayank](https://instagram.com/wondermayank)
* 📺 YouTube: [@wondermayank](https://youtube.com/@wondermayank)
* 🐙 GitHub: [@wondermayank](https://github.com/wondermayank)
* 📚 ThunderStudy: [commercesehoga.github.io](https://commercesehoga.github.io)

---

<div align="center">

Made with ⚡ by **wondermayank** ([@wondermayankx](https://x.com/wondermayankx))

If you like this 4K wallpaper site, drop a ⭐

</div>

