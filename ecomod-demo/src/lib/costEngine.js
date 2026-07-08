// ---------------------------------------------------------------------------
// EcoMod cost and margin engine
//
// This is the "hidden" calculation that fires on every RFQ submission.
// The visitor never sees any of it. In production this runs server-side
// (a serverless function) against parameters held in an encrypted store,
// so financial variables never reach the public application layer.
//
// It is a pure function: same inputs, same outputs, no side effects.
// That makes it trivial to unit test and safe to re-run on view, which is
// how the demo shows live recalculation when management edits a rate.
//
// The four metrics, in order:
//   1. Net Book Value (NBV)       - from the unit inventory record
//   2. Refurbishment works cost   - base prep by condition grade, plus each
//                                   selected option (parts + labour hours x rate)
//   3. Transport and freight      - per-county flat rate + crane surcharge tier
//   4. Estimated margin           - suggested sell price vs total projected
//                                   cost, RAG-flagged against the baseline
//
// Estimator overrides: any line can be overridden. The engine keeps the
// original value alongside the override so the UI can show the original
// struck through, and so overrides are auditable.
// ---------------------------------------------------------------------------

// A "line" carries both the engine's original figure and the effective figure
// after any estimator override.
function line(key, label, original, overrides) {
  const hasOverride = overrides[key] !== undefined && overrides[key] !== null
  return {
    key,
    label,
    original: Math.round(original),
    value: Math.round(hasOverride ? Number(overrides[key]) : original),
    overridden: hasOverride,
  }
}

export function computeValuation({ unit, optionIds, county, options, counties, settings, overrides = {} }) {
  const rates = settings.labourRates

  // 1. Net Book Value ------------------------------------------------------
  // New units: manufacturing cost. Refurbished: current accounting NBV.
  const nbv = line('nbv', 'Net Book Value (NBV)', unit.nbv, overrides)

  // 2. Refurbishment works -------------------------------------------------
  // Base prep applies to refurbished units only and scales with grade:
  // a grade C unit costs more to bring back than a grade A.
  const prepBase = unit.condition === 'refurbished' ? (settings.prepCostByGrade[unit.grade] || 0) : 0
  const prep = line('prep', unit.condition === 'refurbished'
    ? `Base preparation (grade ${unit.grade})`
    : 'Base preparation (new unit)', prepBase, overrides)

  // Each selected option: parts cost + labour hours x hourly rate.
  // Hours and parts are independently overridable per option.
  const optionLines = (optionIds || []).map((id) => {
    const opt = options.find((o) => o.id === id)
    if (!opt) return null
    const parts = line(`opt:${id}:parts`, `${opt.name}: parts`, opt.partsCost, overrides)
    const hours = line(`opt:${id}:hours`, `${opt.name}: labour hours`, opt.labourHours, overrides)
    const rate = rates[opt.rateType] || rates.standard
    const labour = Math.round(hours.value * rate)
    const labourOriginal = Math.round(hours.original * rate)
    return {
      id,
      name: opt.name,
      rateType: opt.rateType,
      rate,
      parts,
      hours,
      labour,
      labourOriginal,
      total: parts.value + labour,
      totalOriginal: parts.original + labourOriginal,
      sellPrice: opt.sellPrice,
    }
  }).filter(Boolean)

  const refurbWorks = prep.value + optionLines.reduce((s, o) => s + o.total, 0)

  // 3. Transport and freight -----------------------------------------------
  // Flat rate per county from the management-editable rate table, plus a
  // crane surcharge tiered by unit length (longest matching tier wins).
  const countyRow = counties.find((c) => c.name === county)
  const transport = line('transport', `Haulage to Co. ${county || 'unknown'}`, countyRow ? countyRow.rate : 0, overrides)

  const tier = [...settings.craneTiers]
    .sort((a, b) => b.minLengthM - a.minLengthM)
    .find((t) => unit.lengthM >= t.minLengthM)
  const crane = line('crane', tier
    ? `Crane set-up (unit ${unit.lengthM}m, tier ${tier.minLengthM}m+)`
    : 'Crane set-up (not required under 6m)', tier ? tier.fee : 0, overrides)

  // 4. Margin ---------------------------------------------------------------
  const totalCost = nbv.value + refurbWorks + transport.value + crane.value

  // Suggested sell price: the unit's guide price plus each option's sell
  // price. Overridable so an estimator can test a customer's counter-offer.
  const baseSell = unit.listPrice + optionLines.reduce((s, o) => s + o.sellPrice, 0)
  const sellPrice = line('sellPrice', 'Suggested sell price', baseSell, overrides)

  const marginEuro = sellPrice.value - totalCost
  const marginPct = sellPrice.value > 0 ? (marginEuro / sellPrice.value) * 100 : 0

  // Price that would be needed to hit the baseline target margin exactly.
  const targetPrice = Math.round(totalCost / (1 - settings.targetMarginPct / 100))

  // RAG flag against the management-editable thresholds.
  const flag = marginPct >= settings.ragGreenPct ? 'green'
    : marginPct >= settings.ragAmberPct ? 'amber'
    : 'red'

  return {
    nbv,
    prep,
    optionLines,
    refurbWorks: Math.round(refurbWorks),
    transport,
    crane,
    transportTotal: transport.value + crane.value,
    totalCost: Math.round(totalCost),
    sellPrice,
    targetPrice,
    marginEuro: Math.round(marginEuro),
    marginPct: Math.round(marginPct * 10) / 10,
    flag,
    hasOverrides: Object.keys(overrides || {}).length > 0,
  }
}
