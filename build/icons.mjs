// Semi-graphic illustrations of the product types (inline SVG, brand colours).
// Keys are the "icon" values used in src/content/<lang>.json → services.items.
const svg = (body) => `<svg viewBox="0 0 96 96" aria-hidden="true">${body}</svg>`;

export const icons = {
  floor: svg(`
    <path d="M28 18h40v66H28z" fill="#e6f6fd"/>
    <path d="M68 18l10-6v66l-10 6z" fill="#0a8fd0"/>
    <path d="M24 14h48v8H24z" fill="#2cc4f4" class="i-pop"/>
    <g class="i-rise"><rect x="32" y="30" width="10" height="12" rx="2" fill="#ff7a59"/><rect x="45" y="32" width="10" height="10" rx="2" fill="#ffc94d"/><rect x="58" y="29" width="7" height="13" rx="2" fill="#3ddc97"/></g>
    <rect x="28" y="42" width="40" height="5" rx="1.5" fill="#0b2540"/>
    <g class="i-rise" style="--d:.1s"><rect x="32" y="52" width="12" height="10" rx="2" fill="#7c6cff"/><rect x="47" y="50" width="9" height="12" rx="2" fill="#ff7a59"/><rect x="59" y="53" width="7" height="9" rx="2" fill="#ffc94d"/></g>
    <rect x="28" y="62" width="40" height="5" rx="1.5" fill="#0b2540"/>
    <rect x="26" y="80" width="44" height="6" rx="2" fill="#0b2540"/>`),
  table: svg(`
    <path d="M18 74h60v6H18z" fill="#0b2540"/>
    <path d="M24 46h44v28H24z" fill="#e6f6fd"/>
    <path d="M68 46l8-5v28l-8 5z" fill="#0a8fd0"/>
    <path d="M24 30h44l-6 16H30z" fill="#2cc4f4" class="i-pop"/>
    <g class="i-rise"><rect x="29" y="54" width="9" height="14" rx="2" fill="#ff7a59"/><rect x="41" y="56" width="9" height="12" rx="2" fill="#ffc94d"/><rect x="53" y="53" width="9" height="15" rx="2" fill="#3ddc97"/></g>
    <rect x="22" y="68" width="48" height="6" rx="2" fill="#0a8fd0"/>`),
  topper: svg(`
    <path d="M20 58V40c0-14 12-24 26-24h8c14 0 22 10 22 24v18z" fill="#2cc4f4" class="i-pop"/>
    <circle cx="36" cy="38" r="10" fill="#fff"/>
    <path d="M33 32h5a4 4 0 0 1 0 8h-2v4h-3z" fill="#0a8fd0"/>
    <rect x="50" y="32" width="18" height="5" rx="2.5" fill="#fff"/>
    <rect x="50" y="41" width="12" height="4" rx="2" fill="#ffffffaa"/>
    <path d="M26 58h44v24H26z" fill="#e6f6fd"/>
    <path d="M70 58l6-4v24l-6 4z" fill="#0a8fd0"/>`),
  shelf: svg(`
    <path d="M10 38h76" stroke="#0b2540" stroke-width="4"/>
    <g class="i-rise"><rect x="16" y="20" width="12" height="18" rx="2" fill="#ffc94d"/><rect x="31" y="24" width="12" height="14" rx="2" fill="#ff7a59"/><rect x="52" y="18" width="12" height="20" rx="2" fill="#7c6cff"/><rect x="67" y="22" width="12" height="16" rx="2" fill="#3ddc97"/></g>
    <rect x="10" y="40" width="76" height="12" rx="2" fill="#2cc4f4" class="i-slide"/>
    <rect x="16" y="44" width="26" height="4" rx="2" fill="#fff"/>
    <path d="M60 40h18v22l-9-5-9 5z" fill="#ff7a59" class="i-swing"/>
    <path d="M10 76h76" stroke="#0b2540" stroke-width="4"/>`),
  label: svg(`
    <g class="i-pop"><rect x="18" y="22" width="44" height="54" rx="6" fill="#e6f6fd"/><rect x="26" y="30" width="28" height="6" rx="3" fill="#0a8fd0"/><rect x="26" y="42" width="20" height="4" rx="2" fill="#9fcfe3"/><path d="M26 54h2v12h-2zm4 0h1v12h-1zm3 0h3v12h-3zm5 0h1v12h-1zm3 0h2v12h-2zm4 0h1v12h-1zm3 0h2v12h-2z" fill="#0b2540"/></g>
    <g class="i-rise" style="--d:.15s"><rect x="44" y="34" width="36" height="44" rx="6" fill="#2cc4f4"/><circle cx="62" cy="50" r="8" fill="#fff"/><rect x="52" y="64" width="20" height="4" rx="2" fill="#fff"/></g>`),
  box: svg(`
    <path d="M48 20l30 14-30 14-30-14z" fill="#e6f6fd" class="i-pop"/>
    <path d="M18 34v32l30 14V48z" fill="#2cc4f4"/>
    <path d="M78 34v32L48 80V48z" fill="#0a8fd0"/>
    <path d="M33 27l30 14v10" stroke="#0b2540" stroke-width="3" fill="none"/>
    <path d="M26 56l8 4M26 62l8 4" stroke="#fff" stroke-width="3" stroke-linecap="round"/>`),
};
