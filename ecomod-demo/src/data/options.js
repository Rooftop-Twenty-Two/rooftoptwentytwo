// Refurb and fit-out options catalogue. Costs are illustrative placeholders.
// partsCost: materials in euro
// labourHours x labour rate (standard or specialist) = labour cost
// sellPrice: what the option adds to the suggested sell price

export const seedOptions = [
  { id: 'partitioning', name: 'Internal partitioning', partsCost: 1800, labourHours: 12, rateType: 'standard', sellPrice: 3600 },
  { id: 'storefront-glazing', name: 'Storefront glazing', partsCost: 3400, labourHours: 16, rateType: 'specialist', sellPrice: 6200 },
  { id: 'customer-counter', name: 'Customer counter', partsCost: 950, labourHours: 6, rateType: 'standard', sellPrice: 1900 },
  { id: 'stacking-kit', name: 'Stacking kit', partsCost: 2200, labourHours: 20, rateType: 'specialist', sellPrice: 4500 },
  { id: 'wc-pod', name: 'WC pod', partsCost: 4100, labourHours: 18, rateType: 'specialist', sellPrice: 7400 },
  { id: 'electrics-pack', name: 'Electrics pack', partsCost: 1600, labourHours: 10, rateType: 'specialist', sellPrice: 3200 },
]
