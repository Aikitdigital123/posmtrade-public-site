// Drawn agent badges (no photos of people). Keys = "avatar" in src/content/<lang>.json → agents.items.
// Each badge: gradient disc in the agent's colour + a white line icon of what the agent does.
// Parts with class "ai-move" animate when the card is hovered.
const badge = (id, from, to, body) => `<svg viewBox="0 0 96 96" aria-hidden="true">
  <defs><linearGradient id="ag-${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/></linearGradient></defs>
  <circle cx="48" cy="48" r="46" fill="url(#ag-${id})"/>
  <circle cx="48" cy="48" r="46" fill="none" stroke="#fff" stroke-opacity=".25" stroke-width="2"/>
  <g fill="none" stroke="#fff" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round">${body}</g>
</svg>`;

export const agentIcons = {
  // logistics: truck with a check
  galochka: badge(
    "galochka",
    "#2cc4f4",
    "#0a6fb0",
    `<path d="M20 34h34v26H20zM54 42h12l8 9v9H54z"/><circle cx="30" cy="62" r="5" fill="#0a6fb0"/><circle cx="64" cy="62" r="5" fill="#0a6fb0"/>
     <path class="ai-move" d="m28 46 5 5 10-10"/>`,
  ),
  // reports: bar chart on a sheet
  zvitnyk: badge(
    "zvitnyk",
    "#7c6cff",
    "#3b2fb8",
    `<path d="M28 20h30l10 10v46H28z"/><path d="M58 20v10h10"/>
     <g class="ai-move"><path d="M37 64V52M46 64V44M55 64V48"/></g>`,
  ),
  // labels: tag with barcode
  nalipka: badge(
    "nalipka",
    "#ff9a6b",
    "#e5533a",
    `<path d="M22 40 40 22h30v30L52 70z"/><circle cx="61" cy="31" r="4"/>
     <g class="ai-move"><path d="M36 46l12 12M41 41l12 12M46 36l12 12"/></g>`,
  ),
  // PDF → table
  formatynka: badge(
    "formatynka",
    "#3ddc97",
    "#0f9a68",
    `<path d="M18 26h22v30H18z"/><path d="M23 35h12M23 42h8"/>
     <path class="ai-move" d="M44 41h10m-4-4 4 4-4 4"/>
     <path d="M58 30h20v24H58zM58 38h20M58 46h20M66 30v24"/>`,
  ),
  // measuring: tape ruler with m²
  mirka: badge(
    "mirka",
    "#ffc94d",
    "#e08a00",
    `<path d="M18 56h60v14H18z"/><path d="M26 56v6M34 56v4M42 56v6M50 56v4M58 56v6M66 56v4"/>
     <g class="ai-move"><path d="M34 26h22v22H34z"/><path d="M60 24h6l-6 7h6" stroke-width="2.6"/></g>`,
  ),
  // purchasing: cart with box
  kramar: badge(
    "kramar",
    "#ff7a59",
    "#b8362a",
    `<path d="M18 26h8l7 30h34l6-22H30"/><circle cx="38" cy="66" r="4"/><circle cx="62" cy="66" r="4"/>
     <path class="ai-move" d="M40 36h18v12H40zM49 36v12"/>`,
  ),
  // project search: magnifier over a picture
  vizualchik: badge(
    "vizualchik",
    "#2cc4f4",
    "#5b4bd8",
    `<path d="M20 26h40v30H20z"/><path d="m24 52 10-12 8 8 6-6 8 10"/>
     <g class="ai-move"><circle cx="60" cy="56" r="11"/><path d="m68 64 9 9"/></g>`,
  ),
  // 3D mock-ups: isometric cube
  maketchyk: badge(
    "maketchyk",
    "#0b2540",
    "#0a8fd0",
    `<g class="ai-move"><path d="M48 20 72 33v28L48 74 24 61V33z"/><path d="M24 33l24 13 24-13M48 46v28"/></g>`,
  ),
  // contracts: document with signature
  dogovir: badge(
    "dogovir",
    "#5b6b7f",
    "#1f2f45",
    `<path d="M28 18h28l12 12v48H28z"/><path d="M36 34h20M36 42h24M36 50h16"/>
     <path class="ai-move" d="M36 66c4-6 7-6 8 0s5 4 8-2 6-2 8 2"/>`,
  ),
  // document flow: document with a clock
  vchasnyk: badge(
    "vchasnyk",
    "#2cc4f4",
    "#0b6a9e",
    `<path d="M24 20h28l10 10v40H24z"/><path d="M32 36h18M32 44h12"/>
     <g class="ai-move"><circle cx="62" cy="62" r="13" fill="#0b6a9e"/><path d="M62 55v8l5 3"/></g>`,
  ),
};
