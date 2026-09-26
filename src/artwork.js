// A small, local renderer for the original photo collages and illustrations.
// This keeps their crops, rotations, frames and tape without Canva's scripts.
import design from './design.json';
export const asset = id => import.meta.env.BASE_URL + design.media[id].files[0].url;
const ns = 'http://www.w3.org/2000/svg';
let sequence = 0;
function svgElement(tag, attrs = {}) {
  const el = document.createElementNS(ns, tag);
  for (const [key, value] of Object.entries(attrs)) el.setAttribute(key, value);
  return el;
}
function imageFill(fill) {
  const ref = fill.B;
  if (!ref) return null;
  const box = ref.B;
  return svgElement('image', { href: asset(ref.A.A), x: box.B, y: box.A, width: box.D, height: box.C, preserveAspectRatio: 'none' });
}
function draw(element) {
  // Canva stores transparency (0 = opaque), not opacity. Preserve it on frames.
  const g = svgElement('g', { transform: `translate(${element.B} ${element.A}) rotate(${element.E || 0} ${element.D / 2} ${element.C / 2})`, opacity: 1 - (element.F || 0) });
  if (element['A?'] === 'H') {
    const children = svgElement('g', { transform: `scale(${element.D / element.b} ${element.C / element.a})` });
    for (const child of element.c) children.append(draw(child));
    g.append(children);
  } else if (element['A?'] === 'I') {
    const id = `crop-${sequence++}`;
    const clip = svgElement('clipPath', { id });
    clip.append(svgElement('rect', { width: element.D, height: element.C }));
    g.append(clip);
    const inner = svgElement('g', { 'clip-path': `url(#${id})` });
    const image = imageFill(element.a);
    if (image) {
      if (element.a.G || element.a.H) image.setAttribute('transform', `translate(${element.a.G ? element.D : 0} ${element.a.H ? element.C : 0}) scale(${element.a.G ? -1 : 1} ${element.a.H ? -1 : 1})`);
      inner.append(image);
    }
    g.append(inner);
  } else if (element['A?'] === 'J') {
    const shapes = svgElement('svg', { width: element.D, height: element.C, viewBox: `0 0 ${element.a.D} ${element.a.C}`, preserveAspectRatio: 'none' });
    for (const shape of element.b) {
      if (shape.B.B) {
        const id = `shape-${sequence++}`;
        const clip = svgElement('clipPath', { id });
        clip.append(svgElement('path', { d: shape.A }));
        const group = svgElement('g', { 'clip-path': `url(#${id})` });
        group.append(imageFill(shape.B));
        shapes.append(clip, group);
      } else shapes.append(svgElement('path', { d: shape.A, fill: shape.B.C || 'none' }));
    }
    g.append(shapes);
  } else if (element['A?'] === 'K') {
    const styles = Object.assign({}, ...element.a.C.C.map(s => Object.fromEntries(Object.entries(s).filter(([, v]) => typeof v === 'string'))));
    const font = design.fonts.find(f => f.A === styles.C?.split(',')[0]);
    const scale = element.e ? element.D / element.e : 1;
    const size = parseFloat(styles.G || '16') * scale;
    const text = svgElement('text', { x: element.D / 2, y: size * .9, 'text-anchor': 'middle', fill: styles.M || '#272727', 'font-family': font?.C || 'serif', 'font-size': size, 'letter-spacing': styles.W || 0 });
    text.textContent = element.a.C.A.join('').trim();
    if (styles['0'] === 'uppercase') text.textContent = text.textContent.toUpperCase();
    g.append(text);
  }
  return g;
}
export function collage(sectionIndex, label) {
  const elements = design.sections[sectionIndex].E.filter(e => e['A?'] === 'H');
  const left = Math.min(...elements.map(e => e.B)) - 14;
  const top = Math.min(...elements.map(e => e.A)) - 14;
  const right = Math.max(...elements.map(e => e.B + e.D)) + 14;
  const bottom = Math.max(...elements.map(e => e.A + e.C)) + 14;
  const svg = svgElement('svg', { viewBox: `${left} ${top} ${right - left} ${bottom - top}`, role: 'img', 'aria-label': label, class: 'collage' });
  // Dress-code footer is text, rendered separately in accessible HTML.
  for (const element of elements) if (sectionIndex !== 4 || element.C > 100) svg.append(draw(element));
  if (sectionIndex === 4) {
    const e = elements.find(e => e.C > 100);
    svg.setAttribute('viewBox', `${e.B - 14} ${e.A - 14} ${e.D + 28} ${e.C + 28}`);
  }
  return svg;
}
export function installFonts() {
  const css = design.fonts.flatMap(f => f.D.map(s => `@font-face{font-family:"${f.C}";src:url("${import.meta.env.BASE_URL}${s.files[0].url}") format("woff");font-style:${s.style.includes('ITALICS') ? 'italic' : 'normal'};font-weight:${s.style.includes('BOLD') ? 700 : 400};font-display:swap;}`)).join('\n');
  const style = document.createElement('style');
  style.textContent = css;
  document.head.append(style);
}
