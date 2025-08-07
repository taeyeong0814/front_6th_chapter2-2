// 쿠폰 관리 섹션 컴포넌트 (기존 AdminPage 구조 유지)
import React, { useState } from "react";
import { CouponList } from "./CouponList";
import { CouponForm } from "./CouponForm";
import { Coupon, CouponFormData } from "../../../types";

interface CouponManagementProps {
  coupons: Coupon[];
  addCoupon: (newCoupon: Omit<Coupon, "id">) => void;
  removeCoupon: (couponCode: string) => void;
  addNotification: (
    message: string,
    type?: "error" | "success" | "warning"
  ) => void;
}

export function CouponManagement({
  coupons,
  addCoupon,
  removeCoupon,
  addNotification,
}: CouponManagementProps) {
  const [showCouponForm, setShowCouponForm] = useState(false);
  const [couponForm, setCouponForm] = useState<CouponFormData>({
    name: "",
    code: "",
    discountType: "amount",
    discountValue: 0,
  });

  const handleCouponSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addCoupon(couponForm);
    setCouponForm({
      name: "",
      code: "",
      discountType: "amount",
      discountValue: 0,
    });
    setShowCouponForm(false);
  };

  const handleRemoveCoupon = (couponCode: string) => {
    removeCoupon(couponCode);
    addNotification("쿠폰이 삭제되었습니다", "success");
  };

  const handleCancelForm = () => {
    setShowCouponForm(false);
  };

  return (
    <section className="bg-white rounded-lg border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold">쿠폰 관리</h2>
      </div>
      <div className="p-6">
        <CouponList
          coupons={coupons}
          onRemoveCoupon={handleRemoveCoupon}
          onAddNewCoupon={() => setShowCouponForm(!showCouponForm)}
        />

        <CouponForm
          isVisible={showCouponForm}
          formData={couponForm}
          onFormDataChange={setCouponForm}
          onSubmit={handleCouponSubmit}
          onCancel={handleCancelForm}
          addNotification={addNotification}
        />
      </div>
    </section>
  );
}
