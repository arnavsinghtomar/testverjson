/** Human-readable order reference, e.g. RH-9F3A2B. Shown on tickets. */
export function orderReference(orderId: string): string {
  return 'RH-' + orderId.replace(/-/g, '').slice(0, 6).toUpperCase();
}
