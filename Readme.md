<div align="center">

# 🌌 Aero — Wallpaper Gallery

**A fast, free wallpaper gallery. Browse, preview and download in one click.**

[![Live](https://img.shields.io/badge/Live-wallpaper.wondermayank.in-573AFC?style=for-the-badge)](https://wallpaper.wondermayank.in/)
![Vanilla JS](https://img.shields.io/badge/Built%20with-Vanilla%20JS-f7df1e?style=for-the-badge&logo=javascript&logoColor=black)
![No Signup](https://img.shields.io/badge/Signup-Not%20needed-22c55e?style=for-the-badge)

[🌐 Open Aero](https://wallpaper.wondermayank.in/) · [🐛 Report Issue](https://github.com/wondermayank/aero/issues) · [🧑‍💻 About the creator](#-about-the-creator)

</div>

---

## 📖 About

**Aero** is a high-performance wallpaper gallery built with plain **HTML, CSS and vanilla JavaScript**. There is no framework, no build step and no backend — wallpapers live in a lightweight client-side database file, so pages load fast and downloads start instantly.

🔗 **Live:** https://wallpaper.wondermayank.in/

---

## ✨ Features

| | Feature | Details |
|---|---|---|
| ⚡ | **High performance** | Zero framework overhead, loads instantly |
| 🗃️ | **Client-side database** | Wallpapers are stored in `database.js` — no server or API calls |
| 📱 | **Responsive grid** | Adapts from phones to large desktop screens |
| ⬇️ | **Instant downloads** | One click to save a wallpaper |
| 🖼️ | **Media gallery** | Clean image discovery and preview |
| 🔗 | **Social-ready** | `og-image.png` for rich link previews |
| 🆓 | **100% free** | No account, no ads, no paywall |

---

## 🗂️ Project Structure

```
aero/
├── index.html      page structure and SEO meta tags
├── style.css       styling and responsive grid layout
├── app.js          gallery logic: rendering, interactions, downloads
├── database.js     client-side wallpaper database
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

All wallpapers are listed in **`database.js`**. To add one:

1. Open `database.js`
2. Copy an existing entry
3. Change its values (title, image URL, category and so on) — **keep the same fields the file already uses**
4. Save, commit and push — the live site updates after deploy

Tips for good wallpapers:
- Use high-resolution images (1920×1080 or larger)
- Prefer compressed **WebP** or well-optimised JPG for fast loading
- Use clear, descriptive titles so people can find them

---

## 🚀 Deploy (Free)

Aero is static, so any free host works:

| Host | Steps |
|---|---|
| **GitHub Pages** | Settings → Pages → Deploy from `main` branch |
| **Cloudflare Pages** | Connect repo → no build command → output directory `/` |
| **Vercel** | Import repo → framework preset **Other** |
| **Netlify** | Import repo → no build command → publish directory `/` |

### Custom domain
1. Add `wallpaper.wondermayank.in` in your host's **Domains** settings
2. Add the `CNAME` record it shows in your DNS provider
3. Wait for HTTPS to activate

---

## 🧑‍💻 About the Creator

Hi, I'm **Thunder** (online as **Wondermayank**) — a student developer from India.

I build free educational web platforms, tools and Telegram bots for students under the **ThunderStudy** and **Wondermayank** brands, and I love clean, modern UI design.

- 🌐 Portfolio: [wondermayank.github.io](https://wondermayank.github.io)
- 📚 ThunderStudy: [commercesehoga.github.io](https://commercesehoga.github.io)
- 🛠️ Free web-dev guide: [make.wondermayank.in](https://make.wondermayank.in)
- 🐙 GitHub: [@wondermayank](https://github.com/wondermayank)

---

## ❓ FAQ

**Is it free?** Yes. No signup, no payment.

**Do I need to install anything?** No. It runs in any modern browser.

**Where are the wallpapers stored?** In `database.js`, loaded directly by the browser.

**Can I use it for my own gallery?** Fork it, replace the entries in `database.js`, and deploy.

---

## 🤝 Contributing

1. Fork the repo
2. Create a branch: `git checkout -b add-wallpapers`
3. Add or improve wallpapers and code
4. Open a Pull Request

---

## ⚖️ Wallpaper Credits

Only add images you own or that are licensed for free use. If you are a creator and want an image credited or removed, please [open an issue](https://github.com/wondermayank/aero/issues).

---

<div align="center">

Made with ⚡ by **Thunder** ([@wondermayank](https://github.com/wondermayank))

If you like Aero, drop a ⭐

</div>
