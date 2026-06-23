export function calculateBookingPrice(startDate: string, endDate: string, dailyRate: number): { daysCount: number, total_price: number, commission_amount: number } {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const daysCount = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);
  const total_price = dailyRate * daysCount;
  const commission_amount = Math.round(total_price * 0.10);

  return { daysCount, total_price, commission_amount };
}
