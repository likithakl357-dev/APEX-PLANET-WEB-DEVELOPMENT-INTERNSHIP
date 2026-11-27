import React from 'react';

// FreshNest brand mark: a woven basket with two leaves. Inline SVG so it stays sharp at any size.
// Keep in sync with public/brand/logo-mark.svg (the standalone asset).
const TONES = {
  color: { leafA: '#78914f', leafB: '#355b35', basket: '#355b35', weave: '#fffdf7' },
  light: { leafA: '#cfe3a8', leafB: '#fffdf7', basket: '#fffdf7', weave: '#355b35' }, // for dark backgrounds
};

export function LogoMark({ size = 28, tone = 'color', title = 'FreshNest', className }) {
  const c = TONES[tone] || TONES.color;
  return <svg className={className} width={size} height={size} viewBox="0 0 64 64" role="img" aria-label={title} focusable="false">
    <path d="M32 31C30.5 18 36 9 51 6c1.6 13.5-4.5 23.5-19 25z" fill={c.leafA} />
    <path d="M32 31C34 20.5 28.5 12 15 10c-1.4 11.5 3.7 19.8 17 21z" fill={c.leafB} />
    <path d="M6 33.5h52a2.6 2.6 0 0 1 0 5.2H6a2.6 2.6 0 0 1 0-5.2z" fill={c.basket} />
    <path d="M9.5 41h45l-4.2 11.4A6 6 0 0 1 44.7 56H19.3a6 6 0 0 1-5.6-3.6z" fill={c.basket} />
    <g fill="none" stroke={c.weave} strokeWidth="1.7" strokeLinecap="round" opacity=".9">
      <path d="M12.6 46.6h38.8M16.2 51.6h31.6" />
      <path d="M24 41.6v14M32 41.6v14M40 41.6v14" opacity=".55" />
    </g>
  </svg>;
}
