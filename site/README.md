# План обучения 7 класс — сайт

Статический сайт с планом домашнего обучения на 2026/2027 год. Собран на Vite +
React 19 + Astryx. Деплоится на GitHub Pages как обычные статические файлы.

## Что внутри

Шесть экранов (адреса через хеш, чтобы работало на Pages без настройки сервера):

| Экран | Адрес |
| --- | --- |
| Обзор | `#/overview` |
| По месяцам | `#/months` |
| По неделям | `#/weeks` |
| Контрольные | `#/controls` |
| Предметы | `#/subjects` |
| Документ (Markdown) | `#/document` |

Отметки «пройдено» на экране «По неделям» хранятся в `localStorage` браузера.

## Локальный запуск

```bash
cd site
npm install
npm run dev
```

Сборка и предпросмотр:

```bash
npm run build
npm run preview
```

## Обновление данных

Единственный источник данных — Python-файлы в `../src`. После правок плана:

```bash
python3 src/export_site_data.py
```

Скрипт перезаписывает `site/src/data/plan.json` и копирует Markdown в
`site/public/plan.md`.

## Публикация на GitHub Pages

1. Запушьте репозиторий в GitHub (ветка `main`).
2. В настройках репозитория: **Settings → Pages → Build and deployment → Source:
   GitHub Actions**.
3. Воркфлоу `.github/workflows/pages.yml` сам соберёт `site/` и опубликует
   `site/dist`.

Сайт использует относительные пути (`base: './'`), поэтому работает и в
подпапке `username.github.io/repo`, и на своём домене без правок.

## Стек

- Vite 8, React 19, TypeScript
- Astryx (`@astryxdesign/core`, тема `neutral`) — компоненты и токены
- markdown-it + github-markdown-css — отрисовка полного текста плана
- puppeteer-core — служебный скрипт `scripts/inspect.mjs` для проверки вёрстки
