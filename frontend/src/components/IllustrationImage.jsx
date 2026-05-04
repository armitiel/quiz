import { useState, useEffect } from 'react';

/**
 * Komponent obrazka z automatycznym fallbackiem.
 *
 * Mapuje image_path z bazy ('/img/X.svg') na PNG ('/ilustracje/X.png').
 * Sprawdza Content-Type głowicą - jeśli serwer zwraca obrazek, używa PNG.
 * W przeciwnym wypadku (np. Vite zwraca index.html dla brakującego pliku) → fallback do SVG.
 *
 * Cache decyzji w window żeby nie sprawdzać tego samego pliku wielokrotnie.
 */

const cache = new Map(); // url -> 'ok' | 'missing'

async function checkImage(url) {
  if (cache.has(url)) return cache.get(url) === 'ok';
  try {
    const resp = await fetch(url, { method: 'HEAD' });
    if (!resp.ok) {
      cache.set(url, 'missing');
      return false;
    }
    const ct = resp.headers.get('content-type') || '';
    const isImage = ct.startsWith('image/');
    cache.set(url, isImage ? 'ok' : 'missing');
    return isImage;
  } catch {
    cache.set(url, 'missing');
    return false;
  }
}

export default function IllustrationImage({ src, alt = '', className = '', ...rest }) {
  const png = pathToPng(src);
  const [resolvedSrc, setResolvedSrc] = useState(src); // domyślnie SVG od razu (instant render)

  useEffect(() => {
    let cancelled = false;
    if (!png) {
      setResolvedSrc(src);
      return;
    }

    // Asynchroniczne sprawdzenie czy PNG istnieje
    checkImage(png).then((exists) => {
      if (cancelled) return;
      setResolvedSrc(exists ? png : src);
    });

    return () => { cancelled = true; };
  }, [src, png]);

  return (
    <img
      src={resolvedSrc}
      alt={alt}
      className={className}
      onError={(e) => { e.target.style.display = 'none'; }}
      {...rest}
    />
  );
}

/**
 * Mapuje /img/X.svg → /ilustracje/X.png
 */
function pathToPng(imagePath) {
  if (!imagePath || typeof imagePath !== 'string') return null;
  const match = imagePath.match(/^\/img\/(.+)\.(svg|png|jpg|jpeg)$/i);
  if (!match) return null;
  return `/ilustracje/${match[1]}.png`;
}
