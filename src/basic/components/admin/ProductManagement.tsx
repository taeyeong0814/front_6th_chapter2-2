// 상품 관리 섹션 컴포넌트 (기존 AdminPage 구조 유지)
import React, { useState } from "react";
import { ProductTable } from "./ProductTable";
import { ProductForm } from "./ProductForm";
import { getDisplayPrice } from "../../utils/price";
import {
  CartItem,
  Product,
  ProductFormData,
  ProductWithUI,
} from "../../../types";

interface ProductManagementProps {
  products: ProductWithUI[];
  addProduct: (newProduct: Omit<ProductWithUI, "id">) => void;
  updateProduct: (productId: string, updates: Partial<ProductWithUI>) => void;
  removeProduct: (productId: string) => void;
  cart: CartItem[];
  addNotification: (
    message: string,
    type?: "error" | "success" | "warning"
  ) => void;
}

export function ProductManagement({
  products,
  addProduct,
  updateProduct,
  removeProduct,
  cart,
  addNotification,
}: ProductManagementProps) {
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [showProductForm, setShowProductForm] = useState(false);
  const [productForm, setProductForm] = useState<ProductFormData>({
    name: "",
    price: 0,
    stock: 0,
    description: "",
    discounts: [],
  });

  const getRemainingStock = (product: Product): number => {
    const cartItem = cart.find((item) => item.product.id === product.id);
    const remaining = product.stock - (cartItem?.quantity || 0);
    return remaining;
  };

  const startEditProduct = (product: ProductWithUI) => {
    setEditingProduct(product.id);
    setProductForm({
      name: product.name,
      price: product.price,
      stock: product.stock,
      description: product.description || "",
      discounts: product.discounts || [],
    });
    setShowProductForm(true);
  };

  const handleProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct && editingProduct !== "new") {
      updateProduct(editingProduct, productForm);
      setEditingProduct(null);
    } else {
      addProduct({
        ...productForm,
        discounts: productForm.discounts,
      });
    }
    setProductForm({
      name: "",
      price: 0,
      stock: 0,
      description: "",
      discounts: [],
    });
    setEditingProduct(null);
    setShowProductForm(false);
  };

  const handleRemoveProduct = (productId: string) => {
    removeProduct(productId);
    addNotification("상품이 삭제되었습니다", "success");
  };

  const handleCancelForm = () => {
    setEditingProduct(null);
    setProductForm({
      name: "",
      price: 0,
      stock: 0,
      description: "",
      discounts: [],
    });
    setShowProductForm(false);
  };

  return (
    <section className="bg-white rounded-lg border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">상품 목록</h2>
          <button
            onClick={() => {
              setEditingProduct("new");
              setProductForm({
                name: "",
                price: 0,
                stock: 0,
                description: "",
                discounts: [],
              });
              setShowProductForm(true);
            }}
            className="px-4 py-2 bg-gray-900 text-white text-sm rounded-md hover:bg-gray-800"
          >
            새 상품 추가
          </button>
        </div>
      </div>

      <ProductTable
        products={products}
        onEditProduct={startEditProduct}
        onRemoveProduct={handleRemoveProduct}
        getRemainingStock={getRemainingStock}
        getDisplayPrice={getDisplayPrice}
        isAdmin={true}
      />

      <ProductForm
        isVisible={showProductForm}
        formData={productForm}
        onFormDataChange={setProductForm}
        onSubmit={handleProductSubmit}
        onCancel={handleCancelForm}
        editingProduct={editingProduct}
        addNotification={addNotification}
      />
    </section>
  );
}
