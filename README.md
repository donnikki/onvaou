# onvaou.vercel.app / Biel

Die Mobile-App ist jetzt auf den Nutzer-Fall reduziert.

- `app/` enthaelt die Expo-App fuer Nutzer.
- `web/portal/` enthaelt den Startpunkt fuer Shop und Admin auf der Website.
- `src/config/portal.ts` zeigt auf die Ziel-URL `https://onvaou.vercel.app`.

## Mobile App starten

```bash
npx expo start
```

## Portal lokal pruefen

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\serve-portal.ps1
```

Danach ist das Portal lokal unter `http://127.0.0.1:4300` erreichbar. Die Ziel-URL im Code ist trotzdem `https://onvaou.vercel.app`.

## Supabase fuer Live-Sync

1. Fuehre [supabase-schema.sql](/c:/dev/Biel/web/portal/supabase-schema.sql) in deinem Supabase SQL Editor aus.
2. Trage URL und Anon Key in `.env` und [config.js](/c:/dev/Biel/web/portal/config.js) ein.
3. Setze `EXPO_PUBLIC_ENABLE_MOCK_MODE=false`.
4. Lege in Supabase Auth echte Shop- und Admin-User an und hinterlege sie in `portal_users`.
