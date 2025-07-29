"use client";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { FaHeart, FaSpinner } from "react-icons/fa";
import toast from "react-hot-toast";
import { useState, useEffect } from "react";

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
}

const baccaBucciProducts: Product[] = [
  {
    id: 17,
    name: "Bacca Bucci Urban Flex",
    price: 60,
    image: "/products/baccabucci 1.jpeg",
  },
  {
    id: 18,
    name: "Bacca Bucci Street Runner",
    price: 65,
    image: "/products/baccabucci 2.jpeg",
  },
  {
    id: 19,
    name: "Bacca Bucci Mesh Pro",
    price: 70,
    image: "/products/baccabucci 3.jpeg",
  },
];

export default function BaccaBucciPage() {
  const { data: session } = useSession();
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    // Simulate loading for demo (replace with real fetch if needed)
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (session?.user?.email) {
      const key = `wishlist_${session.user.email}`;
      const stored = localStorage.getItem(key);
      if (stored) setWishlist(JSON.parse(stored));
    }
  }, [session]);

  const toggleWishlist = (product: Product) => {
    if (!session?.user?.email) {
      toast.error("Please log in to use wishlist");
      return;
    }
    const key = `wishlist_${session.user.email}`;
    let newWishlist;
    if (wishlist.includes(product.id)) {
      newWishlist = wishlist.filter(id => id !== product.id);
      toast("Removed from wishlist");
    } else {
      newWishlist = [...wishlist, product.id];
      toast.success("Added to wishlist!");
    }
    setWishlist(newWishlist);
    localStorage.setItem(key, JSON.stringify(newWishlist));
  };

  const handleAddToCart = () => {
    toast.success('Added to cart!');
    // Add cart logic here if needed
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-black">
        <FaSpinner className="animate-spin text-4xl mr-2" />
        <span>Loading products...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-8 px-2 sm:px-4">
      <h1 className="text-2xl sm:text-3xl font-bold mb-8 text-gray-900 text-center">Bacca Bucci Sneakers</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 max-w-6xl mx-auto">
        {baccaBucciProducts.map((product) => (
          <div key={product.id} className="bg-white border border-gray-200 rounded-lg shadow hover:shadow-xl transition-shadow duration-300 p-4 sm:p-6 flex flex-col items-center relative">
            <button
              className={`absolute top-2 right-2 z-10 p-2 rounded-full ${wishlist.includes(product.id) ? 'bg-pink-600 text-white' : 'bg-white text-pink-600'} shadow`}
              onClick={() => toggleWishlist(product)}
              aria-label="Add to wishlist"
            >
              <FaHeart color={wishlist.includes(product.id) ? 'red' : 'gray'} size={24} />
            </button>
            <div className="w-32 h-32 sm:w-40 sm:h-40 relative mb-4">
              <Image src={product.image} alt={product.name} fill className="object-contain rounded" sizes="160px" />
            </div>
            <h3 className="font-semibold text-base sm:text-lg mb-2 text-gray-900 text-center break-words">{product.name}</h3>
            <span className="text-blue-600 font-bold mb-4">${product.price.toFixed(2)}</span>
            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition w-full" onClick={handleAddToCart}>Add to Cart</button>
          </div>
        ))}
      </div>
    </div>
  );
} 