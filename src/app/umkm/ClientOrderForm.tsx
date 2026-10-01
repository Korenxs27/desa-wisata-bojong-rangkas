"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingBag, ShoppingCart, Plus, Minus } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

interface FormProps {
  productId: number;
  productName: string;
  productPrice: number;
  stockStatus: string;
  productImage?: string;
  category?: string;
}

export default function ClientOrderForm({ 
  productId, 
  productName, 
  productPrice, 
  stockStatus,
  productImage = "",
  category = "UMKM"
}: FormProps) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);

  const getCartFromStorage = (): any[] => {
    try {
      const saved = localStorage.getItem("cart");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  };

  const saveCartToStorage = (items: any[]) => {
    localStorage.setItem("cart", JSON.stringify(items));
    window.dispatchEvent(new Event("storage"));
  };

  const handleAddToCart = () => {
    if (stockStatus !== "instock") {
      toast.error("Maaf, stok produk sedang tidak tersedia!");
      return;
    }

    const currentCart = getCartFromStorage();
    const existingIndex = currentCart.findIndex((item) => item.id === productId);

    let updatedCart = [...currentCart];
    if (existingIndex > -1) {
      updatedCart[existingIndex].quantity += quantity;
      // Perbarui gambar jika sebelumnya kosong/placeholder
      if (productImage) {
        updatedCart[existingIndex].image = productImage;
      }
    } else {
      updatedCart.push({
        id: productId,
        title: productName,
        price: productPrice,
        quantity: quantity,
        image: productImage, // MENYIMPAN URL GAMBAR ASLI PRODUK
        category: category,
      });
    }

    saveCartToStorage(updatedCart);
    toast.success("Produk berhasil ditambahkan ke keranjang!");
  };

  const handleBuyNow = () => {
    if (stockStatus !== "instock") {
      toast.error("Maaf, stok produk sedang tidak tersedia!");
      return;
    }

    handleAddToCart();
    router.push("/checkout");
  };

  return (
    <div className="sticky top-32 z-20 space-y-4 bg-white/90 backdrop-blur-md p-5 rounded-2xl border border-neutral-200/80 shadow-lg shadow-slate-100">
      <Toaster position="top-right" reverseOrder={false} />

      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-neutral-500 uppercase">Jumlah Kuantitas</span>
        <div className="flex items-center border border-neutral-200 rounded-xl overflow-hidden bg-neutral-50">
          <button
            type="button"
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="px-3 py-1.5 hover:bg-neutral-200 text-neutral-700 font-bold transition cursor-pointer"
          >
            <Minus size={12} />
          </button>
          <span className="px-3 text-xs font-bold text-neutral-800">{quantity}</span>
          <button
            type="button"
            onClick={() => setQuantity(quantity + 1)}
            className="px-3 py-1.5 hover:bg-neutral-200 text-neutral-700 font-bold transition cursor-pointer"
          >
            <Plus size={12} />
          </button>
        </div>
      </div>

      <div className="pt-2 border-t border-neutral-100 flex justify-between items-center text-xs">
        <span className="text-neutral-500 font-medium">Subtotal Estimasi</span>
        <span className="font-extrabold text-neutral-900 text-sm">
          Rp {(productPrice * quantity).toLocaleString("id-ID")}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 pt-2">
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={stockStatus !== "instock"}
          className="w-full py-3 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 font-bold rounded-xl text-xs transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
        >
          <ShoppingCart size={15} /> + Keranjang
        </button>

        <button
          type="button"
          onClick={handleBuyNow}
          disabled={stockStatus !== "instock"}
          className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 cursor-pointer disabled:opacity-50"
        >
          <ShoppingBag size={15} /> Beli Langsung
        </button>
      </div>
    </div>
  );
}