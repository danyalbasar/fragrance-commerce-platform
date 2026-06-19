"use client";

import { createContext, useContext, useState } from "react";

interface CartContextType {
  cartCount: number;
  setCartCount: (count: number) => void;
}

const CartContext = createContext<CartContextType>({
  cartCount: 0,
  setCartCount: () => {},
});

export function CartProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [cartCount, setCartCount] = useState(0);

  return (
    <CartContext.Provider
      value={{
        cartCount,
        setCartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}