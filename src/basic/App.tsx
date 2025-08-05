import { useState, useEffect } from "react";

import { AdminPage } from "./components/AdminPage";
import { CartPage } from "./components/CartPage";
import { Coupon } from "../types";
import { ProductWithUI, initialProducts, initialCoupons } from "./constants";
import { useCart } from "./hooks/useCart";
import { Header } from "./components/Header";
import { NotificationList } from "./components/NotificationList";

const App = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState<ProductWithUI[]>(() => {
    const saved = localStorage.getItem("products");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return initialProducts;
      }
    }
    return initialProducts;
  });
  const [coupons, setCoupons] = useState<Coupon[]>(() => {
    const saved = localStorage.getItem("coupons");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return initialCoupons;
      }
    }
    return initialCoupons;
  });

  // useCart는 products를 받아서 cart, notifications 등 상태를 관리
  const {
    notifications,
    setNotifications,
    cart,
    totalItemCount,
    selectedCoupon,
    addToCart,
    removeFromCart,
    updateQuantity,
    totals,
    getRemainingStock,
    completeOrder,
    calculateItemTotal,
    applyCoupon,
    removeCoupon,
  } = useCart(products);

  // products 상태 변경 시 localStorage에 동기화
  useEffect(() => {
    localStorage.setItem("products", JSON.stringify(products));
  }, [products]);

  return (
    <div className="min-h-screen bg-gray-50">
      <NotificationList
        notifications={notifications}
        removeNotification={(id) =>
          setNotifications((prev) => prev.filter((n) => n.id !== id))
        }
      />

      <Header
        isAdmin={isAdmin}
        setIsAdmin={setIsAdmin}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        cart={cart}
        totalItemCount={totalItemCount}
      />
      <main className="max-w-7xl mx-auto px-4 py-8">
        {isAdmin ? (
          <AdminPage
            isAdmin={isAdmin}
            products={products}
            setProducts={setProducts}
            coupons={coupons}
            setCoupons={setCoupons}
            notifications={notifications}
            setNotifications={setNotifications}
          />
        ) : (
          <CartPage
            isAdmin={isAdmin}
            searchTerm={searchTerm}
            products={products}
            setProducts={setProducts}
            coupons={coupons}
            setCoupons={setCoupons}
            notifications={notifications}
            setNotifications={setNotifications}
            cart={cart}
            selectedCoupon={selectedCoupon}
            addToCart={addToCart}
            removeFromCart={removeFromCart}
            updateQuantity={updateQuantity}
            totals={totals}
            getRemainingStock={getRemainingStock}
            completeOrder={completeOrder}
            calculateItemTotal={calculateItemTotal}
            applyCoupon={applyCoupon}
            removeCoupon={removeCoupon}
          />
        )}
      </main>
    </div>
  );
};

export default App;
