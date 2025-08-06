// TODO: 장바구니 페이지 컴포넌트
// 힌트:
// 1. 상품 목록 표시 (검색 기능 포함)
// 2. 장바구니 관리
// 3. 쿠폰 적용
// 4. 주문 처리
//
// 필요한 hooks:
// - useProducts: 상품 목록 관리
// - useCart: 장바구니 상태 관리
// - useCoupons: 쿠폰 목록 관리
// - useDebounce: 검색어 디바운싱
//
// 하위 컴포넌트:
// - SearchBar: 검색 입력
// - ProductList: 상품 목록 표시

import { Cart } from "./CartPage/Cart";
import { CouponSelector } from "./CartPage/CouponSelector";
import { OrderSummary } from "./CartPage/OrderSummary";
import { ProductList } from "./CartPage/ProductList";
import { useEffect } from "react";
import { ProductWithUI } from "../constants";
import { Coupon, CartItem } from "../../types";

export function CartPage({
  isAdmin,
  searchTerm,
  products,
  coupons,
  cart,
  selectedCoupon: selectedCouponFromCart,
  addToCart,
  removeFromCart,
  updateQuantity,
  totals,
  getRemainingStock,
  completeOrder,
  calculateItemTotal,
  applyCoupon,
  removeCoupon,
}: {
  isAdmin: boolean;
  searchTerm: string;
  products: ProductWithUI[];
  coupons: Coupon[];
  cart: CartItem[]; // 타입 명확히 정의
  selectedCoupon: any;
  addToCart: (product: ProductWithUI) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, newQuantity: number) => void;
  totals: { totalBeforeDiscount: number; totalAfterDiscount: number };
  getRemainingStock: (product: ProductWithUI) => number;
  completeOrder: () => void;
  calculateItemTotal: (item: any) => number;
  applyCoupon: (coupon: Coupon) => void;
  removeCoupon: () => void;
}) {
  useEffect(() => {
    localStorage.setItem("products", JSON.stringify(products));
  }, [products]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="lg:col-span-3">
        <ProductList
          products={products}
          searchTerm={searchTerm}
          addToCart={addToCart}
          getRemainingStock={getRemainingStock}
          isAdmin={isAdmin}
        />
      </div>

      <div className="lg:col-span-1">
        <div className="sticky top-24 space-y-4">
          <Cart
            cart={cart}
            removeFromCart={removeFromCart}
            updateQuantity={updateQuantity}
            calculateItemTotal={calculateItemTotal}
          />

          {cart.length > 0 && (
            <>
              <CouponSelector
                coupons={coupons}
                selectedCoupon={selectedCouponFromCart}
                applyCoupon={applyCoupon}
                removeCoupon={removeCoupon}
              />

              <OrderSummary totals={totals} completeOrder={completeOrder} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
