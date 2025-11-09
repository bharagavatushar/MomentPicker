# MomentPicker — Modern Material Edition (Standalone)

A compact, modern date/time picker for **Moment.js**. **Single-file drop‑in** — just include one script tag. Vanilla JS with an optional jQuery bridge. The component injects its own styles and, if `window.moment` is missing, it will fetch Moment.js from a CDN automatically.

- **Modes:** date, month, year (+ optional time)
- **Constraints:** absolute or relative min/max (e.g. `-1y`, `+6M`, `-2w`, `+14d`)
- **UX:** auto-flip positioning, ripple buttons, accessible labels, keyboard open/close
- **Styling:** CSS custom properties, dark‑mode aware, theme hook (`theme` option)

> No npm/ESM builds. Use via a single `<script>` file.

---

## Usage (script tag)

**Include Moment yourself (recommended)** or rely on auto-load:

```html
<!-- Recommended: preload Moment (prevents dynamic injection) -->
<script src="https://cdn.jsdelivr.net/npm/moment@2.30.1/moment.min.js"></script>

<!-- Then include the picker -->
<script src="./momentpicker.js"></script>
```

**Basic example:**

```html
<input id="when" placeholder="YYYY-MM-DD" />
<script>
  const p = new MomentPicker('#when', {
    minDate: '-1y',
    maxDate: '+6M',
    showToday: true
  });
</script>
```

**Inline calendar:**

```html
<div id="host"></div>
<script>
  new MomentPicker('#host', { inline: true });
</script>
```

**Pick date & time (commit on Apply):**

```html
<input id="dt" />
<script>
  new MomentPicker('#dt', {
    includeTime: true,
    use12h: true,
    minuteStep: 15,
    showApply: true,
    datetimeFormat: 'YYYY-MM-DD hh:mm A'
  });
</script>
```

**Write to a different input (sink):**

```html
<button id="btn">Choose…</button>
<input id="hidden" type="text" />
<script>
  new MomentPicker('#btn', {
    targetInput: '#hidden',
    format: 'YYYY-MM-DD'
  });
</script>
```

**jQuery bridge (optional):**

```html
<script src="https://cdn.jsdelivr.net/npm/jquery@3.7.1/dist/jquery.min.js"></script>
<script src="./momentpicker.js"></script>
<script>
  $('#el').momentPicker({ includeTime: true });
  $('#el').momentPicker('open');
</script>
```

---

## API

### Constructor
```ts
new MomentPicker(target: string | HTMLElement, options?: Options)
```

### Public methods
- `open()` / `close()` / `toggle()`  
- `destroy()`  
- `getDate(): moment.Moment | null`  
- `setDate(value, { silent?: boolean })`  
- `setOptions(next: Partial<Options>)`

### Options (selected)
| Option | Type | Default | Notes |
|---|---|---:|---|
| `selectionMode` | `'date' \| 'month' \| 'year'` | `'date'` | Sets starting view & commit behavior. |
| `includeTime` | boolean | `false` | Enables time selectors + Now/Apply (if `showApply`). |
| `format` | string | `'YYYY-MM-DD'` | Output when `includeTime=false`. |
| `datetimeFormat` | string | `'YYYY-MM-DD HH:mm'` | Output when `includeTime=true`. |
| `use12h` | boolean | `false` | 12‑hour clock; shows AM/PM. |
| `minuteStep` | number | `5` | Minute increments. |
| `locale` | string | current moment locale | Weekdays/formatting. |
| `firstDay` | `0..6 \| null` | `null` | Force first day (null = locale default). |
| `minDate` / `maxDate` | Momentish \| relative string | `null` | Accepts `Date`, number, ISO/string, `moment`, or relative like `-1y`, `+6M`, `-2w`, `+14d`. |
| `blockFromTodayForward` | boolean | `false` | Disallow today & future. |
| `blockFromTodayBackward` | boolean | `false` | Disallow today & past. |
| `disable` | `(m: moment) => boolean` | `null` | Disable per-day. |
| `inline` | boolean | `false` | Render inside host element. |
| `position` | `'auto' \| 'top' \| 'bottom'` | `'auto'` | Popup anchor with auto‑flip. |
| `autoClose` | boolean | `true` | Close on commit. |
| `showToday` / `showClear` / `showNow` / `showApply` | boolean | `true` | `showNow` appears if `includeTime`. |
| `theme` | string | `''` | Appended to `.mc-root` for easy theming. |
| `clickableStyle` | boolean | `true` | Dotted underline & pointer on non‑inline triggers. |
| `preventDefaultOnOpen` | boolean | `true` | Prevents nav/submit on anchor/button triggers. |
| `required` | boolean | `false` | Simple required validation. |
| `validate` | `(m: moment \| null, inst) => string \| null` | `null` | Return message to block commit. |
| `targetInput` | `string \| HTMLElement \| null` | `null` | Write output elsewhere. |
| `onOpen/onClose/onChange` | callbacks | `null` | `onChange` receives the `moment` or `null`. |

**Commit notes:** With `includeTime=true` and `showApply=true`, day/time changes are previewed but only committed on **Apply**.

---

## Theming

Use CSS variables globally or via a theme class assigned through `options.theme`:

```css
.my-theme {
  --mc-primary: #3f51b5;
  --mc-primary-contrast: #fff;
  --mc-bg: #fff;
  --mc-fg: #1f2937;
  --mc-border: #e5e7eb;
  --mc-hover: #f3f4f6;
  --mc-shadow: 0 10px 28px rgba(0,0,0,.14);
}
```

Then:

```js
new MomentPicker('#btn', { theme: 'my-theme' });
```

---

## Accessibility

- Trigger gains `tabindex="0"`, `aria-haspopup="dialog"`, toggles `aria-expanded`.
- `Esc` closes; `Enter`, `Space`, or `ArrowDown` opens on the trigger.
- Errors announced via `aria-live="polite"`. Calendar uses `role="grid"` and button cells.

---

## Notes

- If `window.moment` is missing, the picker auto‑loads Moment 2.30.1 via jsDelivr. In strict CSP contexts, preload Moment yourself.
- Relative bounds support: `y` (years), `M` (months), `w` (weeks), `d` (days).

---

## License

MIT © 2025 Tushar Bhargava
