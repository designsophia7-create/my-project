// Phase 1 displays USD only; Phase 2 adds geo-detected multi-currency
// conversion using the fx_rates table.
export function formatPriceUsd(value: number | string): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
    Number(value),
  )
}
