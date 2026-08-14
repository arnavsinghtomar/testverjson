/**
 * Card numbers never leave this function intact. We keep the last four digits
 * so support can identify a payment, and nothing else.
 */
export function maskCard(cardNumber: string): string {
  return cardNumber.slice(-4);
}

/** Partially hide an email for display in staff tooling. */
export function maskEmail(email: string): string {
  const [name, domain] = email.split('@');
  return name.slice(0, 2) + '***@' + domain;
}
