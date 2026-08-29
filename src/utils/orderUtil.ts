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
// derive the quantity that produces exactly that total. Mirrors
// totalHelper's own branching exactly (same base-unit-vs-alternate-unit
// price source) so the two stay consistent by construction — entering an
// amount and immediately reading the total back always shows the same
// number the customer asked for.
export const quantityFromAmountHelper = (amount: number, price: number, unitId: number, product: Product): number => {
  const pricePerUnit = unitId === product.unitId ? product.priceUnit : price;
  if (!pricePerUnit || pricePerUnit <= 0) return 0;
  return amount / pricePerUnit;
};

export const formatDate = (dateString: Date) => {
  const timeZone = 'America/Mexico_City';
  const date = new Date(dateString);
  return formatInTimeZone(date, timeZone, 'dd/MM/yyyy HH:mm');
};
