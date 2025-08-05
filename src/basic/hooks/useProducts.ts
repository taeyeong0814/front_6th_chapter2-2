// TODO: 상품 관리 Hook
// 주요 기능(힌트):
// 1. 상품 목록 상태 관리 (localStorage 연동)
// 2. 상품 CRUD 작업
// 3. 재고 업데이트
// 4. 할인 규칙 추가/삭제
//
// 반환할 값:
// - products: 상품 배열
// - updateProduct: 상품 정보 수정
// - addProduct: 새 상품 추가
// - updateProductStock: 재고 수정
// - addProductDiscount: 할인 규칙 추가
// - removeProductDiscount: 할인 규칙 삭제

import { useCallback, useEffect, useState } from "react";
import { Product, Notification, Discount } from "../../types";
import { initialProducts } from "../constants";
import * as productModel from "../models/product";

export function useProducts(
  setNotifications?: React.Dispatch<React.SetStateAction<Notification[]>>
) {
  const [products, setProducts] = useState<Product[]>(() => {
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

  // localStorage 동기화
  useEffect(() => {
    localStorage.setItem("products", JSON.stringify(products));
  }, [products]);

  // 알림 관리
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

  // 상품 추가
  const addProduct = useCallback(
    (productData: {
      name: string;
      price: number;
      stock: number;
      discounts?: Discount[];
    }) => {
      // 상품명 중복 체크
      if (productModel.isDuplicateProductName(products, productData.name)) {
        addNotification("이미 존재하는 상품명입니다.", "error");
        return false;
      }

      // 새 상품 생성 (유효성 검증 포함)
      const newProductWithoutId = productModel.createProduct(productData);
      if (!newProductWithoutId) {
        addNotification("유효하지 않은 상품 정보입니다.", "error");
        return false;
      }

      // ID 추가하여 완전한 Product 객체 생성
      const newProduct: Product = {
        ...newProductWithoutId,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9), // 고유 ID 생성
      };

      // 상품 목록에 추가
      const updatedProducts = productModel.addProductToProducts(
        products,
        newProduct
      );
      if (!updatedProducts) {
        addNotification("상품 추가에 실패했습니다.", "error");
        return false;
      }

      setProducts(updatedProducts);
      addNotification("상품이 추가되었습니다.", "success");
      return true;
    },
    [products, addNotification]
  );

  // 상품 정보 수정
  const updateProduct = useCallback(
    (productId: string, updates: Partial<Product>) => {
      // 상품명 변경 시 중복 체크
      if (
        updates.name &&
        productModel.isDuplicateProductNameForUpdate(
          products,
          productId,
          updates.name
        )
      ) {
        addNotification("이미 존재하는 상품명입니다.", "error");
        return false;
      }

      const updatedProducts = productModel.updateProductInList(
        products,
        productId,
        updates
      );
      if (!updatedProducts) {
        addNotification(
          "상품을 찾을 수 없거나 유효하지 않은 정보입니다.",
          "error"
        );
        return false;
      }

      setProducts(updatedProducts);
      addNotification("상품 정보가 수정되었습니다.", "success");
      return true;
    },
    [products, addNotification]
  );

  // 재고 업데이트
  const updateProductStock = useCallback(
    (productId: string, stock: number) => {
      if (!productModel.isValidStock(stock)) {
        addNotification("재고는 0 이상이어야 합니다.", "error");
        return false;
      }

      const updatedProducts = productModel.updateProductStockInList(
        products,
        productId,
        stock
      );
      if (!updatedProducts) {
        addNotification("상품을 찾을 수 없습니다.", "error");
        return false;
      }

      setProducts(updatedProducts);
      addNotification("재고가 업데이트되었습니다.", "success");
      return true;
    },
    [products, addNotification]
  );

  // 할인 규칙 추가
  const addProductDiscount = useCallback(
    (productId: string, discount: Discount) => {
      const updatedProducts = productModel.addProductDiscountToList(
        products,
        productId,
        discount
      );
      if (!updatedProducts) {
        addNotification(
          "상품을 찾을 수 없거나 유효하지 않은 할인 규칙입니다.",
          "error"
        );
        return false;
      }

      setProducts(updatedProducts);
      addNotification("할인 규칙이 추가되었습니다.", "success");
      return true;
    },
    [products, addNotification]
  );

  // 할인 규칙 삭제
  const removeProductDiscount = useCallback(
    (productId: string, discountIndex: number) => {
      const updatedProducts = productModel.removeProductDiscountFromList(
        products,
        productId,
        discountIndex
      );
      if (!updatedProducts) {
        addNotification("상품 또는 할인 규칙을 찾을 수 없습니다.", "error");
        return false;
      }

      setProducts(updatedProducts);
      addNotification("할인 규칙이 삭제되었습니다.", "success");
      return true;
    },
    [products, addNotification]
  );

  // 상품 찾기
  const findProduct = useCallback(
    (productId: string) => {
      return productModel.findProductById(products, productId);
    },
    [products]
  );

  // 상품 할인율 계산
  const getProductDiscountRate = useCallback(
    (product: Product, quantity: number) => {
      return productModel.getProductDiscountRate(product, quantity);
    },
    []
  );

  // 상품 재고 확인
  const checkProductStock = useCallback(
    (productId: string, requestedQuantity: number) => {
      return productModel.hasEnoughStock(
        products,
        productId,
        requestedQuantity
      );
    },
    [products]
  );

  return {
    // 상태값
    products,

    // 상품 관리 함수들
    addProduct,
    updateProduct,
    updateProductStock,
    findProduct,

    // 할인 관리 함수들
    addProductDiscount,
    removeProductDiscount,
    getProductDiscountRate,

    // 재고 관리 함수들
    checkProductStock,

    // 상태 setter (내부 사용용)
    setProducts,
  };
}
