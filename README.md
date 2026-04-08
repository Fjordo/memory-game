# Memory Game 🎮

Un gioco della memoria interattivo e moderno costruito con **React**, **TypeScript** e **Vite**. Il gioco presenta una griglia di 100 carte (10x10) con emoji di frutta, animali e simboli naturali.

## 🎯 Caratteristiche

- **Griglia 10x10**: 100 carte con 50 coppie di simboli
- **Interfaccia moderna**: Realizzata con React 19 e Tailwind CSS
- **Animazioni fluide**: Effetti di flip e transizioni smooth
- **Logica di gioco**: Rileva automaticamente le coppie corrispondenti
- **Stato globale**: Gestione dello stato con React Hooks
- **Type-safe**: Completamente tipizzato con TypeScript

## 🚀 Quick Start

### Prerequisiti

- Node.js 16+
- npm o yarn

### Installazione

```bash
# Clonare il repository
git clone https://github.com/Fjordo/memory-game.git
cd memory-game

# Installare le dipendenze
npm install
```

### Avvio in modalità sviluppo

```bash
npm run dev
```

L'applicazione sarà disponibile su `http://localhost:5173`

### Build per la produzione

```bash
npm run build
```

La build sarà generata nella cartella `dist/`

### Anteprima della build

```bash
npm run preview
```

### Linting

```bash
npm run lint
```

## 🐳 Docker

L'applicazione è containerizzata con Docker e configurata per essere servita con Nginx.

### Build dell'immagine Docker

```bash
docker build -t memory-game .
```

### Esecuzione del container

```bash
docker run -p 80:80 memory-game
```

L'applicazione sarà disponibile su `http://localhost`

## 📁 Struttura del progetto

```text
├── src/
│   ├── App.tsx           # Componente principale
│   ├── memory.tsx        # Logica e UI del gioco
│   ├── App.css           # Stili personalizzati
│   ├── index.css         # Stili globali
│   ├── main.tsx          # Entry point
│   └── assets/           # Risorse statiche
├── public/               # File pubblici
├── Dockerfile            # Configurazione Docker
├── nginx.conf            # Configurazione Nginx
├── vite.config.ts        # Configurazione Vite
├── tsconfig.json         # Configurazione TypeScript
└── package.json          # Dipendenze del progetto
```

## 🛠️ Tecnologie utilizzate

- **React 19** - Framework UI
- **TypeScript ~5.9** - Type-safe language
- **Vite 7** - Build tool e dev server
- **Tailwind CSS 4** - Utility-first CSS framework
- **ESLint 9** - Linting e code quality
- **Docker** - Containerizzazione
- **Nginx** - Web server

## 🎮 Come giocare

1. **Clicca su una carta** per scoprire il simbolo nascosto
2. **Clicca su una seconda carta** per cercare la coppia
3. **Se i simboli corrispondono**, le carte rimangono scoperte
4. **Se non corrispondo**, le carte si rigirano
5. **L'obiettivo** è trovare tutte le 50 coppie di simboli

## 📝 Script disponibili

| Script | Descrizione |
| ------ | ----------- |
| `npm run dev` | Avvia il dev server con hot reload |
| `npm run build` | Compila TypeScript e crea la build di produzione |
| `npm run lint` | Esegue ESLint per verificare la qualità del codice |
| `npm run preview` | Anteprima della build di produzione in locale |

## 🐛 Bug segnalati / Issues

Se trovi un bug o vuoi suggerire una feature, crea una [issue](https://github.com/Fjordo/memory-game/issues) nel repository.

---
