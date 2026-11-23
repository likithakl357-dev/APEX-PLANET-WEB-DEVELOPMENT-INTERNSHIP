import React, { useState } from 'react';
import { imageFor } from '../data/productImages.js';
import { LogoMark } from './Logo.jsx';

// Category tints reuse the palette of the homepage category tiles.
const TINTS = ['#f0f4df', '#edf4f2', '#f8f0d9', '#f5eee5', '#f6e9e7', '#f2eafa'];
const tintOf = p => TINTS[Number(String(p.id).split('-')[0]) % TINTS.length];

/** Clean placeholder used whenever a product has no verified photo. Shows the real brand, name and pack size. */
export function PackPlaceholder({ product }) {
  return <div className="pack-ph" style={{ '--tint': tintOf(product) }} role="img" aria-label={`${product.brand} ${product.name}, ${product.unit}. Photo coming soon.`}>
    <div className="pack-body">
      <span className="pack-brand">{product.brand}</span>
      <LogoMark className="pack-glyph" size={40} title="" />
      <b className="pack-name">{product.name}</b>
      <span className="pack-unit">{product.unit}</span>
    </div>
  </div>;
}

export function ProductImage({ product }) {
  const photo = imageFor(product);
  const [broken, setBroken] = useState(false);
  const show = photo && !broken;
  return <div className="product-visual">
    {show
      ? <img className="product-photo" src={photo.src} alt={photo.alt || `${product.brand} ${product.name}`} loading="lazy" decoding="async" onError={() => setBroken(true)} />
      : <PackPlaceholder product={product} />}
    {show && photo.credit && (photo.source
      ? <a className="image-source-note" href={photo.source} target="_blank" rel="noreferrer">Photo: {photo.credit}</a>
      : <span className="image-source-note">Photo: {photo.credit}</span>)}
    {!show && <span className="image-source-note">Photo coming soon</span>}
    <span className="product-tag">{product.tag}</span>
  </div>;
}

/** Small thumbnail for cart / checkout rows: verified photo if there is one, otherwise the product emoji. */
export function ProductThumb({ product }) {
  const photo = imageFor(product);
  const [broken, setBroken] = useState(false);
  return photo && !broken
    ? <img className="thumb-img" src={photo.src} alt={photo.alt || `${product.brand} ${product.name}`} loading="lazy" onError={() => setBroken(true)} />
    : <span role="img" aria-label={product.name}>{product.emoji}</span>;
}
