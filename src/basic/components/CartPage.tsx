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

import { ProductImageIcon } from "./icons";
import { Cart } from "./CartPage/Cart";
import { useEffect, useState } from "react";
import { ProductWithUI } from "../constants";
import { getDisplayPrice } from "../utils/price";
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
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

  const filteredProducts = debouncedSearchTerm
    ? products.filter(
        (product) =>
          product.name
            .toLowerCase()
            .includes(debouncedSearchTerm.toLowerCase()) ||
          (product.description &&
            product.description
              .toLowerCase()
              .includes(debouncedSearchTerm.toLowerCase()))
      )
    : products;

  useEffect(() => {
    localStorage.setItem("products", JSON.stringify(products));
  }, [products]);

  // 테스트 통과를 위해 추가한 useEffect
  useEffect(() => {
    setDebouncedSearchTerm(searchTerm);
  }, [searchTerm]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="lg:col-span-3">
        {/* 상품 목록 */}
        <section>
          <div className="mb-6 flex justify-between items-center">
            <h2 className="text-2xl font-semibold text-gray-800">전체 상품</h2>
            <div className="text-sm text-gray-600">
              총 {products.length}개 상품
            </div>
          </div>
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">
                "{debouncedSearchTerm}"에 대한 검색 결과가 없습니다.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProducts.map((product) => {
                const remainingStock = getRemainingStock(product);

                return (
                  <div
                    key={product.id}
                    className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    {/* 상품 이미지 영역 (placeholder) */}
                    <div className="relative">
                      <div className="aspect-square bg-gray-100 flex items-center justify-center">
                        <ProductImageIcon className="w-24 h-24 text-gray-300" />
                      </div>
                      {product.isRecommended && (
                        <span className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                          BEST
                        </span>
                      )}
                      {product.discounts.length > 0 && (
                        <span className="absolute top-2 left-2 bg-orange-500 text-white text-xs px-2 py-1 rounded">
                          ~
                          {Math.max(...product.discounts.map((d) => d.rate)) *
                            100}
                          %
                        </span>
                      )}
                    </div>

                    {/* 상품 정보 */}
                    <div className="p-4">
                      <h3 className="font-medium text-gray-900 mb-1">
                        {product.name}
                      </h3>
                      {product.description && (
                        <p className="text-sm text-gray-500 mb-2 line-clamp-2">
                          {product.description}
                        </p>
                      )}

                      {/* 가격 정보 */}
                      <div className="mb-3">
                        <p className="text-lg font-bold text-gray-900">
                          {getDisplayPrice(product, isAdmin, getRemainingStock)}
                        </p>
                        {product.discounts.length > 0 && (
                          <p className="text-xs text-gray-500">
                            {product.discounts[0].quantity}개 이상 구매시 할인{" "}
                            {product.discounts[0].rate * 100}%
                          </p>
                        )}
                      </div>

                      {/* 재고 상태 */}
                      <div className="mb-3">
                        {remainingStock <= 5 && remainingStock > 0 && (
                          <p className="text-xs text-red-600 font-medium">
                            품절임박! {remainingStock}개 남음
                          </p>
                        )}
                        {remainingStock > 5 && (
                          <p className="text-xs text-gray-500">
                            재고 {remainingStock}개
                          </p>
                        )}
                      </div>

                      {/* 장바구니 버튼 */}
                      <button
                        onClick={() => addToCart(product)}
                        disabled={remainingStock <= 0}
                        className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${
                          remainingStock <= 0
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-gray-900 text-white hover:bg-gray-800"
                        }`}
                      >
                        {remainingStock <= 0 ? "품절" : "장바구니 담기"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
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
              <section className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-700">
                    쿠폰 할인
                  </h3>
                  <button className="text-xs text-blue-600 hover:underline">
                    쿠폰 등록
                  </button>
                </div>
                {coupons.length > 0 && (
                  <select
                    className="w-full text-sm border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500"
                    value={selectedCouponFromCart?.code || ""}
                    onChange={(e) => {
                      const coupon = coupons.find(
                        (c) => c.code === e.target.value
                      );
                      if (coupon) {
                        applyCoupon(coupon);
                      } else {
                        removeCoupon();
                      }
                    }}
                  >
                    <option value="">쿠폰 선택</option>
                    {coupons.map((coupon) => (
                      <option key={coupon.code} value={coupon.code}>
                        {coupon.name} (
                        {coupon.discountType === "amount"
                          ? `${coupon.discountValue.toLocaleString()}원`
                          : `${coupon.discountValue}%`}
                        )
                      </option>
                    ))}
                  </select>
                )}
              </section>

              <section className="bg-white rounded-lg border border-gray-200 p-4">
                <h3 className="text-lg font-semibold mb-4">결제 정보</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">상품 금액</span>
                    <span className="font-medium">
                      {totals.totalBeforeDiscount.toLocaleString()}원
                    </span>
                  </div>
                  {totals.totalBeforeDiscount - totals.totalAfterDiscount >
                    0 && (
                    <div className="flex justify-between text-red-500">
                      <span>할인 금액</span>
                      <span>
                        -
                        {(
                          totals.totalBeforeDiscount - totals.totalAfterDiscount
                        ).toLocaleString()}
                        원
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between py-2 border-t border-gray-200">
                    <span className="font-semibold">결제 예정 금액</span>
                    <span className="font-bold text-lg text-gray-900">
                      {totals.totalAfterDiscount.toLocaleString()}원
                    </span>
                  </div>
                </div>

                <button
                  onClick={completeOrder}
                  className="w-full mt-4 py-3 bg-yellow-400 text-gray-900 rounded-md font-medium hover:bg-yellow-500 transition-colors"
                >
                  {totals.totalAfterDiscount.toLocaleString()}원 결제하기
                </button>

                <div className="mt-3 text-xs text-gray-500 text-center">
                  <p>* 실제 결제는 이루어지지 않습니다</p>
                </div>
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
