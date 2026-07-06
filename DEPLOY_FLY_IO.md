# Guida al deployment su Fly.io

Questa guida spiega come deployare l'applicazione Memory Game su **Fly.io**.

## 📋 Prerequisiti

1. **Account Fly.io**: Registrati gratuitamente su [fly.io](https://fly.io)
2. **Fly CLI**: Installa il CLI di Fly.io

### Installazione Fly CLI

#### Windows (PowerShell)

```powershell
iwr https://fly.io/install.ps1 -useb | iex
```

#### macOS/Linux (Bash)

```bash
curl -L https://fly.io/install.sh | sh
```

Verifica l'installazione:

```bash
flyctl version
```

## 🚀 Operazioni di deployment

### 1. Autenticazione con Fly.io

```bash
flyctl auth login
```

Questo aprirà il browser per completare l'autenticazione.

### 2. Configurazione iniziale (opzionale)

Se vuoi personalizzare il nome dell'app, modifica il file `fly.toml`:

```toml
app = "fjordo-memory-game"  # Cambia con il tuo nome preferito
primary_region = "mil"       # Regione (mil=Milano, ams=Amsterdam, cdg=Parigi, etc.)
```

**Regioni disponibili in Europa:**

- `mil` - Milan, Italy
- `ams` - Amsterdam, Netherlands
- `cdg` - Paris, France
- `lhr` - London, UK
- `fra` - Frankfurt, Germany

### 3. Primo deployment con `flyctl launch`

Questo crea l'app su Fly.io e deploya automaticamente:

```bash
flyctl launch
```

Durante l'esecuzione:

- ✅ Legge il `fly.toml`
- ✅ Crea l'app sulla regione specificata
- ✅ Effettua il build del Dockerfile
- ✅ Deploya l'app
- ✅ Fornisce l'URL pubblico

Se hai già un `fly.toml` configurato:

```bash
flyctl launch --now
```

### 4. Deployamenti successivi

Per i prossimi deployamenti, usa semplicemente:

```bash
flyctl deploy
```

Oppure:

```bash
flyctl deploy --now
```

### 5. Deployment automatico da GitHub Actions

Il repository usa due workflow separati:

- `.github/workflows/ci.yml` esegue lint, test e build su pull request e push su `main`, `development` e `feature/**`.
- `.github/workflows/deploy.yml` parte solo quando il workflow `CI` termina con successo dopo un push su `main`.

Per abilitarla:

1. Genera un token di deploy per l'app:

```bash
flyctl tokens create deploy -x 999999h
```

2. Copia tutto il valore del token, incluso il prefisso `FlyV1`.
3. Su GitHub apri **Settings → Secrets and variables → Actions**.
4. Crea un repository secret chiamato `FLY_API_TOKEN`.
5. Incolla il token come valore del secret.

Il job `deploy` usa `flyctl deploy --remote-only` e fa checkout dello stesso commit che ha superato la CI, quindi il build Docker viene eseguito dai builder remoti di Fly.io usando `fly.toml` e `Dockerfile` presenti nel repository.

## 📝 File `fly.toml` - Spiegazione

Il file `fly.toml` già generato contiene:

| Sezione | Descrizione |
| ------- | ---------- |
| `app` | Nome univoco dell'app su Fly.io |
| `primary_region` | Regione datacenter principale |
| `build.dockerfile` | Percorso del Dockerfile |
| `http_service.internal_port` | Porta interna del container (`8080`) |
| `http_service.checks` | Health check dell'app |

## 🔧 Comandi utili

```bash
# Visualizza lo stato del deployment
flyctl status

# Vedi i log in tempo reale
flyctl logs

# Accedi alla console SSH dell'app
flyctl ssh console

# Scala l'app (numero di istanze)
flyctl scale count 2

# Configura variabili d'ambiente
flyctl secrets set MY_VAR=value

# Visualizza variabili d'ambiente
flyctl secrets list

# Elimina l'app
flyctl apps destroy fjordo-memory-game

# Rinomina l'app
flyctl apps rename fjordo-memory-game new-name
```

## 🌐 Accesso all'app

Dopo il deployment, l'app sarà disponibile su:

```text
https://fjordo-memory-game.fly.dev
```

*(sostituisci `fjordo-memory-game` con il nome della tua app)*

Fly.io fornisce automaticamente **SSL/TLS** con certificati Let's Encrypt!

## 💡 Configurazioni avanzate

### Aumentare il numero di istanze

```bash
flyctl scale count 3
```

### Configurare un dominio personalizzato

```bash
# Aggiungi un dominio
flyctl certs add tuodominio.com

# Verifica lo stato del certificato
flyctl certs show tuodominio.com
```

### Abilitare il database (se necessario in futuro)

```bash
flyctl postgres create
```

### Monitorare performance

```bash
# Dashboard web
flyctl open
```

## 🐛 Troubleshooting

### L'app non si avvia

```bash
flyctl logs
```

### Il build fallisce

```bash
flyctl deploy --verbose
```

### Ripristina a un deployment precedente

```bash
flyctl releases
flyctl releases rollback
```

## 📊 Limiti del piano gratuito Fly.io

- ✅ 3 app gratuite
- ✅ 3GB storage condiviso
- ✅ 160GB/mese di banda
- ✅ PostgreSQL/MySQL database gratuiti

## 🔐 Considerazioni di sicurezza

Il file `nginx.conf` include già:

- ✅ Security headers (CSP, X-Frame-Options, etc.)
- ✅ Cache headers ottimizzati
- ✅ Health check
- ✅ Runtime Nginx non privilegiato su porta `8080`
- ✅ Permissioni browser minimali (geolocation, camera, microphone disabilitate)

## 📞 Supporto

- **Docs**: <https://fly.io/docs>
- **Community**: <https://community.fly.io>
- **Status**: <https://status.fly.io>

---

A te, **Buon deployment! 🚀**
