import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const app = document.querySelector("#app");
const page = document.body.dataset.portalPage || "landing";
const config = window.ONVAOU_CONFIG || {};
const siteName = config.siteName || "onvaou-blush.vercel.app";
const siteUrl = config.siteUrl || "https://onvaou-blush.vercel.app";
const hasSupabase = Boolean(config.supabaseUrl && config.supabaseAnonKey);
const supabase = hasSupabase ? createClient(config.supabaseUrl, config.supabaseAnonKey) : null;
const authRole = page === "admin" ? "admin" : "shop";

const categories = [
  "Kleiderladen",
  "Cafe",
  "Restaurant",
  "Bar",
  "Coiffeur",
  "Festival",
  "Party",
  "Konditorei"
];

const mapIcons = [
  "kleiderladen",
  "cafe",
  "restaurant",
  "bar",
  "coiffeur",
  "festival",
  "party",
  "konditorei"
];

const escapeHtml = (value) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const formatDate = (value) => {
  if (!value) {
    return "-";
  }

  try {
    return new Intl.DateTimeFormat("de-CH", { dateStyle: "medium" }).format(new Date(value));
  } catch {
    return value;
  }
};

const createId = (prefix) => `${prefix}-${Date.now()}`;

const formatAuthError = (error, fallback = "Etwas ist schiefgelaufen. Bitte versuche es erneut.") => {
  const message = String(error?.message || "").trim();

  if (!message) {
    return fallback;
  }

  if (/invalid login credentials/i.test(message)) {
    return "E-Mail oder Passwort stimmen nicht.";
  }

  if (/email not confirmed/i.test(message)) {
    return "Bitte bestaetige zuerst deine E-Mail und versuche es dann erneut.";
  }

  if (/user already registered/i.test(message)) {
    return "Mit dieser E-Mail gibt es bereits ein Shopkonto.";
  }

  return message;
};

const loadPortalScript = () =>
  new Promise((resolve) => {
    if (window.Html5Qrcode) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js";
    script.onload = () => resolve();
    script.onerror = () => resolve();
    document.body.appendChild(script);
  });

const hydrateScanner = async () => {
  if (!window.Html5Qrcode || !document.querySelector("#qr-reader")) {
    return;
  }

  try {
    const scanner = new window.Html5Qrcode("qr-reader");
    await scanner.start(
      { facingMode: "environment" },
      { fps: 10, qrbox: { width: 220, height: 220 } },
      async (decodedText) => {
        const input = document.querySelector("#qr-value");
        if (input) {
          input.value = decodedText;
        }
        await scanner.stop();
      }
    );
  } catch {
    const reader = document.querySelector("#qr-reader");
    if (reader) {
      reader.innerHTML = `
        <div>
          <strong>Kamera nicht verfuegbar</strong>
          <div class="muted">Du kannst den QR-Wert unten trotzdem manuell einfuegen.</div>
        </div>
      `;
    }
  }
};

const renderSetupRequired = () => {
  app.innerHTML = `
    <main class="shell">
      <section class="hero hero-shop">
        <p class="eyebrow">Shop-Portal</p>
        <h1>Shop-Portal fuer Biel</h1>
        <p class="muted">Die Supabase-Konfiguration fehlt noch. Trage zuerst die echten Werte in <code>web/portal/config.js</code> ein.</p>
      </section>
      <section class="landing-grid compact-grid">
        <article class="card highlight-red">
          <p class="label">Pflicht</p>
          <h2>Ohne Demo-Modus</h2>
          <p class="muted">Login, Freigaben und Einloesungen laufen hier nur gegen echte Supabase-Daten.</p>
        </article>
        <article class="card highlight-ink">
          <p class="label">Live URL</p>
          <h2>${escapeHtml(siteName)}</h2>
          <p class="muted">Das Portal ist auf <code>${escapeHtml(siteUrl)}</code> ausgerichtet.</p>
        </article>
      </section>
    </main>
  `;
};

const renderLanding = () => {
  app.innerHTML = `
    <main class="shell landing-shell">
      <section class="hero hero-shop">
        <div class="hero-copy">
          <p class="eyebrow">Shop-Portal</p>
          <h1>Shop-Portal fuer Biel</h1>
          <p class="muted">Verwalte dein Profil, Aktionen und Einloesungen.</p>
        </div>
        <div class="landing-links landing-links-large">
          <a class="button button-large" href="./shop.html">Shop einloggen</a>
          <a class="secondary-button button-large" href="./signup.html">Shop registrieren</a>
        </div>
      </section>

      <section class="landing-grid compact-grid">
        <article class="card highlight-red">
          <p class="label">Profil</p>
          <h2>Shop pflegen</h2>
          <p class="muted">Texte, Bilder und Kontaktdaten an einem Ort verwalten.</p>
        </article>
        <article class="card highlight-ink">
          <p class="label">Aktionen</p>
          <h2>Einfach verwalten</h2>
          <p class="muted">Neue Aktionen anlegen und QR-Einloesungen direkt bestaetigen.</p>
        </article>
      </section>

      <div class="admin-link-row">
        <a class="admin-link" href="./admin.html">Admin</a>
      </div>
    </main>
  `;
};

const renderUnauthorized = (message) => {
  app.innerHTML = `
    <main class="shell">
      <section class="hero hero-shop">
        <p class="eyebrow">${escapeHtml(siteName)}</p>
        <h1>Zugriff nicht erlaubt</h1>
        <p class="muted">${escapeHtml(message)}</p>
        <div class="landing-links">
          <a class="ghost-button" href="./index.html">Zurueck</a>
          <button class="button" id="logout-button">Logout</button>
        </div>
      </section>
    </main>
  `;

  document.querySelector("#logout-button")?.addEventListener("click", async () => {
    await supabase.auth.signOut();
    renderLogin();
  });
};

const renderShopPendingApproval = (shop) => {
  app.innerHTML = `
    <main class="shell">
      <section class="hero hero-shop">
        <p class="eyebrow">Shop wartet</p>
        <h1>Dein Shop wartet noch auf Admin-Freigabe.</h1>
        <p class="muted">Sobald ${escapeHtml(shop.name || "dein Shop")} freigegeben ist, kannst du Profil, Aktionen und Einloesungen hier verwalten.</p>
        <div class="landing-links">
          <a class="ghost-button" href="./index.html">Zur Startseite</a>
          <button class="button" id="logout-button">Logout</button>
        </div>
      </section>
    </main>
  `;

  document.querySelector("#logout-button")?.addEventListener("click", async () => {
    await supabase.auth.signOut();
    renderLogin();
  });
};

const renderLogin = (errorMessage = "", infoMessage = "") => {
  const heading = authRole === "admin" ? "Admin Login" : "Shop Login";
  const subcopy =
    authRole === "admin"
      ? "Melde dich mit deinem Admin-Konto an."
      : "Melde dich mit deinem Shop-Konto an.";

  app.innerHTML = `
    <main class="shell">
      <div class="top-nav">
        <a class="ghost-button" href="./index.html">Zur Startseite</a>
        <span class="pill green">Supabase Login</span>
      </div>
      <section class="login-shell">
        <section class="hero hero-shop">
          <p class="eyebrow">${authRole === "admin" ? "Admin" : "Shop"}</p>
          <h1>${heading}</h1>
          <p class="muted">${subcopy}</p>
          ${
            authRole === "shop"
              ? `
                <div class="inline-actions">
                  <a class="secondary-button" href="./signup.html">Shop registrieren</a>
                </div>
              `
              : ""
          }
        </section>

        <section class="login-card">
          <h2>Einloggen</h2>
          <form id="login-form">
            <div class="field">
              <label for="email">E-Mail</label>
              <input id="email" name="email" type="email" required />
            </div>
            <div class="field">
              <label for="password">Passwort</label>
              <input id="password" name="password" type="password" required />
            </div>
            ${infoMessage ? `<div class="note success">${escapeHtml(infoMessage)}</div>` : ""}
            ${errorMessage ? `<div class="note danger">${escapeHtml(errorMessage)}</div>` : ""}
            <button class="button" type="submit">Weiter</button>
          </form>
        </section>
      </section>
    </main>
  `;

  document.querySelector("#login-form")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "").trim();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      renderLogin(formatAuthError(error));
      return;
    }

    await bootPortal();
  });
};

const renderSignup = (errorMessage = "", successMessage = "") => {
  if (successMessage) {
    app.innerHTML = `
      <main class="shell">
        <div class="top-nav">
          <a class="ghost-button" href="./index.html">Zur Startseite</a>
        </div>
        <section class="login-shell">
          <section class="hero hero-shop">
            <p class="eyebrow">Shop Registrierung</p>
            <h1>Fast geschafft</h1>
            <p class="muted">${escapeHtml(successMessage)}</p>
            <div class="inline-actions">
              <a class="button" href="./shop.html">Zum Shop Login</a>
            </div>
          </section>
        </section>
      </main>
    `;
    return;
  }

  app.innerHTML = `
    <main class="shell">
      <div class="top-nav">
        <a class="ghost-button" href="./index.html">Zur Startseite</a>
        <a class="ghost-button" href="./shop.html">Ich habe schon ein Login</a>
      </div>
      <section class="login-shell">
        <section class="hero hero-shop">
          <p class="eyebrow">Shop Registrierung</p>
          <h1>Shop registrieren</h1>
          <p class="muted">Erstelle dein Shopkonto. Nach der Freigabe kannst du dein Profil, Aktionen und Einloesungen hier verwalten.</p>
        </section>

        <section class="login-card">
          <h2>Neuer Shop</h2>
          <form id="signup-form">
            <div class="field">
              <label for="contact-name">Dein Name</label>
              <input id="contact-name" name="contact_name" required />
            </div>
            <div class="field">
              <label for="shop-name">Shopname</label>
              <input id="shop-name" name="shop_name" required />
            </div>
            <div class="field">
              <label for="signup-email">E-Mail</label>
              <input id="signup-email" name="email" type="email" required />
            </div>
            <div class="field">
              <label for="signup-password">Passwort</label>
              <input id="signup-password" name="password" type="password" minlength="6" required />
            </div>
            <div class="field">
              <label for="shop-category">Kategorie</label>
              <select id="shop-category" name="category">
                ${categories.map((category) => `<option value="${escapeHtml(category)}">${escapeHtml(category)}</option>`).join("")}
              </select>
            </div>
            <div class="field">
              <label for="shop-phone">Telefon</label>
              <input id="shop-phone" name="phone" />
            </div>
            <div class="field full">
              <label for="shop-description">Kurzbeschreibung</label>
              <textarea id="shop-description" name="description" placeholder="Kurz und einfach"></textarea>
            </div>
            ${errorMessage ? `<div class="note danger">${escapeHtml(errorMessage)}</div>` : ""}
            <button class="button" type="submit">Registrierung senden</button>
          </form>
        </section>
      </section>
    </main>
  `;

  document.querySelector("#signup-form")?.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const contactName = String(formData.get("contact_name") || "").trim();
    const shopName = String(formData.get("shop_name") || "").trim();
    const email = String(formData.get("email") || "").trim().toLowerCase();
    const password = String(formData.get("password") || "").trim();
    const category = String(formData.get("category") || categories[0]);
    const phone = String(formData.get("phone") || "").trim();
    const description = String(formData.get("description") || "").trim();

    if (!contactName || !shopName || !email || !password) {
      renderSignup("Bitte fuelle alle Pflichtfelder aus.");
      return;
    }

    if (password.length < 6) {
      renderSignup("Das Passwort muss mindestens 6 Zeichen haben.");
      return;
    }

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: contactName,
          portal_role: "shop"
        }
      }
    });

    if (signUpError) {
      renderSignup(formatAuthError(signUpError));
      return;
    }

    const authUser = signUpData.user;
    if (!authUser?.id) {
      renderSignup("Die Registrierung konnte nicht vorbereitet werden. Bitte versuche es erneut.");
      return;
    }

    const shopId = createId("shop");
    const now = new Date().toISOString();

    const shopPayload = {
      id: shopId,
      owner_user_id: authUser.id,
      name: shopName,
      category,
      description,
      slogan: "",
      street: "",
      house_number: "",
      zip: "",
      city: "Biel",
      country: "Schweiz",
      latitude: 47.1368,
      longitude: 7.2468,
      phone,
      email,
      website: "",
      opening_hours: {},
      products: [],
      services: [],
      logo_url: "",
      hero_image_url: "",
      gallery_image_urls: [],
      map_icon: mapIcons.includes(category.toLowerCase()) ? category.toLowerCase() : "cafe",
      subscription_status: "inactive",
      admin_approved: false,
      is_visible_on_map: false,
      created_at: now,
      updated_at: now
    };

    const { error: shopError } = await supabase.from("shops").insert(shopPayload);
    if (shopError) {
      renderSignup("Die Registrierung konnte nicht fertig gespeichert werden. Bitte versuche es erneut oder melde dich beim Admin.");
      return;
    }

    const { error: portalUserError } = await supabase.from("portal_users").insert({
      user_id: authUser.id,
      role: "shop",
      shop_id: shopId,
      display_name: contactName,
      created_at: now,
      updated_at: now
    });

    if (portalUserError) {
      renderSignup("Die Registrierung wurde angelegt, aber das Shopprofil konnte nicht komplett verbunden werden. Bitte melde dich beim Admin.");
      return;
    }

    await supabase.auth.signOut();
    renderSignup("", "Deine Shop-Registrierung wurde erstellt und wartet auf Freigabe.");
  });
};

const loadPortalUser = async (userId) => {
  const { data, error } = await supabase
    .from("portal_users")
    .select("*")
    .eq("user_id", userId)
    .eq("role", authRole)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
};

const loadShopById = async (shopId) => {
  if (!shopId) {
    return null;
  }

  const { data, error } = await supabase.from("shops").select("*").eq("id", shopId).maybeSingle();

  if (error) {
    throw error;
  }

  return data;
};

const loadDashboardData = async (portalUser) => {
  const shopQuery = supabase.from("shops").select("*").order("name", { ascending: true });
  const offerQuery = supabase.from("offers").select("*").order("created_at", { ascending: false });
  const redemptionQuery = supabase.from("redemptions").select("*").order("created_at", { ascending: false });

  const filteredShopQuery = authRole === "shop" ? shopQuery.eq("id", portalUser.shop_id) : shopQuery;
  const filteredOfferQuery = authRole === "shop" ? offerQuery.eq("shop_id", portalUser.shop_id) : offerQuery;
  const filteredRedemptionQuery = authRole === "shop" ? redemptionQuery.eq("shop_id", portalUser.shop_id) : redemptionQuery;

  const [{ data: shops, error: shopsError }, { data: offers, error: offersError }, { data: redemptions, error: redemptionsError }] =
    await Promise.all([filteredShopQuery, filteredOfferQuery, filteredRedemptionQuery]);

  if (shopsError) throw shopsError;
  if (offersError) throw offersError;
  if (redemptionsError) throw redemptionsError;

  return {
    shops: shops || [],
    offers: offers || [],
    redemptions: redemptions || []
  };
};

const createShopForm = (shop) => {
  const adminControls =
    authRole === "admin"
      ? `
        <div class="field">
          <label for="shop-status">Abo Status</label>
          <select id="shop-status" name="subscription_status">
            ${["active", "inactive", "expired"].map((status) => `<option value="${status}" ${status === shop.subscription_status ? "selected" : ""}>${status}</option>`).join("")}
          </select>
        </div>
        <div class="field">
          <label for="shop-approved">Admin Freigabe</label>
          <select id="shop-approved" name="admin_approved">
            <option value="true" ${shop.admin_approved ? "selected" : ""}>freigegeben</option>
            <option value="false" ${!shop.admin_approved ? "selected" : ""}>wartet</option>
          </select>
        </div>
        <div class="field">
          <label for="shop-visible">Auf Karte sichtbar</label>
          <select id="shop-visible" name="is_visible_on_map">
            <option value="true" ${shop.is_visible_on_map ? "selected" : ""}>sichtbar</option>
            <option value="false" ${!shop.is_visible_on_map ? "selected" : ""}>versteckt</option>
          </select>
        </div>
      `
      : `
        <div class="field full">
          <div class="note">
            <strong>Status</strong><br />
            Freigabe: ${shop.admin_approved ? "freigegeben" : "wartet"}<br />
            Karte: ${shop.is_visible_on_map ? "sichtbar" : "nicht sichtbar"}
          </div>
        </div>
      `;

  return `
    <form id="shop-form">
      <div class="form-grid">
        <div class="field">
          <label for="shop-name">Name</label>
          <input id="shop-name" name="name" value="${escapeHtml(shop.name || "")}" required />
        </div>
        <div class="field">
          <label for="shop-category">Kategorie</label>
          <select id="shop-category" name="category">
            ${categories.map((category) => `<option value="${escapeHtml(category)}" ${category === shop.category ? "selected" : ""}>${escapeHtml(category)}</option>`).join("")}
          </select>
        </div>
        <div class="field full">
          <label for="shop-description">Beschreibung</label>
          <textarea id="shop-description" name="description">${escapeHtml(shop.description || "")}</textarea>
        </div>
        <div class="field">
          <label for="shop-slogan">Slogan</label>
          <input id="shop-slogan" name="slogan" value="${escapeHtml(shop.slogan || "")}" />
        </div>
        <div class="field">
          <label for="shop-icon">Map-Icon</label>
          <select id="shop-icon" name="map_icon">
            ${mapIcons.map((icon) => `<option value="${icon}" ${icon === shop.map_icon ? "selected" : ""}>${icon}</option>`).join("")}
          </select>
        </div>
        <div class="field">
          <label for="shop-phone">Telefon</label>
          <input id="shop-phone" name="phone" value="${escapeHtml(shop.phone || "")}" />
        </div>
        <div class="field">
          <label for="shop-email">E-Mail</label>
          <input id="shop-email" name="email" value="${escapeHtml(shop.email || "")}" />
        </div>
        <div class="field">
          <label for="shop-website">Website</label>
          <input id="shop-website" name="website" value="${escapeHtml(shop.website || "")}" />
        </div>
        <div class="field">
          <label for="shop-logo">Logo URL</label>
          <input id="shop-logo" name="logo_url" value="${escapeHtml(shop.logo_url || "")}" />
        </div>
        <div class="field">
          <label for="shop-hero">Hero URL</label>
          <input id="shop-hero" name="hero_image_url" value="${escapeHtml(shop.hero_image_url || "")}" />
        </div>
        <div class="field">
          <label for="shop-street">Strasse</label>
          <input id="shop-street" name="street" value="${escapeHtml(shop.street || "")}" />
        </div>
        <div class="field">
          <label for="shop-house-number">Nr.</label>
          <input id="shop-house-number" name="house_number" value="${escapeHtml(shop.house_number || "")}" />
        </div>
        <div class="field">
          <label for="shop-zip">PLZ</label>
          <input id="shop-zip" name="zip" value="${escapeHtml(shop.zip || "")}" />
        </div>
        <div class="field">
          <label for="shop-city">Ort</label>
          <input id="shop-city" name="city" value="${escapeHtml(shop.city || "")}" />
        </div>
        <div class="field">
          <label for="shop-country">Land</label>
          <input id="shop-country" name="country" value="${escapeHtml(shop.country || "")}" />
        </div>
        ${adminControls}
      </div>
      <div class="button-row">
        <button class="button" type="submit">Shop speichern</button>
      </div>
    </form>
  `;
};

const createOfferList = (offers, selectedOfferId) => {
  if (!offers.length) {
    return '<div class="empty-state">Noch keine Aktionen vorhanden.</div>';
  }

  return `
    <div class="list">
      ${offers
        .map(
          (offer) => `
            <button class="list-item ${offer.id === selectedOfferId ? "active" : ""}" data-offer-id="${offer.id}">
              <div class="section-header">
                <strong>${escapeHtml(offer.title)}</strong>
                <span class="pill ${offer.status === "active" ? "green" : "ink"}">${escapeHtml(offer.status)}</span>
              </div>
              <div class="muted">${escapeHtml(offer.description || "")}</div>
              <div class="muted">Gueltig bis ${formatDate(offer.valid_until)}</div>
            </button>
          `
        )
        .join("")}
    </div>
  `;
};

const createOfferForm = (offer, shopId) => `
  <form id="offer-form">
    <input type="hidden" name="id" value="${escapeHtml(offer.id || "")}" />
    <div class="form-grid">
      <div class="field">
        <label for="offer-title">Titel</label>
        <input id="offer-title" name="title" value="${escapeHtml(offer.title || "")}" required />
      </div>
      <div class="field">
        <label for="offer-type">Typ</label>
        <select id="offer-type" name="type">
          ${["percent", "two_for_one", "fixed_price", "free_item", "special"].map((type) => `<option value="${type}" ${type === offer.type ? "selected" : ""}>${type}</option>`).join("")}
        </select>
      </div>
      <div class="field full">
        <label for="offer-description">Beschreibung</label>
        <textarea id="offer-description" name="description">${escapeHtml(offer.description || "")}</textarea>
      </div>
      <div class="field">
        <label for="offer-discount">Rabatt %</label>
        <input id="offer-discount" name="discount_percent" type="number" value="${escapeHtml(offer.discount_percent || "")}" />
      </div>
      <div class="field">
        <label for="offer-fixed-price">Fixpreis Label</label>
        <input id="offer-fixed-price" name="fixed_price_label" value="${escapeHtml(offer.fixed_price_label || "")}" />
      </div>
      <div class="field">
        <label for="offer-valid-until">Gueltig bis</label>
        <input id="offer-valid-until" name="valid_until" type="date" value="${escapeHtml((offer.valid_until || new Date().toISOString()).slice(0, 10))}" />
      </div>
      <div class="field">
        <label for="offer-status">Status</label>
        <select id="offer-status" name="status">
          ${["pending_shop", "active", "paused", "expired", "declined"].map((status) => `<option value="${status}" ${status === offer.status ? "selected" : ""}>${status}</option>`).join("")}
        </select>
      </div>
      <div class="field">
        <label for="offer-points">Punkte</label>
        <input id="offer-points" name="points_reward" type="number" value="${escapeHtml(offer.points_reward || 40)}" />
      </div>
    </div>
    <input type="hidden" name="shop_id" value="${escapeHtml(shopId)}" />
    <div class="button-row">
      <button class="button" type="submit">${offer.id ? "Aktion speichern" : "Neue Aktion anlegen"}</button>
      <button class="ghost-button" type="button" id="new-offer-button">Neue leere Aktion</button>
    </div>
  </form>
`;

const createQrSection = (shopId, offers) => `
  <section class="editor">
    <div class="section-header">
      <div>
        <p class="label">QR</p>
        <h3>Einloesung bestaetigen</h3>
      </div>
      <span class="pill ink">${escapeHtml(shopId)}</span>
    </div>
    <div id="qr-reader" class="scanner-box">
      <div>
        <strong>QR Kamera-Scan</strong>
        <div class="muted">Wenn dein Browser Kamerazugriff erlaubt, kannst du den Nutzer-QR direkt scannen.</div>
      </div>
    </div>
    <form id="qr-form" class="qr-form">
      <div class="field">
        <label for="qr-offer">Aktion</label>
        <select id="qr-offer" name="offer_id">
          ${offers
            .filter((offer) => offer.status === "active")
            .map((offer) => `<option value="${offer.id}">${escapeHtml(offer.title)}</option>`)
            .join("")}
        </select>
      </div>
      <div class="field">
        <label for="qr-value">QR Code</label>
        <input id="qr-value" name="qr_code_value" placeholder="z. B. BIEL-user-123456" />
      </div>
      <button class="secondary-button" type="submit">Einloesung speichern</button>
    </form>
  </section>
`;

const renderDashboard = async (portalUser, selectedShopId = null, selectedOfferId = null) => {
  const { shops, offers, redemptions } = await loadDashboardData(portalUser);
  const selectedShop =
    shops.find((shop) => shop.id === selectedShopId) ||
    shops.find((shop) => shop.id === portalUser.shop_id) ||
    shops[0] ||
    null;

  if (!selectedShop) {
    renderUnauthorized("Es ist noch kein Shop mit diesem Konto verbunden.");
    return;
  }

  const selectedShopOffers = offers.filter((offer) => offer.shop_id === selectedShop.id);
  const selectedOffer =
    selectedOfferId === "__new__"
      ? {
          id: "",
          shop_id: selectedShop.id,
          title: "",
          description: "",
          type: "special",
          discount_percent: null,
          fixed_price_label: null,
          valid_until: new Date().toISOString(),
          status: "active",
          points_reward: 40
        }
      : selectedShopOffers.find((offer) => offer.id === selectedOfferId) ||
        selectedShopOffers[0] || {
          id: "",
          shop_id: selectedShop.id,
          title: "",
          description: "",
          type: "special",
          discount_percent: null,
          fixed_price_label: null,
          valid_until: new Date().toISOString(),
          status: "active",
          points_reward: 40
        };

  const pendingApprovalCount = shops.filter((shop) => !shop.admin_approved).length;

  app.innerHTML = `
    <main class="shell">
      <div class="top-nav">
        <div class="button-row">
          <a class="ghost-button" href="./index.html">${escapeHtml(siteName)}</a>
          <span class="pill green">Live via Supabase</span>
        </div>
        <div class="button-row">
          <span class="pill ink">${escapeHtml(portalUser.role)}</span>
          <button class="ghost-button" id="logout-button">Logout</button>
        </div>
      </div>

      <section class="stats-grid">
        <article class="card">
          <p class="label">Marke</p>
          <div class="stat-value">${escapeHtml(siteName)}</div>
        </article>
        <article class="card">
          <p class="label">Shops</p>
          <div class="stat-value">${shops.length}</div>
        </article>
        <article class="card">
          <p class="label">${authRole === "admin" ? "Wartend" : "Status"}</p>
          <div class="stat-value">${authRole === "admin" ? pendingApprovalCount : selectedShop.admin_approved ? "frei" : "wartet"}</div>
        </article>
        <article class="card">
          <p class="label">Einloesungen</p>
          <div class="stat-value">${redemptions.length}</div>
        </article>
      </section>

      <section class="dashboard-grid">
        <aside class="sidebar-stack">
          <section class="panel">
            <div class="section-header">
              <div>
                <p class="label">Shops</p>
                <h3>${authRole === "admin" ? "Alle Shops" : "Dein Shop"}</h3>
              </div>
            </div>
            <div class="list">
              ${shops
                .map(
                  (shop) => `
                    <button class="list-item ${shop.id === selectedShop.id ? "active" : ""}" data-shop-id="${shop.id}">
                      <div class="section-header">
                        <strong>${escapeHtml(shop.name)}</strong>
                        <span class="pill ${shop.admin_approved ? "green" : "red"}">${shop.admin_approved ? "freigegeben" : "wartet"}</span>
                      </div>
                      <div class="muted">${escapeHtml(shop.category || "")}</div>
                    </button>
                  `
                )
                .join("")}
            </div>
          </section>

          ${createQrSection(selectedShop.id, selectedShopOffers)}
        </aside>

        <section class="main-stack">
          <section class="editor">
            <div class="section-header">
              <div>
                <p class="label">Shop Profil</p>
                <h3>${escapeHtml(selectedShop.name)}</h3>
              </div>
              <span class="pill ink">${escapeHtml(selectedShop.subscription_status)}</span>
            </div>
            ${createShopForm(selectedShop)}
          </section>

          <section class="editor">
            <div class="section-header">
              <div>
                <p class="label">Aktionen</p>
                <h3>Deals verwalten</h3>
              </div>
              <span class="pill ink">${selectedShopOffers.length} Aktionen</span>
            </div>
            <div class="offer-grid">
              <div>${createOfferList(selectedShopOffers, selectedOffer.id)}</div>
              <div>${createOfferForm(selectedOffer, selectedShop.id)}</div>
            </div>
          </section>
        </section>
      </section>
    </main>
  `;

  document.querySelector("#logout-button")?.addEventListener("click", async () => {
    await supabase.auth.signOut();
    renderLogin();
  });

  document.querySelectorAll("[data-shop-id]").forEach((button) => {
    button.addEventListener("click", async () => {
      const shopId = button.getAttribute("data-shop-id");
      await renderDashboard(portalUser, shopId, null);
    });
  });

  document.querySelector("#shop-form")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const payload = {
      ...selectedShop,
      name: String(formData.get("name") || ""),
      category: String(formData.get("category") || selectedShop.category),
      description: String(formData.get("description") || ""),
      slogan: String(formData.get("slogan") || ""),
      phone: String(formData.get("phone") || ""),
      email: String(formData.get("email") || ""),
      website: String(formData.get("website") || ""),
      logo_url: String(formData.get("logo_url") || ""),
      hero_image_url: String(formData.get("hero_image_url") || ""),
      street: String(formData.get("street") || ""),
      house_number: String(formData.get("house_number") || ""),
      zip: String(formData.get("zip") || ""),
      city: String(formData.get("city") || ""),
      country: String(formData.get("country") || ""),
      map_icon: String(formData.get("map_icon") || selectedShop.map_icon),
      updated_at: new Date().toISOString()
    };

    if (authRole === "admin") {
      payload.subscription_status = String(formData.get("subscription_status") || selectedShop.subscription_status);
      payload.admin_approved = String(formData.get("admin_approved")) === "true";
      payload.is_visible_on_map = String(formData.get("is_visible_on_map")) === "true";
    } else {
      payload.subscription_status = selectedShop.subscription_status;
      payload.admin_approved = selectedShop.admin_approved;
      payload.is_visible_on_map = selectedShop.is_visible_on_map;
    }

    const { error } = await supabase.from("shops").upsert(payload);
    if (error) {
      window.alert(error.message);
      return;
    }

    await renderDashboard(portalUser, selectedShop.id, selectedOffer.id || null);
  });

  document.querySelectorAll("[data-offer-id]").forEach((button) => {
    button.addEventListener("click", async () => {
      const offerId = button.getAttribute("data-offer-id");
      await renderDashboard(portalUser, selectedShop.id, offerId);
    });
  });

  document.querySelector("#new-offer-button")?.addEventListener("click", async () => {
    await renderDashboard(portalUser, selectedShop.id, "__new__");
  });

  document.querySelector("#offer-form")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const id = String(formData.get("id") || "") || createId("offer");
    const discount = String(formData.get("discount_percent") || "").trim();
    const fixedPrice = String(formData.get("fixed_price_label") || "").trim();
    const points = String(formData.get("points_reward") || "").trim();

    const payload = {
      id,
      shop_id: selectedShop.id,
      title: String(formData.get("title") || ""),
      description: String(formData.get("description") || ""),
      type: String(formData.get("type") || "special"),
      discount_percent: discount ? Number(discount) : null,
      free_item: null,
      purchase_requirement: null,
      fixed_price_label: fixedPrice || null,
      bundle_details: null,
      max_redemptions: null,
      inventory_total: null,
      reward_label: null,
      friends_required: null,
      points_reward: points ? Number(points) : 40,
      promotion: null,
      valid_until: new Date(String(formData.get("valid_until") || new Date().toISOString())).toISOString(),
      status: String(formData.get("status") || "active"),
      created_at: selectedOffer.id ? selectedOffer.created_at : new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase.from("offers").upsert(payload);
    if (error) {
      window.alert(error.message);
      return;
    }

    await renderDashboard(portalUser, selectedShop.id, id);
  });

  document.querySelector("#qr-form")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const qrCodeValue = String(formData.get("qr_code_value") || "").trim();
    const offerId = String(formData.get("offer_id") || "").trim();

    if (!qrCodeValue || !offerId) {
      window.alert("Bitte Aktion und QR-Code angeben.");
      return;
    }

    const { data: appUser, error: appUserError } = await supabase
      .from("app_users")
      .select("*")
      .eq("qr_code_value", qrCodeValue)
      .maybeSingle();

    if (appUserError) {
      window.alert(appUserError.message);
      return;
    }

    if (!appUser) {
      window.alert("QR-Code wurde nicht gefunden. Stelle sicher, dass der Nutzer bereits in der App angelegt wurde.");
      return;
    }

    const offer = selectedShopOffers.find((entry) => entry.id === offerId);
    const pointsAwarded = offer?.points_reward || 40;

    const { error: redemptionError } = await supabase.from("redemptions").insert({
      id: createId("redeem"),
      offer_id: offerId,
      shop_id: selectedShop.id,
      user_id: appUser.id,
      qr_code_value: qrCodeValue,
      confirmed_by_shop_user_id: portalUser.user_id,
      points_awarded: pointsAwarded,
      status: "confirmed",
      created_at: new Date().toISOString()
    });

    if (redemptionError) {
      window.alert(redemptionError.message);
      return;
    }

    const { error: pointsError } = await supabase
      .from("app_users")
      .update({
        points_balance: Number(appUser.points_balance || 0) + pointsAwarded,
        updated_at: new Date().toISOString()
      })
      .eq("id", appUser.id);

    if (pointsError) {
      window.alert(pointsError.message);
      return;
    }

    window.alert(`${appUser.name} wurde bestaetigt und hat ${pointsAwarded} Punkte erhalten.`);
    await renderDashboard(portalUser, selectedShop.id, selectedOffer.id || null);
  });

  await loadPortalScript();
  await hydrateScanner();
};

const bootPortal = async () => {
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) {
    renderLogin(formatAuthError(sessionError));
    return;
  }

  const session = sessionData.session;
  if (!session?.user) {
    renderLogin();
    return;
  }

  const portalUser = await loadPortalUser(session.user.id);
  if (!portalUser) {
    if (authRole === "shop") {
      renderLogin("Zu diesem Login wurde noch kein Shopprofil gefunden.");
      return;
    }

    renderUnauthorized("Dein Konto ist nicht als Admin freigeschaltet.");
    return;
  }

  if (authRole === "shop") {
    const shop = await loadShopById(portalUser.shop_id);

    if (!shop) {
      renderUnauthorized("Dein Shopkonto ist noch nicht komplett eingerichtet.");
      return;
    }

    if (!shop.admin_approved) {
      renderShopPendingApproval(shop);
      return;
    }
  }

  await renderDashboard(portalUser, portalUser.shop_id || null, null);
};

const boot = async () => {
  if (page === "landing") {
    renderLanding();
    if (!hasSupabase) {
      const note = document.createElement("div");
      note.className = "shell";
      note.innerHTML = '<div class="note danger">Supabase ist in web/portal/config.js noch nicht gesetzt.</div>';
      app.appendChild(note);
    }
    return;
  }

  if (!hasSupabase || !supabase) {
    renderSetupRequired();
    return;
  }

  try {
    if (page === "signup") {
      renderSignup();
      return;
    }

    await bootPortal();
  } catch (error) {
    if (page === "signup") {
      renderSignup(formatAuthError(error));
      return;
    }

    renderLogin(formatAuthError(error, "Login konnte nicht vorbereitet werden."));
  }
};

void boot();
