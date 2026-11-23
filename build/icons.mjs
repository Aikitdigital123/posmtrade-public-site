// Semi-graphic illustrations of the product types (inline SVG, brand colours).
// Keys are the "icon" values used in src/content/<lang>.json → services.items.
import {
  barketa,
  counterDisplay,
  cube,
  decoration,
  figure,
  floorDisplay,
  labelsMarking,
  palletFrame,
  shelfStrips,
  shippingBox,
  topperBranding,
  tray,
} from "./scenes.mjs";

const svg = (body) => `<svg viewBox="0 0 96 96" aria-hidden="true">${body}</svg>`;

export const icons = {
  // isometric, detailed (build/scenes.mjs)
  floor: floorDisplay(),
  table: counterDisplay(),
  topper: topperBranding(),
  shelf: shelfStrips(),
  label: labelsMarking(),
  box: shippingBox(),
  barketa: barketa(),
  figure: figure(),
  decoration: decoration(),
  pallet: palletFrame(),
  tray: tray(),
  cube: cube(),
};
