import { ProductWithUI } from "../constants";
import { formatPrice } from "./formatters";

export function getDisplayPrice(
  product: ProductWithUI,
  isAdmin: boolean,
  getRemainingStock: (product: ProductWithUI) => number
): string {
  // 재고가 없는 경우 "SOLD OUT" 표시
  if (getRemainingStock(product) <= 0) {
    return "SOLD OUT";
  }

  // 관리자 모드에서는 가격을 원화 형식으로 표시하되, 통화 기호는 제외
  if (isAdmin) {
    return formatPrice(product.price, "KRW", false) + "원";
  }
  return formatPrice(product.price, "KRW", true);
}
