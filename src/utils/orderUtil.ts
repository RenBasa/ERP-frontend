import { formatInTimeZone } from 'date-fns-tz';
// set it to base price, to quant * base price or modified price from drop * quant
export const totalHelper = (quantity: number, price: number, unitId: number, product: Product): number => {
  if (quantity <= 0) {
    return price;
  }
  //   if (unitId === product.unitId && product.priceUnit) {
  if (unitId === product.unitId) {
    return quantity * product.priceUnit;
  }
  return quantity * price;
};

// Inverse of totalHelper: given a peso amount a customer wants to spend,
// derive the quantity that produces that total. Mirrors totalHelper's own
// branching exactly (same base-unit-vs-alternate-unit price source) so the
// two stay consistent by construction.
// The quantity is rounded to 3 decimals (grams), otherwise $56 at $130/kg
// stores and prints 0.4307692307692308 kg. The line total is then
// recomputed from the rounded quantity (0.431 kg -> $56.03) rather than
// kept at the amount entered, because the ticket and the backend both
// derive a line's total as quantity x price; keeping $56 would make the
// lines on the ticket not add up to the order total.
export const quantityFromAmountHelper = (amount: number, price: number, unitId: number, product: Product): number => {
  const pricePerUnit = unitId === product.unitId ? product.priceUnit : price;
  if (!pricePerUnit || pricePerUnit <= 0) return 0;
  return roundQuantity(amount / pricePerUnit);
};

export const roundQuantity = (value: number): number => Math.round((value + Number.EPSILON) * 1000) / 1000;

// Money is stored as a float, so a total built from a peso amount can come
// out as 1.9999999999999998 instead of 2. Round to cents before saving, so the
// stored total matches the one on screen and paying it exactly isn't rejected
// as exceeding the order total.
export const roundToCents = (value: number): number => Math.round((value + Number.EPSILON) * 100) / 100;

export const formatDate = (dateString: Date) => {
  const timeZone = 'America/Mexico_City';
  const date = new Date(dateString);
  return formatInTimeZone(date, timeZone, 'dd/MM/yyyy HH:mm');
};
