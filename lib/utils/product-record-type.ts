export const SERVICE_RECORD_TYPE = 'Services';

export const KNOWN_PRODUCT_RECORD_TYPES = [
  'Product',
  'Phantom',
  'Bundle',
  'Kit',
  'Discounts',
  'Digital',
  'Make',
] as const;

export function isServiceRecordType(recordType: string | null | undefined): boolean {
  return recordType === SERVICE_RECORD_TYPE;
}
