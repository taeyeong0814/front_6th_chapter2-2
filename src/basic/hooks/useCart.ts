// TODO: 장바구니 관리 Hook
// 힌트:
// 1. 장바구니 상태 관리 (localStorage 연동)
// 2. 상품 추가/삭제/수량 변경
// 3. 쿠폰 적용
// 4. 총액 계산
// 5. 재고 확인
//
// 사용할 모델 함수:
// - cartModel.addItemToCart
// - cartModel.removeItemFromCart
// - cartModel.updateCartItemQuantity
// - cartModel.calculateCartTotal
// - cartModel.getRemainingStock
//
// 반환할 값:
// - cart: 장바구니 아이템 배열
// - selectedCoupon: 선택된 쿠폰
// - addToCart: 상품 추가 함수
// - removeFromCart: 상품 제거 함수
// - updateQuantity: 수량 변경 함수
// - applyCoupon: 쿠폰 적용 함수
// - calculateTotal: 총액 계산 함수
// - getRemainingStock: 재고 확인 함수
// - clearCart: 장바구니 비우기 함수
import { useCallback, useEffect, useState } from "react";
import { CartItem, Coupon, Product, Notification } from "../../types";
import { ProductWithUI } from "../constants";
import * as cartModel from "../models/cart";

export function useCart(products: Product[]) {
  const [totalItemCount, setTotalItemCount] = useState(0);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem("cart");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [];
  });

  // 순수함수들을 래핑한 헬퍼 함수들
  const calculateItemTotal = useCallback(
    (item: CartItem): number => {
      return cartModel.calculateItemTotal(item, cart);
    },
    [cart]
  );

  const calculateCartTotal = useCallback((): {
    totalBeforeDiscount: number;
    totalAfterDiscount: number;
    totalDiscount: number;
  } => {
    return cartModel.calculateCartTotal(cart, selectedCoupon);
  }, [cart, selectedCoupon]);

  const getRemainingStock = useCallback(
    (product: Product): number => {
      return cartModel.getRemainingStock(product, cart);
    },
    [cart]
  );

  useEffect(() => {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    setTotalItemCount(count);
  }, [cart]);

  useEffect(() => {
    if (cart.length > 0) {
      localStorage.setItem("cart", JSON.stringify(cart));
    } else {
      localStorage.removeItem("cart");
    }
  }, [cart]);

  // 알림 관리
  const addNotification = useCallback(
    (message: string, type: "error" | "success" | "warning" = "success") => {
      const id = Date.now().toString();
      setNotifications((prev) => [...prev, { id, message, type }]);

      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
      }, 3000);
    },
    []
  );

  // 장바구니 조작 함수들
  const addToCart = useCallback(
    (product: ProductWithUI) => {
      const remainingStock = getRemainingStock(product);
      if (remainingStock <= 0) {
        addNotification("재고가 부족합니다!", "error");
        return;
      }

      setCart((prevCart) => {
        // 재고 체크를 다시 한번 (동시성 이슈 방지)
        const currentStock = cartModel.getRemainingStock(product, prevCart);
        if (currentStock <= 0) {
          addNotification("재고가 부족합니다!", "error");
          return prevCart;
        }

        const newCart = cartModel.addItemToCart(prevCart, product, 1);
        const updatedItem = newCart.find(
          (item) => item.product.id === product.id
        );

        if (updatedItem && updatedItem.quantity > product.stock) {
          addNotification(`재고는 ${product.stock}개까지만 있습니다.`, "error");
          return prevCart;
        }

        return newCart;
      });

      addNotification("장바구니에 담았습니다", "success");
    },
    [getRemainingStock, addNotification]
  );

  const removeFromCart = useCallback((productId: string) => {
    setCart((prevCart) => cartModel.removeItemFromCart(prevCart, productId));
  }, []);

  const updateQuantity = useCallback(
    (productId: string, newQuantity: number) => {
      if (newQuantity <= 0) {
        removeFromCart(productId);
        return;
      }

      const product = products.find((p) => p.id === productId);
      if (!product) return;

      if (newQuantity > product.stock) {
        addNotification(`재고는 ${product.stock}개까지만 있습니다.`, "error");
        return;
      }

      setCart((prevCart) =>
        cartModel.updateCartItemQuantity(prevCart, productId, newQuantity)
      );
    },
    [products, removeFromCart, addNotification]
  );

  const clearCart = useCallback(() => {
    setCart([]);
    setSelectedCoupon(null);
  }, []);

  // 쿠폰 관리 함수들
  const applyCoupon = useCallback(
    (coupon: Coupon) => {
      const currentTotal = calculateCartTotal().totalAfterDiscount;

      if (currentTotal < 10000 && coupon.discountType === "percentage") {
        addNotification(
          "percentage 쿠폰은 10,000원 이상 구매 시 사용 가능합니다.",
          "error"
        );
        return;
      }

      setSelectedCoupon(coupon);
      addNotification("쿠폰이 적용되었습니다.", "success");
    },
    [addNotification, calculateCartTotal]
  );

  const removeCoupon = useCallback(() => {
    setSelectedCoupon(null);
    addNotification("쿠폰이 해제되었습니다.", "success");
  }, [addNotification]);

  // 주문 완료
  const completeOrder = useCallback(() => {
    const orderNumber = `ORD-${Date.now()}`;
    addNotification(
      `주문이 완료되었습니다. 주문번호: ${orderNumber}`,
      "success"
    );
    setCart([]);
    setSelectedCoupon(null);
  }, [addNotification]);

  const totals = calculateCartTotal();

  return {
    // 상태값들
    cart,
    selectedCoupon,
    totalItemCount,
    notifications,
    totals,

    // 계산 함수들 (순수함수 래핑)
    calculateItemTotal,
    getRemainingStock,

    // 장바구니 조작 함수들
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,

    // 쿠폰 관리 함수들
    applyCoupon,
    removeCoupon,

    // 주문 완료
    completeOrder,

    // 상태 setter (내부 사용용)
    setNotifications,
    setCart,
  };
}
