import type { ClientCategoryDiscount, Product } from "./types";

/**
 * Pretul companiei pentru un produs: base_price - discountul companiei pentru
 * categoria produsului. Lipsa unui rand de discount = 0% (regula din schema).
 * Calculul REAL, care conteaza (comanda), se face server-side la Faza 5 — asta
 * e doar afisajul din portal, informativ.
 */
export function clientPrice(
  product: Pick<Product, "base_price" | "category_id">,
  discounts: ClientCategoryDiscount[],
): { finalPrice: number; discountPercentage: number } {
  const discount = discounts.find((d) => d.category_id === product.category_id);
  const pct = discount?.discount_percentage ?? 0;
  const finalPrice = product.base_price * (1 - pct / 100);
  return { finalPrice, discountPercentage: pct };
}
