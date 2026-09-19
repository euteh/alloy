import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export interface CartLine {
  productId: string;
  sku: string;
  name: string;
  unit: string;
  quantity: number;
  /** Pretul afisat clientului la momentul adaugarii (informativ — pretul REAL
   * folosit la generarea comenzii se recalculeaza din baza de date, nu din cos). */
  displayUnitPrice: number;
}

interface CartState {
  lines: CartLine[];
  add: (line: Omit<CartLine, "quantity">, quantity?: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
}

const CartContext = createContext<CartState | undefined>(undefined);
const STORAGE_KEY = "alloy-b2b-cart";

/**
 * Cos in localStorage — suficient pentru demo (per companie/browser). Nu e
 * sursa de adevar pentru pret/disponibilitate: la "Genereaza comanda", server-side
 * (Supabase) se recalculeaza totul din `products` + `client_category_discounts`,
 * cosul e doar UI. La productie reala (dupa contractul cu Alloy) devine relevant
 * daca vrem cos persistat cross-device — nu e cazul acum.
 */
export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as CartLine[]) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      /* private browsing / storage plin — cosul ramane doar in memorie, nu blocam UI-ul */
    }
  }, [lines]);

  function add(line: Omit<CartLine, "quantity">, quantity = 1) {
    setLines((prev) => {
      const existing = prev.find((l) => l.productId === line.productId);
      if (existing) {
        return prev.map((l) =>
          l.productId === line.productId ? { ...l, quantity: l.quantity + quantity } : l,
        );
      }
      return [...prev, { ...line, quantity }];
    });
  }

  function updateQuantity(productId: string, quantity: number) {
    if (quantity <= 0) return remove(productId);
    setLines((prev) => prev.map((l) => (l.productId === productId ? { ...l, quantity } : l)));
  }

  function remove(productId: string) {
    setLines((prev) => prev.filter((l) => l.productId !== productId));
  }

  function clear() {
    setLines([]);
  }

  return (
    <CartContext.Provider value={{ lines, add, updateQuantity, remove, clear }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartState {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart trebuie folosit in interiorul <CartProvider>");
  return ctx;
}
