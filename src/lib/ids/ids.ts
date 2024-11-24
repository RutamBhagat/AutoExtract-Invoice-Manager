const PREFIXES = {
  invoice: "INV-",
  product: "PROD-",
  customer: "CUST-",
} as const;

export function generateId(type: keyof typeof PREFIXES): string {
  const prefix = PREFIXES[type];
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `${prefix}${timestamp}-${random}`;
}

export function validateId(id: string): boolean {
  return Object.values(PREFIXES).some((prefix) => id.startsWith(prefix));
}
