import { useState } from "react";

import { CartPage } from "./components/CartPage";
import { useCart } from "./hooks/useCart";
import { useProducts } from "./hooks/useProducts";
import { useCoupons } from "./hooks/useCoupons";
import { useNotifications } from "./hooks/useNotifications";
import { Header } from "./components/Header";
import { NotificationList } from "./components/NotificationList";
import { AdminPage } from "./components/AdminPage";
import { useAtomValue } from "jotai";
import { isAdminAtom } from "./stores/isAdminAtom";

const App = () => {
  const isAdmin = useAtomValue(isAdminAtom);
  const [searchTerm, setSearchTerm] = useState("");

  // 알림 훅
  const { notifications, addNotification, removeNotification } =
    useNotifications();

  // 상품 관리 훅
  const { products, addProduct, updateProduct, removeProduct } = useProducts({
    addNotification,
  });

  // 쿠폰 관리 훅
  const { coupons, addCoupon, removeCoupon } = useCoupons({ addNotification });

  // 장바구니 관리 훅
  const {
    cart,
    selectedCoupon,
    addToCart,
    removeFromCart,
    updateQuantity,
    applyCoupon,
    removeCoupon: removeSelectedCoupon,
    completeOrder,
    calculateItemTotal,
    calculateCartTotal,
    getRemainingStock,
  } = useCart({ addNotification });

  // 장바구니 총 아이템 수 계산
  const totalItemCount = cart.reduce((total, item) => total + item.quantity, 0);
  return (
    <div className="min-h-screen bg-gray-50">
      <NotificationList
        notifications={notifications}
        removeNotification={removeNotification}
      />

      <Header
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        cart={cart}
        totalItemCount={totalItemCount}
      />
      <main className="max-w-7xl mx-auto px-4 py-8">
        {isAdmin ? (
          <AdminPage
            products={products}
            addProduct={addProduct}
            updateProduct={updateProduct}
            removeProduct={removeProduct}
            coupons={coupons}
            addCoupon={addCoupon}
            removeCoupon={removeCoupon}
            cart={cart}
            addNotification={addNotification}
          />
        ) : (
          <CartPage
            searchTerm={searchTerm}
            coupons={coupons}
            cart={cart}
            selectedCoupon={selectedCoupon}
            addToCart={addToCart}
            removeFromCart={removeFromCart}
            updateQuantity={updateQuantity}
            applyCoupon={applyCoupon}
            removeSelectedCoupon={removeSelectedCoupon}
            completeOrder={completeOrder}
            calculateItemTotal={calculateItemTotal}
            calculateCartTotal={calculateCartTotal}
            getRemainingStock={getRemainingStock}
          />
        )}
      </main>
    </div>
  );
};

export default App;
