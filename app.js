/**
 * ============================================================
 *  WellBite — app.js   "Every Bite, Better Living"
 *  Everything is stored on this phone only (no Google Sheet).
 *  Sections:
 *    1. Setup & helpers         5. Screens: invite, PIN, first setup
 *    2. Storage & state         6. Views: today, history, dashboard, profile
 *    3. Targets & nutrition     7. Sheets: meal form, settings, family, export
 *    4. Daily insights          8. Actions & start-up
 * ============================================================
 */
(function () {
  'use strict';

  /* ============ 1. SETUP & HELPERS ============ */

  const VERSION = '1.0.0';
  const CREDIT = 'Created by CreanovativeCo';
  const TAGLINE = 'Every Bite, Better Living';
  const MEALS = ['breakfast', 'lunch', 'dinner', 'snack'];
  const MEAL_EMO = { breakfast: '🌅', lunch: '☀️', dinner: '🌙', snack: '🍪' };
  const MOODS = ['ok', 'full', 'hungry', 'bloated'];
  const MOOD_EMO = { ok: '😊', full: '😌', hungry: '😋', bloated: '😣' };
  const NUTR = ['kcal', 'protein', 'carbs', 'fat', 'sugar', 'sodium', 'fiber', 'veg', 'fruit'];
  const C = { kcal: '#4F5BF0', protein: '#2E9E63', carbs: '#3D8BF2', fat: '#E0762F', sugar: '#B548C8', sodium: '#7B869C', fiber: '#0F9D8D', water: '#3D8BF2' };

  // App logo (also used for the icons): a smiling bowl with a sprout
  const LOGO_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5D6BF6"/><stop offset="1" stop-color="#4450E0"/></linearGradient><linearGradient id="lf" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#25A563"/><stop offset="1" stop-color="#62DA98"/></linearGradient><linearGradient id="bw" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#E6E9FF"/></linearGradient></defs><rect width="512" height="512" rx="118" fill="url(#bg)"/><circle cx="256" cy="250" r="168" fill="#fff" opacity=".07"/><path d="M250 236 C 236 186, 196 160, 146 168 C 150 218, 196 246, 250 236 Z" fill="url(#lf)"/><path d="M262 236 C 272 170, 320 128, 384 136 C 380 200, 330 242, 262 236 Z" fill="url(#lf)"/><path d="M256 250 L 256 200" stroke="#1F8F55" stroke-width="12" stroke-linecap="round"/><circle cx="190" cy="226" r="0" fill="#fff"/><rect x="96" y="246" width="320" height="34" rx="17" fill="#C9CFFF"/><path d="M112 280 H 400 C 394 360, 336 404, 256 404 C 176 404, 118 360, 112 280 Z" fill="url(#bw)"/><path d="M206 322 q 50 40 100 0" stroke="#5D6BF6" stroke-width="15" stroke-linecap="round" fill="none"/><rect x="214" y="398" width="84" height="22" rx="11" fill="#E6E9FF"/></svg>';
  const LOGO_URL = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(LOGO_SVG);
  const $ = (sel, el) => (el || document).querySelector(sel);
  const $$ = (sel, el) => Array.from((el || document).querySelectorAll(sel));
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const pad = (n) => (n < 10 ? '0' : '') + n;
  const ymd = (d) => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  const todayStr = () => ymd(new Date());
  const toDate = (s) => { const p = String(s).split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); };
  const addDays = (s, n) => { const d = toDate(s); d.setDate(d.getDate() + n); return ymd(d); };
  const daysBetween = (a, b) => Math.round((toDate(b) - toDate(a)) / 86400000);
  const weekStart = (s) => { const d = toDate(s); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return ymd(d); };
  const monthEnd = (s) => { const d = toDate(s); return ymd(new Date(d.getFullYear(), d.getMonth() + 1, 0)); };
  const uid = (p) => p + Date.now().toString(36) + Math.floor(Math.random() * 1679616).toString(36);
  const nowTime = () => { const d = new Date(); return pad(d.getHours()) + ':' + pad(d.getMinutes()); };
  const num = (v) => { const n = parseFloat(String(v == null ? '' : v).replace(',', '.')); return isFinite(n) ? n : 0; };
  const r0 = (n) => Math.round(n || 0);
  const r1 = (n) => Math.round((n || 0) * 10) / 10;
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
  const fmtN = (n) => { try { return new Intl.NumberFormat(locale()).format(r0(n)); } catch (e) { return String(r0(n)); } };

  function t(key, vars) {
    const dict = window.WB_TEXT[S.lang] || window.WB_TEXT.id;
    let s = dict[key] != null ? dict[key] : (window.WB_TEXT.id[key] != null ? window.WB_TEXT.id[key] : key);
    if (vars) Object.keys(vars).forEach((k) => { s = s.split('{' + k + '}').join(vars[k]); });
    return s;
  }
  const locale = () => (S.lang === 'en' ? 'en-GB' : 'id-ID');
  function fmtDate(s, opt) {
    if (!s) return '';
    try { return new Intl.DateTimeFormat(locale(), opt || { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }).format(toDate(s)); }
    catch (e) { return s; }
  }
  const fmtShort = (s) => fmtDate(s, { day: 'numeric', month: 'short' });
  function relDay(s) {
    const td = todayStr();
    if (s === td) return t('today');
    if (s === addDays(td, -1)) return t('yesterday');
    if (s === addDays(td, 1)) return t('tomorrow');
    return '';
  }

  // Icons (simple line icons, 24x24) — same style as AgendaKu
  const ICON = {
    home: '<path d="M4 11l8-7 8 7"/><path d="M6 10v9h12v-9"/>',
    list: '<path d="M9 6h11M9 12h11M9 18h11"/><circle cx="4.5" cy="6" r="1"/><circle cx="4.5" cy="12" r="1"/><circle cx="4.5" cy="18" r="1"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    minus: '<path d="M5 12h14"/>',
    chart: '<path d="M5 20V10M12 20V4M19 20v-7"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M12 3v2.5M12 18.5V21M3 12h2.5M18.5 12H21M5.6 5.6l1.8 1.8M16.6 16.6l1.8 1.8M5.6 18.4l1.8-1.8M16.6 7.4l1.8-1.8"/>',
    search: '<circle cx="11" cy="11" r="6"/><path d="M20 20l-4.5-4.5"/>',
    clock: '<circle cx="12" cy="12" r="8"/><path d="M12 8v4l3 2"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    x: '<path d="M6 6l12 12M18 6L6 18"/>',
    left: '<path d="M14.5 6l-6 6 6 6"/>',
    right: '<path d="M9.5 6l6 6-6 6"/>',
    edit: '<path d="M5 19h3.5L19 8.5 15.5 5 5 15.5z"/><path d="M13.5 7l3.5 3.5"/>',
    trash: '<path d="M5 7h14M10 7V5h4v2M7 7l1 12h8l1-12"/>',
    lock: '<rect x="6" y="11" width="12" height="9" rx="2"/><path d="M9 11V8a3 3 0 016 0v3"/>',
    back: '<path d="M9 6H20v12H9l-5-6z"/><path d="M12 10l4 4M16 10l-4 4"/>',
    copy: '<rect x="9" y="9" width="10" height="11" rx="2"/><path d="M6 15V6a2 2 0 012-2h7"/>',
    paste: '<rect x="6" y="5" width="12" height="15" rx="2"/><path d="M9 5V4h6v1M9 11h6M9 14h4"/>',
    out: '<path d="M14 5h5v5M19 5l-8 8"/><path d="M18 14v5H5V6h5"/>',
    cal: '<rect x="4" y="5" width="16" height="15" rx="3"/><path d="M8 3v4M16 3v4M4 10h16"/>',
    bell: '<path d="M6 16V11a6 6 0 0112 0v5l1.5 2h-15z"/><path d="M10 20a2 2 0 004 0"/>',
    camera: '<path d="M4 8h3l2-2.5h6L17 8h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
    image: '<rect x="4" y="5" width="16" height="14" rx="2.500"/><circle cx="9" cy="10" r="1.6"/><path d="M5 17l4.5-4.5 3 3 2.500-2.500L19 17"/>',
    spark: '<path d="M12 3.5l1.9 4.6 4.6 1.9-4.6 1.9L12 16.5l-1.9-4.6L5.5 10l4.6-1.9z"/><path d="M18.500 15.500l.8 1.9 1.9.8-1.9.8-.8 1.9-.8-1.9-1.9-.8 1.9-.8z"/>',
    user: '<circle cx="12" cy="8.5" r="3.5"/><path d="M5 20c.8-3.6 3.6-5.5 7-5.5s6.2 1.9 7 5.5"/>',
    users: '<circle cx="9" cy="9" r="3"/><path d="M3.5 19c.6-3 2.800-4.500 5.500-4.500s4.900 1.500 5.500 4.500"/><circle cx="16.500" cy="8" r="2.500"/><path d="M15.500 13.700c2.500-.3 4.400 1 5 4"/>',
    drop: '<path d="M12 3.5s6 6.4 6 10.5a6 6 0 01-12 0c0-4.100 6-10.500 6-10.500z"/>',
    scale: '<rect x="4" y="4" width="16" height="16" rx="4"/><path d="M8.5 10a5 5 0 017 0l-2.500 2.500"/>',
    target: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="1"/>',
    download: '<path d="M12 4v11M7.5 10.500L12 15l4.500-4.500M5 19h14"/>',
    upload: '<path d="M12 16V5M7.500 9.500L12 5l4.500 4.500M5 19h14"/>',
    share: '<circle cx="6" cy="12" r="2.500"/><circle cx="17" cy="6" r="2.500"/><circle cx="17" cy="18" r="2.500"/><path d="M8.300 10.800l6.400-3.600M8.300 13.200l6.400 3.600"/>',
    star: '<path d="M12 4l2.400 5 5.600.8-4 3.900.9 5.500L12 16.700 7.100 19.200l.9-5.500-4-3.900 5.600-.8z"/>',
    info: '<circle cx="12" cy="12" r="8"/><path d="M12 11v5M12 8h.01"/>',
    key: '<circle cx="8" cy="15" r="3.500"/><path d="M10.500 12.500L19 4M16 7l2 2M14 9l1.500 1.500"/>',
    leaf: '<path d="M5 19c0-8 5-13 14-14 0 9-5 14-13 14z"/><path d="M5 19l8-8"/>',
    file: '<path d="M6 4h9l4 4v12H6z"/><path d="M14 4v5h5M9 13h6M9 16h4"/>',
    logout: '<path d="M10 5H6v14h4M14 8l4 4-4 4M18 12H10"/>',
    flame: '<path d="M12 21c-4 0-6.500-2.700-6.500-6.200 0-3.300 2.500-5.300 3.500-8.300 1.500 1.500 2 3 2 4.500 1-1 1.500-2.500 1.500-4.500C16 8.500 18.500 11.500 18.500 14.800 18.500 18.300 16 21 12 21z"/>'
  };
  const icon = (n, cls) => `<svg class="ic ${cls || ''}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON[n] || ''}</svg>`;

  // Profile picture: the chosen photo, or initials on a soft colour
  const AV_COLORS = [['#DCE0FF', '#3F49D6'], ['#E1F4E8', '#23824F'], ['#FFEDE3', '#C9542B'], ['#EEEAFE', '#6A4FD8'], ['#E3F1FF', '#2B6FD6'], ['#FBE4EE', '#B8437A']];
  function initialsOf(name) {
    const parts = String(name || '').trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return '';
    return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
  }
  function avatar(size, prof) {
    const p = prof || S.profile || {};
    const box = `width:${size}px;height:${size}px;`;
    if (p.photo && /^data:image\//.test(p.photo)) return `<span class="av" style="${box}"><img src="${esc(p.photo)}" alt=""></span>`;
    const c = AV_COLORS[(Number(p.color) || 0) % AV_COLORS.length], ini = initialsOf(p.name);
    return `<span class="av" style="${box}background:${c[0]};color:${c[1]};font-size:${Math.round(size * 0.38)}px">${ini ? esc(ini) : icon('user')}</span>`;
  }

  /* ============ 2. STORAGE & STATE ============ */

  const mem = {};
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v == null ? (k in mem ? mem[k] : d) : JSON.parse(v); } catch (e) { return k in mem ? mem[k] : d; } },
    set(k, v) {
      mem[k] = v;
      try { localStorage.setItem(k, JSON.stringify(v)); }
      catch (e) { if (e && /quota/i.test(e.name + e.message)) setTimeout(() => toast(t('storageFull'), 'error'), 50); }
    },
    del(k) { delete mem[k]; try { localStorage.removeItem(k); } catch (e) { /* ignore */ } }
  };

  // Food photos live in IndexedDB (much more room than localStorage)
  const photoDB = (() => {
    let dbp = null;
    const open = () => dbp || (dbp = new Promise((res, rej) => {
      try {
        const rq = indexedDB.open('wellbite', 1);
        rq.onupgradeneeded = () => rq.result.createObjectStore('photos');
        rq.onsuccess = () => res(rq.result); rq.onerror = () => rej(rq.error);
      } catch (e) { rej(e); }
    }));
    const tx = (mode, fn) => open().then((db) => new Promise((res, rej) => {
      const s = db.transaction('photos', mode).objectStore('photos'); const r = fn(s);
      r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error);
    }));
    const cache = {};
    return {
      get(id) { if (id in cache) return Promise.resolve(cache[id]); return tx('readonly', (s) => s.get(id)).then((v) => (cache[id] = v || '')).catch(() => ''); },
      put(id, v) { cache[id] = v; return tx('readwrite', (s) => s.put(v, id)).catch(() => {}); },
      del(id) { delete cache[id]; return tx('readwrite', (s) => s.delete(id)).catch(() => {}); },
      all() { return open().then((db) => new Promise((res) => {
        const out = {}; const c = db.transaction('photos').objectStore('photos').openCursor();
        c.onsuccess = () => { const cur = c.result; if (cur) { out[cur.key] = cur.value; cur.continue(); } else res(out); };
        c.onerror = () => res(out);
      })).catch(() => ({})); },
      clear() { Object.keys(cache).forEach((k) => delete cache[k]); return tx('readwrite', (s) => s.clear()).catch(() => {}); },
      peek(id) { return cache[id]; }
    };
  })();

  const DEF_PROFILE = { name: '', bio: '', photo: '', color: 0, sex: 'F', birth: '', height: '', activity: 2,
    goal: 'lose', startWeight: '', startDate: '', targetWeight: '', targetDate: '', customKcal: '', glassMl: 250, setupDone: false };
  const DEF_SETTINGS = { aiKey: '', aiModel: 'gemini-flash-latest', reminders: { breakfast: '07:00', lunch: '12:00', snack: '15:30', dinner: '18:30', waterFrom: '08:00', waterTo: '20:00', waterEvery: 2 }, inAppRemind: true };

  const S = {
    lang: store.get('wb_lang', (navigator.language || 'id').toLowerCase().indexOf('en') === 0 ? 'en' : 'id'),
    pinHash: store.get('wb_pinhash', ''),
    recHash: store.get('wb_rechash', ''),
    lockOnOpen: store.get('wb_lock', true),
    profile: Object.assign({}, DEF_PROFILE, store.get('wb_profile', {})),
    settings: Object.assign({}, DEF_SETTINGS, store.get('wb_settings', {})),
    entries: store.get('wb_entries', []),
    water: store.get('wb_water', {}),
    weights: store.get('wb_weights', []),
    myFoods: store.get('wb_myfoods', []),
    family: store.get('wb_family', []),
    lastBackup: store.get('wb_backup', 0),
    view: 'today',
    day: todayStr(),
    hist: { q: '', meal: 'all', mood: 'all', from: '', to: '', open: false },
    dash: { period: 'week', anchor: todayStr() },
    famSel: ''
  };
  S.settings.reminders = Object.assign({}, DEF_SETTINGS.reminders, S.settings.reminders || {});

  function persist() {
    store.set('wb_entries', S.entries); store.set('wb_water', S.water); store.set('wb_weights', S.weights);
    store.set('wb_myfoods', S.myFoods); store.set('wb_family', S.family);
  }
  const saveProfile = () => store.set('wb_profile', S.profile);
  const saveSettings = () => store.set('wb_settings', S.settings);

  /* ============ 3. TARGETS & NUTRITION ============ */

  const foodName = (f) => (S.lang === 'en' ? f.en_name : f.id_name);
  const foodPortion = (f) => (S.lang === 'en' ? f.en_portion : f.id_portion);
  const allFoods = () => S.myFoods.concat(window.WB_FOODS || []);

  function ageOf(birth) {
    if (!birth) return 0;
    const b = toDate(birth), n = new Date();
    let a = n.getFullYear() - b.getFullYear();
    if (n.getMonth() < b.getMonth() || (n.getMonth() === b.getMonth() && n.getDate() < b.getDate())) a--;
    return a > 0 && a < 120 ? a : 0;
  }
  const sortedWeights = () => S.weights.slice().sort((a, b) => a.date.localeCompare(b.date));
  function currentWeight() {
    const w = sortedWeights(); if (w.length) return num(w[w.length - 1].kg);
    return num(S.profile.startWeight);
  }
  function weightOn(date) {     // latest weigh-in on or before a date
    const w = sortedWeights().filter((x) => x.date <= date);
    return w.length ? num(w[w.length - 1].kg) : 0;
  }
  function bmiOf(kg, cm) { const h = num(cm) / 100; return h > 0 && kg > 0 ? kg / (h * h) : 0; }
  function bmiCat(b) {   // Kemenkes RI categories
    if (!b) return { k: '', c: 'muted' };
    if (b < 17) return { k: 'bmiVeryThin', c: 'peach' };
    if (b < 18.5) return { k: 'bmiThin', c: 'peach' };
    if (b <= 25) return { k: 'bmiNormal', c: 'green' };
    if (b <= 27) return { k: 'bmiOver', c: 'peach' };
    return { k: 'bmiObese', c: 'peach' };
  }
  const ACT = [1.2, 1.375, 1.55, 1.725, 1.9];

  /** Daily targets from the profile. Everything here is an estimate, not medical advice. */
  function targets() {
    const p = S.profile, kg = currentWeight(), cm = num(p.height), age = ageOf(p.birth) || 30;
    const out = { ready: kg > 0 && cm > 0, kg: kg, bmr: 0, tdee: 0, kcal: 2000, deficit: 0, weekly: 0, notes: [] };
    if (out.ready) {
      out.bmr = 10 * kg + 6.25 * cm - 5 * age + (p.sex === 'M' ? 5 : -161);
      out.tdee = out.bmr * (ACT[clamp(Number(p.activity) || 0, 0, 4)] || 1.375);
      const floor = p.sex === 'M' ? 1500 : 1200;
      let k = out.tdee;
      const tw = num(p.targetWeight);
      if (p.goal === 'lose' && tw > 0 && tw < kg) {
        const days = p.targetDate ? Math.max(7, daysBetween(todayStr(), p.targetDate)) : 0;
        const need = days ? (kg - tw) * 7700 / days : 500;
        const def = Math.min(need, 750, out.tdee - floor);
        k = out.tdee - Math.max(def, 0);
        out.deficit = Math.max(def, 0);
        out.weekly = out.deficit * 7 / 7700;
        if (days && need > out.deficit + 25) out.notes.push('tooFast');
        if (out.deficit > 0) out.eta = addDays(todayStr(), Math.ceil((kg - tw) * 7700 / out.deficit));
        const tb = bmiOf(tw, cm); if (tb && tb < 18.5) out.notes.push('targetLow');
      } else if (p.goal === 'gain') { k = out.tdee + 300; out.weekly = -300 * 7 / 7700; }
      out.kcal = Math.round(Math.max(k, floor) / 10) * 10;
    }
    if (num(p.customKcal) >= 800) { out.kcal = Math.round(num(p.customKcal)); out.custom = true; }
    out.protein = Math.round(Math.max(out.kcal * 0.2 / 4, kg ? kg * 0.8 : 0));
    out.carbs = Math.round(out.kcal * 0.5 / 4);
    out.fat = Math.round(out.kcal * 0.3 / 9);
    out.sugar = Math.min(50, Math.round(out.kcal * 0.1 / 4));
    out.sodium = 2000;
    out.fiber = Math.round(out.kcal / 1000 * 14);
    out.veg = 3; out.fruit = 2;
    const ml = num(p.glassMl) || 250;
    out.water = kg ? clamp(Math.round(kg * 30 / ml), 6, 14) : 8;
    out.waterMl = ml;
    return out;
  }

  const zero = () => NUTR.reduce((o, k) => (o[k] = 0, o), {});
  function itemTotals(it) { const q = num(it.qty) || 0; const o = {}; NUTR.forEach((k) => { o[k] = num(it[k]) * q; }); return o; }
  function entryTotals(e) { const o = zero(); (e.items || []).forEach((it) => { const x = itemTotals(it); NUTR.forEach((k) => { o[k] += x[k]; }); }); return o; }
  const dayEntries = (date) => S.entries.filter((e) => e.date === date).sort((a, b) => (a.time || '').localeCompare(b.time || ''));
  function dayTotals(date) {
    const o = zero(); dayEntries(date).forEach((e) => { const x = entryTotals(e); NUTR.forEach((k) => { o[k] += x[k]; }); });
    o.water = Number(S.water[date]) || 0; o.count = dayEntries(date).length;
    return o;
  }

  /** WellBite score 0–100 for a day (only meaningful once something was logged). */
  function dayScore(tot, tg) {
    if (!tot.count) return null;
    let s = 0;
    const ratio = tot.kcal / tg.kcal;
    s += ratio >= 0.9 && ratio <= 1.1 ? 30 : ratio >= 0.75 && ratio <= 1.2 ? 18 : 6;
    s += tot.sugar <= tg.sugar ? 12 : tot.sugar <= tg.sugar * 1.3 ? 6 : 0;
    s += tot.sodium <= tg.sodium ? 12 : tot.sodium <= tg.sodium * 1.3 ? 6 : 0;
    s += Math.min(1, tot.protein / tg.protein) * 10;
    s += Math.min(1, tot.veg / tg.veg) * 10 + Math.min(1, tot.fruit / tg.fruit) * 6;
    s += Math.min(1, tot.water / tg.water) * 20;
    return Math.round(clamp(s, 0, 100));
  }
  function streak() {
    let n = 0, d = todayStr();
    if (!dayEntries(d).length) d = addDays(d, -1);
    while (dayEntries(d).length) { n++; d = addDays(d, -1); }
    return n;
  }

  /* ============ 4. DAILY INSIGHTS ============ */

  const pick = (ids) => ids.map((id) => (window.WB_FOODS || []).find((f) => f.id === id)).filter(Boolean).map(foodName).join(', ');

  /** Friendly, practical tips for one day. tone: good | warn | info */
  function insightsFor(date) {
    const tg = targets(), tot = dayTotals(date), out = [];
    const isToday = date === todayStr(), hr = new Date().getHours();
    const late = !isToday || hr >= 18;
    const add = (tone, emo, title, text) => out.push({ tone, emo, title, text });
    if (!tot.count) {
      add('info', '📝', t('insNoneT'), isToday ? t('insNone') : t('insNonePast'));
    } else {
      const left = tg.kcal - tot.kcal;
      if (tot.kcal > tg.kcal * 1.1) add('warn', '🔥', t('insOverT', { n: fmtN(-left) }), t('insOver'));
      else if (left <= tg.kcal * 0.1 && left >= -tg.kcal * 0.1) add('good', '🎯', t('insOnT'), t('insOn'));
      else if (left > 0) {
        const idea = left < 180 ? pick(['apel', 'pepaya', 'yogurt', 'teh-tawar']) : left < 450 ? pick(['telur-rebus', 'pisang', 'tahu-kukus', 'kacang', 'yogurt'])
          : pick(['nasi-merah', 'dada-rebus', 'ikan-bakar', 'tumis-buncis', 'sayur-sop']);
        add('info', '🍽️', t(isToday ? 'insLeftT' : 'insLeftPastT', { n: fmtN(left) }), isToday ? t('insLeft', { ideas: idea }) : t('insLeftPast'));
        if (late && tot.kcal < tg.kcal * 0.6) add('warn', '💛', t('insLowT'), t('insLow'));
      }
      if (tot.sugar > tg.sugar) add('warn', '🍬', t('insSugarT', { n: r0(tot.sugar), max: tg.sugar }), t('insSugar'));
      else if (tot.sugar > tg.sugar * 0.75) add('info', '🍬', t('insSugarNearT', { n: r0(tot.sugar), max: tg.sugar }), t('insSugarNear'));
      if (tot.sodium > tg.sodium) add('warn', '🧂', t('insSaltT', { n: fmtN(tot.sodium) }), t('insSalt'));
      if (tot.fat > tg.fat * 1.15) add('warn', '🍳', t('insFatT', { n: r0(tot.fat), max: tg.fat }), t('insFat'));
      if (late && tot.protein < tg.protein * 0.7) add('info', '💪', t('insProtT', { n: r0(tg.protein - tot.protein) }), t('insProt', { ideas: pick(['telur-rebus', 'tempe-goreng', 'tahu-kukus', 'dada-rebus', 'ikan-bakar']) }));
      if (late && tot.fiber < tg.fiber * 0.6) add('info', '🌾', t('insFiberT', { n: r1(tot.fiber), max: tg.fiber }), t('insFiber'));
      const vegOk = tot.veg >= tg.veg, fruitOk = tot.fruit >= tg.fruit;
      if (vegOk && fruitOk) add('good', '🥗', t('insPlateOkT'), t('insPlateOk'));
      else if (late || tot.count >= 2) add('info', '🥦', t('insPlateT', { v: r1(tot.veg), vt: tg.veg, f: r1(tot.fruit), ft: tg.fruit }),
        !vegOk && !fruitOk ? t('insPlateBoth') : !vegOk ? t('insPlateVeg') : t('insPlateFruit'));
      const ds = dayEntries(date);
      if (ds.some((e) => e.mood === 'bloated')) add('info', '😣', t('insBloatT'), t('insBloat'));
      if (ds.filter((e) => e.mood === 'hungry').length >= 2) add('info', '😋', t('insHungryT'), t('insHungry'));
      if (isToday && hr >= 10 && !ds.some((e) => e.meal === 'breakfast')) add('info', '🌅', t('insBreakT'), t('insBreak'));
    }
    const extra = tot.sodium > tg.sodium ? 2 : 0, goal = tg.water + extra;
    if (tot.water >= goal) add('good', '💧', t('insWaterOkT'), t('insWaterOk'));
    else if (late || tot.water < Math.floor(goal * (Math.max(0, hr - 7) / 13))) add('info', '💧', t('insWaterT', { n: goal - tot.water }), extra ? t('insWaterSalt') : t('insWater', { ml: tg.waterMl }));
    const order = { warn: 0, info: 1, good: 2 };
    return out.sort((a, b) => order[a.tone] - order[b.tone]);
  }

  /** In-app reminder: a meal time passed today and nothing is logged for it yet. */
  function dueReminder() {
    if (!S.settings.inAppRemind) return null;
    const r = S.settings.reminders, now = nowTime(), ds = dayEntries(todayStr());
    for (let i = MEALS.length - 1; i >= 0; i--) {
      const m = MEALS[i]; const at = r[m];
      if (!at || now < at) continue;
      const passed = (Number(now.slice(0, 2)) * 60 + Number(now.slice(3))) - (Number(at.slice(0, 2)) * 60 + Number(at.slice(3)));
      if (passed <= 150 && !ds.some((e) => e.meal === m)) return m;
    }
    return null;
  }

  /* ============ 5. SCREENS: INVITE, PIN, FIRST SETUP ============ */

  const gate = $('#gate'), appEl = $('#app');
  let pin = { mode: '', step: '', buf: '', first: '', old: '', msg: '', busy: false, fails: 0 };

  const langToggle = () => `<div class="seg small" role="group" aria-label="Language">
      <button data-act="lang" data-lang="id" class="${S.lang === 'id' ? 'on' : ''}">ID</button>
      <button data-act="lang" data-lang="en" class="${S.lang === 'en' ? 'on' : ''}">EN</button></div>`;
  const logo = () => `<div class="logo"><span class="logo-mark"><img src="${LOGO_URL}" alt=""></span><span class="logo-word">Well<b>Bite</b></span></div>`;

  function showGate(html) {
    appEl.hidden = true; gate.hidden = false; $('#boot').hidden = true;
    gate.innerHTML = html + `<p class="credit">${CREDIT}</p>`;
  }

  const heroArt = () => `<svg class="art" viewBox="0 0 160 130" aria-hidden="true">
      <ellipse cx="80" cy="118" rx="62" ry="7" fill="#E3E6F3"/>
      <path d="M96 52c0-24 14-38 40-40 0 26-14 40-40 40z" fill="#3BA76A"/><path d="M96 52l26-26" stroke="#A9E2C0" stroke-width="3" stroke-linecap="round"/>
      <circle cx="58" cy="54" r="20" fill="#EC6F45"/><circle cx="51" cy="47" r="5" fill="#FFC2AA"/>
      <circle cx="84" cy="46" r="13" fill="#F2B544"/>
      <rect x="18" y="62" width="124" height="12" rx="6" fill="#D6DBFF"/>
      <path d="M26 74h108c-2 26-24 40-54 40S28 100 26 74z" fill="#4F5BF0"/>
      <path d="M44 86h72" stroke="#7D87F5" stroke-width="3" stroke-linecap="round"/></svg>`;

  // Invitation code: only people who were given a code can use the app (see config.js)
  const inviteList = () => ((window.AK_CONFIG && window.AK_CONFIG.inviteHashes) || []).filter(Boolean);
  const inviteNeeded = () => inviteList().length > 0 && inviteList().indexOf(store.get('wb_invite', '')) < 0;
  function showInvite(err) {
    pin = { mode: 'invite', step: '' };
    showGate(`<div class="gate-top">${logo()}${langToggle()}</div>
      <div class="gate-body">
        <div class="lock-badge">${icon('lock')}</div>
        <h1>${t('inviteTitle')}</h1>
        <p class="muted">${t('inviteSub')}</p>
        <form data-form="invite" novalidate>
          <div class="field ${err ? 'bad' : ''}"><input id="invite-code" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="${t('invitePh')}">
            <p class="err">${err ? esc(err) : ''}</p></div>
          <button class="btn primary block big">${t('continue')}</button>
        </form>
      </div>`);
  }

  function showWelcome() {
    pin = { mode: 'welcome', step: '' };
    showGate(`<div class="gate-top">${logo()}${langToggle()}</div>
      <div class="gate-body">
        <div class="gate-art">${heroArt()}</div>
        <p class="tagline">${TAGLINE}</p>
        <h1>${t('welcomeTitle')}</h1>
        <p class="muted">${t('welcomeSub')}</p>
        <ul class="feat">
          <li><span>📸</span>${t('feat1')}</li><li><span>🥗</span>${t('feat2')}</li>
          <li><span>💧</span>${t('feat3')}</li><li><span>📈</span>${t('feat4')}</li></ul>
        <button class="btn primary block big" data-act="startPin">${t('getStarted')}</button>
        <p class="muted small center">${t('phoneOnly')}</p>
      </div>`);
  }

  function showPin(mode) {
    pin = { mode: mode, step: mode === 'create' ? 'new' : mode === 'change' ? 'old' : mode === 'reset' ? 'rcode' : 'enter',
      buf: '', first: '', old: '', msg: '', busy: false, fails: 0 };
    renderPin();
  }

  function renderPin() {
    const titles = { new: pin.mode === 'create' ? 'pinCreate' : 'pinNew', confirm: 'pinConfirm', enter: 'pinEnter', old: 'pinOld' };
    const subs = { new: pin.mode === 'create' ? 'pinCreateSub' : '', confirm: 'pinConfirmSub', enter: 'pinEnterSub', old: '' };
    const canBack = pin.mode === 'change' || pin.mode === 'reset' || pin.mode === 'create';
    const top = `<div class="gate-top">${canBack ? `<button class="icon-btn" data-act="pinBack" aria-label="${t('back')}">${icon('left')}</button>` : logo()}${langToggle()}</div>`;
    if (pin.step === 'recovery') {
      showGate(`<div class="gate-top">${logo()}${langToggle()}</div><div class="gate-body">
        <div class="lock-badge">${icon('key')}</div>
        <h1>${t('recTitle')}</h1><p class="muted">${t('recSub')}</p>
        <div class="rec-code">${esc(pin.rcode)}</div>
        <button class="btn soft block" data-act="copyText" data-v="${esc(pin.rcode)}">${icon('copy')}${t('copyCode')}</button>
        <button class="btn primary block big" data-act="recDone">${icon('check')}${t('recDone')}</button></div>`);
      return;
    }
    if (pin.step === 'rcode') {
      showGate(`${top}<div class="gate-body">
        <div class="lock-badge">${icon('key')}</div>
        <h1>${t('recEnter')}</h1><p class="muted">${t('recEnterSub')}</p>
        <form data-form="rcode" novalidate>
          <div class="field"><input id="rec-code" class="code-input" autocomplete="off" autocapitalize="characters" spellcheck="false" maxlength="9" placeholder="XXXX-XXXX">
          <p class="err" id="pin-msg">${esc(pin.msg)}</p></div>
          <button class="btn primary block big">${t('continue')}</button>
        </form>
        <button class="btn link danger" data-act="askErase">${t('recLost')}</button></div>`);
      return;
    }
    const keys = [1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => `<button class="key" data-act="digit" data-d="${n}">${n}</button>`).join('');
    showGate(`${top}<div class="gate-body pin">
      ${pin.mode === 'unlock' ? `<div class="pin-av">${avatar(64)}</div><p class="muted">${t('hello', { name: esc(S.profile.name || '') })}</p>` : `<div class="lock-badge">${icon('lock')}</div>`}
      <h1>${t(titles[pin.step])}</h1>
      <p class="muted">${subs[pin.step] ? t(subs[pin.step]) : '&nbsp;'}</p>
      <div class="pin-dots" id="pin-dots" aria-label="PIN"></div>
      <p class="err center" id="pin-msg" aria-live="polite">${esc(pin.msg)}</p>
      <div class="keypad">${keys}
        ${pin.mode === 'unlock' ? `<button class="key text" data-act="forgot">${t('pinForgot')}</button>` : '<span></span>'}
        <button class="key" data-act="digit" data-d="0">0</button>
        <button class="key" data-act="pinDel" aria-label="${t('delete')}">${icon('back')}</button>
      </div></div>`);
    pinDots();
  }
  function pinDots() {
    const el = $('#pin-dots'); if (!el) return;
    el.innerHTML = [0, 1, 2, 3].map((i) => `<span class="${i < pin.buf.length ? 'on' : ''}"></span>`).join('');
    el.classList.toggle('busy', !!pin.busy);
  }
  function pinFail(msg) {
    pin.buf = ''; pin.busy = false; pin.msg = msg;
    const m = $('#pin-msg'); if (m) m.textContent = msg;
    const d = $('#pin-dots'); if (d) { d.classList.remove('shake'); void d.offsetWidth; d.classList.add('shake'); }
    pinDots();
  }
  const hashPin = (p) => window.AKHash.sha256('wellbite:' + p);
  const recHashOf = (c) => window.AKHash.sha256('wellbite-rec:' + String(c || '').toUpperCase().replace(/[^A-Z0-9]/g, ''));
  function newRecoveryCode() {
    const abc = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
    const r = new Uint32Array(8);
    try { crypto.getRandomValues(r); } catch (e) { for (let i = 0; i < 8; i++) r[i] = Math.floor(Math.random() * 4294967296); }
    let c = ''; for (let i = 0; i < 8; i++) c += abc[r[i] % abc.length];
    return c.slice(0, 4) + '-' + c.slice(4);
  }
  // Wrong PIN 5x -> wait 1 min, 10x -> 5 min, 15x -> 15 min
  function lockLeft() { return Math.max(0, store.get('wb_lockuntil', 0) - Date.now()); }

  function submitPin() {
    const p = pin.buf;
    if (pin.step === 'old') {
      if (hashPin(p) !== S.pinHash) { pinFail(t('pinWrong')); return; }
      pin.old = p; pin.step = 'new'; pin.buf = ''; pin.msg = ''; renderPin(); return;
    }
    if (pin.step === 'new') { pin.first = p; pin.step = 'confirm'; pin.buf = ''; pin.msg = ''; renderPin(); return; }
    if (pin.step === 'confirm') {
      if (p !== pin.first) { pin.step = 'new'; pin.first = ''; pin.buf = ''; pin.msg = t('pinMismatch'); renderPin(); return; }
      S.pinHash = hashPin(p); store.set('wb_pinhash', S.pinHash); store.del('wb_lockuntil'); store.set('wb_fails', 0);
      if (pin.mode === 'create') {
        const code = newRecoveryCode(); S.recHash = recHashOf(code); store.set('wb_rechash', S.recHash);
        pin = { mode: 'create', step: 'recovery', rcode: code, buf: '', msg: '' }; renderPin(); return;
      }
      toast(t('pinChanged'), 'success'); enterApp(); return;
    }
    // unlock
    if (lockLeft()) { pinFail(t('pinLocked', { n: Math.ceil(lockLeft() / 60000) })); return; }
    if (hashPin(p) === S.pinHash) { store.set('wb_fails', 0); enterApp(); return; }
    const fails = (store.get('wb_fails', 0) || 0) + 1; store.set('wb_fails', fails);
    if (fails % 5 === 0) { const min = fails >= 15 ? 15 : fails >= 10 ? 5 : 1; store.set('wb_lockuntil', Date.now() + min * 60000); pinFail(t('pinLocked', { n: min })); return; }
    pinFail(t('pinWrongLeft', { n: 5 - (fails % 5) }));
  }

  /** First-time profile: body data + goal, so targets can be calculated. */
  function showSetup() {
    pin = { mode: 'setup', step: '' };
    const p = S.profile;
    showGate(`<div class="gate-top">${logo()}${langToggle()}</div>
      <div class="gate-body setup">
        <h1>${t('setupTitle')}</h1>
        <p class="muted">${t('setupSub')}</p>
        <form data-form="setup" novalidate>${profileFields(p, true)}
          <button class="btn primary block big">${icon('check')}${t('setupDone')}</button>
          <button type="button" class="btn link block" data-act="skipSetup">${t('setupLater')}</button>
        </form>
      </div>`);
  }

  function profileFields(p, first) {
    const opt = (v, cur, label) => `<option value="${v}" ${String(cur) === String(v) ? 'selected' : ''}>${label}</option>`;
    return `
      <div class="field"><label for="p-name">${t('name')}</label><input id="p-name" maxlength="40" value="${esc(p.name)}" placeholder="${t('namePh')}"></div>
      ${first ? '' : `<div class="field"><label for="p-bio">${t('bio')}</label><input id="p-bio" maxlength="80" value="${esc(p.bio)}" placeholder="${t('bioPh')}"></div>`}
      <div class="grid2">
        <div class="field"><label for="p-sex">${t('sex')}</label><select id="p-sex">${opt('F', p.sex, t('female'))}${opt('M', p.sex, t('male'))}</select></div>
        <div class="field"><label for="p-birth">${t('birth')}</label><input id="p-birth" type="date" value="${esc(p.birth)}" max="${todayStr()}"></div>
      </div>
      <div class="grid2">
        <div class="field"><label for="p-height">${t('height')} (cm)</label><input id="p-height" type="text" inputmode="decimal" value="${esc(p.height)}" placeholder="158"></div>
        <div class="field"><label for="p-weight">${t('weightNow')} (kg)</label><input id="p-weight" type="text" inputmode="decimal" value="${esc(currentWeight() || '')}" placeholder="60"></div>
      </div>
      <div class="field"><label for="p-act">${t('activity')}</label><select id="p-act">${[0, 1, 2, 3, 4].map((i) => opt(i, p.activity, t('act' + i))).join('')}</select></div>
      <div class="field"><label>${t('goal')}</label><div class="seg" role="group">
        ${['lose', 'keep', 'gain'].map((g) => `<button type="button" data-act="setGoal" data-v="${g}" class="${p.goal === g ? 'on' : ''}">${t('goal_' + g)}</button>`).join('')}</div>
        <input type="hidden" id="p-goal" value="${esc(p.goal)}"></div>
      <div class="grid2" id="goal-extra" ${p.goal === 'keep' ? 'hidden' : ''}>
        <div class="field"><label for="p-tw">${t('targetWeight')} (kg)</label><input id="p-tw" type="text" inputmode="decimal" value="${esc(p.targetWeight)}" placeholder="55"></div>
        <div class="field"><label for="p-td">${t('targetDate')}</label><input id="p-td" type="date" value="${esc(p.targetDate)}" min="${addDays(todayStr(), 7)}"></div>
      </div>
      <p class="err" id="p-err"></p>`;
  }

  /** Reads the profile form. Returns false (and shows why) when something is off. */
  function readProfileForm() {
    const v = (id) => { const el = $('#' + id); return el ? el.value.trim() : ''; };
    const err = (k) => { const e = $('#p-err'); if (e) e.textContent = t(k); return false; };
    const h = num(v('p-height')), w = num(v('p-weight')), tw = num(v('p-tw'));
    if (v('p-height') && (h < 80 || h > 230)) return err('errHeight');
    if (v('p-weight') && (w < 20 || w > 300)) return err('errWeight');
    if (v('p-tw') && (tw < 20 || tw > 300)) return err('errWeight');
    const p = S.profile;
    p.name = v('p-name'); if ($('#p-bio')) p.bio = v('p-bio');
    p.sex = v('p-sex') || 'F'; p.birth = v('p-birth'); p.height = h ? String(h) : '';
    p.activity = Number(v('p-act')) || 0; p.goal = v('p-goal') || 'keep';
    p.targetWeight = tw ? String(tw) : ''; p.targetDate = v('p-td');
    if (w && w !== currentWeight()) {
      if (!p.startWeight) { p.startWeight = String(w); p.startDate = todayStr(); }
      logWeight(todayStr(), w);
    }
    if (!p.startWeight && w) { p.startWeight = String(w); p.startDate = todayStr(); }
    saveProfile(); return true;
  }
  function logWeight(date, kg, waist) {
    const ex = S.weights.find((x) => x.date === date);
    if (ex) { ex.kg = kg; if (waist !== undefined) ex.waist = waist; }
    else S.weights.push({ id: uid('w'), date: date, kg: kg, waist: waist || '' });
    persist();
  }

  function enterApp() {
    gate.hidden = true; $('#boot').hidden = true; appEl.hidden = false;
    if (!S.profile.setupDone) { showSetup(); return; }
    render();
  }

  /* ============ 6. VIEWS ============ */

  const view = $('#view');
  function render() {
    const st = streak();
    $('#top').innerHTML = `${logo()}<div class="top-right">
      ${st ? `<span class="streak" title="${t('streak')}">${icon('flame')}${st}</span>` : ''}
      <button class="icon-btn" data-act="openFamily" aria-label="${t('family')}">${icon('users')}${S.family.length ? '<em class="dot"></em>' : ''}</button>
      <button class="av-btn" data-act="go" data-view="profile" aria-label="${t('profile')}">${avatar(44)}</button></div>`;
    const nav = (v, ic, label) => `<button class="nav-item ${S.view === v ? 'on' : ''}" data-act="go" data-view="${v}">${icon(ic)}<span>${label}</span></button>`;
    $('#nav').innerHTML = nav('today', 'home', t('navToday')) + nav('history', 'list', t('navHistory')) +
      `<button class="fab" data-act="addMeal" aria-label="${t('addMeal')}">${icon('plus')}</button>` +
      nav('dash', 'chart', t('navDash')) + nav('profile', 'user', t('navProfile'));
    renderView(true);
  }
  function renderView(animate) {
    const fn = { today: viewToday, history: viewHistory, dash: viewDash, profile: viewProfile }[S.view] || viewToday;
    const y = view.scrollTop;
    view.innerHTML = fn();
    if (animate) { view.scrollTop = 0; view.classList.remove('fade'); void view.offsetWidth; view.classList.add('fade'); } else view.scrollTop = y;
    hydratePhotos();
  }
  /** Fills <img data-photo="id"> after render (photos come from IndexedDB). */
  function hydratePhotos(root) {
    $$('img[data-photo]', root).forEach((img) => {
      const id = img.dataset.photo, c = photoDB.peek(id);
      if (c) { img.src = c; img.parentNode.classList.add('has'); return; }
      photoDB.get(id).then((v) => { if (v) { img.src = v; img.parentNode.classList.add('has'); } });
    });
  }

  function ring(pct, size, color, inner) {
    const r = size / 2 - 7, c = 2 * Math.PI * r, p = clamp(pct, 0, 1);
    const over = pct > 1.02;
    return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" class="ring" aria-hidden="true">
      <circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="${over ? '#FBE3D8' : '#E9ECF6'}" stroke-width="11"/>
      ${p > 0 ? `<circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="${over ? '#EC6F45' : color || C.kcal}" stroke-width="11" stroke-linecap="round"
        stroke-dasharray="${(c * p).toFixed(1)} ${c.toFixed(1)}" transform="rotate(-90 ${size / 2} ${size / 2})"/>` : ''}${inner || ''}</svg>`;
  }
  function bar(label, val, max, unit, color, limit) {
    const pct = max ? val / max : 0;
    const over = limit && val > max;
    return `<div class="mbar ${over ? 'over' : ''}"><div class="mbar-top"><span>${label}</span><b>${limit ? fmtN(val) : r0(val)}<small> / ${fmtN(max)} ${unit}</small></b></div>
      <div class="track"><i style="width:${(clamp(pct, 0, 1) * 100).toFixed(1)}%;background:${over ? '#EC6F45' : color}"></i></div></div>`;
  }

  // ---------- Today ----------
  function viewToday() {
    const d = S.day, tg = targets(), tot = dayTotals(d), isToday = d === todayStr();
    const left = tg.kcal - tot.kcal, score = dayScore(tot, tg);
    const rel = relDay(d);
    const due = isToday ? dueReminder() : null;
    const ins = insightsFor(d);
    const glasses = Array.from({ length: Math.max(tg.water, tot.water) }, (_, i) =>
      `<button class="glass ${i < tot.water ? 'on' : ''}" data-act="setWater" data-n="${i < tot.water && i === tot.water - 1 ? i : i + 1}" aria-label="${i + 1}">${icon('drop')}</button>`).join('');
    const meals = MEALS.map((m) => {
      const list = dayEntries(d).filter((e) => e.meal === m);
      const kc = list.reduce((s, e) => s + entryTotals(e).kcal, 0);
      return `<div class="meal-sec">
        <div class="meal-head"><span class="meal-emo">${MEAL_EMO[m]}</span><div><h3>${t('meal_' + m)}</h3>
          <small>${list.length ? fmtN(kc) + ' kkal' : t('notYet')}</small></div>
          <button class="btn soft sm" data-act="addMeal" data-meal="${m}">${icon('plus')}${t('add')}</button></div>
        ${list.map(entryCard).join('')}</div>`;
    }).join('');
    return `
      <div class="day-nav">
        <button class="icon-btn" data-act="dayNav" data-n="-1" aria-label="${t('prev')}">${icon('left')}</button>
        <label class="day-label"><b>${rel || fmtDate(d, { weekday: 'long' })}</b><small>${fmtDate(d, { day: 'numeric', month: 'long', year: 'numeric' })}</small>
          <input type="date" id="day-input" value="${d}" max="${todayStr()}" data-ch="day" aria-label="${t('pickDate')}"></label>
        <button class="icon-btn" data-act="dayNav" data-n="1" ${isToday ? 'disabled' : ''} aria-label="${t('next')}">${icon('right')}</button>
      </div>
      ${due ? `<button class="remind" data-act="addMeal" data-meal="${due}">${icon('bell')}<span>${t('remindDue', { meal: t('meal_' + due).toLowerCase() })}</span>${icon('plus')}</button>` : ''}
      ${!tg.ready ? `<button class="remind soft" data-act="go" data-view="profile">${icon('info')}<span>${t('needProfile')}</span>${icon('right')}</button>` : ''}
      <section class="card hero-k">
        <div class="hk-row">
          <div class="hk-ring">${ring(tot.kcal / tg.kcal, 132, C.kcal)}<div class="hk-in"><b>${fmtN(tot.kcal)}</b><small>${t('of')} ${fmtN(tg.kcal)} kkal</small></div></div>
          <div class="hk-side">
            <small>${left >= 0 ? (isToday ? t('kcalLeft') : t('kcalLeftDay')) : t('kcalOver')}</small>
            <strong class="${left < 0 ? 'over' : ''}">${fmtN(Math.abs(left))}<span> kkal</span></strong>
            ${score != null ? `<span class="score s${score >= 75 ? 'g' : score >= 50 ? 'm' : 'l'}">⭐ ${t('score')} ${score}</span>` : ''}
          </div>
        </div>
        <div class="macros">
          ${bar(t('protein'), tot.protein, tg.protein, 'g', C.protein)}
          ${bar(t('carbs'), tot.carbs, tg.carbs, 'g', C.carbs)}
          ${bar(t('fat'), tot.fat, tg.fat, 'g', C.fat, true)}
        </div>
        <div class="limits">
          <div class="lim ${tot.sugar > tg.sugar ? 'over' : ''}"><small>🍬 ${t('sugar')} (g)</small><b>${r0(tot.sugar)}<span>/${tg.sugar}</span></b></div>
          <div class="lim ${tot.sodium > tg.sodium ? 'over' : ''}"><small>🧂 ${t('sodium')} (mg)</small><b>${fmtN(tot.sodium)}<span>/${fmtN(tg.sodium)}</span></b></div>
          <div class="lim ${tot.fiber >= tg.fiber ? 'ok' : ''}"><small>🌾 ${t('fiber')} (g)</small><b>${r1(tot.fiber)}<span>/${tg.fiber}</span></b></div>
        </div>
      </section>
      <section class="card water">
        <div class="sec-head"><div><h2>💧 ${t('water')}</h2><small class="muted">${t('waterSub', { n: tot.water, t: tg.water, ml: fmtN(tot.water * tg.waterMl) })}</small></div>
          <div class="row"><button class="icon-btn sm" data-act="water" data-n="-1" aria-label="${t('less')}">${icon('minus')}</button>
          <button class="icon-btn sm primary" data-act="water" data-n="1" aria-label="${t('more')}">${icon('plus')}</button></div></div>
        <div class="glasses">${glasses}</div>
      </section>
      <section class="tiles plate">
        <div class="tile green"><span class="tile-emo">🥦</span><div><b>${r1(tot.veg)}<small>/${tg.veg}</small></b><small>${t('vegServ')}</small></div></div>
        <div class="tile peach"><span class="tile-emo">🍎</span><div><b>${r1(tot.fruit)}<small>/${tg.fruit}</small></b><small>${t('fruitServ')}</small></div></div>
      </section>
      <section class="card">
        <div class="sec-head"><h2>✨ ${t('insights')}</h2></div>
        <div class="ins-list">${ins.map((x) => `<div class="insight ${x.tone}"><span>${x.emo}</span><div><strong>${esc(x.title)}</strong><p>${esc(x.text)}</p></div></div>`).join('')}</div>
      </section>
      <section class="meals">${meals}</section>
      ${tot.count ? `<section class="card share-card"><h3>👨‍👩‍👧 ${t('shareFamily')}</h3><p class="muted small">${t('shareHow')}</p>
        <div class="row"><button class="btn soft grow" data-act="shareDay" data-date="${d}">${icon('share')}${t('sendLink')}</button>
        <button class="btn primary grow" data-act="shareImg" data-date="${d}">${icon('image')}${t('sendImg')}</button></div></section>` : ''}
      <p class="credit">${CREDIT}</p>`;
  }

  function entryCard(e) {
    const x = entryTotals(e);
    const names = (e.items || []).map((i) => esc(i.name)).join(', ') || t('noItems');
    return `<button class="entry" data-act="openEntry" data-id="${esc(e.id)}">
      <span class="thumb">${MEAL_EMO[e.meal]}${e.photo ? `<img data-photo="${esc(e.id)}" alt="">` : ''}</span>
      <span class="en-body"><strong>${names}</strong>
        <small>${esc(e.time || '')} · ${fmtN(x.kcal)} kkal · P ${r0(x.protein)}g · K ${r0(x.carbs)}g · L ${r0(x.fat)}g${e.ai ? ' · ✨AI' : ''}</small>
        ${e.note ? `<small class="en-note">${esc(e.note)}</small>` : ''}</span>
      ${e.mood ? `<span class="en-mood" title="${t('mood_' + e.mood)}">${MOOD_EMO[e.mood]}</span>` : ''}</button>`;
  }

  // ---------- History ----------
  function filteredEntries() {
    const f = S.hist, q = f.q.trim().toLowerCase();
    return S.entries.filter((e) => (f.meal === 'all' || e.meal === f.meal) && (f.mood === 'all' || e.mood === f.mood) &&
      (!f.from || e.date >= f.from) && (!f.to || e.date <= f.to) &&
      (!q || (e.items || []).some((i) => String(i.name).toLowerCase().indexOf(q) >= 0) || String(e.note || '').toLowerCase().indexOf(q) >= 0))
      .sort((a, b) => (b.date + (b.time || '')).localeCompare(a.date + (a.time || '')));
  }
  function historyListHtml() {
    const list = filteredEntries();
    if (!list.length) return emptyBox('list', t('histEmpty'), S.entries.length ? t('histEmptyF') : t('histEmptySub'));
    const tg = targets(); let out = '', cur = '', shown = 0;
    for (const e of list) {
      if (shown >= 200) break;
      if (e.date !== cur) {
        cur = e.date; const tot = dayTotals(cur);
        const st = tot.kcal > tg.kcal * 1.1 ? 'over' : tot.kcal >= tg.kcal * 0.9 ? 'ok' : '';
        out += `<div class="day-head"><b>${relDay(cur) || fmtDate(cur)}</b><span class="${st}">${fmtN(tot.kcal)} / ${fmtN(tg.kcal)} kkal</span>
          <i>💧${tot.water}</i></div>`;
      }
      out += `<div class="h-item"><span class="h-meal">${MEAL_EMO[e.meal]}</span>${entryCard(e)}</div>`; shown++;
    }
    return `<p class="muted count">${t('found', { n: list.length })}</p>` + out;
  }
  function viewHistory() {
    const f = S.hist;
    const chip = (k, v, label) => `<button class="chip ${f[k] === v ? 'on' : ''}" data-act="hFilter" data-k="${k}" data-v="${v}">${label}</button>`;
    return `<div class="page-head"><h1>${t('navHistory')}</h1>
        <button class="icon-btn ${f.open || f.from || f.to || f.mood !== 'all' ? 'has' : ''}" data-act="hToggle" aria-label="${t('filter')}">${icon('cal')}</button></div>
      <div class="search"><span>${icon('search')}</span><input type="search" placeholder="${t('searchFood')}" value="${esc(f.q)}" data-in="hSearch" aria-label="${t('searchFood')}"></div>
      <div class="chips">${chip('meal', 'all', t('all'))}${MEALS.map((m) => chip('meal', m, MEAL_EMO[m] + ' ' + t('meal_' + m))).join('')}</div>
      ${f.open ? `<div class="filters">
        <label>${t('from')}<input type="date" value="${esc(f.from)}" data-ch="hFrom"></label>
        <label>${t('to')}<input type="date" value="${esc(f.to)}" data-ch="hTo"></label>
        <div class="wide"><span class="flabel">${t('mood')}</span><div class="chips pick">${chip('mood', 'all', t('all'))}${MOODS.map((m) => chip('mood', m, MOOD_EMO[m] + ' ' + t('mood_' + m))).join('')}</div></div>
        <button class="btn link wide" data-act="hClear">${t('clearFilter')}</button></div>` : ''}
      <div id="hist-list" class="hist">${historyListHtml()}</div>`;
  }
  function emptyBox(ic, title, sub, cta) {
    return `<div class="empty"><span class="empty-ic">${icon(ic)}</span><strong>${title}</strong><p>${sub}</p>${cta || ''}</div>`;
  }

  // ---------- Dashboard ----------
  function periodDays() {
    const a = S.dash.anchor;
    const from = S.dash.period === 'week' ? weekStart(a) : a.slice(0, 8) + '01';
    const to = S.dash.period === 'week' ? addDays(from, 6) : monthEnd(a);
    const days = []; for (let d = from; d <= to; d = addDays(d, 1)) days.push(d);
    return { from, to, days };
  }
  function barChart(vals, labels, target, color, unit, opts) {
    opts = opts || {};
    const W = 330, H = 150, pl = 4, pb = 20, pt = 18, n = vals.length;
    const max = Math.max(target || 0, ...vals, 1) * 1.12;
    const bw = (W - pl * 2) / n, y = (v) => pt + (H - pt - pb) * (1 - v / max);
    let s = `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img">`;
    if (target) s += `<line x1="0" x2="${W}" y1="${y(target)}" y2="${y(target)}" class="tline"/><text x="${W - 2}" y="${y(target) - 4}" class="ax" text-anchor="end">${t('target')} ${fmtN(target)}</text>`;
    vals.forEach((v, i) => {
      const x = pl + i * bw + bw * 0.18, w = bw * 0.64, h = Math.max(v ? 3 : 0, H - pb - y(v));
      const over = opts.overIsBad && target && v > target * 1.1;
      s += `<rect x="${x.toFixed(1)}" y="${(H - pb - h).toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" rx="${Math.min(5, w / 2)}" fill="${over ? '#F1A487' : color}" opacity="${v ? 1 : 0.25}"/>`;
      if (n <= 8 && v) s += `<text x="${(x + w / 2).toFixed(1)}" y="${(H - pb - h - 4).toFixed(1)}" class="ax v" text-anchor="middle">${opts.dec ? r1(v) : fmtN(v)}</text>`;
      if (n <= 8 || i % 5 === 0 || i === n - 1) s += `<text x="${(x + w / 2).toFixed(1)}" y="${H - 5}" class="ax" text-anchor="middle">${labels[i]}</text>`;
    });
    return s + '</svg>';
  }
  function lineChart(points, color, target) {
    if (points.length < 1) return '';
    const W = 330, H = 150, pl = 30, pr = 10, pt = 14, pb = 22;
    const ys = points.map((p) => p.v).concat(target ? [target] : []);
    let lo = Math.min(...ys), hi = Math.max(...ys); if (hi - lo < 2) { lo -= 1; hi += 1; } lo -= 0.5; hi += 0.5;
    const t0 = toDate(points[0].d).getTime(), t1 = Math.max(toDate(points[points.length - 1].d).getTime(), t0 + 86400000);
    const X = (d) => pl + (W - pl - pr) * ((toDate(d).getTime() - t0) / (t1 - t0)), Y = (v) => pt + (H - pt - pb) * (1 - (v - lo) / (hi - lo));
    let s = `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img">`;
    [0, 0.5, 1].forEach((f) => { const v = lo + (hi - lo) * f; s += `<line x1="${pl}" x2="${W - pr}" y1="${Y(v)}" y2="${Y(v)}" class="grid"/><text x="${pl - 4}" y="${Y(v) + 3}" class="ax" text-anchor="end">${r1(v)}</text>`; });
    if (target) s += `<line x1="${pl}" x2="${W - pr}" y1="${Y(target)}" y2="${Y(target)}" class="tline green"/><text x="${W - pr}" y="${Y(target) - 4}" class="ax" text-anchor="end">🎯 ${target} kg</text>`;
    s += `<polyline points="${points.map((p) => X(p.d).toFixed(1) + ',' + Y(p.v).toFixed(1)).join(' ')}" fill="none" stroke="${color}" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"/>`;
    points.forEach((p, i) => { if (points.length <= 16 || i === points.length - 1) s += `<circle cx="${X(p.d).toFixed(1)}" cy="${Y(p.v).toFixed(1)}" r="3.5" fill="#fff" stroke="${color}" stroke-width="2.200"/>`; });
    s += `<text x="${pl}" y="${H - 5}" class="ax">${fmtShort(points[0].d)}</text><text x="${W - pr}" y="${H - 5}" class="ax" text-anchor="end">${fmtShort(points[points.length - 1].d)}</text>`;
    return s + '</svg>';
  }

  function viewDash() {
    const P = periodDays(), tg = targets(), td = todayStr();
    const tots = P.days.map((d) => dayTotals(d));
    const logged = P.days.map((d, i) => ({ d, t: tots[i] })).filter((x) => x.t.count && x.d <= td);
    const n = logged.length || 1;
    const avg = (k) => logged.reduce((s, x) => s + x.t[k], 0) / n;
    const onTarget = logged.filter((x) => x.t.kcal >= tg.kcal * 0.9 && x.t.kcal <= tg.kcal * 1.1).length;
    const scores = logged.map((x) => dayScore(x.t, tg)).filter((v) => v != null);
    const avgScore = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
    const waterDays = P.days.filter((d) => d <= td);
    const avgWater = waterDays.length ? waterDays.reduce((s, d) => s + (Number(S.water[d]) || 0), 0) / waterDays.length : 0;
    const labels = P.days.map((d) => S.dash.period === 'week' ? fmtDate(d, { weekday: 'short' }).slice(0, 3) : String(+d.slice(8)));
    const pK = avg('protein') * 4, cK = avg('carbs') * 4, fK = avg('fat') * 9, sum = pK + cK + fK || 1;
    const sugarOver = logged.filter((x) => x.t.sugar > tg.sugar).length, saltOver = logged.filter((x) => x.t.sodium > tg.sodium).length;
    const moods = {}; let moodN = 0;
    S.entries.filter((e) => e.date >= P.from && e.date <= P.to && e.mood).forEach((e) => { moods[e.mood] = (moods[e.mood] || 0) + 1; moodN++; });
    const foods = {};
    S.entries.filter((e) => e.date >= P.from && e.date <= P.to).forEach((e) => (e.items || []).forEach((i) => { const k = String(i.name).trim(); if (k) foods[k] = (foods[k] || 0) + 1; }));
    const top = Object.keys(foods).sort((a, b) => foods[b] - foods[a]).slice(0, 5);
    const perMeal = MEALS.map((m) => { const es = S.entries.filter((e) => e.meal === m && e.date >= P.from && e.date <= P.to); return es.reduce((s, e) => s + entryTotals(e).kcal, 0) / n; });
    const mealMax = Math.max(...perMeal, 1);
    const wpts = sortedWeights().filter((w) => w.date >= P.from && w.date <= P.to).map((w) => ({ d: w.date, v: num(w.kg) }));
    const title = S.dash.period === 'week' ? `${fmtShort(P.from)} – ${fmtDate(P.to, { day: 'numeric', month: 'short', year: 'numeric' })}` : fmtDate(P.from, { month: 'long', year: 'numeric' });
    return `<div class="page-head"><h1>${t('navDash')}</h1>
        <div class="seg small"><button class="${S.dash.period === 'week' ? 'on' : ''}" data-act="dPeriod" data-v="week">${t('week')}</button>
        <button class="${S.dash.period === 'month' ? 'on' : ''}" data-act="dPeriod" data-v="month">${t('month')}</button></div></div>
      <div class="day-nav slim"><button class="icon-btn" data-act="dNav" data-n="-1">${icon('left')}</button><b>${title}</b>
        <button class="icon-btn" data-act="dNav" data-n="1" ${P.to >= td ? 'disabled' : ''}>${icon('right')}</button></div>
      <section class="tiles">
        <div class="tile blue"><span class="tile-emo">🔥</span><div><b>${logged.length ? fmtN(avg('kcal')) : '–'}</b><small>${t('avgKcal')}</small></div></div>
        <div class="tile green"><span class="tile-emo">🎯</span><div><b>${onTarget}<small>/${logged.length}</small></b><small>${t('daysOnTarget')}</small></div></div>
        <div class="tile lilac"><span class="tile-emo">⭐</span><div><b>${scores.length ? avgScore : '–'}</b><small>${t('avgScore')}</small></div></div>
        <div class="tile peach"><span class="tile-emo">💧</span><div><b>${r1(avgWater)}</b><small>${t('avgWater')}</small></div></div>
      </section>
      <section class="card"><div class="sec-head"><h2>${t('kcalPerDay')}</h2></div>
        ${barChart(tots.map((x) => r0(x.kcal)), labels, tg.kcal, C.kcal, 'kkal', { overIsBad: true })}
        <p class="chart-cap">${t('kcalCap')}</p></section>
      <section class="card"><div class="sec-head"><h2>${t('macroSplit')}</h2></div>
        ${logged.length ? `<div class="stack"><i style="width:${pK / sum * 100}%;background:${C.protein}"></i><i style="width:${cK / sum * 100}%;background:${C.carbs}"></i><i style="width:${fK / sum * 100}%;background:${C.fat}"></i></div>
        <div class="legend"><span><u style="background:${C.protein}"></u>${t('protein')} <b>${r0(pK / sum * 100)}%</b> · ${r0(avg('protein'))} g</span>
          <span><u style="background:${C.carbs}"></u>${t('carbs')} <b>${r0(cK / sum * 100)}%</b> · ${r0(avg('carbs'))} g</span>
          <span><u style="background:${C.fat}"></u>${t('fat')} <b>${r0(fK / sum * 100)}%</b> · ${r0(avg('fat'))} g</span></div>
        <p class="chart-cap">${t('macroIdeal')}</p>` : `<p class="muted">${t('noData')}</p>`}</section>
      <section class="card"><div class="sec-head"><h2>${t('limitsTitle')}</h2></div>
        <div class="limits big">
          <div class="lim ${sugarOver ? 'over' : 'ok'}"><small>🍬 ${t('sugar')}</small><b>${r0(avg('sugar'))}<span> g/${t('dayShort')}</span></b><i>${t('daysOver', { n: sugarOver })}</i></div>
          <div class="lim ${saltOver ? 'over' : 'ok'}"><small>🧂 ${t('sodium')}</small><b>${fmtN(avg('sodium'))}<span> mg</span></b><i>${t('daysOver', { n: saltOver })}</i></div>
          <div class="lim ${avg('fiber') >= tg.fiber ? 'ok' : ''}"><small>🌾 ${t('fiber')}</small><b>${r1(avg('fiber'))}<span> g</span></b><i>${t('target')} ${tg.fiber} g</i></div>
          <div class="lim ${avg('veg') >= tg.veg ? 'ok' : ''}"><small>🥦 ${t('veg')}</small><b>${r1(avg('veg'))}<span> ${t('serv')}</span></b><i>${t('target')} ${tg.veg}</i></div>
          <div class="lim ${avg('fruit') >= tg.fruit ? 'ok' : ''}"><small>🍎 ${t('fruit')}</small><b>${r1(avg('fruit'))}<span> ${t('serv')}</span></b><i>${t('target')} ${tg.fruit}</i></div>
          <div class="lim"><small>💪 ${t('protein')}</small><b>${r0(avg('protein'))}<span> g</span></b><i>${t('target')} ${tg.protein} g</i></div>
        </div></section>
      <section class="card"><div class="sec-head"><h2>💧 ${t('water')}</h2></div>
        ${barChart(P.days.map((d) => Number(S.water[d]) || 0), labels, tg.water, C.water, t('glass'), { dec: false })}</section>
      <section class="card"><div class="sec-head"><h2>${t('perMeal')}</h2></div>
        <div class="hbars">${MEALS.map((m, i) => `<div class="hbar"><span>${MEAL_EMO[m]} ${t('meal_' + m)}</span><div class="track"><i style="width:${perMeal[i] / mealMax * 100}%;background:${C.kcal}"></i></div><b>${fmtN(perMeal[i])}</b></div>`).join('')}</div>
        <p class="chart-cap">${t('perMealCap')}</p></section>
      <section class="card"><div class="sec-head"><h2>⚖️ ${t('weightTrend')}</h2><button class="btn soft sm" data-act="addWeight">${icon('plus')}${t('weigh')}</button></div>
        ${wpts.length ? lineChart(wpts, C.kcal, num(S.profile.targetWeight) || 0) + (wpts.length > 1 ? `<p class="chart-cap">${t('weightChange', { n: (wpts[wpts.length - 1].v - wpts[0].v > 0 ? '+' : '') + r1(wpts[wpts.length - 1].v - wpts[0].v) })}</p>` : '') : `<p class="muted">${t('noWeight')}</p>`}</section>
      <section class="card"><div class="sec-head"><h2>${t('moodTitle')}</h2></div>
        ${moodN ? `<div class="moods">${MOODS.map((m) => `<div class="mood-b"><span>${MOOD_EMO[m]}</span><b>${moods[m] || 0}</b><small>${t('mood_' + m)}</small></div>`).join('')}</div>` : `<p class="muted">${t('noData')}</p>`}</section>
      <section class="card"><div class="sec-head"><h2>${t('topFoods')}</h2></div>
        ${top.length ? `<ol class="top">${top.map((k) => `<li><span>${esc(k)}</span><b>${foods[k]}×</b></li>`).join('')}</ol>` : `<p class="muted">${t('noData')}</p>`}</section>
      <button class="btn soft block" data-act="openExport">${icon('download')}${t('exportExcel')}</button>
      <p class="credit">${CREDIT}</p>`;
  }

  // ---------- Profile ----------
  function viewProfile() {
    const p = S.profile, tg = targets(), kg = currentWeight(), bmi = bmiOf(kg, p.height), cat = bmiCat(bmi);
    const sw = num(p.startWeight), tw = num(p.targetWeight);
    let prog = '';
    if (p.goal !== 'keep' && sw && tw && kg) {
      const total = sw - tw, done = sw - kg, pct = total ? clamp(done / total, 0, 1) : 0;
      prog = `<div class="goal-prog"><div class="row-sb"><small>${t('start')} <b>${r1(sw)} kg</b></small><small>${t('now')} <b>${r1(kg)} kg</b></small><small>🎯 <b>${r1(tw)} kg</b></small></div>
        <div class="track big"><i style="width:${(pct * 100).toFixed(1)}%;background:linear-gradient(90deg,#7D87F5,#4F5BF0)"></i></div>
        <p class="muted small">${t('goalProg', { n: r1(Math.abs(done)), dir: done >= 0 === (p.goal === 'lose') ? t('progGood') : t('progBad'), left: r1(Math.abs(kg - tw)) })}</p></div>`;
    }
    const notes = (tg.notes || []).map((k) => `<div class="insight warn"><span>⚠️</span><div><p>${t('note_' + k)}</p></div></div>`).join('');
    const ws = sortedWeights();
    const wl = ws.slice(-8).reverse();
    return `<div class="page-head"><h1>${t('navProfile')}</h1><button class="icon-btn" data-act="openSettings" aria-label="${t('settings')}">${icon('gear')}</button></div>
      <section class="profile-card">
        <button class="av-edit" data-act="pickAvatar" aria-label="${t('changePhoto')}">${avatar(76)}<span class="av-cam">${icon('camera')}</span></button>
        <input type="file" id="avatar-file" accept="image/*" hidden data-ch="avatar">
        <div class="pc-body"><strong>${esc(p.name || t('noName'))}</strong><small>${esc(p.bio || TAGLINE)}</small>
          <div class="row"><button class="btn soft sm" data-act="editProfile">${icon('edit')}${t('editProfile')}</button></div></div>
      </section>
      <section class="tiles">
        <div class="tile blue"><span class="tile-emo">📏</span><div><b>${p.height ? r0(num(p.height)) : '–'}<small> cm</small></b><small>${t('height')}</small></div></div>
        <div class="tile lilac"><span class="tile-emo">⚖️</span><div><b>${kg ? r1(kg) : '–'}<small> kg</small></b><small>${t('weightNow')}</small></div></div>
        <div class="tile ${cat.c}"><span class="tile-emo">🧮</span><div><b>${bmi ? r1(bmi) : '–'}</b><small>BMI${cat.k ? ' · ' + t(cat.k) : ''}</small></div></div>
        <div class="tile peach"><span class="tile-emo">🎂</span><div><b>${ageOf(p.birth) || '–'}<small> ${t('yr')}</small></b><small>${t('age')}</small></div></div>
      </section>
      <section class="card">
        <div class="sec-head"><h2>🎯 ${t('myTarget')}</h2><span class="pill">${t('goal_' + p.goal)}</span></div>
        ${tg.ready ? `<div class="tgrid">
          <div><small>${t('dailyKcal')}</small><b>${fmtN(tg.kcal)} kkal</b>${tg.custom ? `<i>${t('customSet')}</i>` : ''}</div>
          <div><small>${t('tdee')}</small><b>${fmtN(tg.tdee)} kkal</b></div>
          ${p.goal === 'lose' && tg.deficit ? `<div><small>${t('deficit')}</small><b>−${fmtN(tg.deficit)} kkal</b></div><div><small>${t('perWeek')}</small><b>≈ ${r1(tg.weekly)} kg</b></div>` : ''}
          ${p.targetDate && p.goal !== 'keep' ? `<div><small>${t('targetDate')}</small><b>${fmtDate(p.targetDate, { day: 'numeric', month: 'short', year: 'numeric' })}</b></div>` : ''}
          ${tg.eta ? `<div><small>${t('eta')}</small><b>${fmtDate(tg.eta, { day: 'numeric', month: 'short', year: 'numeric' })}</b></div>` : ''}
          <div><small>${t('protein')} / ${t('carbs')} / ${t('fat')}</small><b>${tg.protein} / ${tg.carbs} / ${tg.fat} g</b></div>
          <div><small>${t('sugar')} · ${t('sodium')}</small><b>≤ ${tg.sugar} g · ≤ ${fmtN(tg.sodium)} mg</b></div>
          <div><small>${t('water')}</small><b>${tg.water} ${t('glass')} (${fmtN(tg.water * tg.waterMl)} ml)</b></div>
          <div><small>${t('fiber')}</small><b>${tg.fiber} g</b></div></div>
          ${prog}${notes}
          <p class="muted small">${t('targetNote')}</p>` : `<p class="muted">${t('needProfile')}</p>`}
        <button class="btn soft block" data-act="editProfile">${icon('target')}${t('editTarget')}</button>
      </section>
      <section class="card">
        <div class="sec-head"><h2>⚖️ ${t('weightLog')}</h2><button class="btn primary sm" data-act="addWeight">${icon('plus')}${t('weigh')}</button></div>
        ${ws.length ? lineChart(ws.map((w) => ({ d: w.date, v: num(w.kg) })), C.kcal, tw || 0) : ''}
        ${wl.length ? `<div class="wlist">${wl.map((w) => `<div class="wrow"><span>${fmtDate(w.date)}</span><b>${r1(num(w.kg))} kg</b>${w.waist ? `<small>${t('waist')} ${esc(w.waist)} cm</small>` : '<small></small>'}
          <button class="icon-btn sm danger" data-act="delWeight" data-id="${esc(w.id)}" aria-label="${t('delete')}">${icon('trash')}</button></div>`).join('')}</div>` : `<p class="muted">${t('noWeight')}</p>`}
      </section>
      <div class="menu">
        <button data-act="openFamily">${icon('users')}<span>${t('family')}</span>${icon('right', 'chev')}</button>
        <button data-act="openReminders">${icon('bell')}<span>${t('reminders')}</span>${icon('right', 'chev')}</button>
        <button data-act="openExport">${icon('download')}<span>${t('exportExcel')}</span>${icon('right', 'chev')}</button>
        <button data-act="openMyFoods">${icon('leaf')}<span>${t('myFoods')}</span>${icon('right', 'chev')}</button>
        <button data-act="openSettings">${icon('gear')}<span>${t('settings')}</span>${icon('right', 'chev')}</button>
      </div>
      <p class="credit">${CREDIT} · v${VERSION}</p>`;
  }

  /* ============ 7. SHEETS (slide-up panels) ============ */

  const wrap = $('#sheet-wrap'), sheetEl = $('#sheet'), dlgWrap = $('#dialog-wrap'), dlg = $('#dialog');
  let sheet = null, dlgOk = null;
  function openSheet(type, html) {
    sheet = { type: type };
    sheetEl.innerHTML = '<div class="grab"></div>' + html;
    if (wrap.hidden) { wrap.hidden = false; document.body.classList.add('noscroll'); requestAnimationFrame(() => wrap.classList.add('open')); sheetEl.scrollTop = 0; }
    hydratePhotos(sheetEl);
  }
  function closeSheet(now) {
    sheet = null; F = null; wrap.classList.remove('open'); document.body.classList.remove('noscroll');
    if (now) { wrap.hidden = true; return; }
    setTimeout(() => { if (!wrap.classList.contains('open')) wrap.hidden = true; }, 280);
  }
  const head = (title, extra) => `<div class="sheet-head"><h2>${title}</h2><div>${extra || ''}<button class="icon-btn" data-act="closeSheet" aria-label="${t('close')}">${icon('x')}</button></div></div>`;

  // ---------- Meal form ----------
  let F = null;   // the meal being edited
  const blankItem = () => ({ name: '', portion: '', qty: 1, kcal: 0, protein: 0, carbs: 0, fat: 0, sugar: 0, sodium: 0, fiber: 0, veg: 0, fruit: 0, foodId: '' });
  function itemFromFood(f, qty) {
    return { name: foodName(f), portion: foodPortion(f), qty: qty || 1, kcal: f.kcal, protein: f.protein, carbs: f.carbs, fat: f.fat, sugar: f.sugar,
      sodium: f.sodium, fiber: f.fiber, veg: f.veg, fruit: f.fruit, foodId: f.id };
  }
  function guessMeal(time) {
    const h = Number(String(time || nowTime()).slice(0, 2));
    return h < 10 ? 'breakfast' : h < 15 ? 'lunch' : h >= 18 ? 'dinner' : 'snack';
  }

  function openMealForm(entry, opts) {
    opts = opts || {};
    const e = entry ? JSON.parse(JSON.stringify(entry)) : null;
    const time = e ? e.time : nowTime();
    F = { id: e ? e.id : '', date: e ? e.date : (opts.date || S.day), time: time, meal: e ? e.meal : (opts.meal || guessMeal(time)),
      items: e ? e.items || [] : [], mood: e ? e.mood || '' : '', note: e ? e.note || '' : '', photo: '', hadPhoto: !!(e && e.photo),
      photoChanged: false, ai: !!(e && e.ai), busy: false, q: '', open: -1, hint: '' };
    const mealSeg = MEALS.map((m) => `<button type="button" data-act="fMeal" data-v="${m}" class="${F.meal === m ? 'on' : ''}">${MEAL_EMO[m]}<span>${t('meal_' + m)}</span></button>`).join('');
    openSheet('meal', `${head(e ? t('editMeal') : t('addMeal'), e ? `<button class="icon-btn danger" data-act="delEntry" aria-label="${t('delete')}">${icon('trash')}</button>` : '')}
      <form data-form="meal" novalidate>
        <div class="seg meal-seg" id="f-meal">${mealSeg}</div>
        <div class="grid2 mt">
          <div class="field"><label for="f-date">${t('date')}</label><input id="f-date" type="date" value="${F.date}" max="${todayStr()}"></div>
          <div class="field"><label for="f-time">${t('time')}</label><input id="f-time" type="time" value="${F.time}"></div>
        </div>
        <div class="photo-box" id="f-photo">${photoBoxHtml()}</div>
        <input type="file" id="cam-file" accept="image/*" capture="environment" hidden data-ch="mealPhoto">
        <input type="file" id="gal-file" accept="image/*" hidden data-ch="mealPhoto">
        <details class="paste" id="quick">
          <summary><span class="opt-ic sm">⌨️</span><span><b>${t('quickTitle')}</b><small>${t('quickSub')}</small></span>${icon('right', 'chev')}</summary>
          <textarea id="f-quick" rows="3" placeholder="${t('quickPh')}"></textarea>
          <div class="row"><button type="button" class="btn soft grow" data-act="quickParse">${icon('list')}${t('quickList')}</button>
            ${S.settings.aiKey ? `<button type="button" class="btn primary grow" data-act="aiText">${icon('spark')}${t('quickAi')}</button>` : ''}</div>
        </details>
        <div class="field search-field"><label>${t('searchAdd')}</label>
          <div class="search"><span>${icon('search')}</span><input type="search" id="f-search" placeholder="${t('searchPh')}" autocomplete="off" data-in="foodSearch"></div>
          <div id="f-results" class="results">${resultsHtml()}</div></div>
        <div class="sec-head sub"><h3>🍽️ ${t('items')}</h3><button type="button" class="btn link" data-act="addManual">${icon('plus')}${t('manual')}</button></div>
        <div id="f-items">${itemsHtml()}</div>
        <div id="f-total" class="f-total">${totalHtml()}</div>
        <div class="field"><label>${t('howFeel')}</label><div class="moods pick" id="f-mood">${moodPickHtml()}</div></div>
        <div class="field"><label for="f-note">${t('note')}</label><textarea id="f-note" rows="2" maxlength="300" placeholder="${t('notePh')}">${esc(F.note)}</textarea></div>
        ${e ? `<button type="button" class="btn ghost block" data-act="dupEntry">${icon('copy')}${t('eatAgain')}</button>` : ''}
        <div class="sheet-foot"><button type="button" class="btn ghost" data-act="closeSheet">${t('cancel')}</button>
          <button class="btn primary grow">${icon('check')}${t('save')}</button></div>
      </form>`);
    if (e && e.photo) photoDB.get(e.id).then((v) => { if (F && F.id === e.id && !F.photoChanged) { F.photo = v || ''; $('#f-photo').innerHTML = photoBoxHtml(); } });
  }

  function photoBoxHtml() {
    if (F.busy) return `<div class="pb-busy"><span class="spin big"></span><b>${t('aiWorking')}</b><small>${t('aiWorkingSub')}</small></div>`;
    if (F.photo) return `<div class="pb-img"><img src="${esc(F.photo)}" alt="">
        <button type="button" class="icon-btn sm pb-x" data-act="removePhoto" aria-label="${t('removePhoto')}">${icon('x')}</button></div>
      ${S.settings.aiKey ? `<button type="button" class="btn primary block" data-act="aiPhoto">${icon('spark')}${t('aiIdentify')}</button>`
        : `<button type="button" class="hint-btn" data-act="openAiSetup">${icon('spark')}<span>${t('aiNoKey')}</span>${icon('right')}</button>`}
      ${F.hint ? `<p class="hint ${F.hintBad ? 'bad' : 'ok'}">${esc(F.hint)}</p>` : ''}`;
    return `<div class="pb-empty"><span>📸</span><div><b>${t('photoTitle')}</b><small>${S.settings.aiKey ? t('photoSubAi') : t('photoSub')}</small></div></div>
      <div class="row"><button type="button" class="btn soft grow" data-act="pickCam">${icon('camera')}${t('camera')}</button>
        <button type="button" class="btn soft grow" data-act="pickGal">${icon('image')}${t('gallery')}</button></div>
      ${F.hint ? `<p class="hint ${F.hintBad ? 'bad' : 'ok'}">${esc(F.hint)}</p>` : ''}`;
  }
  function moodPickHtml() {
    return MOODS.map((m) => `<button type="button" class="mood-b ${F.mood === m ? 'on' : ''}" data-act="fMood" data-v="${m}"><span>${MOOD_EMO[m]}</span><small>${t('mood_' + m)}</small></button>`).join('');
  }

  // ----- search the food list -----
  const norm = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
  function searchFoods(q, limit) {
    q = norm(q); if (!q) return [];
    const words = q.split(' ');
    const scored = [];
    allFoods().forEach((f) => {
      const hay = norm(f.id_name + ' ' + f.en_name + ' ' + (f.keys || '').replace(/\|/g, ' '));
      if (!words.every((w) => hay.indexOf(w) >= 0)) return;
      const nm = norm(foodName(f));
      let s = 1; if (nm.indexOf(q) === 0) s += 3; else if (nm.indexOf(q) >= 0) s += 2;
      if ((f.keys || '').split('|').some((k) => norm(k) === q)) s += 4;
      if (String(f.id).indexOf('my-') === 0) s += 1;
      scored.push({ f, s: s - nm.length / 100 });
    });
    return scored.sort((a, b) => b.s - a.s).slice(0, limit || 8).map((x) => x.f);
  }
  function frequentItems() {
    const seen = {}, out = [];
    S.entries.slice().sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time)).forEach((e) => (e.items || []).forEach((i) => {
      const k = norm(i.name); if (!k) return;
      if (!seen[k]) { seen[k] = { n: 0, item: i }; }
      seen[k].n++;
    }));
    Object.keys(seen).sort((a, b) => seen[b].n - seen[a].n).slice(0, 8).forEach((k) => out.push(seen[k].item));
    return out;
  }
  function resultsHtml() {
    if (!F) return '';
    if (!F.q) {
      const fr = frequentItems();
      return fr.length ? `<div class="freq"><small>${t('frequent')}</small><div class="chips pick">${fr.map((i, n) => `<button type="button" class="chip" data-act="addFreq" data-i="${n}">${esc(i.name)}</button>`).join('')}</div></div>` : '';
    }
    const list = searchFoods(F.q, 8);
    if (!list.length) return `<div class="no-res"><span>${t('noFound', { q: esc(F.q) })}</span><button type="button" class="btn soft sm" data-act="addManual" data-name="${esc(F.q)}">${icon('plus')}${t('addAsNew')}</button></div>`;
    return list.map((f) => `<button type="button" class="res" data-act="addFood" data-id="${esc(f.id)}">
      <span><b>${esc(foodName(f))}</b><small>${esc(foodPortion(f))} · ${fmtN(f.kcal)} kkal · P ${r0(f.protein)} · K ${r0(f.carbs)} · L ${r0(f.fat)}</small></span>
      <i>${icon('plus')}</i></button>`).join('');
  }

  // ----- items in the meal -----
  function itemsHtml() {
    if (!F.items.length) return `<p class="muted small empty-items">${t('noItemsYet')}</p>`;
    return F.items.map((it, i) => {
      const x = itemTotals(it), open = F.open === i;
      const f = (k, label, unit, step) => `<label>${label}<span class="unit-in"><input type="text" inputmode="decimal" value="${r1(num(it[k]))}" data-in="itemField" data-i="${i}" data-k="${k}"><em>${unit}</em></span></label>`;
      return `<div class="item ${open ? 'open' : ''} ${!it.kcal && !open ? 'warn' : ''}">
        <div class="item-row">
          <button type="button" class="item-main" data-act="toggleItem" data-i="${i}">
            <b>${esc(it.name || t('unnamed'))}</b><small>${esc(it.portion || '')}${it.portion ? ' · ' : ''}${fmtN(x.kcal)} kkal${!it.kcal ? ' · ' + t('fillKcal') : ''}</small></button>
          <div class="qty"><button type="button" data-act="qty" data-i="${i}" data-n="-0.5" aria-label="${t('less')}">${icon('minus')}</button>
            <b>${r1(it.qty)}×</b><button type="button" data-act="qty" data-i="${i}" data-n="0.5" aria-label="${t('more')}">${icon('plus')}</button></div>
        </div>
        ${open ? `<div class="item-edit">
          <label class="wide">${t('foodName')}<input type="text" value="${esc(it.name)}" data-in="itemField" data-i="${i}" data-k="name" maxlength="60"></label>
          <label class="wide">${t('portion')}<input type="text" value="${esc(it.portion)}" data-in="itemField" data-i="${i}" data-k="portion" maxlength="40" placeholder="${t('portionPh')}"></label>
          <p class="wide muted small">${t('perPortion')}</p>
          ${f('kcal', t('kcal'), 'kkal')}${f('protein', t('protein'), 'g')}${f('carbs', t('carbs'), 'g')}${f('fat', t('fat'), 'g')}
          ${f('sugar', t('sugar'), 'g')}${f('sodium', t('sodium'), 'mg')}${f('fiber', t('fiber'), 'g')}${f('qty', t('qty'), '×')}
          ${f('veg', t('vegServ'), t('serv'))}${f('fruit', t('fruitServ'), t('serv'))}
          <div class="wide row"><button type="button" class="btn ghost sm" data-act="saveMyFood" data-i="${i}">${icon('star')}${t('saveMyFood')}</button>
            <button type="button" class="btn link danger" data-act="delItem" data-i="${i}">${icon('trash')}${t('remove')}</button></div>
        </div>` : ''}
      </div>`;
    }).join('');
  }
  function totalHtml() {
    const x = zero(); F.items.forEach((it) => { const y = itemTotals(it); NUTR.forEach((k) => { x[k] += y[k]; }); });
    if (!F.items.length) return '';
    return `<div class="ft-k"><span>${t('total')}</span><b>${fmtN(x.kcal)} kkal</b></div>
      <div class="ft-m"><span>P ${r0(x.protein)}g</span><span>K ${r0(x.carbs)}g</span><span>L ${r0(x.fat)}g</span><span>🍬 ${r0(x.sugar)}g</span><span>🧂 ${fmtN(x.sodium)}mg</span><span>🌾 ${r1(x.fiber)}g</span></div>`;
  }
  function refreshItems() { $('#f-items').innerHTML = itemsHtml(); $('#f-total').innerHTML = totalHtml(); }

  /** "nasi 1 piring, ayam goreng 2, teh manis" -> matched items from the list */
  function parseFoodText(text) {
    const words = { setengah: 0.5, separuh: 0.5, satu: 1, se: 1, dua: 2, tiga: 3, empat: 4, lima: 5, half: 0.5, one: 1, two: 2, three: 3 };
    return String(text || '').split(/\n|,|;|\+|\s&\s|\sdan\s|\sand\s|\spakai\s|\sdengan\s|\swith\s/i).map((s) => s.trim()).filter(Boolean).map((piece) => {
      let qty = 1, rest = piece;
      const m = rest.match(/(\d+(?:[.,]\d+)?|\d+\/\d+)\s*(x|×)?/i);
      if (m) { qty = m[1].indexOf('/') > 0 ? Number(m[1].split('/')[0]) / Number(m[1].split('/')[1]) : num(m[1]); rest = rest.replace(m[0], ' '); }
      else { const w = norm(rest).split(' ').find((x) => words[x] != null); if (w) { qty = words[w]; rest = norm(rest).replace(new RegExp('\\b' + w + '\\b'), ' '); } }
      const clean = norm(rest).replace(/\b(piring|mangkuk|mangkok|gelas|cup|buah|potong|ptg|porsi|bungkus|butir|sdm|sdt|centong|tusuk|lembar|keping|plate|bowl|glass|piece|pieces|slice|serving|pack)\b/g, ' ').replace(/\s+/g, ' ').trim();
      let hit = searchFoods(clean, 1)[0] || searchFoods(clean.split(' ').slice(0, 2).join(' '), 1)[0];
      if (!hit) clean.split(' ').filter((w) => w.length >= 3).sort((a, b) => b.length - a.length).some((w) => (hit = searchFoods(w, 1)[0]));
      const it = hit ? itemFromFood(hit, qty || 1) : Object.assign(blankItem(), { name: piece.trim().slice(0, 60), qty: qty || 1 });
      return it;
    });
  }

  // ----- photos -----
  function readImage(file, maxSide, quality) {
    return new Promise((res, rej) => {
      const url = URL.createObjectURL(file), img = new Image();
      img.onload = () => {
        const sc = Math.min(1, maxSide / Math.max(img.width, img.height)), c = document.createElement('canvas');
        c.width = Math.round(img.width * sc); c.height = Math.round(img.height * sc);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        URL.revokeObjectURL(url); res(c.toDataURL('image/jpeg', quality || 0.8));
      };
      img.onerror = () => { URL.revokeObjectURL(url); rej(new Error('img')); };
      img.src = url;
    });
  }

  // ----- AI (Google Gemini, with the user's own free API key) -----
  const AI_MODELS = ['gemini-flash-latest', 'gemini-2.5-flash', 'gemini-2.5-flash-lite'];
  function aiPrompt(extra) {
    return `You are a nutritionist who knows Indonesian and international food very well.
${extra ? 'The user describes the meal as: "' + extra.replace(/"/g, "'") + '".\n' : ''}Identify every separate food and drink${extra ? '' : ' visible in the photo'}. Estimate the portion actually ${extra ? 'described' : 'visible'} (not a standard portion) and its nutrition.
Use Indonesian dish names when the food is Indonesian (e.g. "Nasi goreng", "Ayam bakar", "Sayur asem").
Answer ONLY with JSON in this exact shape:
{"items":[{"name_id":"","name_en":"","portion_id":"","portion_en":"","grams":0,"kcal":0,"protein_g":0,"carbs_g":0,"fat_g":0,"sugar_g":0,"sodium_mg":0,"fiber_g":0,"vegetable_servings":0,"fruit_servings":0,"confidence":0.0}],"comment_id":"","comment_en":""}
vegetable_servings / fruit_servings: 1 serving = about 100 g of vegetables / one medium fruit. comment: one short friendly sentence about the meal's balance. If there is no food, return {"items":[]}.`;
  }
  async function aiCall(parts) {
    const key = String(S.settings.aiKey || '').trim();
    if (!key) throw new Error(t('aiNoKey'));
    const models = [S.settings.aiModel || AI_MODELS[0]].concat(AI_MODELS.filter((m) => m !== S.settings.aiModel));
    let lastErr = null;
    for (const model of models) {
      let r;
      try {
        r = await fetch('https://generativelanguage.googleapis.com/v1beta/models/' + encodeURIComponent(model) + ':generateContent', {
          method: 'POST', headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
          body: JSON.stringify({ contents: [{ parts: parts }], generationConfig: { responseMimeType: 'application/json', temperature: 0.2 } })
        });
      } catch (e) { throw new Error(t('aiOffline')); }
      if (r.status === 404) { lastErr = new Error(t('aiModelGone')); continue; }
      if (r.status === 400 || r.status === 401 || r.status === 403) { const j = await r.json().catch(() => ({})); throw new Error(/api key|API_KEY|permission/i.test(JSON.stringify(j)) ? t('aiBadKey') : t('aiFail')); }
      if (r.status === 429) throw new Error(t('aiQuota'));
      if (!r.ok) { lastErr = new Error(t('aiFail')); continue; }
      const j = await r.json();
      const txt = (((j.candidates || [])[0] || {}).content || { parts: [] }).parts.map((p) => p.text || '').join('');
      const m = txt.match(/\{[\s\S]*\}/);
      if (!m) throw new Error(t('aiFail'));
      if (model !== S.settings.aiModel) { S.settings.aiModel = model; saveSettings(); }
      return JSON.parse(m[0]);
    }
    throw lastErr || new Error(t('aiFail'));
  }
  function aiToItems(res) {
    const en = S.lang === 'en';
    return (res.items || []).filter((x) => x && (x.name_id || x.name_en)).map((x) => ({
      name: String((en ? x.name_en : x.name_id) || x.name_id || x.name_en).slice(0, 60),
      portion: String((en ? x.portion_en : x.portion_id) || x.portion_id || (x.grams ? x.grams + ' g' : '')).slice(0, 40),
      qty: 1, kcal: r0(num(x.kcal)), protein: r1(num(x.protein_g)), carbs: r1(num(x.carbs_g)), fat: r1(num(x.fat_g)), sugar: r1(num(x.sugar_g)),
      sodium: r0(num(x.sodium_mg)), fiber: r1(num(x.fiber_g)), veg: r1(num(x.vegetable_servings)), fruit: r1(num(x.fruit_servings)), foodId: 'ai',
      conf: num(x.confidence)
    }));
  }
  async function runAi(parts) {
    F.busy = true; F.hint = ''; $('#f-photo').innerHTML = photoBoxHtml();
    try {
      const res = await aiCall(parts);
      const items = aiToItems(res);
      if (!F) return;
      F.busy = false;
      if (!items.length) { F.hint = t('aiNothing'); F.hintBad = true; }
      else {
        F.items = F.items.filter((i) => i.foodId !== 'ai').concat(items); F.ai = true; F.open = -1;
        const cm = S.lang === 'en' ? res.comment_en : res.comment_id;
        F.hint = t('aiDone', { n: items.length }) + (cm ? ' ' + cm : ''); F.hintBad = false;
        refreshItems();
      }
    } catch (e) { if (!F) return; F.busy = false; F.hint = e.message; F.hintBad = true; }
    if (F) $('#f-photo').innerHTML = photoBoxHtml();
  }

  function submitMealForm() {
    F.date = $('#f-date').value || F.date; F.time = $('#f-time').value || F.time; F.note = $('#f-note').value.trim();
    const items = F.items.filter((i) => String(i.name).trim() || num(i.kcal));
    if (!items.length && !F.photo) { toast(t('needItem'), 'error'); return; }
    items.forEach((i) => { i.name = String(i.name).trim() || t('unnamed'); delete i.conf; });
    const isNew = !F.id;
    const e = { id: F.id || uid('m'), date: F.date, time: F.time, meal: F.meal, items: items, mood: F.mood, note: F.note,
      photo: !!F.photo, ai: F.ai, updated: Date.now() };
    if (isNew) { e.created = Date.now(); S.entries.push(e); }
    else { const i = S.entries.findIndex((x) => x.id === e.id); if (i >= 0) { e.created = S.entries[i].created; S.entries[i] = e; } else S.entries.push(e); }
    if (F.photo && (F.photoChanged || isNew)) photoDB.put(e.id, F.photo);
    if (!F.photo && F.hadPhoto) photoDB.del(e.id);
    persist(); closeSheet(); S.day = e.date; if (S.view !== 'history') S.view = 'today'; render();
    toast(t('saved'), 'success');
  }

  // ---------- Weight ----------
  function openWeightForm() {
    const last = sortedWeights().slice(-1)[0];
    openSheet('weight', `${head('⚖️ ' + t('weigh'))}
      <form data-form="weight" novalidate>
        <div class="field"><label for="w-date">${t('date')}</label><input id="w-date" type="date" value="${todayStr()}" max="${todayStr()}"></div>
        <div class="grid2"><div class="field"><label for="w-kg">${t('weight')} (kg)</label><input id="w-kg" type="text" inputmode="decimal" value="${last ? esc(last.kg) : esc(S.profile.startWeight)}" placeholder="60"></div>
          <div class="field"><label for="w-waist">${t('waist')} (cm)</label><input id="w-waist" type="text" inputmode="decimal" placeholder="${t('optional')}"></div></div>
        <p class="hint">${icon('info')}${t('weighTip')}</p>
        <p class="err" id="w-err"></p>
        <div class="sheet-foot"><button type="button" class="btn ghost" data-act="closeSheet">${t('cancel')}</button><button class="btn primary grow">${icon('check')}${t('save')}</button></div>
      </form>`);
  }

  // ---------- Profile edit ----------
  function openProfileForm() {
    const p = S.profile;
    openSheet('profile', `${head(t('editProfile'))}
      <form data-form="profile" novalidate>${profileFields(p, false)}
        <details class="paste"><summary><span class="opt-ic sm">⚙️</span><span><b>${t('advanced')}</b><small>${t('advancedSub')}</small></span>${icon('right', 'chev')}</summary>
          <div class="grid2"><div class="field"><label for="p-kcal">${t('customKcal')}</label><input id="p-kcal" type="text" inputmode="numeric" value="${esc(p.customKcal)}" placeholder="${t('auto')}"></div>
          <div class="field"><label for="p-glass">${t('glassSize')} (ml)</label><input id="p-glass" type="text" inputmode="numeric" value="${esc(p.glassMl)}"></div></div>
          <div class="grid2"><div class="field"><label for="p-sw">${t('startWeight')} (kg)</label><input id="p-sw" type="text" inputmode="decimal" value="${esc(p.startWeight)}"></div>
          <div class="field"><label for="p-sd">${t('startDate')}</label><input id="p-sd" type="date" value="${esc(p.startDate)}"></div></div>
        </details>
        <div class="sheet-foot"><button type="button" class="btn ghost" data-act="closeSheet">${t('cancel')}</button><button class="btn primary grow">${icon('check')}${t('save')}</button></div>
      </form>`);
  }

  // ---------- Settings ----------
  function openSettings() {
    openSheet('settings', `${head(t('settings'))}
      <div class="menu">
        <div class="menu-row">${icon('info')}<span>${t('language')}</span>${langToggle()}</div>
      </div>
      <label class="switch"><input type="checkbox" ${S.lockOnOpen ? 'checked' : ''} data-ch="lock"><i></i><span>${t('lockOnOpen')}<small>${t('lockOnOpenSub')}</small></span></label>
      <div class="menu">
        <button data-act="changePin">${icon('lock')}<span>${t('changePin')}</span>${icon('right', 'chev')}</button>
        <button data-act="openAiSetup">${icon('spark')}<span>${t('aiSetup')}</span><small class="st ${S.settings.aiKey ? 'on' : ''}">${S.settings.aiKey ? t('active') : t('off')}</small>${icon('right', 'chev')}</button>
        <button data-act="openReminders">${icon('bell')}<span>${t('reminders')}</span>${icon('right', 'chev')}</button>
        <button data-act="openMyFoods">${icon('leaf')}<span>${t('myFoods')}</span><small class="st">${S.myFoods.length}</small>${icon('right', 'chev')}</button>
      </div>
      <h3 class="menu-title">${t('dataTitle')}</h3>
      <p class="muted small pad">${t('dataNote')}${S.lastBackup ? ' ' + t('lastBackup', { d: fmtDate(ymd(new Date(S.lastBackup))) }) : ''}</p>
      <div class="menu">
        <button data-act="openExport">${icon('download')}<span>${t('exportExcel')}</span>${icon('right', 'chev')}</button>
        <button data-act="backup">${icon('file')}<span>${t('backup')}</span>${icon('right', 'chev')}</button>
        <button data-act="restore">${icon('upload')}<span>${t('restore')}</span>${icon('right', 'chev')}</button>
        <input type="file" id="restore-file" accept=".json,application/json" hidden data-ch="restore">
      </div>
      <div class="menu">
        <button data-act="lockNow">${icon('logout')}<span>${t('lockNow')}</span></button>
        <button class="danger" data-act="askErase">${icon('trash')}<span>${t('eraseAll')}</span></button>
      </div>
      <p class="credit">WellBite v${VERSION} · ${TAGLINE}<br>${CREDIT}</p>`);
  }

  function openAiSetup() {
    const s = S.settings;
    openSheet('ai', `${head('✨ ' + t('aiSetup'))}
      <p class="muted">${t('aiAbout')}</p>
      <ol class="steps">
        <li>${t('aiStep1')} <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener">aistudio.google.com/apikey</a></li>
        <li>${t('aiStep2')}</li><li>${t('aiStep3')}</li></ol>
      <form data-form="ai" novalidate>
        <div class="field"><label for="ai-key">Gemini API key</label>
          <div class="with-btn"><input id="ai-key" type="password" autocomplete="off" autocapitalize="off" spellcheck="false" value="${esc(s.aiKey)}" placeholder="AIza...">
          <button type="button" class="btn ghost" data-act="pasteKey">${icon('paste')}</button></div></div>
        <div class="field"><label for="ai-model">${t('aiModel')}</label>
          <select id="ai-model">${AI_MODELS.map((m) => `<option ${s.aiModel === m ? 'selected' : ''}>${m}</option>`).join('')}</select></div>
        <p class="hint" id="ai-msg">${icon('info')}${t('aiPrivacy')}</p>
        <div class="row"><button type="button" class="btn soft grow" data-act="aiTest">${icon('spark')}${t('aiTest')}</button>
          <button class="btn primary grow">${icon('check')}${t('save')}</button></div>
        ${s.aiKey ? `<button type="button" class="btn link danger block" data-act="aiRemove">${t('aiRemove')}</button>` : ''}
      </form>`);
  }

  function openReminders() {
    const r = S.settings.reminders;
    const ti = (k) => `<div class="field"><label for="r-${k}">${MEAL_EMO[k]} ${t('meal_' + k)}</label><input id="r-${k}" type="time" value="${esc(r[k])}"></div>`;
    const rows = MEALS.filter((m) => r[m]).map((m) => [r[m], MEAL_EMO[m] + ' ' + t('scMeal', { meal: t('meal_' + m).toLowerCase() })]);
    const every = Number(r.waterEvery) || 0;
    if (every && r.waterFrom && r.waterTo) {
      for (let m = Number(r.waterFrom.slice(0, 2)) * 60 + Number(r.waterFrom.slice(3)); m <= Number(r.waterTo.slice(0, 2)) * 60 + Number(r.waterTo.slice(3)); m += every * 60)
        rows.push([pad(Math.floor(m / 60)) + ':' + pad(m % 60), '💧 ' + t('scWater')]);
    }
    rows.sort((x, y) => x[0].localeCompare(y[0]));
    openSheet('rem', `${head('🔔 ' + t('reminders'))}
      <form data-form="rem" novalidate>
        <div class="grid2">${MEALS.map(ti).join('')}</div>
        <h3 class="menu-title">💧 ${t('water')}</h3>
        <div class="grid2"><div class="field"><label for="r-wf">${t('from')}</label><input id="r-wf" type="time" value="${esc(r.waterFrom)}"></div>
          <div class="field"><label for="r-wt">${t('to')}</label><input id="r-wt" type="time" value="${esc(r.waterTo)}"></div></div>
          <div class="field"><label for="r-we">${t('every')}</label><select id="r-we">${[0, 1, 2, 3].map((h) => `<option value="${h}" ${Number(r.waterEvery) === h ? 'selected' : ''}>${h ? h + ' ' + t('hour') : t('off')}</option>`).join('')}</select></div>
        <label class="switch"><input type="checkbox" id="r-inapp" ${S.settings.inAppRemind ? 'checked' : ''}><i></i><span>${t('inApp')}<small>${t('inAppSub')}</small></span></label>
        <button class="btn primary block big">${icon('check')}${t('save')}</button>
      </form>
      <section class="card sc-card">
        <h3>📲 ${t('scTitle')}</h3>
        <p class="muted small">${t('scAbout')}</p>
        <ol class="steps">
          <li>${t('scStep1')}</li><li>${t('scStep2')}</li><li>${t('scStep3')}</li><li>${t('scStep4')}</li><li>${t('scStep5')}</li></ol>
        <p class="muted small"><b>${t('scList')}</b></p>
        <div class="sc-list">${rows.map((x) => `<div class="sc-row"><b>${x[0]}</b><span>${esc(x[1])}</span><button type="button" class="icon-btn sm" data-act="copyText" data-v="${esc(x[1])}" aria-label="${t('copyCode')}">${icon('copy')}</button></div>`).join('')}</div>
      </section>`);
  }

  /** Hands a file to the phone: share sheet when available, otherwise a normal download. */
  async function saveFile(name, mime, data) {
    const blob = data instanceof Blob ? data : new Blob([data], { type: mime });
    try {
      const file = new File([blob], name, { type: mime });
      if (/iphone|ipad|ipod|android/i.test(navigator.userAgent) && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: name });
        return true;
      }
    } catch (err) { if (err && err.name === 'AbortError') return false; }
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = name;
    document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
    return true;
  }

  // ---------- Export to Excel ----------
  function openExport() {
    const td = todayStr(), m0 = td.slice(0, 8) + '01';
    const pm = toDate(m0); pm.setMonth(pm.getMonth() - 1); const pm0 = ymd(pm);
    const first = S.entries.reduce((a, e) => (!a || e.date < a ? e.date : a), '') || td;
    const opt = (from, to, label, on) => `<button type="button" class="chip ${on ? 'on' : ''}" data-act="exRange" data-from="${from}" data-to="${to}">${label}</button>`;
    openSheet('export', `${head('📊 ' + t('exportExcel'))}
      <p class="muted">${t('exportAbout')}</p>
      <form data-form="export" novalidate>
        <div class="chips pick" id="ex-chips">${opt(m0, td, t('thisMonth'), true)}${opt(pm0, monthEnd(pm0), t('lastMonth'))}${opt(addDays(td, -29), td, t('last30'))}${opt(first, td, t('allData'))}</div>
        <div class="grid2 mt"><div class="field"><label for="ex-from">${t('from')}</label><input id="ex-from" type="date" value="${m0}"></div>
          <div class="field"><label for="ex-to">${t('to')}</label><input id="ex-to" type="date" value="${td}"></div></div>
        <ul class="feat small"><li><span>📅</span>${t('exSheet1')}</li><li><span>🍽️</span>${t('exSheet2')}</li><li><span>⚖️</span>${t('exSheet3')}</li><li><span>🎯</span>${t('exSheet4')}</li></ul>
        <button class="btn primary block big" id="ex-btn">${icon('download')}${t('makeExcel')}</button>
      </form>`);
  }
  function loadExcelJs() {
    if (window.ExcelJS) return Promise.resolve(window.ExcelJS);
    return new Promise((res, rej) => { const s = document.createElement('script'); s.src = 'exceljs.min.js'; s.onload = () => res(window.ExcelJS); s.onerror = rej; document.head.appendChild(s); });
  }
  async function exportExcel(from, to) {
    const XL = await loadExcelJs();
    const tg = targets(), p = S.profile, en = S.lang === 'en';
    const FONT = 'Century Gothic', INK = 'FF2B3050';
    const xd = (v) => { const q = String(v).split('-'); return new Date(Date.UTC(+q[0], +q[1] - 1, +q[2])); };
    const wb = new XL.Workbook(); wb.creator = 'WellBite — ' + CREDIT; wb.created = new Date();
    const fill = (c) => ({ type: 'pattern', pattern: 'solid', fgColor: { argb: c } });
    const border = { top: { style: 'thin', color: { argb: 'FFE1E4F0' } }, bottom: { style: 'thin', color: { argb: 'FFE1E4F0' } }, left: { style: 'thin', color: { argb: 'FFE1E4F0' } }, right: { style: 'thin', color: { argb: 'FFE1E4F0' } } };
    function sheetWith(name, title, cols, rows, opts) {
      const ws = wb.addWorksheet(name, { views: [{ state: 'frozen', ySplit: 4, showGridLines: false }] });
      ws.columns = cols.map((c) => ({ width: c.w }));
      ws.mergeCells(1, 1, 1, cols.length);
      const t1 = ws.getCell(1, 1); t1.value = title; t1.font = { name: FONT, size: 15, bold: true, color: { argb: 'FF3F49D6' } };
      ws.mergeCells(2, 1, 2, cols.length);
      const t2 = ws.getCell(2, 1); t2.value = `${p.name || 'WellBite'} · ${fmtDate(from)} – ${fmtDate(to)} · ${TAGLINE}`; t2.font = { name: FONT, size: 10, color: { argb: 'FF8389A0' } };
      ws.getRow(1).height = 26; ws.getRow(3).height = 6;
      const hr = ws.getRow(4); hr.height = 30;
      cols.forEach((c, i) => { const cell = hr.getCell(i + 1); cell.value = c.h; cell.font = { name: FONT, size: 10, bold: true, color: { argb: 'FF3F49D6' } };
        cell.fill = fill('FFE6E9FF'); cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true }; cell.border = border; });
      rows.forEach((r, ri) => {
        const row = ws.getRow(5 + ri); row.height = 20;
        r.forEach((v, i) => {
          const cell = row.getCell(i + 1); cell.value = v; cell.font = { name: FONT, size: 10, color: { argb: INK } }; cell.border = border;
          cell.alignment = { vertical: 'middle', horizontal: typeof v === 'number' ? 'right' : 'left', wrapText: !!cols[i].wrap };
          if (cols[i].fmt) cell.numFmt = cols[i].fmt;
          if (ri % 2) cell.fill = fill('FFF8F9FD');
        });
        if (opts && opts.paint) opts.paint(row, r);
      });
      if (rows.length) ws.autoFilter = { from: { row: 4, column: 1 }, to: { row: 4 + rows.length, column: cols.length } };
      ws.pageSetup = { orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 0 };
      return ws;
    }
    const days = []; for (let d = from; d <= to; d = addDays(d, 1)) days.push(d);
    const okT = en ? 'On target' : 'Sesuai target', overT = en ? 'Over' : 'Berlebih', underT = en ? 'Under' : 'Kurang', noT = en ? 'Not logged' : 'Tidak dicatat';
    const dayRows = days.map((d) => {
      const x = dayTotals(d), st = !x.count ? noT : x.kcal > tg.kcal * 1.1 ? overT : x.kcal >= tg.kcal * 0.9 ? okT : underT;
      return [xd(d), x.count, r0(x.kcal), tg.kcal, r0(tg.kcal - x.kcal), r1(x.protein), r1(x.carbs), r1(x.fat), r1(x.sugar), r0(x.sodium), r1(x.fiber),
        r1(x.veg), r1(x.fruit), x.water, x.count ? dayScore(x, tg) : '', weightOn(d) && S.weights.some((w) => w.date === d) ? weightOn(d) : '', st];
    });
    const H = en ? ['Date', 'Meals', 'Calories (kcal)', 'Target (kcal)', 'Left (kcal)', 'Protein (g)', 'Carbs (g)', 'Fat (g)', 'Sugar (g)', 'Sodium (mg)', 'Fiber (g)', 'Veg (serv.)', 'Fruit (serv.)', 'Water (glasses)', 'Score', 'Weight (kg)', 'Status']
      : ['Tanggal', 'Jml makan', 'Kalori (kkal)', 'Target (kkal)', 'Sisa (kkal)', 'Protein (g)', 'Karbo (g)', 'Lemak (g)', 'Gula (g)', 'Natrium (mg)', 'Serat (g)', 'Sayur (porsi)', 'Buah (porsi)', 'Air (gelas)', 'Skor', 'Berat (kg)', 'Status'];
    const W1 = [14, 9, 12, 12, 11, 10, 10, 10, 10, 11, 9, 10, 10, 10, 8, 10, 14];
    const statusPaint = (row, r) => {
      const c = row.getCell(17), v = r[16];
      const col = v === okT ? ['FFE1F4E8', 'FF23824F'] : v === overT ? ['FFFDE8DF', 'FFC9542B'] : v === underT ? ['FFE3F1FF', 'FF2B6FD6'] : ['FFF1F2F6', 'FF8389A0'];
      c.fill = fill(col[0]); c.font = { name: FONT, size: 10, bold: true, color: { argb: col[1] } }; c.alignment = { horizontal: 'center', vertical: 'middle' };
      if (r[8] > tg.sugar) { row.getCell(9).font = { name: FONT, size: 10, bold: true, color: { argb: 'FFC9542B' } }; }
      if (r[9] > tg.sodium) { row.getCell(10).font = { name: FONT, size: 10, bold: true, color: { argb: 'FFC9542B' } }; }
    };
    const ws1 = sheetWith(en ? 'Daily summary' : 'Ringkasan Harian', en ? 'WellBite — Daily summary' : 'WellBite — Ringkasan Harian',
      H.map((h, i) => ({ h, w: W1[i], fmt: i === 0 ? 'dd mmm yyyy' : i === 9 || i === 2 || i === 3 || i === 4 ? '#,##0' : undefined })), dayRows, { paint: statusPaint });
    // totals row
    const logged = dayRows.filter((r) => r[1]);
    if (logged.length) {
      const rr = ws1.getRow(5 + dayRows.length + 1);
      const avgOf = (i) => r1(logged.reduce((s, r) => s + (Number(r[i]) || 0), 0) / logged.length);
      rr.getCell(1).value = en ? 'Average (logged days)' : 'Rata-rata (hari tercatat)';
      [2, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].forEach((i) => { rr.getCell(i + 1).value = avgOf(i); });
      rr.eachCell((c) => { c.font = { name: FONT, size: 10, bold: true, color: { argb: 'FF3F49D6' } }; c.fill = fill('FFEEF0FF'); c.border = border; });
    }
    // meal details
    const det = [];
    S.entries.filter((e) => e.date >= from && e.date <= to).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time)).forEach((e) => {
      (e.items.length ? e.items : [blankItem()]).forEach((i) => {
        const x = itemTotals(i);
        det.push([xd(e.date), e.time || '', t('meal_' + e.meal), i.name || '', i.portion || '', num(i.qty), r0(x.kcal), r1(x.protein), r1(x.carbs), r1(x.fat), r1(x.sugar), r0(x.sodium), r1(x.fiber),
          e.mood ? MOOD_EMO[e.mood] + ' ' + t('mood_' + e.mood) : '', e.note || '', e.ai ? 'AI' : (i.foodId ? (en ? 'List' : 'Daftar') : 'Manual')]);
      });
    });
    const H2 = en ? ['Date', 'Time', 'Meal', 'Food', 'Portion', 'Qty', 'kcal', 'Protein (g)', 'Carbs (g)', 'Fat (g)', 'Sugar (g)', 'Sodium (mg)', 'Fiber (g)', 'Feeling', 'Note', 'Source']
      : ['Tanggal', 'Jam', 'Waktu makan', 'Makanan', 'Porsi', 'Jumlah', 'kkal', 'Protein (g)', 'Karbo (g)', 'Lemak (g)', 'Gula (g)', 'Natrium (mg)', 'Serat (g)', 'Perasaan', 'Catatan', 'Sumber'];
    const W2 = [13, 7, 13, 26, 18, 8, 8, 10, 10, 9, 9, 11, 9, 15, 26, 9];
    sheetWith(en ? 'Meal details' : 'Detail Makanan', en ? 'WellBite — Meal details' : 'WellBite — Detail Makanan',
      H2.map((h, i) => ({ h, w: W2[i], fmt: i === 0 ? 'dd mmm yyyy' : i === 11 ? '#,##0' : undefined, wrap: i === 3 || i === 14 })), det);
    // weight
    const wr = sortedWeights().map((w, i, arr) => { const kg = num(w.kg), b = bmiOf(kg, p.height); return [xd(w.date), kg, i ? r1(kg - num(arr[i - 1].kg)) : '', w.waist ? num(w.waist) : '', b ? r1(b) : '', b ? t(bmiCat(b).k) : '']; });
    sheetWith(en ? 'Weight' : 'Berat Badan', en ? 'WellBite — Weight log' : 'WellBite — Catatan Berat Badan',
      (en ? ['Date', 'Weight (kg)', 'Change (kg)', 'Waist (cm)', 'BMI', 'BMI category'] : ['Tanggal', 'Berat (kg)', 'Perubahan (kg)', 'Lingkar pinggang (cm)', 'BMI', 'Kategori BMI']).map((h, i) => ({ h, w: [14, 12, 14, 18, 9, 20][i], fmt: i === 0 ? 'dd mmm yyyy' : undefined })), wr);
    // profile & targets
    const pr = [[t('name'), p.name || ''], [t('sex'), p.sex === 'M' ? t('male') : t('female')], [t('age'), ageOf(p.birth) || ''], [t('height') + ' (cm)', num(p.height) || ''],
      [t('weightNow') + ' (kg)', currentWeight() || ''], ['BMI', r1(bmiOf(currentWeight(), p.height)) || ''], [t('goal'), t('goal_' + p.goal)],
      [t('targetWeight') + ' (kg)', num(p.targetWeight) || ''], [t('targetDate'), p.targetDate ? xd(p.targetDate) : ''], [t('dailyKcal'), tg.kcal], [t('tdee'), r0(tg.tdee)],
      [t('protein') + ' (g)', tg.protein], [t('carbs') + ' (g)', tg.carbs], [t('fat') + ' (g)', tg.fat], [t('sugar') + ' max (g)', tg.sugar], [t('sodium') + ' max (mg)', tg.sodium],
      [t('fiber') + ' (g)', tg.fiber], [t('water') + ' (' + t('glass') + ')', tg.water], [t('vegServ'), tg.veg], [t('fruitServ'), tg.fruit]];
    const ws4 = sheetWith(en ? 'Profile & targets' : 'Profil & Target', en ? 'WellBite — Profile & daily targets' : 'WellBite — Profil & Target Harian',
      [{ h: en ? 'Item' : 'Data', w: 28 }, { h: en ? 'Value' : 'Nilai', w: 22, fmt: undefined }], pr);
    ws4.getCell(5 + 8, 2).numFmt = 'dd mmm yyyy';
    const note = ws4.getRow(5 + pr.length + 1); note.getCell(1).value = t('targetNote'); note.getCell(1).font = { name: FONT, size: 9, italic: true, color: { argb: 'FF8389A0' } };
    ws4.mergeCells(5 + pr.length + 1, 1, 5 + pr.length + 1, 2); note.height = 42; note.getCell(1).alignment = { wrapText: true, vertical: 'top' };
    const buf = await wb.xlsx.writeBuffer();
    return new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  }

  // ---------- Family sharing (no server: a link that carries the summary) ----------
  async function packShare(obj) {
    const json = JSON.stringify(obj);
    const b64 = (bytes) => { let s = ''; bytes.forEach((b) => { s += String.fromCharCode(b); }); return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); };
    if (window.CompressionStream) {
      try {
        const cs = new Blob([json]).stream().pipeThrough(new CompressionStream('deflate-raw'));
        return 'z' + b64(new Uint8Array(await new Response(cs).arrayBuffer()));
      } catch (e) { /* fall back */ }
    }
    return 'j' + b64(new TextEncoder().encode(json));
  }
  async function unpackShare(code) {
    code = String(code || '').trim(); const m = code.match(/lihat=([A-Za-z0-9_-]+)/); if (m) code = m[1];
    const kind = code[0], s = code.slice(1).replace(/-/g, '+').replace(/_/g, '/');
    const bin = atob(s + '==='.slice((s.length + 3) % 4)); const bytes = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    let json;
    if (kind === 'z') { const ds = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate-raw')); json = await new Response(ds).text(); }
    else if (kind === 'j') json = new TextDecoder().decode(bytes);
    else throw new Error('bad');
    const d = JSON.parse(json);
    if (!d || d.app !== 'wb' || !/^\d{4}-\d{2}-\d{2}$/.test(d.date) || !Array.isArray(d.e)) throw new Error('bad');
    return d;
  }
  function shareObj(date) {
    const tg = targets(), x = dayTotals(date);
    return { app: 'wb', v: 1, name: S.profile.name || 'WellBite', color: Number(S.profile.color) || 0, date: date, sent: Date.now(), tk: tg.kcal, tw: tg.water,
      tot: { k: r0(x.kcal), p: r0(x.protein), c: r0(x.carbs), f: r0(x.fat), s: r0(x.sugar), na: r0(x.sodium), fi: r1(x.fiber), v: r1(x.veg), fr: r1(x.fruit), w: x.water },
      e: dayEntries(date).map((e) => ({ m: e.meal, t: e.time, mo: e.mood || '', n: (e.note || '').slice(0, 120), i: e.items.map((i) => [String(i.name).slice(0, 40), r0(itemTotals(i).kcal)]) })) };
  }
  function shareText(o) {
    const lines = [`🥗 WellBite · ${o.name} · ${fmtDate(o.date, { weekday: 'long', day: 'numeric', month: 'long' })}`,
      `🔥 ${fmtN(o.tot.k)} / ${fmtN(o.tk)} kkal · 💧 ${o.tot.w}/${o.tw} ${t('glass')}`];
    o.e.forEach((e) => lines.push(`${MEAL_EMO[e.m]} ${e.t} ${e.i.map((i) => i[0]).join(', ')}${e.mo ? ' ' + MOOD_EMO[e.mo] : ''}`));
    return lines.join('\n');
  }
  function shareCard(o, idx) {
    const pct = o.tk ? o.tot.k / o.tk : 0;
    return `<section class="card fam-card">
      <div class="fam-head">${avatar(42, { name: o.name, color: o.color })}<div><strong>${esc(o.name)}</strong><small>${fmtDate(o.date, { weekday: 'long', day: 'numeric', month: 'long' })}</small></div>
        ${idx != null ? `<button class="icon-btn sm danger" data-act="delShare" data-i="${idx}" aria-label="${t('delete')}">${icon('trash')}</button>` : ''}</div>
      <div class="fam-k"><div class="hk-ring sm">${ring(pct, 84, C.kcal)}<div class="hk-in"><b>${fmtN(o.tot.k)}</b><small>/${fmtN(o.tk)}</small></div></div>
        <div class="fam-stats"><span>💪 ${o.tot.p} g</span><span>🍚 ${o.tot.c} g</span><span>🧈 ${o.tot.f} g</span><span>🍬 ${o.tot.s} g</span><span>🧂 ${fmtN(o.tot.na)} mg</span><span>💧 ${o.tot.w}/${o.tw}</span><span>🥦 ${o.tot.v}</span><span>🍎 ${o.tot.fr}</span></div></div>
      <div class="fam-meals">${o.e.map((e) => `<div class="fam-m"><span>${MEAL_EMO[e.m]}</span><div><b>${esc(t('meal_' + e.m))} · ${esc(e.t || '')}</b><small>${e.i.map((i) => esc(i[0]) + ' (' + fmtN(i[1]) + ')').join(', ')}</small>${e.n ? `<small class="en-note">${esc(e.n)}</small>` : ''}</div>${e.mo ? `<em>${MOOD_EMO[e.mo]}</em>` : ''}</div>`).join('') || `<p class="muted">${t('noData')}</p>`}</div>
    </section>`;
  }
  /** A neat picture of one day (to send on WhatsApp instead of a screenshot). */
  async function dayImage(date) {
    const o = shareObj(date), tg = targets();
    const W = 1080, F = '"Plus Jakarta Sans", "Poppins", system-ui, -apple-system, sans-serif';
    const meas = document.createElement('canvas').getContext('2d');
    const wrap = (txt, font, maxW, maxLines) => {
      meas.font = font; const words = String(txt).split(' '), lines = []; let cur = '';
      words.forEach((w) => { const tr = cur ? cur + ' ' + w : w; if (meas.measureText(tr).width > maxW && cur) { lines.push(cur); cur = w; } else cur = tr; });
      if (cur) lines.push(cur);
      if (lines.length > maxLines) { lines.length = maxLines; lines[maxLines - 1] = lines[maxLines - 1].replace(/\s*\S*$/, '') + '…'; }
      return lines;
    };
    const itemFont = `500 30px ${F}`;
    const mealBlocks = o.e.map((e) => ({ e, lines: wrap(e.i.map((i) => i[0]).join(', ') + (e.n ? ' — ' + e.n : ''), itemFont, 760, 3) }));
    const mealsH = mealBlocks.reduce((h, b) => h + 92 + b.lines.length * 40, 0) || 90;
    const H = Math.max(1080, 900 + mealsH + 110);
    const c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d');
    const rr = (X, Y, w, h, r, fill) => { x.beginPath(); x.moveTo(X + r, Y); x.arcTo(X + w, Y, X + w, Y + h, r); x.arcTo(X + w, Y + h, X, Y + h, r); x.arcTo(X, Y + h, X, Y, r); x.arcTo(X, Y, X + w, Y, r); x.closePath(); x.fillStyle = fill; x.fill(); };
    x.fillStyle = '#F3F5FB'; x.fillRect(0, 0, W, H);
    const g = x.createLinearGradient(0, 0, W, 360); g.addColorStop(0, '#5D6BF6'); g.addColorStop(1, '#7B57EC');
    x.fillStyle = g; x.fillRect(0, 0, W, 380);
    try { const img = new Image(); img.src = LOGO_URL; await img.decode(); x.drawImage(img, 64, 56, 104, 104); } catch (e) { /* logo optional */ }
    x.fillStyle = '#fff'; x.font = `800 50px ${F}`; x.fillText('WellBite', 192, 112);
    x.globalAlpha = .85; x.font = `600 24px ${F}`; x.fillText(TAGLINE.toUpperCase(), 194, 150); x.globalAlpha = 1;
    x.font = `800 46px ${F}`; x.fillText(t('imgTitle', { name: o.name }), 64, 252);
    x.globalAlpha = .9; x.font = `500 30px ${F}`; x.fillText(fmtDate(date, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }), 64, 300); x.globalAlpha = 1;
    // calories card
    rr(48, 340, W - 96, 470, 36, '#FFFFFF');
    const cx = 230, cy = 560, R = 132, pct = o.tk ? o.tot.k / o.tk : 0, over = pct > 1.02;
    x.lineWidth = 34; x.lineCap = 'round';
    x.strokeStyle = over ? '#FBE3D8' : '#E9ECF6'; x.beginPath(); x.arc(cx, cy, R, 0, Math.PI * 2); x.stroke();
    if (pct > 0) { x.strokeStyle = over ? '#EC6F45' : '#4F5BF0'; x.beginPath(); x.arc(cx, cy, R, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * Math.min(pct, 1)); x.stroke(); }
    x.textAlign = 'center'; x.fillStyle = '#1F2437'; x.font = `800 58px ${F}`; x.fillText(fmtN(o.tot.k), cx, cy + 10);
    x.fillStyle = '#8389A0'; x.font = `600 24px ${F}`; x.fillText(t('of') + ' ' + fmtN(o.tk) + ' kkal', cx, cy + 50); x.textAlign = 'left';
    const left = o.tk - o.tot.k;
    x.fillStyle = '#8389A0'; x.font = `600 26px ${F}`; x.fillText(left >= 0 ? (date === todayStr() ? t('kcalLeft') : t('kcalLeftDay')) : t('kcalOver'), 420, 430);
    x.fillStyle = left >= 0 ? '#23824F' : '#C9542B'; x.font = `800 60px ${F}`; x.fillText(fmtN(Math.abs(left)) + ' kkal', 420, 496);
    const chips = [['💪', t('protein'), o.tot.p + ' g'], ['🍚', t('carbs'), o.tot.c + ' g'], ['🧈', t('fat'), o.tot.f + ' g'], ['🍬', t('sugar'), o.tot.s + ' g', o.tot.s > tg.sugar],
      ['🧂', t('sodium'), fmtN(o.tot.na) + ' mg', o.tot.na > tg.sodium], ['💧', t('water'), o.tot.w + '/' + o.tw], ['🥦', t('veg'), String(o.tot.v)], ['🍎', t('fruit'), String(o.tot.fr)]];
    chips.forEach((ch, i) => {
      const X = 420 + (i % 2) * 290, Y = 530 + Math.floor(i / 2) * 64;
      rr(X, Y, 274, 52, 16, ch[3] ? '#FDEFE8' : '#F3F5FB');
      x.font = `500 26px ${F}`; x.fillStyle = '#4A5068'; x.fillText(ch[0] + ' ' + ch[1], X + 14, Y + 35);
      x.font = `800 26px ${F}`; x.fillStyle = ch[3] ? '#C9542B' : '#1F2437'; x.textAlign = 'right'; x.fillText(ch[2], X + 260, Y + 35); x.textAlign = 'left';
    });
    // meals
    let y = 850;
    x.fillStyle = '#1F2437'; x.font = `800 36px ${F}`; x.fillText('🍽️ ' + t('imgMeals'), 64, y); y += 30;
    mealBlocks.forEach((b) => {
      const h = 72 + b.lines.length * 40;
      rr(48, y, W - 96, h, 28, '#FFFFFF');
      x.font = `400 44px ${F}`; x.fillText(MEAL_EMO[b.e.m], 76, y + 64);
      x.fillStyle = '#1F2437'; x.font = `700 32px ${F}`; x.fillText(t('meal_' + b.e.m) + (b.e.t ? ' · ' + b.e.t : ''), 150, y + 52);
      const kc = b.e.i.reduce((s2, i) => s2 + i[1], 0);
      x.textAlign = 'right'; x.fillStyle = '#4F5BF0'; x.font = `800 30px ${F}`; x.fillText(fmtN(kc) + ' kkal' + (b.e.mo ? '  ' + MOOD_EMO[b.e.mo] : ''), W - 76, y + 52); x.textAlign = 'left';
      x.fillStyle = '#4A5068'; x.font = itemFont; b.lines.forEach((ln, i) => x.fillText(ln, 150, y + 96 + i * 40));
      y += h + 20;
    });
    if (!mealBlocks.length) { x.fillStyle = '#8389A0'; x.font = itemFont; x.fillText(t('noData'), 64, y + 50); }
    x.fillStyle = '#8389A0'; x.font = `600 24px ${F}`; x.textAlign = 'center'; x.fillText(CREDIT + ' · ' + TAGLINE, W / 2, H - 50);
    return new Promise((res) => c.toBlob(res, 'image/png'));
  }

  function openFamily() {
    const people = {};
    S.family.forEach((o, i) => { (people[o.name] = people[o.name] || []).push(Object.assign({ idx: i }, o)); });
    const names = Object.keys(people);
    if (S.famSel && !people[S.famSel]) S.famSel = '';
    const sel = S.famSel || names[0] || '';
    const list = sel ? people[sel].sort((a, b) => b.date.localeCompare(a.date)) : [];
    openSheet('family', `${head('👨‍👩‍👧 ' + t('family'))}
      <p class="muted">${t('famAbout')}</p>
      <div class="row mt"><button class="btn primary grow" data-act="shareDay" data-date="${todayStr()}">${icon('share')}${t('sendLink')}</button>
        <button class="btn soft grow" data-act="shareImg" data-date="${todayStr()}">${icon('image')}${t('sendImg')}</button></div>
      <details class="paste mt" ${S.family.length ? '' : 'open'}><summary><span class="opt-ic sm">📥</span><span><b>${t('famReceive')}</b><small>${t('famReceiveSub')}</small></span>${icon('right', 'chev')}</summary>
        <textarea id="fam-code" rows="3" placeholder="${t('famPastePh')}"></textarea>
        <div class="row"><button type="button" class="btn ghost" data-act="famPaste">${icon('paste')}${t('paste')}</button><button type="button" class="btn primary grow" data-act="famAdd">${icon('check')}${t('famSave')}</button></div>
      </details>
      ${names.length > 1 ? `<div class="chips mt">${names.map((n) => `<button class="chip ${n === sel ? 'on' : ''}" data-act="famPick" data-v="${esc(n)}">${esc(n)}</button>`).join('')}</div>` : ''}
      <div class="fam-list">${list.map((o) => shareCard(o, o.idx)).join('') || ''}</div>
      <p class="hint">${icon('info')}${t('famLive')}</p>`);
  }

  // ---------- My foods ----------
  function openMyFoods(edit) {
    const f = edit || null;
    const fld = (k, label, unit, v) => `<label>${label}<span class="unit-in"><input type="text" inputmode="decimal" id="mf-${k}" value="${v == null ? '' : esc(v)}"><em>${unit}</em></span></label>`;
    openSheet('myfoods', `${head('⭐ ' + t('myFoods'))}
      <p class="muted">${t('myFoodsAbout')}</p>
      <form data-form="myfood" class="item-edit card" novalidate>
        <input type="hidden" id="mf-id" value="${f ? esc(f.id) : ''}">
        <label class="wide">${t('foodName')}<input type="text" id="mf-name" maxlength="60" value="${f ? esc(f.id_name) : ''}" placeholder="${t('myFoodPh')}"></label>
        <label class="wide">${t('portion')}<input type="text" id="mf-portion" maxlength="40" value="${f ? esc(f.id_portion) : ''}" placeholder="${t('portionPh')}"></label>
        ${fld('kcal', t('kcal'), 'kkal', f && f.kcal)}${fld('protein', t('protein'), 'g', f && f.protein)}${fld('carbs', t('carbs'), 'g', f && f.carbs)}${fld('fat', t('fat'), 'g', f && f.fat)}
        ${fld('sugar', t('sugar'), 'g', f && f.sugar)}${fld('sodium', t('sodium'), 'mg', f && f.sodium)}${fld('fiber', t('fiber'), 'g', f && f.fiber)}${fld('veg', t('vegServ'), t('serv'), f && f.veg)}
        ${fld('fruit', t('fruitServ'), t('serv'), f && f.fruit)}
        <div class="wide row"><button class="btn primary grow">${icon('check')}${f ? t('save') : t('addFood')}</button></div>
      </form>
      <div class="mf-list">${S.myFoods.map((x) => `<div class="wrow"><span><b>${esc(x.id_name)}</b><small>${esc(x.id_portion)} · ${fmtN(x.kcal)} kkal</small></span>
        <button class="icon-btn sm" data-act="editMyFood" data-id="${esc(x.id)}">${icon('edit')}</button>
        <button class="icon-btn sm danger" data-act="delMyFood" data-id="${esc(x.id)}">${icon('trash')}</button></div>`).join('') || `<p class="muted small">${t('myFoodsEmpty')}</p>`}</div>`);
  }
  function myFoodFrom(it) {
    return { id: 'my-' + uid(''), id_name: it.name, en_name: it.name, keys: norm(it.name), id_portion: it.portion || '1 porsi', en_portion: it.portion || '1 serving', grams: 0,
      kcal: num(it.kcal), protein: num(it.protein), carbs: num(it.carbs), fat: num(it.fat), sugar: num(it.sugar), sodium: num(it.sodium), fiber: num(it.fiber), group: 'my', veg: num(it.veg), fruit: num(it.fruit) };
  }

  // ---------- Dialogs & toast ----------
  function openDialog(html, onOk) { dlg.innerHTML = html; dlgOk = onOk; dlgWrap.hidden = false; requestAnimationFrame(() => dlgWrap.classList.add('open')); }
  function closeDialog() { dlgWrap.classList.remove('open'); dlgOk = null; setTimeout(() => { if (!dlgWrap.classList.contains('open')) dlgWrap.hidden = true; }, 200); }
  function confirmBox(title, body, okText, onOk, danger) {
    openDialog(`<h2>${title}</h2><p>${body}</p><div class="row"><button class="btn ghost grow" data-act="dlgNo">${t('cancel')}</button>
      <button class="btn ${danger ? 'dangerfill' : 'primary'} grow" data-act="dlgYes">${okText}</button></div>`, onOk);
  }
  let toastT = 0;
  function toast(msg, type) {
    const el = $('#toast');
    el.className = 'toast ' + (type || 'info');
    el.innerHTML = icon(type === 'error' ? 'x' : type === 'success' ? 'check' : 'info') + '<span>' + esc(msg) + '</span>';
    requestAnimationFrame(() => el.classList.add('show'));
    clearTimeout(toastT); toastT = setTimeout(() => el.classList.remove('show'), type === 'error' ? 4200 : 2600);
  }

  // ---------- Read-only viewer for a shared link (works without installing / PIN) ----------
  async function showViewer(code) {
    try {
      const o = await unpackShare(code);
      showGate(`<div class="gate-top">${logo()}${langToggle()}</div>
        <div class="viewer"><p class="tagline">${t('viewerTitle', { name: esc(o.name) })}</p>${shareCard(o, null)}
        <div class="card"><h3>📥 ${t('viewerSave')}</h3><p class="muted small">${t('viewerSaveSub')}</p>
          <button class="btn primary block" data-act="copyText" data-v="${esc(location.href)}">${icon('copy')}${t('copyLink')}</button></div></div>`);
    } catch (e) {
      showGate(`<div class="gate-top">${logo()}</div><div class="gate-body"><h1>${t('viewerBad')}</h1><p class="muted">${t('viewerBadSub')}</p></div>`);
    }
  }

  /* ============ 8. ACTIONS & START-UP ============ */

  const findEntry = (id) => S.entries.find((e) => e.id === id);
  const A = {
    lang(el) {
      S.lang = el.dataset.lang; store.set('wb_lang', S.lang); document.documentElement.lang = S.lang;
      if (!gate.hidden) {
        if (/^#lihat=/.test(location.hash)) { showViewer(location.hash); return; }
        ({ invite: showInvite, welcome: showWelcome, setup: showSetup }[pin.mode] || renderPin)(); return;
      }
      render(); if (sheet && sheet.type === 'settings') openSettings();
    },
    startPin() { showPin('create'); },
    digit(el) {
      if (pin.busy || pin.buf.length >= 4) return;
      pin.buf += el.dataset.d; if (pin.msg) { pin.msg = ''; const m = $('#pin-msg'); if (m) m.textContent = ''; }
      pinDots(); if (pin.buf.length === 4) { pin.busy = true; setTimeout(() => { pin.busy = false; submitPin(); }, 140); }
    },
    pinDel() { if (pin.busy) return; pin.buf = pin.buf.slice(0, -1); pinDots(); },
    pinBack() { if (pin.mode === 'change') enterApp(); else if (pin.mode === 'create') showWelcome(); else showPin('unlock'); },
    forgot() { showPin('reset'); },
    recDone() { enterApp(); },
    async copyText(el) {
      const v = el.dataset.v;
      try { await navigator.clipboard.writeText(v); toast(t('copied'), 'success'); }
      catch (e) { const ta = document.createElement('textarea'); ta.value = v; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); toast(t('copied'), 'success'); } catch (x) { /* ignore */ } ta.remove(); }
    },
    askErase() {
      confirmBox(t('eraseQ'), t('eraseSub'), t('delete'), () => {
        Object.keys(localStorage).filter((k) => k.indexOf('wb_') === 0 && k !== 'wb_invite' && k !== 'wb_lang').forEach((k) => store.del(k));
        photoDB.clear().then(() => setTimeout(() => location.reload(), 200));
      }, true);
    },
    skipSetup() { S.profile.setupDone = true; saveProfile(); enterApp(); },
    setGoal(el) {
      $$('[data-act="setGoal"]').forEach((b) => b.classList.toggle('on', b === el));
      $('#p-goal').value = el.dataset.v; const x = $('#goal-extra'); if (x) x.hidden = el.dataset.v === 'keep';
    },
    go(el) { S.view = el.dataset.view; if (S.view === 'today' && el.closest('#nav')) S.day = todayStr(); closeSheet(true); render(); },
    addMeal(el) { openMealForm(null, { meal: el && el.dataset.meal, date: S.view === 'today' ? S.day : todayStr() }); },
    openEntry(el) { const e = findEntry(el.dataset.id); if (e) openMealForm(e); },
    dayNav(el) { const d = addDays(S.day, Number(el.dataset.n)); if (d <= todayStr()) { S.day = d; renderView(); } },
    setWater(el) { const n = Number(el.dataset.n); S.water[S.day] = n; if (!n) delete S.water[S.day]; persist(); renderView(); },
    water(el) { const n = Math.max(0, (Number(S.water[S.day]) || 0) + Number(el.dataset.n)); S.water[S.day] = n; if (!n) delete S.water[S.day]; persist(); renderView();
      if (Number(el.dataset.n) > 0 && n === targets().water) toast(t('waterDone'), 'success'); },
    async shareDay(el) {
      const date = el.dataset.date || todayStr();
      if (!dayEntries(date).length) { toast(t('shareNothing'), 'error'); return; }
      const o = shareObj(date), code = await packShare(o);
      const url = location.href.split('#')[0].split('?')[0] + '#lihat=' + code;
      const text = shareText(o) + '\n\n' + t('shareOpen');
      try { if (navigator.share) { await navigator.share({ title: 'WellBite', text: text, url: url }); return; } } catch (e) { if (e && e.name === 'AbortError') return; }
      location.href = 'https://wa.me/?text=' + encodeURIComponent(text + '\n' + url);
    },
    async shareImg(el) {
      const date = el.dataset.date || todayStr();
      if (!dayEntries(date).length) { toast(t('shareNothing'), 'error'); return; }
      const old = el.innerHTML; el.disabled = true; el.innerHTML = '<span class="spin"></span>';
      try { const blob = await dayImage(date); await saveFile('WellBite_' + (S.profile.name || 'ringkasan').replace(/\W+/g, '') + '_' + date + '.png', 'image/png', blob); }
      catch (e) { toast(t('imgFail'), 'error'); }
      el.disabled = false; el.innerHTML = old;
    },
    openFamily() { openFamily(); },
    async famPaste() { try { const v = await navigator.clipboard.readText(); if (v) $('#fam-code').value = v.trim(); } catch (e) { $('#fam-code').focus(); } },
    async famAdd() {
      const v = $('#fam-code').value;
      try {
        const o = await unpackShare(v);
        S.family = S.family.filter((x) => !(x.name === o.name && x.date === o.date));
        S.family.push(o); S.family.sort((a, b) => b.date.localeCompare(a.date)); S.family = S.family.slice(0, 120);
        S.famSel = o.name; persist(); openFamily(); render(); toast(t('famSaved', { name: o.name }), 'success');
      } catch (e) { toast(t('famBad'), 'error'); }
    },
    famPick(el) { S.famSel = el.dataset.v; openFamily(); },
    delShare(el) { S.family.splice(Number(el.dataset.i), 1); persist(); openFamily(); render(); },
    hFilter(el) { S.hist[el.dataset.k] = el.dataset.v; renderView(); },
    hToggle() { S.hist.open = !S.hist.open; renderView(); },
    hClear() { S.hist = { q: '', meal: 'all', mood: 'all', from: '', to: '', open: false }; renderView(); },
    dPeriod(el) { S.dash.period = el.dataset.v; renderView(); },
    dNav(el) {
      const n = Number(el.dataset.n), a = S.dash.anchor;
      if (S.dash.period === 'week') S.dash.anchor = addDays(a, 7 * n);
      else { const d = toDate(a.slice(0, 8) + '01'); d.setMonth(d.getMonth() + n); S.dash.anchor = ymd(d); }
      if (S.dash.anchor > todayStr()) S.dash.anchor = todayStr();
      renderView();
    },
    addWeight() { openWeightForm(); },
    delWeight(el) { confirmBox(t('delWeightQ'), '', t('delete'), () => { S.weights = S.weights.filter((w) => w.id !== el.dataset.id); persist(); renderView(); }, true); },
    pickAvatar() { $('#avatar-file').click(); },
    editProfile() { openProfileForm(); },
    openSettings() { openSettings(); },
    openReminders() { openReminders(); },
    openExport() { openExport(); },
    openMyFoods() { openMyFoods(); },
    openAiSetup() { if (F && sheet && sheet.type === 'meal') { confirmBox(t('aiSetup'), t('aiLeaveForm'), t('continue'), () => openAiSetup()); return; } openAiSetup(); },
    closeSheet() { closeSheet(); },
    dlgNo() { closeDialog(); },
    dlgYes() { const fn = dlgOk; closeDialog(); if (fn) fn(); },
    // meal form
    fMeal(el) { F.meal = el.dataset.v; $$('#f-meal button').forEach((b) => b.classList.toggle('on', b === el)); },
    fMood(el) { F.mood = F.mood === el.dataset.v ? '' : el.dataset.v; $('#f-mood').innerHTML = moodPickHtml(); },
    pickCam() { $('#cam-file').click(); },
    pickGal() { $('#gal-file').click(); },
    removePhoto() { F.photo = ''; F.photoChanged = true; F.hint = ''; $('#f-photo').innerHTML = photoBoxHtml(); },
    aiPhoto() { if (!F.photo) return; runAi([{ text: aiPrompt('') }, { inline_data: { mime_type: 'image/jpeg', data: F.photo.split(',')[1] } }]); },
    aiText() {
      const v = $('#f-quick').value.trim(); if (!v) { $('#f-quick').focus(); return; }
      const parts = [{ text: aiPrompt(v) }]; if (F.photo) parts.push({ inline_data: { mime_type: 'image/jpeg', data: F.photo.split(',')[1] } });
      $('#quick').open = false; runAi(parts); $('#f-photo').scrollIntoView({ behavior: 'smooth', block: 'center' });
    },
    quickParse() {
      const v = $('#f-quick').value.trim(); if (!v) { $('#f-quick').focus(); return; }
      const items = parseFoodText(v); F.items = F.items.concat(items);
      const miss = items.filter((i) => !i.foodId).length;
      $('#f-quick').value = ''; $('#quick').open = false; F.open = miss ? F.items.indexOf(items.find((i) => !i.foodId)) : -1; refreshItems();
      toast(miss ? t('quickMiss', { n: miss }) : t('quickOk', { n: items.length }), miss ? 'info' : 'success');
    },
    addFreq(el) { const it = frequentItems()[Number(el.dataset.i)]; if (it) { F.items.push(Object.assign({}, it, { qty: 1 })); refreshItems(); toast(t('added', { name: it.name }), 'success'); } },
    addFood(el) {
      const f = allFoods().find((x) => x.id === el.dataset.id); if (!f) return;
      F.items.push(itemFromFood(f, 1)); F.q = ''; const s = $('#f-search'); if (s) s.value = '';
      $('#f-results').innerHTML = resultsHtml(); refreshItems(); toast(t('added', { name: foodName(f) }), 'success');
    },
    addManual(el) {
      F.items.push(Object.assign(blankItem(), { name: (el && el.dataset.name) || '', portion: S.lang === 'en' ? '1 serving' : '1 porsi' }));
      F.open = F.items.length - 1; F.q = ''; const s = $('#f-search'); if (s) s.value = ''; $('#f-results').innerHTML = resultsHtml(); refreshItems();
      const inp = $$('#f-items .item.open input')[0]; if (inp) inp.focus();
    },
    toggleItem(el) { const i = Number(el.dataset.i); F.open = F.open === i ? -1 : i; refreshItems(); },
    qty(el) { const it = F.items[Number(el.dataset.i)]; it.qty = Math.max(0.5, r1(num(it.qty) + Number(el.dataset.n))); refreshItems(); },
    delItem(el) { F.items.splice(Number(el.dataset.i), 1); F.open = -1; refreshItems(); },
    saveMyFood(el) {
      const it = F.items[Number(el.dataset.i)]; if (!it || !String(it.name).trim()) { toast(t('needName'), 'error'); return; }
      const ex = S.myFoods.find((f) => norm(f.id_name) === norm(it.name));
      const nf = myFoodFrom(it); if (ex) nf.id = ex.id;
      S.myFoods = S.myFoods.filter((f) => f.id !== nf.id).concat([nf]); persist(); toast(t('myFoodSaved', { name: it.name }), 'success');
    },
    delEntry() {
      confirmBox(t('delMealQ'), t('delMealSub'), t('delete'), () => {
        const id = F.id; S.entries = S.entries.filter((e) => e.id !== id); photoDB.del(id); persist(); closeSheet(); render(); toast(t('deleted'), 'info');
      }, true);
    },
    dupEntry() {
      const src = findEntry(F.id); if (!src) return;
      const e = JSON.parse(JSON.stringify(src)); e.id = uid('m'); e.date = todayStr(); e.time = nowTime(); e.meal = guessMeal(e.time); e.photo = false; e.created = e.updated = Date.now(); e.mood = ''; e.note = '';
      S.entries.push(e); persist(); closeSheet(); S.day = e.date; S.view = 'today'; render(); toast(t('dupDone'), 'success');
    },
    changePin() { closeSheet(true); showPin('change'); },
    lockNow() { closeSheet(true); showPin('unlock'); },
    async backup() {
      const photos = await photoDB.all();
      const data = { app: 'WellBite', version: VERSION, exportedAt: new Date().toISOString(), profile: S.profile,
        settings: Object.assign({}, S.settings, { aiKey: '' }), entries: S.entries, water: S.water, weights: S.weights, myFoods: S.myFoods, family: S.family, photos: photos };
      const ok = await saveFile('wellbite-backup-' + todayStr() + '.json', 'application/json', JSON.stringify(data));
      if (ok) { S.lastBackup = Date.now(); store.set('wb_backup', S.lastBackup); toast(t('backupDone'), 'success'); }
    },
    restore() { $('#restore-file').click(); },
    async pasteKey() { try { const v = await navigator.clipboard.readText(); if (v) $('#ai-key').value = v.trim(); } catch (e) { $('#ai-key').focus(); } },
    async aiTest(el) {
      const key = $('#ai-key').value.trim(), model = $('#ai-model').value, msg = $('#ai-msg');
      if (!key) { $('#ai-key').focus(); return; }
      const old = { k: S.settings.aiKey, m: S.settings.aiModel }; S.settings.aiKey = key; S.settings.aiModel = model;
      el.disabled = true; el.innerHTML = '<span class="spin"></span>' + t('aiTesting');
      try {
        const res = await aiCall([{ text: aiPrompt('1 piring nasi goreng dengan telur ceplok dan segelas es teh manis') }]);
        const its = aiToItems(res);
        msg.className = 'hint ok'; msg.innerHTML = icon('check') + esc(t('aiTestOk', { list: its.map((i) => i.name + ' ' + i.kcal + ' kkal').join(', ') }));
      } catch (e) { msg.className = 'hint bad'; msg.innerHTML = icon('x') + esc(e.message); }
      S.settings.aiKey = old.k; if (S.settings.aiModel === model) S.settings.aiModel = old.m || model;
      el.disabled = false; el.innerHTML = icon('spark') + t('aiTest');
    },
    aiRemove() { S.settings.aiKey = ''; saveSettings(); openAiSetup(); toast(t('aiRemoved'), 'info'); },
    exRange(el) { $$('#ex-chips .chip').forEach((c) => c.classList.toggle('on', c === el)); $('#ex-from').value = el.dataset.from; $('#ex-to').value = el.dataset.to; },
    editMyFood(el) { openMyFoods(S.myFoods.find((f) => f.id === el.dataset.id)); },
    delMyFood(el) { S.myFoods = S.myFoods.filter((f) => f.id !== el.dataset.id); persist(); openMyFoods(); }
  };

  // change events
  const CH = {
    day(el) { if (el.value && el.value <= todayStr()) { S.day = el.value; renderView(); } },
    hFrom(el) { S.hist.from = el.value; $('#hist-list').innerHTML = historyListHtml(); hydratePhotos($('#hist-list')); },
    hTo(el) { S.hist.to = el.value; $('#hist-list').innerHTML = historyListHtml(); hydratePhotos($('#hist-list')); },
    lock(el) { S.lockOnOpen = el.checked; store.set('wb_lock', S.lockOnOpen); },
    async avatar(el) {
      const file = el.files && el.files[0]; if (!file) return;
      try {
        const url = await readImage(file, 600, 0.85), img = new Image();
        img.onload = () => {
          const side = Math.min(img.width, img.height), c = document.createElement('canvas'); c.width = c.height = 256;
          c.getContext('2d').drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, 256, 256);
          S.profile.photo = c.toDataURL('image/jpeg', 0.85); saveProfile(); render();
        };
        img.src = url;
      } catch (e) { toast(t('photoBad'), 'error'); }
      el.value = '';
    },
    async mealPhoto(el) {
      const file = el.files && el.files[0]; el.value = ''; if (!file || !F) return;
      try {
        F.photo = await readImage(file, 900, 0.78); F.photoChanged = true; F.hint = '';
        $('#f-photo').innerHTML = photoBoxHtml();
        if (S.settings.aiKey) A.aiPhoto();
      } catch (e) { toast(t('photoBad'), 'error'); }
    },
    restore(el) {
      const file = el.files && el.files[0]; if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        let d = null; try { d = JSON.parse(reader.result); } catch (e) { d = null; } el.value = '';
        if (!d || d.app !== 'WellBite' || !Array.isArray(d.entries)) { toast(t('restoreBad'), 'error'); return; }
        confirmBox(t('restoreQ'), t('restoreSub', { n: d.entries.length }), t('restore'), async () => {
          const keepKey = S.settings.aiKey;
          S.profile = Object.assign({}, DEF_PROFILE, d.profile || {}, { setupDone: true });
          S.settings = Object.assign({}, DEF_SETTINGS, d.settings || {}, { aiKey: keepKey });
          S.entries = d.entries.filter((e) => e && e.id && /^\d{4}-\d{2}-\d{2}$/.test(e.date));
          S.water = d.water || {}; S.weights = d.weights || []; S.myFoods = d.myFoods || []; S.family = d.family || [];
          persist(); saveProfile(); saveSettings();
          const ph = d.photos || {}; for (const k of Object.keys(ph)) { if (/^data:image\//.test(ph[k])) await photoDB.put(k, ph[k]); }
          closeSheet(); render(); toast(t('restoreDone'), 'success');
        });
      };
      reader.readAsText(file);
    }
  };

  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('backdrop')) { if (e.target.parentNode === wrap) closeSheet(); else closeDialog(); return; }
    const el = e.target.closest('[data-act]');
    if (!el || el.disabled) return;
    const fn = A[el.dataset.act];
    if (fn) { if (el.tagName === 'BUTTON' && el.type !== 'submit') e.preventDefault(); fn(el, e); }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { if (!dlgWrap.hidden) closeDialog(); else if (sheet) closeSheet(); return; }
    if (!gate.hidden && ['new', 'confirm', 'enter', 'old'].indexOf(pin.step) >= 0) {
      if (/^\d$/.test(e.key)) A.digit({ dataset: { d: e.key } });
      if (e.key === 'Backspace') A.pinDel();
    }
    if (e.key === 'Enter' && e.target.id === 'f-search') { e.preventDefault(); const first = $('#f-results .res'); if (first) first.click(); }
  });
  document.addEventListener('change', (e) => { const k = e.target.dataset && e.target.dataset.ch; if (k && CH[k]) CH[k](e.target); });
  document.addEventListener('input', (e) => {
    const k = e.target.dataset && e.target.dataset.in;
    if (k === 'hSearch') { S.hist.q = e.target.value; $('#hist-list').innerHTML = historyListHtml(); hydratePhotos($('#hist-list')); }
    if (k === 'foodSearch' && F) { F.q = e.target.value; $('#f-results').innerHTML = resultsHtml(); }
    if (k === 'itemField' && F) {
      const it = F.items[Number(e.target.dataset.i)], key = e.target.dataset.k; if (!it) return;
      it[key] = key === 'name' || key === 'portion' ? e.target.value : num(e.target.value);
      if (key !== 'name' && key !== 'portion') it.foodId = it.foodId === 'ai' ? 'ai' : '';
      $('#f-total').innerHTML = totalHtml();
      const row = e.target.closest('.item'); if (row) { const x = itemTotals(it), sm = $('.item-main small', row); if (sm) sm.textContent = (it.portion ? it.portion + ' · ' : '') + fmtN(x.kcal) + ' kkal'; const b = $('.item-main b', row); if (b) b.textContent = it.name || t('unnamed'); }
    }
  });
  document.addEventListener('submit', (e) => {
    const f = e.target.dataset && e.target.dataset.form; if (!f) return;
    e.preventDefault();
    if (f === 'invite') {
      const code = $('#invite-code').value, btn = $('button', e.target);
      if (btn) { btn.disabled = true; btn.innerHTML = '<span class="spin"></span>' + t('checking'); }
      setTimeout(() => {
        const h = window.AKHash.inviteHash(code);
        if (code.trim() && inviteList().indexOf(h) >= 0) { store.set('wb_invite', h); boot(); } else showInvite(t('inviteBad'));
      }, 40);
    }
    if (f === 'rcode') {
      if (S.recHash && recHashOf($('#rec-code').value) === S.recHash) { pin.mode = 'reset'; pin.step = 'new'; pin.msg = ''; store.del('wb_lockuntil'); store.set('wb_fails', 0); renderPin(); }
      else { pin.msg = t('recBad'); renderPin(); }
    }
    if (f === 'setup') { if (readProfileForm()) { S.profile.setupDone = true; saveProfile(); enterApp(); toast(t('welcomeDone', { name: S.profile.name || '' }), 'success'); } }
    if (f === 'profile') {
      if (!readProfileForm()) return;
      const k = num($('#p-kcal').value), g = num($('#p-glass').value);
      S.profile.customKcal = k >= 800 ? String(r0(k)) : ''; S.profile.glassMl = g >= 100 && g <= 1000 ? r0(g) : 250;
      const sw = num($('#p-sw').value); if (sw >= 20) S.profile.startWeight = String(sw);
      if ($('#p-sd').value) S.profile.startDate = $('#p-sd').value;
      saveProfile(); closeSheet(); render(); toast(t('saved'), 'success');
    }
    if (f === 'meal') submitMealForm();
    if (f === 'weight') {
      const kg = num($('#w-kg').value), date = $('#w-date').value || todayStr(), waist = num($('#w-waist').value);
      if (kg < 20 || kg > 300) { $('#w-err').textContent = t('errWeight'); return; }
      if (!S.profile.startWeight) { S.profile.startWeight = String(kg); S.profile.startDate = date; saveProfile(); }
      logWeight(date, kg, waist ? String(waist) : ''); closeSheet(); render(); toast(t('saved'), 'success');
      const tw = num(S.profile.targetWeight);
      if (tw && S.profile.goal === 'lose' && kg <= tw) setTimeout(() => toast(t('goalReached'), 'success'), 2700);
    }
    if (f === 'ai') {
      S.settings.aiKey = $('#ai-key').value.trim(); S.settings.aiModel = $('#ai-model').value; saveSettings();
      closeSheet(); toast(S.settings.aiKey ? t('aiSaved') : t('aiRemoved'), 'success'); render();
    }
    if (f === 'rem') {
      const r = S.settings.reminders;
      MEALS.forEach((m) => { r[m] = $('#r-' + m).value; });
      r.waterFrom = $('#r-wf').value; r.waterTo = $('#r-wt').value; r.waterEvery = Number($('#r-we').value) || 0;
      S.settings.inAppRemind = $('#r-inapp').checked; saveSettings();
      openReminders(); toast(t('remSaved'), 'success'); renderView();
    }
    if (f === 'export') {
      const from = $('#ex-from').value, to = $('#ex-to').value, btn = $('#ex-btn');
      if (!from || !to || from > to) { toast(t('badRange'), 'error'); return; }
      btn.disabled = true; btn.innerHTML = '<span class="spin"></span>' + t('making');
      exportExcel(from, to).then((blob) => saveFile('WellBite_' + from + '_' + to + '.xlsx', blob.type, blob))
        .then((ok) => { if (ok) toast(t('exported'), 'success'); })
        .catch(() => toast(t('exportFail'), 'error'))
        .finally(() => { const b = $('#ex-btn'); if (b) { b.disabled = false; b.innerHTML = icon('download') + t('makeExcel'); } });
    }
    if (f === 'myfood') {
      const name = $('#mf-name').value.trim(); if (!name) { toast(t('needName'), 'error'); return; }
      const it = { name: name, portion: $('#mf-portion').value.trim() };
      NUTR.forEach((k) => { it[k] = num(($('#mf-' + k) || {}).value); });
      const nf = myFoodFrom(it), id = $('#mf-id').value; if (id) nf.id = id;
      S.myFoods = S.myFoods.filter((x) => x.id !== nf.id).concat([nf]); persist(); openMyFoods(); toast(t('myFoodSaved', { name: name }), 'success');
    }
  });

  // lock again after the app was in the background for 2 minutes; refresh "today" after midnight
  let hiddenAt = 0;
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { hiddenAt = Date.now(); return; }
    if (appEl.hidden) return;
    if (S.lockOnOpen && S.pinHash && hiddenAt && Date.now() - hiddenAt > 120000) { closeSheet(true); showPin('unlock'); return; }
    if (S.view === 'today' && !sheet) renderView();
  });

  function boot() {
    document.documentElement.lang = S.lang;
    if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol) && !window.WB_NO_SW) navigator.serviceWorker.register('sw.js').catch(() => {});
    if (/^#lihat=/.test(location.hash)) return showViewer(location.hash);
    if (inviteNeeded()) return showInvite();
    if (!S.pinHash) return showWelcome();
    if (S.lockOnOpen) return showPin('unlock');
    enterApp();
  }
  window.addEventListener('hashchange', () => { if (/^#lihat=/.test(location.hash)) showViewer(location.hash); });
  boot();
})();
