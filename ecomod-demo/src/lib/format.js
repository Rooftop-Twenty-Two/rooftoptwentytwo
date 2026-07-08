// Formatting helpers. Euro as €1,234, dates as DD/MM/YYYY.

export const euro = (n) => '€' + Math.round(n).toLocaleString('en-IE')

export const fmtDate = (iso) => {
  if (!iso) return ''
  const d = new Date(iso)
  const p = (x) => String(x).padStart(2, '0')
  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()}`
}

export const fmtDateTime = (iso) => {
  if (!iso) return ''
  const d = new Date(iso)
  const p = (x) => String(x).padStart(2, '0')
  return `${fmtDate(iso)} ${p(d.getHours())}:${p(d.getMinutes())}`
}

// "3h ago", "2d ago"
export const timeSince = (iso) => {
  const ms = Date.now() - new Date(iso).getTime()
  const h = Math.floor(ms / 3600000)
  if (h < 1) return `${Math.max(1, Math.floor(ms / 60000))}m ago`
  if (h < 48) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

export const hoursSince = (iso) => (Date.now() - new Date(iso).getTime()) / 3600000
