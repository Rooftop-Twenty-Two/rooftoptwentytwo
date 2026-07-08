import React from 'react'

// Dashed-border wireframe image placeholder with an X through it.
export function Placeholder({ caption, height = 130, badge }) {
  return (
    <div className="ph" style={{ height }}>
      <svg className="ph-x" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <line x1="0" y1="0" x2="100" y2="100" stroke="#d4d4d4" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        <line x1="100" y1="0" x2="0" y2="100" stroke="#d4d4d4" strokeWidth="1" vectorEffect="non-scaling-stroke" />
      </svg>
      {badge && (
        <span style={{
          position: 'absolute', top: 5, right: 5, zIndex: 1, background: '#fff',
          border: '1px solid #d4d4d4', fontSize: '.65rem', padding: '1px 6px', color: '#666',
        }}>{badge}</span>
      )}
      {caption && <div className="ph-caption">{caption}</div>}
    </div>
  )
}
