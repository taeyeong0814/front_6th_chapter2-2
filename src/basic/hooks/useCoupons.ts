// TODO: 쿠폰 관리 Hook
// 주요 기능(힌트):
// 1. 쿠폰 목록 상태 관리 (localStorage 연동)
// 2. 쿠폰 추가/삭제/검증
//
// 반환할 값:
// - coupons: 쿠폰 배열
// - addCoupon: 새 쿠폰 추가
// - removeCoupon: 쿠폰 삭제

import { useCallback, useEffect, useState } from "react";
import { Coupon, Notification } from "../../types";
import { initialCoupons } from "../constants";
import * as couponModel from "../models/coupon";

export function useCoupons(
  setNotifications?: React.Dispatch<React.SetStateAction<Notification[]>>
) {
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

  // localStorage 동기화
  useEffect(() => {
    localStorage.setItem("coupons", JSON.stringify(coupons));
  }, [coupons]);

  // 알림 관리 (외부에서 전달받거나 내부에서 관리)
  const addNotification = useCallback(
    (message: string, type: "error" | "success" | "warning" = "success") => {
      if (setNotifications) {
        const id = Date.now().toString();
        setNotifications((prev) => [...prev, { id, message, type }]);

        setTimeout(() => {
          setNotifications((prev) => prev.filter((n) => n.id !== id));
        }, 3000);
      }
    },
    [setNotifications]
  );

  // 쿠폰 추가
  const addCoupon = useCallback(
    (couponData: {
      name: string;
      code: string;
      discountType: "amount" | "percentage";
      discountValue: number;
    }) => {
      // 중복 코드 확인
      if (couponModel.isDuplicateCouponCode(coupons, couponData.code)) {
        addNotification("이미 존재하는 쿠폰 코드입니다.", "error");
        return false;
      }

      // 새 쿠폰 생성 (유효성 검증 포함)
      const newCoupon = couponModel.createCoupon(couponData);
      if (!newCoupon) {
        addNotification("유효하지 않은 쿠폰 정보입니다.", "error");
        return false;
      }

      // 쿠폰 목록에 추가
      const updatedCoupons = couponModel.addCouponToCoupons(coupons, newCoupon);
      if (!updatedCoupons) {
        addNotification("쿠폰 추가에 실패했습니다.", "error");
        return false;
      }

      setCoupons(updatedCoupons);
      addNotification("쿠폰이 추가되었습니다.", "success");
      return true;
    },
    [coupons, addNotification]
  );

  // 쿠폰 삭제
  const removeCoupon = useCallback(
    (couponCode: string) => {
      const updatedCoupons = couponModel.removeCouponByCode(
        coupons,
        couponCode
      );
      setCoupons(updatedCoupons);
      addNotification("쿠폰이 삭제되었습니다.", "success");
    },
    [coupons, addNotification]
  );

  // 쿠폰 찾기
  const findCoupon = useCallback(
    (couponCode: string) => {
      return couponModel.findCouponByCode(coupons, couponCode);
    },
    [coupons]
  );

  // 쿠폰 적용 가능 여부 확인
  const canApplyCoupon = useCallback((coupon: Coupon, totalAmount: number) => {
    return couponModel.canApplyCoupon(coupon, totalAmount);
  }, []);

  // 쿠폰 할인 금액 계산
  const calculateCouponDiscount = useCallback(
    (coupon: Coupon, totalAmount: number) => {
      return couponModel.calculateCouponDiscount(coupon, totalAmount);
    },
    []
  );

  return {
    // 상태값
    coupons,

    // 쿠폰 관리 함수들
    addCoupon,
    removeCoupon,
    findCoupon,

    // 쿠폰 계산 함수들
    canApplyCoupon,
    calculateCouponDiscount,

    // 상태 setter (내부 사용용)
    setCoupons,
  };
}
