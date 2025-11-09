# MomentPicker — Modern Material Edition

A compact, modern date/time picker for **Moment.js**. Single-file drop‑in, no build required. Vanilla JS with an optional jQuery bridge. Automatically injects its own styles and (if needed) fetches Moment.js from a CDN.

- **Modes:** date, month, year (+ optional time)
- **Constraints:** absolute or relative min/max (e.g. `-1y`, `+6M`, `-2w`, `+14d`)
- **UX:** auto-flip positioning, ripple buttons, accessible labels, keyboard open/close
- **Styling:** CSS custom properties, dark‑mode aware, theme hook (`theme` option)

---

## Installation

**CDN / script tag (no build):**
```html
<!-- Optional: load Moment yourself to avoid the CDN fallback -->
<script src="https://cdn.jsdelivr.net/npm/moment@2.30.1/moment.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/momentpicker-modern-material/dist/momentpicker.min.js"></script>
```

**npm / ESM:**
```bash
npm i momentpicker-modern-material
```

```js
import MomentPicker from 'momentpicker-modern-material';

const picker = new MomentPicker('#date', { format: 'YYYY-MM-DD' });
```

> **Browser‑only:** The picker targets `window/document`. It’s not intended for SSR.

---

## Quickstart

```html
<input id="when" placeholder="YYYY-MM-DD" />
<script>
  const p = new MomentPicker('#when', {
    minDate: '-1y',
    maxDate: '+6M',
    showToday: true,
    includeTime: false
  });
</script>
```

**Inline calendar:**
```js
new MomentPicker('#host', { inline: true });
```

**Time picking with Apply:**
```js
new MomentPicker('#when', {
  includeTime: true,
  use12h: true,
  minuteStep: 15,
  showApply: true,
  datetimeFormat: 'YYYY-MM-DD hh:mm A'
});
```

**Write to a different input (sink):**
```js
new MomentPicker('#button', {
  targetInput: '#hidden',
  format: 'YYYY-MM-DD'
});
```

**jQuery bridge (optional):**
```js
$('#element').momentPicker({ includeTime: true });
$('#element').momentPicker('open');   // call methods via string name
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
| `selectionMode` | `'date' \| 'month' \| 'year'` | `'date'` | Sets the starting view and commit behavior. |
| `includeTime` | boolean | `false` | Enables time selectors + Now/Apply (if `showApply`). |
| `format` | string | `'YYYY-MM-DD'` | Output format when `includeTime=false`. |
| `datetimeFormat` | string | `'YYYY-MM-DD HH:mm'` | Output format when `includeTime=true`. |
| `use12h` | boolean | `false` | 12‑hour clock; shows AM/PM. |
| `minuteStep` | number | `5` | Minute increments for selector & Now button rounding. |
| `locale` | string | current moment locale | Used for formatting, weekdays, first day of week. |
| `firstDay` | `0..6 \| null` | `null` | Force first day of week (null = locale default). |
| `minDate` / `maxDate` | Momentish \| relative string | `null` | Accepts `Date`, number, ISO/string, `moment`, or relative strings like `-1y`, `+6M`, `-2w`, `+14d`. |
| `blockFromTodayForward` | boolean | `false` | Disallow today and future (day granularity). |
| `blockFromTodayBackward` | boolean | `false` | Disallow today and past. |
| `disable` | `(m: moment) => boolean` | `null` | Per‑day custom disabling. |
| `inline` | boolean | `false` | Renders inline within the host element. |
| `position` | `'auto' \| 'top' \| 'bottom'` | `'auto'` | Popup anchor behavior with auto‑flip. |
| `zIndex` | number | `9999` | Popup stacking. |
| `autoClose` | boolean | `true` | Close on commit. |
| `showToday` / `showClear` / `showNow` / `showApply` | boolean | `true` | `showNow` appears when `includeTime=true`. |
| `theme` | string | `''` | Appended to the root selector (`.mc-root`), perfect for theming. |
| `clickableStyle` | boolean | `true` | Adds dotted underline and pointer to non‑inline triggers. |
| `preventDefaultOnOpen` | boolean | `true` | Prevents navigation/submit on anchor/button triggers. |
| `required` | boolean | `false` | Simple required validation. |
| `validate` | `(m: moment \| null, inst) => string \| null` | `null` | Return a message string to block commit. |
| `targetInput` | `string \| HTMLElement \| null` | `null` | If set, output is written there (instead of the trigger). |
| `onOpen/onClose/onChange` | callbacks | `null` | `onChange` receives the `moment` (or `null`). |

**Commit semantics:**  
- With `includeTime=true` **and** `showApply=true`, picking a day or changing time **does not** commit until the **Apply** button is clicked.  
- **Today** and **Clear** apply immediately.  
- When writing to input/textarea sinks, the picker dispatches native `input` and `change` events for integrations.

---

## Theming & CSS variables

The component injects its own CSS (light + dark via `prefers-color-scheme`). Override via custom properties (global or within a theme class passed in `options.theme`):

```css
.my-theme {
  --mc-bg: #fff;
  --mc-fg: #1f2937;
  --mc-muted: #6b7280;
  --mc-border: #e5e7eb;
  --mc-hover: #f3f4f6;
  --mc-primary: #3f51b5;
  --mc-primary-contrast: #fff;
  --mc-shadow: 0 10px 28px rgba(0,0,0,.14);
  --mc-radius: 12px;
  --mc-cell-h: 36px;
  --mc-font: Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
}
```

Pass the theme: `new MomentPicker('#btn', { theme: 'my-theme' });`

---

## Accessibility & keyboard

- Trigger receives `tabindex="0"`, `aria-haspopup="dialog"`, and toggles `aria-expanded`.
- Close with `Esc`. Open with `Enter`, `Space`, or `ArrowDown` on the trigger.
- Error area uses `aria-live="polite"`.
- Calendar grid uses `role="grid"` and cells are buttons.

---

## Tips & troubleshooting

- **Moment loading:** If `window.moment` is absent, the picker injects `https://cdn.jsdelivr.net/npm/moment@2.30.1/moment.min.js`. Some CSPs block this; preload Moment yourself to avoid network injection.
- **Relative bounds:** Supported units are years (`y`), months (`M`), weeks (`w`), days (`d`). Examples: `-1y`, `+2M`, `-3w`, `+10d`.
- **Disable specific days:**
  ```js
  disable: (m) => m.day() === 0 || m.day() === 6
  ```
- **Positioning:** The popup auto‑flips to fit viewport; set `position: 'top'|'bottom'` to force.

---

## Browser support

Modern evergreen browsers. The picker uses `classList`, `closest`, CSS variables, and `prefers-color-scheme`.

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

---

## License

MIT © 2025 Your Name
