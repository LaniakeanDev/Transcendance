#!/usr/bin/env node
// Read-only WCAG 1.4.3 contrast audit for every foreground/background color pair
// actually used in the app (light and dark mode). No CSS is changed by this script —
// it only reports ratios and, for failures, proposes a minimally-adjusted hex for a
// human to review (see ACCESSIBILITY_AUDIT.md, "Contrast" section).
//
// Formula: WCAG 2.x relative luminance / contrast ratio, implemented directly
// (https://www.w3.org/TR/WCAG21/#dfn-relative-luminance) — no extra dependency needed.

function hexToRgb(hex) {
  const n = hex.replace('#', '');
  const full = n.length === 3
    ? n.split('').map((c) => c + c).join('')
    : n;
  const int = parseInt(full, 16);
  return [(int >> 16) & 255, (int >> 8) & 255, int & 255];
}

function relativeLuminance([r, g, b]) {
  const lin = (c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  const [rl, gl, bl] = [lin(r), lin(g), lin(b)];
  return 0.2126 * rl + 0.7152 * gl + 0.0722 * bl;
}

function contrastRatio(hex1, hex2) {
  const l1 = relativeLuminance(hexToRgb(hex1));
  const l2 = relativeLuminance(hexToRgb(hex2));
  const [lighter, darker] = l1 >= l2 ? [l1, l2] : [l2, l1];
  return (lighter + 0.05) / (darker + 0.05);
}

// Alpha-composite `fgHex` at `alpha` over `bgHex` (both opaque hexes), returning the
// resulting opaque hex — used for the one gradient stop that isn't fully opaque.
function compositeOver(fgHex, alpha, bgHex) {
  const [fr, fg, fb] = hexToRgb(fgHex);
  const [br, bg, bb] = hexToRgb(bgHex);
  const mix = (f, b) => Math.round(f * alpha + b * (1 - alpha));
  return `#${[mix(fr, br), mix(fg, bg), mix(fb, bb)]
    .map((v) => v.toString(16).padStart(2, '0'))
    .join('')}`;
}

// Nudge a hex color's lightness by `deltaPercent` (positive = lighter, negative =
// darker) in HSL space, keeping hue/saturation untouched — used only to *propose* a
// minimal fix for a failing pair, never applied automatically.
function adjustLightness(hex, deltaPercent) {
  const [r, g, b] = hexToRgb(hex).map((c) => c / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  const d = max - min;
  if (d !== 0) {
    s = d / (1 - Math.abs(2 * l - 1));
    switch (max) {
      case r: h = ((g - b) / d) % 6; break;
      case g: h = (b - r) / d + 2; break;
      default: h = (r - g) / d + 4;
    }
    h *= 60;
    if (h < 0) h += 360;
  }
  const newL = Math.min(1, Math.max(0, l + deltaPercent / 100));
  const c = (1 - Math.abs(2 * newL - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = newL - c / 2;
  let [r2, g2, b2] = [0, 0, 0];
  if (h < 60) [r2, g2, b2] = [c, x, 0];
  else if (h < 120) [r2, g2, b2] = [x, c, 0];
  else if (h < 180) [r2, g2, b2] = [0, c, x];
  else if (h < 240) [r2, g2, b2] = [0, x, c];
  else if (h < 300) [r2, g2, b2] = [x, 0, c];
  else [r2, g2, b2] = [c, 0, x];
  const toHex = (v) => Math.round((v + m) * 255).toString(16).padStart(2, '0');
  return `#${toHex(r2)}${toHex(g2)}${toHex(b2)}`;
}

// --- Color tokens actually defined/used in the app -------------------------------
// Tailwind v4 (this project's version) defines its palette in OKLCH, not fixed
// hex — these values are the actual sRGB a browser renders for each token
// (computed from node_modules/tailwindcss/theme.css's oklch() definitions via the
// standard OKLab/OKLCH -> linear sRGB -> sRGB conversion), not the older, slightly
// different Tailwind v3 hex table. Confirmed against a live axe-core browser run:
// gray-400 here is #99a1af, matching exactly what axe reported for a real element.
const glint = '#f5bc02';
const bgLight = '#ffffff';
const bgDark = '#0a0a0a';
const fgLight = '#171717';
const fgDark = '#ededed';

const gray = {
  100: '#f3f4f6', 200: '#e5e7eb', 300: '#d1d5dc', 400: '#99a1af',
  500: '#6a7282', 600: '#4a5565', 700: '#364153', 800: '#1e2939',
};
const neutral = {
  100: '#f5f5f5', 300: '#d4d4d4', 400: '#a1a1a1', 500: '#737373',
  600: '#525252', 700: '#404040', 900: '#171717',
};
const red = { 50: '#fef2f2', 500: '#fb2c36', 600: '#e7000b', 700: '#c10007' };
const blue = { 500: '#2b7fff' };

// --- Every foreground/background pair actually rendered, per usage site ----------
const pairs = [
  // Body text
  { label: 'Body text (light) — app/layout.tsx', fg: fgLight, bg: bgLight, large: false },
  { label: 'Body text (dark) — app/layout.tsx', fg: fgDark, bg: bgDark, large: false },

  // --glint as text
  { label: '--glint link text on white (light) — login/signup "Sign up"/"Log in" link', fg: glint, bg: bgLight, large: false },
  { label: '--glint link text on #0a0a0a (dark) — same link, no dark: override', fg: glint, bg: bgDark, large: false },
  { label: '--glint label text on white (light) — post-form "Upload an image"', fg: glint, bg: bgLight, large: false },
  { label: '--glint label text on gray-800 (dark) — post-form container is dark:bg-gray-800', fg: glint, bg: gray[800], large: false },

  // --glint as background
  { label: 'White text on --glint gradient stop, light bg behind (login/signup submit button)', fg: '#ffffff', bg: compositeOver(glint, 0.8, bgLight), large: false },
  { label: 'White text on --glint gradient stop, dark bg behind (login/signup submit button)', fg: '#ffffff', bg: compositeOver(glint, 0.8, bgDark), large: false },
  { label: 'Black text on solid --glint (post-form submit button)', fg: '#000000', bg: glint, large: false },
  { label: 'Black text on --glint skip link (app/layout.tsx, keyboard-focus only)', fg: '#000000', bg: glint, large: false },

  // gray-* on body background (no dark: override → checked against both themes)
  { label: 'gray-500 on white (light) — timestamps, helper text, comment-toggle text', fg: gray[500], bg: bgLight, large: false },
  { label: 'gray-300 on #0a0a0a (dark) — dark: counterpart of the above', fg: gray[300], bg: bgDark, large: false },
  { label: 'gray-400 on white (light) — uppercase post date, disabled "Post" button, post-form icon', fg: gray[400], bg: bgLight, large: false },
  { label: 'gray-400 on #0a0a0a (dark) — same elements, no dark: override', fg: gray[400], bg: bgDark, large: false },
  { label: 'gray-600 on white (light) — post "…" options button, no explicit card bg', fg: gray[600], bg: bgLight, large: false },
  { label: 'gray-300 on #0a0a0a (dark) — dark: counterpart of the "…" button', fg: gray[300], bg: bgDark, large: false },
  { label: 'gray-600 on gray-300 — avatar-fallback initial letter (components/post/index.tsx)', fg: gray[600], bg: gray[300], large: false },
  { label: 'gray-700 on white (light) — post-form caption label, container is bg-white', fg: gray[700], bg: bgLight, large: false },
  { label: 'gray-200 on gray-800 (dark) — dark: counterpart of the caption label', fg: gray[200], bg: gray[800], large: false },

  // red-* error text
  { label: 'red-500 on white (light) — login/signup field errors', fg: red[500], bg: bgLight, large: false },
  { label: 'red-500 on #0a0a0a (dark) — same errors, no dark: override', fg: red[500], bg: bgDark, large: false },
  { label: 'red-600 on white (light) — EditProfileForm field errors, no container bg', fg: red[600], bg: bgLight, large: false },
  { label: 'red-600 on #0a0a0a (dark) — same, no dark: override', fg: red[600], bg: bgDark, large: false },
  { label: 'red-600 on white (light) — post-form image/caption errors, container is bg-white', fg: red[600], bg: bgLight, large: false },
  { label: 'red-600 on gray-800 (dark) — same, container is dark:bg-gray-800, text has no dark: override', fg: red[600], bg: gray[800], large: false },
  { label: 'red-700 on red-50 — post-form root error box (fixed pair, not theme-dependent)', fg: red[700], bg: red[50], large: false },

  // blue link/button text
  { label: 'blue-500 on white (light) — comment-form "Post" button', fg: blue[500], bg: bgLight, large: false },
  { label: 'blue-500 on #0a0a0a (dark) — same, no dark: override', fg: blue[500], bg: bgDark, large: false },

  // neutral-* (profile pages, EditProfileForm) — no dark: overrides anywhere in these files
  { label: 'neutral-500 on white (light) — profile stat labels, "Compressing..." status', fg: neutral[500], bg: bgLight, large: false },
  { label: 'neutral-500 on #0a0a0a (dark) — same, page has no dark: text override', fg: neutral[500], bg: bgDark, large: false },
  { label: 'neutral-400 on neutral-100 — avatar-fallback initial / "No image" placeholder', fg: neutral[400], bg: neutral[100], large: false },
  { label: 'neutral-600 on white (light) — EditProfileForm inactive avatar-mode toggle button', fg: neutral[600], bg: bgLight, large: false },
  { label: 'neutral-600 on #0a0a0a (dark) — same, no dark: override', fg: neutral[600], bg: bgDark, large: false },
  { label: 'neutral-700 on white (light) — profile bio text', fg: neutral[700], bg: bgLight, large: false },
  { label: 'neutral-700 on #0a0a0a (dark) — same, no dark: override', fg: neutral[700], bg: bgDark, large: false },

  // Found via a live axe-core/cli run (step 7), not present in the earlier static list:
  { label: 'White text on #4CAF50 — CookieBanner "J\'accepte" button', fg: '#ffffff', bg: '#4CAF50', large: false },

  // UI-component (non-text) boundaries — WCAG 1.4.11, 3:1 minimum
  { label: '[UI] gray-200 card border on white (light) — login/signup/post card', fg: gray[200], bg: bgLight, large: true, uiComponent: true },
  { label: '[UI] gray-600 card border on #0a0a0a (dark) — dark: counterpart', fg: gray[600], bg: bgDark, large: true, uiComponent: true },
  { label: '[UI] neutral-300 border on white (light) — EditProfileForm/profile buttons & inputs', fg: neutral[300], bg: bgLight, large: true, uiComponent: true },
];

function verdict(ratio, { large, uiComponent }) {
  const threshold = uiComponent || large ? 3 : 4.5;
  return { threshold, pass: ratio >= threshold };
}

const rows = pairs.map((p) => {
  const ratio = contrastRatio(p.fg, p.bg);
  const { threshold, pass } = verdict(ratio, p);
  const row = {
    label: p.label,
    fg: p.fg,
    bg: p.bg,
    ratio: Math.round(ratio * 100) / 100,
    threshold,
    pass,
  };
  if (!pass) {
    // Propose the smallest lightness nudge (in the direction that increases contrast)
    // that reaches the threshold, in 1% steps, capped at a 40% search range.
    const darkerBg = relativeLuminance(hexToRgb(p.bg)) < 0.5;
    const direction = darkerBg ? 1 : -1; // lighten fg on dark bg, darken fg on light bg
    let proposed = null;
    for (let step = 1; step <= 40; step++) {
      const candidate = adjustLightness(p.fg, direction * step);
      if (contrastRatio(candidate, p.bg) >= threshold) {
        proposed = candidate;
        break;
      }
    }
    row.proposedFg = proposed;
    row.proposedRatio = proposed
      ? Math.round(contrastRatio(proposed, p.bg) * 100) / 100
      : null;
  }
  return row;
});

const failures = rows.filter((r) => !r.pass);

console.log('# Contrast audit\n');
for (const r of rows) {
  const status = r.pass ? 'PASS' : 'FAIL';
  const fix = r.pass
    ? ''
    : r.proposedFg
      ? ` — proposed fg ${r.proposedFg} → ${r.proposedRatio}:1 (NOT applied)`
      : ' — no lightness-only nudge within 40% reaches threshold; needs a different fix (see report)';
  console.log(`[${status}] ${r.ratio}:1 (need ${r.threshold}:1) — ${r.label} (fg ${r.fg} / bg ${r.bg})${fix}`);
}
console.log(`\n${rows.length} pairs checked, ${failures.length} below threshold.`);

if (failures.length > 0) {
  console.log('\nMarkdown table for ACCESSIBILITY_AUDIT.md:\n');
  console.log('| Pair | Ratio | Threshold | Proposed fg (not applied) | New ratio |');
  console.log('|---|---|---|---|---|');
  for (const r of failures) {
    const proposed = r.proposedFg ? `\`${r.proposedFg}\`` : '_none within 40%_';
    const newRatio = r.proposedRatio ? `${r.proposedRatio}:1` : '—';
    console.log(
      `| ${r.label} (${r.fg} on ${r.bg}) | ${r.ratio}:1 | ${r.threshold}:1 | ${proposed} | ${newRatio} |`
    );
  }
}
