export interface ShippingItem {
  weight?: number
  quantity: number
}

export interface ShippingAddressLike {
  city?: string | null
  district?: string | null
  province?: string | null
}

interface ShippingRule {
  baseFee: number
  perKg: number
  minFee: number
}

// Simple zone mapping leveraging your existing wilayah API fields
// Extend as needed. Fallback to DEFAULT when not matched.
export const ZONE_BY_CITY: Record<string, string> = {
  Jakarta: 'ZONE_A',
  Bogor: 'ZONE_A',
  Depok: 'ZONE_A',
  Tangerang: 'ZONE_A',
  Bekasi: 'ZONE_A',
}

export const ZONE_BY_PROVINCE: Record<string, string> = {
  'DKI JAKARTA': 'ZONE_A',
  'JAWA BARAT': 'ZONE_B',
  BANTEN: 'ZONE_B',
}

export const SHIPPING_RULES: Record<string, ShippingRule> = {
  ZONE_A: { baseFee: 10000, perKg: 3000, minFee: 15000 },
  ZONE_B: { baseFee: 15000, perKg: 4000, minFee: 20000 },
  DEFAULT: { baseFee: 20000, perKg: 5000, minFee: 25000 },
}

function normalize(value?: string | null): string {
  if (!value) return ''
  return value.trim()
}

export function estimateShipping(params: {
  items: ShippingItem[]
  address: ShippingAddressLike
  freeShippingThreshold?: number
  subtotal?: number
}) {
  const totalWeightRaw = params.items.reduce(
    (sum, i) => sum + (i.weight ?? 1) * i.quantity,
    0
  )
  const totalWeightKg = Math.max(1, Math.ceil(totalWeightRaw))

  // Determine zone by city first, then province, else DEFAULT
  const city = normalize(params.address.city)
  const province = normalize(params.address.province?.toUpperCase?.())
  const zoneKey =
    (city && ZONE_BY_CITY[city]) ||
    (province && ZONE_BY_PROVINCE[province]) ||
    'DEFAULT'
  const rule = SHIPPING_RULES[zoneKey] || SHIPPING_RULES.DEFAULT

  // Free shipping support
  if (
    typeof params.freeShippingThreshold === 'number' &&
    typeof params.subtotal === 'number' &&
    params.subtotal >= params.freeShippingThreshold
  ) {
    return { shippingCost: 0, zone: zoneKey, totalWeightKg }
  }

  const shippingCost = Math.max(
    rule.minFee,
    rule.baseFee + totalWeightKg * rule.perKg
  )
  return { shippingCost, zone: zoneKey, totalWeightKg }
}
