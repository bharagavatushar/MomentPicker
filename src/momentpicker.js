/*!
 * MomentPicker — Modern Material Edition (Single-file Drop-in)
 * Vanilla JS + optional jQuery bridge
 * MIT — 2025
 */
(function (w, d) {
  'use strict';

  // -----------------------------
  // 0) Ensure moment.js is present
  // -----------------------------
  function ensureMoment() {
    return new Promise((resolve, reject) => {
      if (w.moment && typeof w.moment === 'function') return resolve(w.moment);
      const s = d.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/moment@2.30.1/moment.min.js';
      s.referrerPolicy = 'no-referrer';
      s.onload = () => (w.moment ? resolve(w.moment) : reject(new Error('moment failed to load')));
      s.onerror = () => reject(new Error('Network error while loading moment.js'));
      d.head.appendChild(s);
    });
  }

  // -----------------------------------
  // 1) Inject component + theme CSS once
  // -----------------------------------
  function injectStyles() {
    if (d.getElementById('momentpicker-styles-all')) return;
    const css = `
:root{
  --mc-bg:#fff; --mc-fg:#1f2937; --mc-muted:#6b7280; --mc-border:#e5e7eb; --mc-hover:#f3f4f6;
  --mc-primary:#3f51b5; --mc-primary-contrast:#fff;
  --mc-shadow:0 10px 28px rgba(0,0,0,.14);
  --mc-radius:12px; --mc-cell-h:36px; --mc-font:Inter,system-ui,-apple-system,Segoe UI,Roboto,sans-serif;
}
@media (prefers-color-scheme: dark){
  :root{
    --mc-bg:#0f1115; --mc-fg:#e5e7eb; --mc-muted:#9ca3af; --mc-border:#232732; --mc-hover:#141824;
    --mc-primary:#8ab4f8; --mc-primary-contrast:#0b1021; --mc-shadow:0 12px 32px rgba(0,0,0,.6);
  }
}
.mc-clickable{ text-decoration:underline dotted; text-underline-offset:3px; cursor:pointer; }

.mc-root{ position:absolute; inset:auto; width:300px; background:var(--mc-bg); color:var(--mc-fg);
  border:1px solid var(--mc-border); border-radius:var(--mc-radius); box-shadow:var(--mc-shadow);
  font-family:var(--mc-font); font-size:14px; user-select:none; z-index:9999; overflow:clip; }
.mc-root.inline{ position:relative; box-shadow:none; }
.mc-hidden{ display:none !important; }

.mc-header{ display:flex; align-items:center; justify-content:space-between; padding:10px 12px;
  border-bottom:1px solid var(--mc-border); background:linear-gradient(0deg,rgba(0,0,0,.02),rgba(0,0,0,.02)); }
.mc-nav-btn{ border:0; background:transparent; width:32px; height:32px; border-radius:10px; font-size:16px; cursor:pointer;
  transition:transform .08s ease; color:inherit; }
.mc-nav-btn:hover{ background:var(--mc-hover); transform:translateY(-1px); }
.mc-title-btn{ border:0; background:transparent; padding:6px 10px; border-radius:10px; font-weight:700; letter-spacing:.2px; cursor:pointer; }
.mc-title-btn:hover{ background:var(--mc-hover); }

.mc-body{ padding:10px; }
.mc-weekdays{ display:grid; grid-template-columns:repeat(7,1fr); gap:6px; margin-bottom:6px; color:var(--mc-muted); text-align:center; font-weight:700; letter-spacing:.3px; }
.mc-grid{ display:grid; grid-template-columns:repeat(7,1fr); gap:6px; }
.mc-months, .mc-years{ display:grid; grid-template-columns:repeat(4,1fr); gap:8px; padding:4px; }

.mc-cell{ height:var(--mc-cell-h); display:flex; align-items:center; justify-content:center;
  border-radius:10px; cursor:pointer; font-weight:600;
  transition:background-color .12s ease, transform .08s ease, box-shadow .12s ease; }
.mc-cell:hover{ background:var(--mc-hover); }
.mc-cell.out{ color:var(--mc-muted); }
.mc-cell.disabled{ opacity:.45; cursor:not-allowed; }
.mc-cell.selected{ background:var(--mc-primary); color:var(--mc-primary-contrast); box-shadow:0 2px 8px rgba(0,0,0,.18); }
.mc-cell.today{ outline:2px solid var(--mc-primary); outline-offset:2px; }
.mc-small{ height:32px; padding:2px 6px; }
/* Optional extra accent */
button.mc-cell{border: 1px solid #62a3c9;background-color: aliceblue;}
button.mc-cell.out{border: 1px solid #dadfe2ff;background-color: #dadfe2ff;}

.mc-footer{ display:flex; align-items:center; justify-content:space-between; padding:10px;
  border-top:1px solid var(--mc-border); background:linear-gradient(180deg,rgba(0,0,0,.02),rgba(0,0,0,.02)); gap:8px; flex-wrap:wrap; }
.mc-actions{ display:flex; gap:8px; align-items:center; }

.mc-btn{ border:1px solid var(--mc-border); background:transparent; color:inherit; border-radius:10px; padding:8px 12px;
  cursor:pointer; font-weight:700; letter-spacing:.2px; position:relative; overflow:hidden;
  transition:transform .06s ease, box-shadow .12s ease, background-color .12s ease; box-shadow:0 1px 2px rgba(0,0,0,.08); }
.mc-btn:hover{ background:var(--mc-hover); transform:translateY(-1px); }
.mc-btn.primary{ background:var(--mc-primary); border-color:var(--mc-primary); color:var(--mc-primary-contrast); box-shadow:0 2px 8px rgba(0,0,0,.18); }
.mc-btn.primary:hover{ filter:brightness(1.05); }
.mc-error{ color:#ef4444; font-size:12px; font-weight:600; }

.mc-time{ display:flex; align-items:center; gap:6px; }
.mc-time select{ height:34px; border:1px solid var(--mc-border); border-radius:10px; padding:0 10px; background:transparent; color:inherit; }
`;
    const tag = d.createElement('style');
    tag.id = 'momentpicker-styles-all';
    tag.textContent = css;
    d.head.appendChild(tag);
  }

  // --------------------------------
  // 2) Utility helpers (no externals)
  // --------------------------------
  const uid = (() => { let i = 0; return () => ++i; })();
  const isEl = (x) => x && x.nodeType === 1;

  function asMoment(v, locale) {
    if (!v) return null;
    const m = w.moment;
    if (m.isMoment(v)) return v.clone().locale(locale);
    if (v instanceof Date || typeof v === 'number') return m(v).locale(locale);
    const iso = m(v, m.ISO_8601, true);
    return (iso.isValid() ? iso : m(v)).locale(locale);
  }

  function clamp(mo, min, max) {
    if (!mo) return mo;
    if (min && mo.isBefore(min)) return min.clone();
    if (max && mo.isAfter(max))  return max.clone();
    return mo;
  }

  const isAnchorLike = (el) => !!(el && (el.tagName === 'A' || el.closest && el.closest('a') || el.getAttribute('role') === 'link'));
  const isSubmitLike  = (el) => !!(el && (el.tagName === 'BUTTON' || (el.tagName === 'INPUT' && /submit|button/i.test(el.type))));

  // Relative bound parser: '-1y', '+2M', '-3w', '+10d'
  function parseRelativeToToday(expr, locale) {
    if (typeof expr !== 'string') return null;
    const m = w.moment;
    const re = /^[+-]\\d+\\s*[yMwd]$/i;
    if (!re.test(expr.trim())) return null;
    const sign = expr.trim()[0] === '-' ? -1 : 1;
    const num  = parseInt(expr.replace(/[^\\d]/g, ''), 10);
    const unit = expr.trim().slice(-1); // last char
    const map = { y:'year', M:'month', w:'week', d:'day', Y:'year', W:'week' };
    const u = map[unit] || 'day';
    return m().locale(locale).startOf('day').add(sign * num, u);
  }

  // ---------------------------------------
  // 3) Component defaults (configurable API)
  // ---------------------------------------
  const DEFAULTS = {
    selectionMode: 'date',        // 'date' | 'month' | 'year' | 'time'
    includeTime: false,
    format: 'YYYY-MM-DD',
    datetimeFormat: 'YYYY-MM-DD HH:mm',
    use12h: false,
    minuteStep: 5,
    locale: (w.moment ? w.moment.locale() : 'en'),
    firstDay: null,               // 0..6 (Sun..Sat); null = locale default

    // Absolute OR relative (e.g. '-1y', '+6M', '-2w', '+14d'):
    minDate: null,
    maxDate: null,

    // Quick guards relative to *today*:
    blockFromTodayForward: false, // disallow today and future
    blockFromTodayBackward: false,// disallow today and past

    disable: null,                // fn(moment) => boolean
    inline: false,
    position: 'auto',             // 'auto' | 'top' | 'bottom'
    zIndex: 9999,
    autoClose: true,
    showToday: true,
    showClear: true,
    showNow: true,
    showApply: true,
    theme: '',
    clickableStyle: true,         // dotted underline + hand cursor on trigger
    preventDefaultOnOpen: true,   // stop nav/submit on anchors/buttons
    required: false,              // validation (blocks Apply/close)
    validate: null,               // fn(moment|null, instance) => string|null
    targetInput: null,            // optional sink element (selector/Element)
    onOpen: null,
    onClose: null,
    onChange: null
  };

  // ------------------------------
  // 4) Ripple for .mc-btn (tiny DOM)
  // ------------------------------
  function attachRipple(root) {
    root.addEventListener('click', (e) => {
      const btn = e.target.closest('.mc-btn'); if (!btn) return;
      const r = d.createElement('span');
      const rect = btn.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height) * 1.25;
      Object.assign(r.style, {
        position:'absolute', width:size+'px', height:size+'px', left:(e.clientX-rect.left-size/2)+'px',
        top:(e.clientY-rect.top-size/2)+'px', borderRadius:'50%', background:'rgba(255,255,255,.35)',
        pointerEvents:'none', transform:'scale(0)', opacity:'0.75', transition:'transform 280ms ease, opacity 480ms ease'
      });
      btn.appendChild(r);
      requestAnimationFrame(()=>{ r.style.transform='scale(1)'; r.style.opacity='0'; });
      setTimeout(()=> r.remove(), 520);
    });
  }

  // -----------------------------
  // 5) MomentPicker core component
  // -----------------------------
  function definePicker() {

    const m = w.moment;

    class MomentPicker {
      constructor(target, options={}) {
        this.el = (typeof target === 'string') ? d.querySelector(target) : target;
        if (!this.el) throw new Error('MomentPicker target not found');
        this.opts = Object.assign({}, DEFAULTS, options || {});
        this.opts.locale = this.opts.locale || m.locale();

        this.id = uid();
        // Resolve min/max with relative support
        this.min = this._resolveBound(this.opts.minDate);
        this.max = this._resolveBound(this.opts.maxDate);

        this.value = asMoment(this._initialValue(), this.opts.locale);
        if (this.value) this.value = clamp(this.value, this.min, this.max);

        this.view = (this.value || m().locale(this.opts.locale)).clone().startOf('month');
        this.viewMode = this._defaultViewMode();
        this.opened = false;

        if (!this.opts.inline && this.opts.clickableStyle) this.el.classList.add('mc-clickable');

        this._build();
        // Capture default (for Clear)
        this._captureDefault();
        this._bind();
        if (this.opts.inline) this.open();
      }

      // ---- Public
      open() {
        if (this.opened) return;
        this.opened = true;
        this.root.classList.remove('mc-hidden');
        this.root.style.zIndex = String(this.opts.zIndex);
        if (!this.opts.inline) {
          this._positionSmart();
          w.addEventListener('resize', this._reposition, { passive:true });
          w.addEventListener('scroll', this._reposition, true);
          d.addEventListener('click', this._docClick, true);
          this.el.setAttribute('aria-expanded', 'true');
        }
        if (typeof this.opts.onOpen === 'function') this.opts.onOpen(this);
        this._render();
        attachRipple(this.root);
      }
      close() {
        if (!this.opened) return;
        this.opened = false;
        this.root.classList.add('mc-hidden');
        if (!this.opts.inline) {
          w.removeEventListener('resize', this._reposition);
          w.removeEventListener('scroll', this._reposition, true);
          d.removeEventListener('click', this._docClick, true);
          this.el.setAttribute('aria-expanded', 'false');
        }
        if (typeof this.opts.onClose === 'function') this.opts.onClose(this);
      }
      toggle(){ this.opened ? this.close() : this.open(); }
      destroy(){
        this.close(); this.root.remove();
        this.el.removeEventListener('click', this._openClick);
        this.el.removeEventListener('keydown', this._openKey);
        delete this.el._momentPicker;
      }
      getDate(){ return this.value ? this.value.clone() : null; }
      setDate(val, {silent=false}={}) {
        const nm = asMoment(val, this.opts.locale);
        if (!nm || !nm.isValid()) return;
        this.value = clamp(nm, this.min, this.max);
        this.view = this.value.clone().startOf('month');
        this._syncOutput();
        this._render();
        if (!silent) this._fireChange();
      }
      setOptions(next){
        this.opts = Object.assign({}, this.opts, next || {});
        // Re-resolve bounds if changed
        this.min = this._resolveBound(this.opts.minDate);
        this.max = this._resolveBound(this.opts.maxDate);
        this.viewMode = this._defaultViewMode();
        this._render();
      }

      // ---- Build
      _build() {
        this.root = d.createElement('div');
        this.root.className = `mc-root mc-hidden ${this.opts.inline ? 'inline' : ''} ${this.opts.theme || ''}`;
        this.root.style.zIndex = String(this.opts.zIndex);

        const header = d.createElement('div');
        header.className = 'mc-header';
        header.innerHTML = `
          <button class="mc-nav-btn" data-nav="prev" aria-label="Previous">&#10094;</button>
          <button class="mc-title-btn" data-action="switch-view" aria-haspopup="grid"></button>
          <button class="mc-nav-btn" data-nav="next" aria-label="Next">&#10095;</button>
        `;

        const body = d.createElement('div');
        body.className = 'mc-body';
        body.innerHTML = `
          <div class="mc-weekdays"></div>
          <div class="mc-grid" role="grid"></div>
          <div class="mc-months mc-hidden" role="grid"></div>
          <div class="mc-years mc-hidden" role="grid"></div>
        `;

        const footer = d.createElement('div');
        footer.className = 'mc-footer';
        footer.innerHTML = `
          <div class="mc-time ${self.opts and 'includeTime' if False else ''}">
            <select class="mc-hour"></select><span>:</span>
            <select class="mc-minute"></select>
            <select class="mc-ampm ${' ' if False else ''}"><option>AM</option><option>PM</option></select>
          </div>
          <div class="mc-actions">
            ${' '}
            ${' '}
            ${' '}
            ${' '}
            <span class="mc-error" aria-live="polite"></span>
          </div>
        `

        this.root.append(header, body, footer);
        if (this.opts.inline) this.el.appendChild(this.root);
        else d.body.appendChild(this.root);

        // Cache parts
        this.$title  = this.root.querySelector('.mc-title-btn');
        this.$wd     = this.root.querySelector('.mc-weekdays');
        this.$grid   = this.root.querySelector('.mc-grid');
        this.$months = this.root.querySelector('.mc-months');
        this.$years  = this.root.querySelector('.mc-years');
        this.$hour   = this.root.querySelector('.mc-hour');
        this.$minute = this.root.querySelector('.mc-minute');
        this.$ampm   = this.root.querySelector('.mc-ampm');
        this.$err    = this.root.querySelector('.mc-error');

        // Bound handlers
        this._docClick   = this._docClick.bind(this);
        this._reposition = this._reposition.bind(this);
        this._openClick  = (e) => {
          if (this.opts.preventDefaultOnOpen && (isAnchorLike(this.el) || isSubmitLike(this.el))) e.preventDefault();
          this.open();
        };
        this._openKey = (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            if (this.opts.preventDefaultOnOpen) e.preventDefault();
            this.open();
          } else if (e.key === 'ArrowDown' && !this.opened) {
            e.preventDefault(); this.open();
          }
        };

        if (!this.opts.inline) {
          this.el.addEventListener('click', this._openClick);
          this.el.addEventListener('keydown', this._openKey);
          if (!this.el.getAttribute('tabindex')) this.el.setAttribute('tabindex','0');
          this.el.setAttribute('aria-haspopup','dialog');
          this.el.setAttribute('aria-expanded','false');
        }

        this._fillTimeSelectors();
        this._render();
        this.el._momentPicker = this;
      }

      _bind() {
        this.root.addEventListener('click', (e) => {
          const nav = e.target.closest('[data-nav]');
          const act = e.target.closest('[data-action]');
          const cell = e.target.closest('.mc-cell');

          if (nav) { this._navigate(nav.getAttribute('data-nav') === 'prev' ? -1 : 1); return; }
          if (act) { this._action(act.getAttribute('data-action')); return; }

          if (cell && !cell.classList.contains('disabled')) {
            if (this.viewMode === 'days') {
              const y = +cell.dataset.y, mo = +cell.dataset.m, dnum = +cell.dataset.d;
              const carry = this.value || m().locale(this.opts.locale);
              const next = m({year:y, month:mo, day:dnum}).date(dnum).month(mo).year(y)
                            .hour(carry.hour()).minute(carry.minute()).second(0).millisecond(0);
              this.setDate(next, {silent:true});
              if (this.opts.includeTime && this.opts.showApply) {
                this._syncTimeIntoValue(true);
                this._render();
              } else {
                if (this.opts.includeTime) this._syncTimeIntoValue();
                this._commitMaybe();
              }
            } else if (this.viewMode === 'months') {
              const y = +cell.dataset.y, mo = +cell.dataset.mo;
              this.view.year(y).month(mo).startOf('month');
              if (this.opts.selectionMode === 'month') {
                const chosen = clamp(m({year:y, month:mo, day:1}), this.min, this.max);
                this.setDate(chosen);
                if (this.opts.autoClose) this.close();
              } else { this.viewMode = 'days'; this._render(); }
            } else {
              const y = +cell.dataset.y;
              this.view.year(y).startOf('year');
              if (this.opts.selectionMode === 'year') {
                const chosen = clamp(m({year:y, month:0, day:1}), this.min, this.max);
                this.setDate(chosen);
                if (this.opts.autoClose) this.close();
              } else { this.viewMode = 'months'; this._render(); }
            }
          }
        });

        this.root.addEventListener('keydown', (e) => {
          if (e.key === 'Escape') { e.preventDefault(); this.close(); }
        });

        if (this.$hour) {
          this.$hour.addEventListener('change', () => this._syncTimeIntoValue(true));
          this.$minute.addEventListener('change', () => this._syncTimeIntoValue(true));
          if (this.$ampm) this.$ampm.addEventListener('change', () => this._syncTimeIntoValue(true));
        }
      }

      // ---- Render
      _render() {
        m.locale(this.opts.locale);
        this._renderHeader();
        this._renderBody();
        this._readTimeIntoSelectors();
        this._clearError();
      }
      _renderHeader() {
        const V = this.view.clone();
        const title = (this.viewMode==='days') ? V.format('MMMM YYYY')
                    : (this.viewMode==='months') ? V.format('YYYY')
                    : `${Math.floor(V.year()/12)*12}–${Math.floor(V.year()/12)*12 + 11}`;
        this.$title.textContent = title;
      }
      _renderBody() {
        const mode = this.viewMode;
        this.$wd.classList.toggle('mc-hidden', mode!=='days');
        this.$grid.classList.toggle('mc-hidden', mode!=='days');
        this.$months.classList.toggle('mc-hidden', mode!=='months');
        this.$years.classList.toggle('mc-hidden', mode!=='years');

        if (mode === 'days') {
          const fd = (this.opts.firstDay != null) ? this.opts.firstDay : (m.localeData(this.opts.locale).firstDayOfWeek?.() ?? 0);
          const ld = m.localeData(this.opts.locale);
          this.$wd.innerHTML = Array.from({length:7},(_,i)=>`<div>${ld.weekdaysMin()[(i+fd)%7]}</div>`).join('');

          const start = this.view.clone().startOf('month');
          const dow = start.day();
          const lead = (dow - fd + 7) % 7;
          const gridStart = start.clone().subtract(lead, 'day');

          let html = '';
          for (let i=0;i<42;i++){
            const day = gridStart.clone().add(i,'day');
            const cls = [
              'mc-cell',
              (day.month() !== this.view.month()) ? 'out':'',
              this._disabledDate(day) ? 'disabled':'',
              (this.value && day.isSame(this.value,'day')) ? 'selected':'',
              day.isSame(m(),'day') ? 'today':''
            ].filter(Boolean).join(' ');
            html += `<button class="${cls}" data-y="${day.year()}" data-m="${day.month()}" data-d="${day.date()}" role="gridcell">${day.date()}</button>`;
          }
          this.$grid.innerHTML = html;

        } else if (mode === 'months') {
          const y = this.view.year();
          let html = '';
          for (let mo=0; mo<12; mo++){
            const ptr = m({year:y, month:mo, day:1});
            const dis = this._disabledMonth(ptr);
            html += `<button class="mc-cell mc-small ${dis?'disabled':''}" data-y="${y}" data-mo="${mo}">${ptr.format('MMM')}</button>`;
          }
          this.$months.innerHTML = html;

        } else {
          const base = Math.floor(this.view.year()/12)*12;
          const minY = this.min ? this.min.year() : -Infinity;
          const maxY = this.max ? this.max.year() : Infinity;
          let html = '';
          for (let i=0;i<12;i++){
            const y = base+i;
            const dis = (y < minY || y > maxY);
            html += `<button class="mc-cell mc-small ${dis?'disabled':''}" data-y="${y}">${y}</button>`;
          }
          this.$years.innerHTML = html;
        }
      }

      // ---- Actions & nav
      _navigate(dir){
        if (this.viewMode==='days') this.view.add(dir,'month');
        else if (this.viewMode==='months') this.view.add(dir,'year');
        else this.view.add(dir*12,'year');
        this._render();
        this._positionSmart();
      }
      _action(a){
        if (a==='switch-view') {
          this.viewMode = (this.viewMode==='days') ? 'months' : (this.viewMode==='months' ? 'years' : 'days');
          this._render();
        } else if (a==='today') {
          const now = clamp(m().locale(this.opts.locale), this.min, this.max);
          if (this.opts.selectionMode==='date') {
            this.setDate(now);
            if (this.opts.autoClose && !this.opts.includeTime) this.close();
          } else {
            this.view = now.clone().startOf('month'); this._render();
          }
        } else if (a==='now') {
          if (!this.opts.includeTime) return;
          const now = m(); this.$minute.value = String(Math.round(now.minute()/this.opts.minuteStep)*this.opts.minuteStep);
          this.$hour.value = this.opts.use12h ? String((now.hour()%12)||12) : String(now.hour());
          if (this.opts.use12h) this.$ampm.value = now.hour()>=12 ? 'PM':'AM';
          this._syncTimeIntoValue(true);
        } else if (a==='clear') {
          this._restoreDefault();  // restores original default string & moment
          this._render();
          this._fireChange();
          if (this.opts.autoClose) this.close();
        } else if (a==='apply') {
          this._syncTimeIntoValue(true);
          this._commitMaybe();
        }
      }

      // ---- Validation & commit
      _commitMaybe(){
        const err = this._validateCurrent();
        if (err) { this._showError(err); return; }
        this._clearError();
        this._syncOutput();
        this._fireChange();
        if (this.opts.autoClose) this.close();
      }
      _validateCurrent(){
        if (this.opts.required && !this.value) return 'This field is required';
        if (this.value) {
          if (this.min && this.value.isBefore(this.min,'minute')) return `Date must be on/after ${this.min.format(this._outFmt())}`;
          if (this.max && this.value.isAfter(this.max,'minute'))  return `Date must be on/before ${this.max.format(this._outFmt())}`;
        }
        if (typeof this.opts.validate === 'function') return this.opts.validate(this.value ? this.value.clone() : null, this) || null;
        return null;
      }
      _showError(msg){ if (this.$err) this.$err.textContent = msg; }
      _clearError(){ if (this.$err) this.$err.textContent = ''; }

      // ---- Time helpers
      _fillTimeSelectors(){
        if (!this.opts.includeTime) return;
        const h = [];
        if (this.opts.use12h){ for (let i=1;i<=12;i++) h.push(`<option value="${i}">${i}</option>`); }
        else { for (let i=0;i<24;i++) h.push(`<option value="${i}">${String(i).padStart(2,'0')}</option>`); }
        const mm = [];
        for (let i=0;i<60;i+=this.opts.minuteStep) mm.push(`<option value="${i}">${String(i).padStart(2,'0')}</option>`);
        this.$hour.innerHTML = h.join('');
        this.$minute.innerHTML = mm.join('');
      }
      _readTimeIntoSelectors(){
        if (!this.opts.includeTime) return;
        const seed = this.value || m();
        const step = this.opts.minuteStep;
        const h24 = seed.hour();
        if (this.opts.use12h){
          const h12 = (h24 % 12) || 12;
          this.$hour.value = String(h12);
          this.$ampm.value = h24>=12 ? 'PM':'AM';
        } else {
          this.$hour.value = String(h24);
        }
        this.$minute.value = String(Math.floor(seed.minute()/step)*step);
      }
      _syncTimeIntoValue(){
        if (!this.opts.includeTime){
          if (!this.value) this.value = this.view.clone().startOf('day');
          return;
        }
        if (!this.value) this.value = this.view.clone().startOf('day');
        let hour = Number(this.$hour.value);
        const minute = Number(this.$minute.value);
        if (this.opts.use12h){
          const pm = this.$ampm.value === 'PM';
          hour = (hour % 12) + (pm ? 12 : 0);
        }
        this.value.hour(hour).minute(minute).second(0).millisecond(0);
      }

      // ---- Constraints (incl. relative guards)
      _disabledDate(d){
        const today = m().startOf('day');
        if (this.opts.blockFromTodayForward && d.isSameOrAfter(today, 'day')) return true;
        if (this.opts.blockFromTodayBackward && d.isSameOrBefore(today, 'day')) return true;

        if (this.min && d.isBefore(this.min, 'day')) return true;
        if (this.max && d.isAfter(this.max, 'day')) return true;
        if (typeof this.opts.disable === 'function') return !!this.opts.disable(d.clone());
        return false;
      }
      _disabledMonth(mo){
        const start = mo.clone().startOf('month');
        const end   = mo.clone().endOf('month');
        const today = m().startOf('day');

        if (this.opts.blockFromTodayForward && end.isSameOrAfter(today,'day')) return true;
        if (this.opts.blockFromTodayBackward && start.isSameOrBefore(today,'day')) return true;

        if (this.min && end.isBefore(this.min,'day')) return true;
        if (this.max && start.isAfter(this.max,'day')) return true;
        return false;
      }

      // ---- Resolve min/max (supports relative strings)
      _resolveBound(val){
        if (!val) return null;
        const rel = parseRelativeToToday(val, this.opts.locale);
        if (rel) return rel;
        const abs = asMoment(val, this.opts.locale);
        return abs ? abs.startOf('day') : null;
      }

      // ---- I/O & defaults
      _initialValue(){
        if (this.opts.value) return this.opts.value;
        if (this.el instanceof HTMLInputElement && this.el.value) return this.el.value;
        const dv = this.el.getAttribute('data-value') || '';
        return dv || null;
      }
      _outFmt(){ return this.opts.includeTime ? this.opts.datetimeFormat : this.opts.format; }

      _resolveSink(){
        let sink = this.opts.targetInput;
        if (typeof sink === 'string') sink = d.querySelector(sink);
        if (!sink) sink = this.el;
        return sink;
      }

      _captureDefault(){
        const sink = this._resolveSink();
        let defText = '';
        if (sink instanceof HTMLInputElement || sink instanceof HTMLTextAreaElement) {
          defText = (sink.defaultValue !== undefined) ? sink.defaultValue : sink.value || '';
        } else {
          defText = sink.getAttribute('data-default')
                 ?? sink.getAttribute('data-value')
                 ?? (sink.textContent || '');
          defText = String(defText).trim();
        }
        this._defaultText = defText;
        this._defaultMoment = asMoment(defText, this.opts.locale);
      }

      _restoreDefault(){
        const sink = this._resolveSink();
        const out = this._defaultText || '';
        if (sink instanceof HTMLInputElement || sink instanceof HTMLTextAreaElement) {
          sink.value = out;
          sink.dispatchEvent(new Event('input', {bubbles:true}));
          sink.dispatchEvent(new Event('change', {bubbles:true}));
        } else {
          sink.setAttribute('data-value', out);
          if (sink !== this.el || !(this.el instanceof HTMLInputElement)) sink.textContent = out;
        }
        this.value = (this._defaultMoment && this._defaultMoment.isValid()) ? this._defaultMoment.clone() : null;
        if (this.value) this.view = this.value.clone().startOf('month');
      }

      _syncOutput(){
        const fmt = this._outFmt();
        const out = this.value ? this.value.format(fmt) : '';
        const sink = this._resolveSink();
        if (sink instanceof HTMLInputElement || sink instanceof HTMLTextAreaElement) {
          sink.value = out;
          sink.dispatchEvent(new Event('input',{bubbles:true}));
          sink.dispatchEvent(new Event('change',{bubbles:true}));
        } else {
          sink.setAttribute('data-value', out);
          if (sink !== this.el || !(this.el instanceof HTMLInputElement)) sink.textContent = out;
        }
      }
      _fireChange(){ if (typeof this.opts.onChange === 'function') this.opts.onChange(this.value ? this.value.clone() : null, this); }

      // ---- Positioning (auto-flip)
      _positionSmart(){
        if (this.opts.inline) return;
        const rect = this.el.getBoundingClientRect();
        const vW = d.documentElement.clientWidth;
        const vH = d.documentElement.clientHeight;
        const scrollX = w.pageXOffset || d.documentElement.scrollLeft;
        const scrollY = w.pageYOffset || d.documentElement.scrollTop;

        // Measure
        this.root.style.top = '-9999px'; this.root.style.left='-9999px'; this.root.style.display='block';
        const ph = this.root.offsetHeight, pw = this.root.offsetWidth;

        const spaceAbove = rect.top;
        const spaceBelow = vH - rect.bottom;

        let top;
        if (this.opts.position === 'top')       top = rect.top + scrollY - ph - 6;
        else if (this.opts.position === 'bottom') top = rect.bottom + scrollY + 6;
        else top = (spaceBelow >= ph || spaceBelow >= spaceAbove)
                  ? (rect.bottom + scrollY + 6)
                  : (rect.top + scrollY - ph - 6);

        let left = rect.left + scrollX;
        if (left + pw > scrollX + vW - 8) left = Math.max(scrollX + 8, scrollX + vW - pw - 8);
        if (left < scrollX + 8) left = scrollX + 8;

        this.root.style.top = `${Math.max(scrollY + 6, top)}px`;
        this.root.style.left = `${left}px`;
      }
      _reposition(){ if (this.opened) this._positionSmart(); }
      _docClick(e){
        if (!this.opened) return;
        if (this.root.contains(e.target)) return;
        if (this.el === e.target || (isEl(this.el) && this.el.contains(e.target))) return;
        this.close();
      }

      // ---- View helpers
      _defaultViewMode(){
        if (this.opts.selectionMode==='month') return 'months';
        if (this.opts.selectionMode==='year')  return 'years';
        return 'days';
      }
    }

    // jQuery bridge
    if (w.jQuery) {
      const $ = w.jQuery;
      $.fn.momentPicker = function (optsOrMethod, ...args) {
        return this.each(function(){
          let inst = this._momentPicker;
          if (!inst) inst = new MomentPicker(this, optsOrMethod || {});
          else if (typeof optsOrMethod === 'string' && typeof inst[optsOrMethod] === 'function') inst[optsOrMethod](...args);
        });
      };
    }

    w.MomentPicker = MomentPicker;
  }

  // ---------------------------
  // 6) Bootstrap the definition
  // ---------------------------
  injectStyles();
  ensureMoment()
    .then(() => definePicker())
    .catch((err) => console.error('[MomentPicker] ', err && err.message ? err.message : err));

})(window, document);
