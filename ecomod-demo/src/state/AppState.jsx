import React, { createContext, useContext, useEffect, useReducer, useRef } from 'react'
import { seedUnits } from '../data/units.js'
import { seedOptions } from '../data/options.js'
import { seedCounties } from '../data/counties.js'
import { seedSettings } from '../data/settings.js'
import { seedSubmissions } from '../data/submissions.js'

// All app data lives here: seed JSON plus anything created during the demo.
// Persisted to localStorage so nothing is lost mid-demo. "Reset demo data"
// in the footer clears it back to the seeds.

const STORAGE_KEY = 'ecomod-wireframe-demo-v1'

export const ROLES = [
  { id: 'visitor', label: 'Public Visitor' },
  { id: 'yard', label: 'Yard Staff (CabinDepot)' },
  { id: 'estimator', label: 'Estimator' },
  { id: 'management', label: 'Management' },
]

const initialState = () => ({
  role: 'visitor',
  units: seedUnits,
  options: seedOptions,
  counties: seedCounties,
  settings: seedSettings,
  submissions: seedSubmissions,
  toasts: [],
})

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return initialState()
    const saved = JSON.parse(raw)
    return { ...initialState(), ...saved, toasts: [] }
  } catch {
    return initialState()
  }
}

function reducer(state, action) {
  switch (action.type) {
    case 'setRole':
      return { ...state, role: action.role }
    case 'addSubmission':
      return { ...state, submissions: [action.submission, ...state.submissions] }
    case 'updateSubmission': {
      const submissions = state.submissions.map((s) => {
        if (s.ref !== action.ref) return s
        const next = { ...s, ...action.patch }
        if (action.auditEvent) {
          next.audit = [...s.audit, { ts: new Date().toISOString(), event: action.auditEvent }]
        }
        return next
      })
      return { ...state, submissions }
    }
    case 'updateUnit':
      return { ...state, units: state.units.map((u) => (u.id === action.id ? { ...u, ...action.patch } : u)) }
    case 'publishPhotos': {
      const units = state.units.map((u) => {
        if (u.id !== action.id) return u
        return {
          ...u,
          photos: [...u.photos, ...action.photos],
          grade: action.grade || u.grade,
          lastUpdated: new Date().toISOString(),
          updatedBy: action.staffName,
        }
      })
      return { ...state, units }
    }
    case 'updateOption':
      return { ...state, options: state.options.map((o) => (o.id === action.id ? { ...o, ...action.patch } : o)) }
    case 'updateCounty':
      return { ...state, counties: state.counties.map((c) => (c.name === action.name ? { ...c, rate: action.rate } : c)) }
    case 'updateSettings':
      return { ...state, settings: { ...state.settings, ...action.patch } }
    case 'toast':
      return { ...state, toasts: [...state.toasts, { id: action.id, msg: action.msg }] }
    case 'dismissToast':
      return { ...state, toasts: state.toasts.filter((t) => t.id !== action.id) }
    case 'reset':
      return { ...initialState(), role: state.role }
    default:
      return state
  }
}

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, null, load)
  const toastId = useRef(0)

  useEffect(() => {
    const { toasts, ...persist } = state
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(persist)) } catch { /* storage full or blocked: demo continues in memory */ }
  }, [state])

  const toast = (msg) => {
    const id = ++toastId.current
    dispatch({ type: 'toast', id, msg })
    setTimeout(() => dispatch({ type: 'dismissToast', id }), 4200)
  }

  const nextRef = () => {
    const nums = state.submissions.map((s) => parseInt(s.ref.replace('RFQ-', ''), 10)).filter((n) => !isNaN(n))
    return 'RFQ-' + (Math.max(1000, ...nums) + 1)
  }

  // Flag possible duplicates: same company name or contact email as an
  // earlier submission.
  const findDuplicate = (submission) => {
    const name = submission.company.name.trim().toLowerCase()
    const email = submission.contact.email.trim().toLowerCase()
    const match = state.submissions.find(
      (s) => s.ref !== submission.ref &&
        (s.company.name.trim().toLowerCase() === name || s.contact.email.trim().toLowerCase() === email)
    )
    return match ? match.ref : null
  }

  return (
    <AppContext.Provider value={{ state, dispatch, toast, nextRef, findDuplicate }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)
