import { useState, useRef, useCallback } from 'react';
import { Image as ImageIcon, ExternalLink, MapPin, AlertTriangle } from 'lucide-react';
import { AnnotationPin } from './AnnotationPin';

/**
 * Screenshot with Annotation Overlay
 * Props:
 *   screenshotUrl: string
 *   annotations: array of { id, x, y, width, height, issue: {...} }
 *   selectedAnnotationId: number | null
 *   pulsingAnnotationId: number | null
 *   onAnnotationClick: (annotationId) => void
 *   onRequestScroll: () => void
 */
export function AnnotatedScreenshot({
  screenshotUrl,
  annotations,
  selectedAnnotationId,
  pulsingAnnotationId,
  onAnnotationClick,
  onRequestScroll,
}) {
  const [imgVisible, setImgVisible] = useState(true);
  const [imgError, setImgError] = useState(false);
  const [naturalDims, setNaturalDims] = useState({ w: 0, h: 0 });
  const containerRef = useRef(null);
  const imgRef = useRef(null);

  const isReady = naturalDims.w > 0 && naturalDims.h > 0;

  const handleLoad = useCallback((e) => {
    const img = e.currentTarget;
    setNaturalDims({ w: img.naturalWidth, h: img.naturalHeight });
  }, []);

  const hasCoords = (ann) => ann.x != null || ann.y != null;

  const toPercent = useCallback((ann) => {
    const nw = naturalDims.w || 1;
    const nh = naturalDims.h || 1;
    return {
      ...ann,
      x: Math.min(100, Math.max(0, (ann.x / nw) * 100)),
      y: Math.min(100, Math.max(0, (ann.y / nh) * 100)),
      w: ann.width != null ? Math.min(100, (ann.width / nw) * 100) : undefined,
      h: ann.height != null ? Math.min(100, (ann.height / nh) * 100) : undefined,
    };
  }, [naturalDims]);

  const pinnedAnns = annotations.filter(hasCoords).map(toPercent);
  const noCoordAnns = annotations.filter(a => !hasCoords(a));

  pinnedAnns.forEach((ann, idx) => {
    ann._displayNum = idx + 1;
  });

  const idToDisplayNum = {};
  pinnedAnns.forEach((ann, idx) => {
    idToDisplayNum[ann.id] = idx + 1;
  });

  // When parent requests scroll, scroll this container into view
  if (onRequestScroll && containerRef.current) {
    containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <div className="card annotated-screenshot-scroll" style={{ padding: 0, overflowY: 'auto', maxHeight: '70vh', position: 'relative' }} ref={containerRef}>
      {/* Screenshot image */}
      {imgVisible && !imgError ? (
        <div style={{ position: 'relative', display: 'inline-block', width: '100%' }}>
          <img
            ref={imgRef}
            src={screenshotUrl}
            alt="UI Screenshot"
            className="annotated-screenshot-img"
            style={{
              width: '100%',
              maxHeight: 420,
              objectFit: 'contain',
              display: 'block',
              background: 'var(--background)',
            }}
            onLoad={handleLoad}
            onError={() => setImgError(true)}
          />

          {/* Subtle overlay when image has loaded but coords not yet available */}
          {!isReady && (
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(0,0,0,0.04)',
              pointerEvents: 'none',
            }}>
              <span style={{ fontSize: 11, color: 'var(--text-muted)', background: 'rgba(255,255,255,0.8)', padding: '4px 8px', borderRadius: 4 }}>
                Loading coordinates...
              </span>
            </div>
          )}

          {/* Annotation pins */}
          {isReady && pinnedAnns.map((ann) => (
            <AnnotationPin
              key={ann.id}
              annotation={ann}
              isSelected={selectedAnnotationId === ann.id}
              isPulsing={pulsingAnnotationId === ann.id}
              onClick={() => onAnnotationClick(ann.id)}
            />
          ))}
        </div>
      ) : (
        /* Fallback for broken image */
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', padding: '48px 20px', background: 'var(--background)', minHeight: 220,
        }}>
          <ImageIcon size={36} style={{ color: 'var(--text-muted)', marginBottom: 10 }} />
          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>Preview unavailable</p>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 14 }}>The image could not be loaded.</p>
          <button onClick={() => window.open(screenshotUrl, '_blank')} className="btn-secondary" style={{ fontSize: 12 }}>
            <ExternalLink size={12} /> Open image in new tab
          </button>
        </div>
      )}

      {/* Annotation count badge */}
      {annotations.length > 0 && (
        <div style={{
          position: 'absolute', bottom: 8, right: 8,
          background: 'rgba(23,27,58,0.82)',
          backdropFilter: 'blur(4px)',
          borderRadius: 6, padding: '4px 8px',
          display: 'flex', alignItems: 'center', gap: 5,
        }}>
          <MapPin size={11} style={{ color: '#fff' }} />
          <span style={{ fontSize: 10, color: '#fff', fontWeight: 600 }}>
            {pinnedAnns.length} visual issue{pinnedAnns.length !== 1 ? 's' : ''}
          </span>
        </div>
      )}

      {/* Notice when some annotations lack coordinates */}
      {noCoordAnns.length > 0 && (
        <div style={{
          padding: '8px 12px',
          background: 'var(--warning-light)',
          borderTop: '1px solid var(--warning)20',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <AlertTriangle size={13} style={{ color: 'var(--warning)', flexShrink: 0 }} />
          <span style={{ fontSize: 11, color: 'var(--warning)' }}>
            {noCoordAnns.length} issue{noCoordAnns.length !== 1 ? 's' : ''} found but visual location
            {noCoordAnns.length !== 1 ? 's are' : ' is'} unavailable. See details below.
          </span>
        </div>
      )}
    </div>
  );
}
