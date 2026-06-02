# OnVaOu Setup Fortsetzen

Stand dieses Projekts:

- Die Mobile-App ist auf den Nutzer-Fall reduziert.
- Shop und Admin laufen im Webportal unter `web/portal/`.
- Die Ziel-URL im Code ist auf `https://onvaou.vercel.app` gesetzt.
- Lokal testbar ist das Portal unter `http://127.0.0.1:4300/`.
- Demo-Modus fuer das Portal wurde entfernt.
- Supabase ist vorbereitet, aber noch nicht mit echten Keys konfiguriert.

## Was als Naechstes zu tun ist

### 1. GitHub-Repo anlegen und Code pushen

Pruefung:

- Das Projekt ist bereits ein Git-Repo.
- Es gibt aktuell noch **kein** `origin` Remote.

Befehle:

```powershell
git add .
git commit -m "Prepare OnVaOu portal and user app split"
git branch -M main
git remote add origin https://github.com/DEINNAME/onvaou.git
git push -u origin main
```

Wichtig:

- `DEINNAME` durch deinen GitHub-Namen ersetzen.
- Vor echtem Push pruefen, dass keine geheimen Keys in `.env` stehen.

### 2. Vercel-Projekt erstellen

Ziel:

- kostenlose URL moeglichst `https://onvaou.vercel.app`

Hinweis:

- Die exakte `.vercel.app`-URL ist nicht garantiert.
- Wenn `onvaou` schon vergeben ist, vergibt Vercel eine aehnliche URL.

In Vercel:

1. Bei `https://vercel.com` einloggen
2. GitHub-Repo importieren
3. Einstellungen beim Import:
   - `Project Name`: `onvaou`
   - `Root Directory`: `web/portal`
   - `Framework Preset`: `Other`
   - `Build Command`: leer
   - `Output Directory`: leer
4. Deploy starten

Danach testen:

- `/`
- `/shop`
- `/admin`

Datei fuer Vercel-Konfiguration:

- `web/portal/vercel.json`

### 3. Supabase einrichten

Es fehlen aktuell noch echte Werte in:

- `.env`
- `web/portal/config.js`

Eintragen:

```text
EXPO_PUBLIC_SUPABASE_URL=...
EXPO_PUBLIC_SUPABASE_ANON_KEY=...
```

Und in `web/portal/config.js`:

```js
window.ONVAOU_CONFIG = {
  siteName: "onvaou.vercel.app",
  siteUrl: "https://onvaou.vercel.app",
  supabaseUrl: "...",
  supabaseAnonKey: "..."
};
```

Wichtig:

- Nur den `anon key` im Frontend verwenden.
- Niemals den `service_role key` dort eintragen.

### 4. SQL in Supabase ausfuehren

Datei:

- `web/portal/supabase-schema.sql`

Diese Datei im Supabase SQL Editor ausfuehren.

Dadurch werden angelegt:

- `shops`
- `offers`
- `redemptions`
- `app_users`
- `portal_users`

### 5. Auth-User in Supabase anlegen

Im Supabase Auth Bereich:

1. einen Admin-User anlegen
2. einen Shop-User anlegen

Danach passende Eintraege in `portal_users` anlegen:

- Admin mit Rolle `admin`
- Shop mit Rolle `shop`
- beim Shop zusaetzlich `shop_id`

### 6. Ersten Shop anlegen

Mindestens ein Eintrag in `shops` wird gebraucht, sonst zeigt das Portal nichts Sinnvolles an.

### 7. Nutzer-App mit Supabase testen

Wichtig:

- Beim Erstellen eines Nutzerprofils in der App wird der User in `app_users` gespiegelt.
- Dadurch kann das Webportal QR-Codes spaeter gegen echte Nutzer aufloesen.

### 8. Lokal weiter testen

Portal lokal starten:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\serve-portal.ps1
```

Lokaler Link:

```text
http://127.0.0.1:4300/
```

## Wichtige Projektdateien

- `src/config/portal.ts`
- `web/portal/config.js`
- `web/portal/app.js`
- `web/portal/vercel.json`
- `web/portal/supabase-schema.sql`
- `scripts/serve-portal.ps1`
- `.env`
- `README.md`

## Wenn wir spaeter weitermachen

Sag einfach:

`Mach mit CONTINUE_ONVAOU_SETUP weiter`

Dann koennen wir direkt bei GitHub, Vercel oder Supabase einsteigen.
