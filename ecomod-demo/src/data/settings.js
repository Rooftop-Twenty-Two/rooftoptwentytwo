// Management-editable financial parameters. Illustrative placeholders.

export const seedSettings = {
  // Baseline target margin used to compute the price needed to hit target
  targetMarginPct: 30,
  // RAG thresholds on gross margin percent: green >= 30, amber 20 to 29, red < 20
  ragGreenPct: 30,
  ragAmberPct: 20,
  // Labour rates in euro per hour
  labourRates: { standard: 48, specialist: 65 },
  // Base preparation cost for refurbished units by condition grade.
  // Grade C needs more prep work than grade A.
  prepCostByGrade: { A: 800, B: 1600, C: 2800 },
  // Crane surcharge tiers by unit length in metres. Longest matching tier wins.
  craneTiers: [
    { minLengthM: 9, fee: 950 },
    { minLengthM: 6, fee: 600 },
  ],
}

export const PURPOSES = [
  'Classroom expansion',
  'Training room',
  'Site office',
  'Sports club room',
  'Ticketing hub',
  'Club shop',
  'Retail pod',
  'Click-and-collect',
  'Bank branch',
  'Service unit',
  'Other',
]

// Purposes that trigger an internal compliance note on the blueprint
export const COMPLIANCE_PURPOSES = {
  'Classroom expansion': 'Educational use. Check fire cert and universal access requirements before quoting.',
  'Training room': 'Educational use. Check fire cert and universal access requirements before quoting.',
  'Sports club room': 'Public assembly use. Check fire cert, occupancy limits and universal access requirements.',
}

// Free consumer email domains rejected by the RFQ form
export const CONSUMER_DOMAINS = [
  'gmail.com', 'googlemail.com', 'yahoo.com', 'yahoo.co.uk', 'yahoo.ie',
  'hotmail.com', 'hotmail.co.uk', 'outlook.com', 'live.com', 'live.ie',
  'aol.com', 'icloud.com', 'me.com', 'proton.me', 'protonmail.com',
]
