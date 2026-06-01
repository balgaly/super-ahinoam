// Themed 16x16 pixel-style glyphs, one per milestone.
// Inner SVG markup only; glyphDataUri() wraps + encodes for an <img src>.
// Kept as data: URIs so they stay within the existing CSP (img-src data:).

export const GLYPHS: Record<string, string> = {
  // Flying Carpet — flight ops -> paper plane
  flying_carpet:
    '<polygon points="1,8 15,3 15,7 7,8 15,9 15,13" fill="#fff"/>',

  // Imaginarium retail -> storefront
  imaginarium:
    '<polygon points="2,6 8,2 14,6" fill="#ff8a8a"/><rect x="3" y="6" width="10" height="8" fill="#ffe27a"/><rect x="6" y="9" width="4" height="5" fill="#7a4a1a"/>',

  // iPlan -> clipboard
  iplan:
    '<rect x="3" y="2" width="10" height="12" fill="#ffe27a"/><rect x="6" y="1" width="4" height="2" fill="#bbb"/><rect x="5" y="5" width="6" height="1.5" fill="#7a4a1a"/><rect x="5" y="8" width="6" height="1.5" fill="#7a4a1a"/>',

  // Dermador -> globe (4 countries)
  dermador:
    '<circle cx="8" cy="8" r="6" fill="#6bd0ff"/><path d="M2 8 H14 M8 2 V14 M4.5 4 Q8.5 8 4.5 12 M11.5 4 Q7.5 8 11.5 12" stroke="#1a6a8a" fill="none" stroke-width="0.8"/>',

  // Shaldag -> ledger book
  shaldag:
    '<rect x="3" y="3" width="10" height="10" fill="#ffe27a"/><rect x="7.2" y="3" width="1.6" height="10" fill="#c8842a"/><rect x="4" y="5.5" width="2.5" height="1" fill="#7a4a1a"/><rect x="9.5" y="5.5" width="2.5" height="1" fill="#7a4a1a"/>',

  // Levi Trucks -> truck
  levi_trucks:
    '<rect x="1" y="6" width="8" height="5" fill="#ffe27a"/><rect x="9" y="8" width="4" height="3" fill="#ff8a8a"/><rect x="9.5" y="8.3" width="2.5" height="1.6" fill="#cde7ff"/><circle cx="4" cy="12" r="1.6" fill="#333"/><circle cx="11" cy="12" r="1.6" fill="#333"/>',

  // SE Ops clients -> two people
  se_ops_clients:
    '<circle cx="5" cy="5" r="2" fill="#fff"/><circle cx="11" cy="5" r="2" fill="#ffd700"/><path d="M2 13 Q5 8 8 13 Z" fill="#fff"/><path d="M8 13 Q11 8 14 13 Z" fill="#ffd700"/>',

  // SE Ops billing fix -> receipt with checkmark (recovered billable events)
  se_ops_billing:
    '<rect x="3" y="2" width="10" height="12" fill="#fff"/><path d="M3 14 l1.6 -1.2 1.6 1.2 1.6 -1.2 1.6 1.2 1.6 -1.2 1.4 1.2 V2 H3 Z" fill="#fff"/><rect x="5" y="4.5" width="6" height="1" fill="#bbb"/><rect x="5" y="6.5" width="4" height="1" fill="#bbb"/><path d="M5 10 L7 12 L11 7.5" stroke="#2aa84a" stroke-width="1.6" fill="none"/>',

  // SE Ops reports -> bar chart
  se_ops_reports:
    '<rect x="2" y="9" width="3" height="5" fill="#6bd0ff"/><rect x="6.5" y="6" width="3" height="8" fill="#ffd700"/><rect x="11" y="3" width="3" height="11" fill="#8aff8a"/>',

  // SE PM step-up -> promotion arrow
  se_pm_step_up:
    '<polygon points="8,1 14,8 10.5,8 10.5,15 5.5,15 5.5,8 2,8" fill="#8aff8a"/>',

  // SE PM data model -> database cylinder
  se_pm_data_model:
    '<rect x="2" y="3.5" width="12" height="9" fill="#6bd0ff"/><ellipse cx="8" cy="12.5" rx="6" ry="2.2" fill="#4aa8d8"/><ellipse cx="8" cy="3.5" rx="6" ry="2.2" fill="#9adcff"/><ellipse cx="8" cy="8" rx="6" ry="2.2" fill="none" stroke="#4aa8d8" stroke-width="0.7"/>',

  // SE PM tickets -> support ticket
  se_pm_tickets:
    '<rect x="2" y="4" width="12" height="8" fill="#ffe27a"/><circle cx="2" cy="8" r="1.6" fill="#5c94fc"/><circle cx="14" cy="8" r="1.6" fill="#5c94fc"/><rect x="7.4" y="5" width="1.2" height="6" fill="#7a4a1a"/>',

  // SE PM volume -> magnifier over data
  se_pm_volume:
    '<rect x="4.5" y="6.5" width="1.3" height="2.5" fill="#ffd700"/><rect x="6.5" y="5" width="1.3" height="4" fill="#ffd700"/><circle cx="7" cy="7" r="4.5" fill="none" stroke="#fff" stroke-width="1.4"/><line x1="10" y1="10" x2="14.5" y2="14.5" stroke="#fff" stroke-width="2"/>',

  // SE PM module -> shield (fake-accounts block)
  se_pm_module:
    '<path d="M8 1 L14 4 V8 Q14 13 8 15 Q2 13 2 8 V4 Z" fill="#ff8a8a"/><path d="M5.5 8 L7.2 10 L10.5 5.5" stroke="#fff" stroke-width="1.6" fill="none"/>',

  // SE PM savings -> clock (hours saved)
  se_pm_savings:
    '<circle cx="8" cy="8" r="6" fill="#ffe27a"/><circle cx="8" cy="8" r="6" fill="none" stroke="#c8842a" stroke-width="1"/><line x1="8" y1="8" x2="8" y2="4" stroke="#1a1a1a" stroke-width="1.2"/><line x1="8" y1="8" x2="11" y2="9" stroke="#1a1a1a" stroke-width="1.2"/>'
};

export function glyphDataUri(id: string): string {
  const inner = GLYPHS[id] ?? '<circle cx="8" cy="8" r="5" fill="#ffd700"/>';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">${inner}</svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}
