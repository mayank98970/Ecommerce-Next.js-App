"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FaSpinner } from "react-icons/fa";
import toast from "react-hot-toast";

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
}
interface CartItem extends Product {
  quantity: number;
}

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;
    setLoading(true);
    
    if (!session) {
      // Redirect to home if not logged in
      router.push('/');
      setLoading(false);
      return;
    }

    // Get user-specific cart from localStorage
    if (typeof window !== 'undefined' && session?.user?.email) {
      const cartKey = `cart_${session.user.email}`;
      const stored = localStorage.getItem(cartKey);
      if (stored) {
        try {
          const parsedCart = JSON.parse(stored);
          const sanitizedCart = parsedCart.map((item: { id: string; name: string; price: number | string; image: string; quantity: number; _id?: string }) => ({
            ...item,
            price: typeof item.price === "string" ? parseFloat(item.price.replace(/[^\d.]/g, "")) : item.price
          }));
          setCart(sanitizedCart);
        } catch (error) {
          console.error('Error loading cart from localStorage:', error);
          setCart([]);
        }
      } else {
        setCart([]);
      }
    }
    setLoading(false);
  }, [session, status, router]);

  // Persist cart to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && session?.user?.email && cart.length > 0) {
      const cartKey = `cart_${session.user.email}`;
      localStorage.setItem(cartKey, JSON.stringify(cart));
    }
  }, [cart, session]);

  // Remove item
  const removeItem = (id: number) => {
    setCart(cart.filter(item => item.id !== id));
    toast.success('Item removed from cart!');
  };

  // Update quantity
  const updateQuantity = (id: number, qty: number) => {
    setCart(cart => cart.map(item => item.id === id ? { ...item, quantity: Math.max(1, qty) } : item));
    toast.success('Cart updated!');
  };

  // Cart summary
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <FaSpinner className="animate-spin text-4xl mr-2" />
        <span>Loading cart...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-2 sm:p-4">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4">Your Cart</h1>
      {cart.length === 0 ? (
        <p className="text-lg">Your cart is currently empty.</p>
      ) : (
        <div className="w-full max-w-2xl flex flex-col gap-6">
          {cart.map((item, idx) => (
            <div key={item.id ?? idx} className="flex flex-col sm:flex-row items-center gap-4 bg-gray-900 p-4 rounded-lg shadow">
              <div className="w-20 h-20 relative">
                <Image src={item.image} alt={item.name} fill className="object-contain rounded" sizes="80px" />
              </div>
              <div className="flex-1 w-full">
                <div className="font-semibold text-lg">{item.name}</div>
                <div className="text-blue-400 font-bold">${item.price.toFixed(2)}</div>
                <div className="flex items-center gap-2 mt-2">
                  <button className="px-2 py-1 bg-gray-700 rounded" onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                  <span className="px-2">{item.quantity}</span>
                  <button className="px-2 py-1 bg-gray-700 rounded" onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                </div>
              </div>
              <button className="ml-0 sm:ml-4 text-red-400 hover:text-red-600 font-bold text-xl mt-2 sm:mt-0" onClick={() => removeItem(item.id)}>&times;</button>
            </div>
          ))}
          <div className="flex flex-col sm:flex-row justify-between items-center mt-6 p-4 bg-gray-800 rounded-lg">
            <div className="font-semibold">Total Items: {totalItems}</div>
            <div className="font-bold text-lg">Total: ${totalPrice.toFixed(2)}</div>
          </div>
          <a
            href="/checkout"
            className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded text-lg transition text-center block"
          >
            Proceed to Checkout
          </a>
        </div>
      )}
    </div>
  );
} 