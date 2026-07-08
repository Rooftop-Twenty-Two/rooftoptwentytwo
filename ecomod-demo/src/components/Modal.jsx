import React from 'react'

export function Modal({ title, onClose, children }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="spread">
          <h2>{title}</h2>
          <button className="btn-small" onClick={onClose}>Close</button>
        </div>
        {children}
      </div>
    </div>
  )
}
