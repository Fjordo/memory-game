# Memory Game 🎮

Un gioco della memoria interattivo costruito con **React 19**, **TypeScript** e **Vite**. Trova tutte le coppie di emoji girando le carte con un'animazione flip 3D.

## 🎯 Funzionalità

- **Livelli di difficoltà** — 4×4 (8 coppie), 6×6 (18), 8×8 (32), 10×10 (50)
- **Selezione categoria** — Tutti, 🍎 Frutta, 🥕 Verdura, 🐶 Animali, 🐮 Fattoria, ⭐ Natura
- **Statistiche in tempo reale** — timer, contatore mosse, coppie trovate
- **Record personale** — salvato in localStorage per ogni combinazione difficoltà/categoria
- **Animazione flip 3D** — rotazione CSS con `perspective` e `rotateY`
- **Responsive** — griglia adattiva da mobile a desktop

## 🚀 Quick Start

### Prerequisiti

- Node.js 22+
- npm

### Installazione

```bash
git clone https://github.com/Fjordo/memory-game.git
cd memory-game
npm install
```

### Sviluppo

```bash
npm run dev        # dev server su http://localhost:5173
npm run build      # build di produzione in dist/
npm run preview    # anteprima della build
npm run lint       # ESLint
npm run test       # test (Vitest, run singolo)
npm run test:watch # test in modalità watch
```

## 🎮 Come giocare

1. Scegli la **difficoltà** e la **categoria** di emoji
2. Clicca su una carta per scoprirla — il timer parte al primo click
3. Clicca su una seconda carta per cercare la coppia
4. Se i simboli corrispondono le carte restano scoperte, altrimenti si rigirano dopo 0,8s
5. Completa tutte le coppie nel minor numero di mosse possibile
6. Il record viene salvato automaticamente per ogni combinazione difficoltà/categoria

## 🐳 Docker

```bash
docker build -t memory-game .
docker run -p 80:80 memory-game
# http://localhost
```

## 📁 Struttura del progetto

```text
src/
  memory.tsx        # logica di gioco, UI, tipi e helper puri
  memory.test.tsx   # test unitari (funzioni pure) e di componente
  test-setup.ts     # setup @testing-library/jest-dom
  App.tsx           # wrapper root
  index.css         # Tailwind + CSS animazione flip 3D
  main.tsx          # entry point React
Dockerfile          # build multi-stage Node → Nginx
nginx.conf          # header di sicurezza e cache strategy
fly.toml            # deploy su Fly.io (CDG)
vite.config.ts      # Vite + Vitest
```

## 🛠️ Stack

| Tecnologia | Versione | Ruolo |
| --- | --- | --- |
| React | 19 | UI framework |
| TypeScript | ~5.9 | Type safety |
| Vite | 8 | Build tool / dev server |
| Tailwind CSS | 4 | Utility-first styling |
| Vitest | 4 | Test runner |
| React Testing Library | 16 | Component testing |
| ESLint | 9 | Linting |
| Docker + Nginx | — | Containerizzazione |
| Fly.io | — | Hosting (region: CDG) |

## 📝 Script disponibili

| Script | Descrizione |
| --- | --- |
| `npm run dev` | Dev server con hot reload |
| `npm run build` | TypeScript check + build produzione |
| `npm run lint` | ESLint |
| `npm run preview` | Anteprima build locale |
| `npm run test` | Vitest (run singolo, CI-friendly) |
| `npm run test:watch` | Vitest in modalità watch |

## 🐛 Issue e contributi

Crea una [issue](https://github.com/Fjordo/memory-game/issues) per bug o suggerimenti.

---
