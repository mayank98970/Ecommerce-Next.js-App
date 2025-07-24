"use client";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { FaHeart } from "react-icons/fa";
import toast from "react-hot-toast";
import { useState, useEffect } from "react";

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
}

const adidasProducts: Product[] = [
  {
    id: 7,
    name: "Adidas Ultraboost 21",
    price: 180,
    image: "/products/adidas1.jpeg",
  },
  {
    id: 8,
    name: "Adidas NMD_R1",
    price: 140,
    image: "/products/adidas2.jpeg",
  },
  {
    id: 9,
    name: "Adidas Superstar",
    price: 100,
    image: "/products/adidas3.jpeg",
  },
  {
    id: 10,
    name: "Adidas Stan Smith",
    price: 95,
    image: "/products/adidas4.jpeg",
  },
  {
    id: 11,
    name: "Adidas Gazelle",
    price: 90,
    image: "/products/adidas6.jpeg",
  },
  {
    id: 12,
    name: "Adidas ZX 2K Boost",
    price: 150,
    image: "/products/adidas7.jpeg",
  },
];

export default function AdidasPage() {
  const { data: session } = useSession();
  const [wishlist, setWishlist] = useState<number[]>([]);

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

  return (
    <div className="min-h-screen bg-white py-12 px-4">
      <h1 className="text-3xl font-bold mb-8 text-gray-900 text-center">Adidas Sneakers</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 max-w-6xl mx-auto">
        {adidasProducts.map((product) => (
          <div key={product.id} className="bg-white border border-gray-200 rounded-lg shadow hover:shadow-xl transition-shadow duration-300 p-6 flex flex-col items-center relative">
            <button
              className={`absolute top-2 right-2 z-10 p-2 rounded-full ${wishlist.includes(product.id) ? 'bg-pink-600 text-white' : 'bg-white text-pink-600'} shadow`}
              onClick={() => toggleWishlist(product)}
              aria-label="Add to wishlist"
            >
              <FaHeart color={wishlist.includes(product.id) ? 'red' : 'gray'} size={24} />
            </button>
            <div className="w-40 h-40 relative mb-4">
              <Image src={product.image} alt={product.name} fill className="object-contain rounded" sizes="160px" />
            </div>
            <h3 className="font-semibold text-lg mb-2 text-gray-900">{product.name}</h3>
            <span className="text-blue-600 font-bold mb-4">${product.price.toFixed(2)}</span>
            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">Add to Cart</button>
          </div>
        ))}
      </div>
    </div>
  );
} 