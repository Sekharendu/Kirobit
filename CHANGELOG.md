# Changelog

All notable changes to KiroBit will be documented in this file.

---

## [1.1.0] — 2026-06-11

### Added
- **IndexedDB caching** — notes and folders persist locally, app opens instantly on revisit
- **Stale-while-revalidate** — cached data shown immediately, server sync happens in background
- **Debounced auto-save** — cache written 2s after last mutation, no performance impact
- **Vercel Analytics** — automatic page views, web vitals, visitor tracking
- **Custom analytics events** — tracks sign-in clicks, sign-ups, note creation, folder creation, favorites, and theme changes
- **SEO meta tags** — title, description, keywords, canonical URL for search engine visibility
- **Open Graph & Twitter Card tags** — rich link previews when sharing on social media
- **robots.txt & sitemap.xml** — allows search engine indexing
- **Landing page revamp** — 6 feature highlight cards on auth screen explaining KiroBit's capabilities
- **Auth button loading states** — "Redirecting…" feedback during OAuth sign-in

### Changed
- `#root` overflow handling — auth page now scrollable when content exceeds viewport
- `.gitignore` — excludes `playwright-report/` and `test-results/`

### Fixed
- Blank link previews on social media (no OG tags)
- Auth page feature cards invisible due to `overflow: hidden`

---

## [1.0.0] — Initial Release

- React 19 + Vite 7 SPA
- Supabase Auth (Google + GitHub OAuth)
- Rich text editing (TipTap: headings, bold, italic, code blocks, text colors, highlights, math)
- Folder-based note organization with drag-and-drop
- Favorites system
- Search (Ctrl+K, full-text across notes)
- Dark/light theme with localStorage persistence
- Responsive layout (desktop sidebar + mobile overlay)
- PWA support (offline mode, installable, update prompts)
- Custom code block toolbar (copy/paste)
- Resizable sidebar (180px–480px)
- Multi-select notes (Ctrl+click bulk delete/move)
- Keyboard-driven format menu (slash command + right-click context)
- Playwright E2E tests (10 suites, desktop + mobile)
