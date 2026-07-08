import React from 'react'

// Renders children inside a simple phone outline so the mobile-first yard
// tool can be demoed on the same projected laptop screen.
export function PhoneFrame({ children }) {
  return (
    <div className="phone-frame">
      <div className="notch" />
      <div className="phone-screen">{children}</div>
    </div>
  )
}
