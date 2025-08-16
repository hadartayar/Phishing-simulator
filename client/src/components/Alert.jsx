import React from 'react'

export default function Alert({ type='info', title, children, onClose }) {
  const palette = {
    info:   { bg: '#0b2942', border:'#1e3a5f' },
    error:  { bg: '#3b0d0d', border:'#5a1a1a' },
    success:{ bg: '#0b3b1a', border:'#1b5e2a' },
    warn:   { bg: '#3b2a0b', border:'#5e451b' },
  }[type] || { bg:'#0b2942', border:'#1e3a5f' }

  return (
    <div className="card" style={{ background: palette.bg, borderColor: palette.border }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 4 }}>
        <strong>{title}</strong>
        {onClose && <button onClick={onClose} style={{ background:'transparent', border:'1px solid #3a4a66' }}>X</button>}
      </div>
      <div style={{ color:'#cfe0ff' }}>{children}</div>
    </div>
  )
}
