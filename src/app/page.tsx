"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import './shiny-hero.css';
import { useRouter } from "next/navigation";
import { FaSearch, FaSpinner, FaShoppingCart, FaUser, FaBox } from "react-icons/fa";
import { useSession, signIn, signOut } from "next-auth/react";
import toast from "react-hot-toast";

interface Product {
  _id: string;
  name: string;
  price: number;
  image: string;
  brand: string;
  category: string;
  description: string;
}

interface CartItem extends Product {
  quantity: number;
}

const brandList = [
  { name: "Nike", image: "/products/nike1.jpeg" },
  { name: "Adidas", image: "/products/adidas1.jpeg" },
  { name: "Red Tape", image: "/products/redtape 1.jpeg" },
  { name: "Bacca Bucci", image: "/products/baccabucci 1.jpeg" },
];

const brandCategories: Record<string, string[]> = {
  Nike: [
    "Air Max 90",
    "Revolution 5",
    "Downshifter 11",
    "Court Vision Low",
    "Air Force 1",
    "Blazer Mid '77",
  ],
  Adidas: [
    "Ultraboost 21",
    "NMD_R1",
    "Superstar",
    "Stan Smith",
    "Gazelle",
    "ZX 2K Boost",
  ],
  "Red Tape": [
    "Classic Runner",
    "Urban Sneaker",
    "Mesh Trainer",
    "Street Style",
  ],
  "Bacca Bucci": [
    "Urban Flex",
    "Street Runner",
    "Mesh Pro",
  ],
};

export default function Home() {
  const { data: session } = useSession();
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);

  const [search, setSearch] = useState("");
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const router = useRouter();

  // Fetch products from API
  useEffect(() => {
    setLoadingProducts(true);
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setProducts(data);
        } else {
          setProducts([]);
        }
        setLoadingProducts(false);
      })
      .catch(() => {
        setProducts([]);
        setLoadingProducts(false);
      });
  }, []);

  // Brand search navigation
  const handleBrandSearch = () => {
    const term = search.trim().toLowerCase().replace(/\s+/g, "");
    if (term === "redtape") {
      setSelectedBrand("Red Tape");
    } else if (term === "nike") {
      setSelectedBrand("Nike");
    } else if (term === "adidas") {
      setSelectedBrand("Adidas");
    } else if (term === "baccabucci") {
      setSelectedBrand("Bacca Bucci");
    }
  };

  // Load cart from localStorage on component mount and session changes
  useEffect(() => {
    if (typeof window !== 'undefined' && session?.user?.email) {
      // User-specific cart key
      const cartKey = `cart_${session.user.email}`;
      const savedCart = localStorage.getItem(cartKey);
      if (savedCart) {
        try {
          const parsedCart = JSON.parse(savedCart);
          setCart(parsedCart);
        } catch (error) {
          console.error('Error loading cart from localStorage:', error);
          setCart([]);
        }
      } else {
        setCart([]);
      }
    } else if (!session) {
      // Clear cart when not logged in
      setCart([]);
    }
  }, [session]);

  // Persist cart to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && session?.user?.email && cart.length > 0) {
      // User-specific cart key
      const cartKey = `cart_${session.user.email}`;
      localStorage.setItem(cartKey, JSON.stringify(cart));
    }
  }, [cart, session]);



  // Filter products by selected brand
  let displayProducts = products;
  if (selectedBrand) {
    displayProducts = products.filter(p => p.brand === selectedBrand);
  }

  // Get categories for selected brand
  const categories = selectedBrand ? brandCategories[selectedBrand] : [];

  // Add to cart handler
  const handleAddToCart = (product: Product) => {
    if (!session) {
      toast.error('Please sign in to add items to your cart');
      router.push('/auth/signin');
      return;
    }
    setCart((prev) => {
      const existing = prev.find(item => item._id === product._id);
      if (existing) {
        toast.success('Increased quantity in cart!');
        return prev.map(item =>
          item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        toast.success('Added to cart!');
        return [...prev, { ...product, quantity: 1 }];
      }
    });
  };

  

  return (
    <div className="font-sans min-h-screen flex flex-col bg-black">
      {/* Navbar */}
      <nav className="w-full bg-black border-b border-gray-800 text-gray-100 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-4">
          <div className="text-2xl font-bold tracking-tight">ShopEase</div>
          <div className="flex gap-8 items-center">
            <ul className="flex gap-8 items-center text-base font-medium">
              <li><a href="/contact" className="hover:text-blue-400 transition">Contact Us</a></li>
            </ul>
            {/* Search Bar */}
            <form className="ml-4 hidden md:block relative w-64" onSubmit={e => { 
              e.preventDefault();
              handleBrandSearch();
            }}>
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="px-3 py-1 pr-10 rounded bg-gray-900 border border-gray-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-transparent rounded transition text-white flex items-center justify-center hover:text-blue-400"
                onClick={handleBrandSearch}
                aria-label="Search"
              >
                <FaSearch />
              </button>
            </form>
            {/* Navigation Links */}
            <div className="flex items-center gap-6 ml-4">
              {session ? (
                <>
                  <Link href="/cart" className="flex items-center gap-2 text-white hover:text-blue-400 transition">
                    <FaShoppingCart />
                    Cart
                    {cart.length > 0 && (
                      <span className="bg-blue-600 text-white rounded-full px-2 py-0.5 text-xs font-bold">{cart.length}</span>
                    )}
                  </Link>
                  <Link href="/profile?tab=orders" className="flex items-center gap-2 text-white hover:text-blue-400 transition">
                    <FaBox />
                    Orders
                  </Link>
                  <Link href="/profile" className="flex items-center gap-2 text-white hover:text-blue-400 transition">
                    <FaUser />
                    Profile
                  </Link>
                  <div className="flex items-center gap-4">
                    <span className="text-white">{session.user?.name}</span>
                    <button
                      onClick={() => signOut()}
                      className="px-4 py-1 rounded bg-red-600 hover:bg-red-700 transition text-white font-semibold"
                    >
                      Logout
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <button
                    className="px-4 py-1 rounded bg-blue-600 hover:bg-blue-700 transition text-white font-semibold"
                    onClick={() => signIn()}
                  >
                    Login
                  </button>
                  <Link
                    href="/auth/signup"
                    className="px-4 py-2 rounded bg-gray-800 hover:bg-gray-700 transition text-white font-semibold border border-gray-600"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section with Shiny Effect */}
      <section className="hero-section">
        <div className="hero-shine" />
        <h1 className="text-4xl sm:text-5xl font-bold mb-4 drop-shadow-lg">Welcome to ShopEase</h1>
        <p className="text-lg sm:text-xl mb-8 text-gray-200">Discover the best deals on the latest products</p>
        <a
          href="#featured"
          className="inline-block bg-white text-black font-semibold px-6 py-3 rounded-full shadow hover:bg-gray-100 transition"
        >
          Shop Now
        </a>
      </section>

      {/* Featured Products */}
      <section
        className="py-16 px-2 sm:px-4 max-w-6xl mx-auto w-full relative"
        // No background image
      >
        {loadingProducts ? (
          <div className="flex justify-center items-center min-h-[200px]">
            <FaSpinner className="animate-spin text-3xl text-blue-400 mr-2" />
            <span className="text-white">Loading products...</span>
          </div>
        ) : !selectedBrand ? (
          <>
            <h2 className="text-2xl font-bold mb-8 text-center text-gray-100">Select a Brand</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
              {brandList.map((brand) => (
                <div
                  key={brand.name}
                  className="relative group bg-black rounded-xl shadow-2xl p-6 flex flex-col items-center cursor-pointer transition-transform duration-300 hover:scale-110 hover:shadow-[0_8px_32px_4px_rgba(255,255,255,0.15),0_1.5px_8px_2px_rgba(0,0,0,0.25)] hover:z-10 border border-gray-800 overflow-hidden hover:border-white/30 hover:-rotate-2 hover:skew-y-1"
                  style={{ perspective: '600px' }}
                  onClick={() => setSelectedBrand(brand.name)}
                >
                  {/* Stronger CSS Glow */}
                  <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-44 h-44 rounded-full bg-white opacity-0 group-hover:opacity-80 blur-2xl transition-all duration-300 z-0 pointer-events-none" />
                  <div className="w-32 h-32 relative mb-4 z-10">
                    <Image src={brand.image} alt={brand.name} fill className="object-contain rounded" sizes="128px" />
                  </div>
                  <h3 className="font-semibold text-lg text-gray-100 z-10">{brand.name}</h3>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <button
              className="mb-6 px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition"
              onClick={() => setSelectedBrand(null)}
            >
              &larr; Back to Brands
            </button>
            <h2 className="text-2xl font-bold mb-8 text-center text-gray-100">{selectedBrand} Sneakers</h2>
            {categories.length > 0 && (
              <div className="mb-8 flex flex-wrap gap-4 justify-center">
                {categories.map((cat) => (
                  <span key={cat} className="bg-blue-700 text-white px-4 py-2 rounded-full text-sm font-semibold">
                    {cat}
                  </span>
                ))}
              </div>
            )}
            {displayProducts.length === 0 ? (
              <div className="text-center text-gray-400">No products found.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
                {displayProducts.map((product) => (
                  <div key={product._id}
                    className="relative group bg-gray-900 rounded-xl shadow-2xl p-4 flex flex-col items-center transform transition-transform duration-300 hover:scale-110 hover:shadow-[0_8px_32px_4px_rgba(255,255,255,0.15),0_1.5px_8px_2px_rgba(0,0,0,0.25)] hover:z-10 border border-gray-800 overflow-hidden hover:border-white/30 hover:-rotate-2 hover:skew-y-1 cursor-pointer"
                    style={{ perspective: '600px' }}
                    onClick={() => router.push(`/product/${product._id}`)}
                  >
                    {/* White Glow on Hover */}
                    <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-36 h-36 rounded-full bg-white opacity-0 group-hover:opacity-80 blur-2xl transition-all duration-300 z-0 pointer-events-none" />
                    <div className="w-32 h-32 relative mb-4 z-10">
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-contain rounded"
                        sizes="128px"
                      />
                    </div>
                    <h3 className="font-semibold text-lg mb-2 text-gray-100 z-10">{product.name}</h3>
                    <span className="text-blue-400 font-bold mb-4 z-10">${product.price.toFixed(2)}</span>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition z-10" onClick={e => { e.stopPropagation(); handleAddToCart(product); }}>
                      Add to Cart
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </section>

      {/* Promo Section */}
      <section className="bg-gradient-to-r from-gray-800 via-gray-900 to-black py-12 px-4 text-center">
        <h3 className="text-xl font-semibold mb-2 text-indigo-300">Summer Sale!</h3>
        <p className="mb-4 text-indigo-200">Up to 50% off selected items. Limited time only.</p>
        <a
          href="#featured"
          className="inline-block bg-indigo-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-indigo-700 transition"
        >
          Shop the Sale
        </a>
      </section>

      {/* Footer */}
      <footer className="bg-black text-gray-400 py-6 text-center mt-auto border-t border-gray-800">
        <div className="mb-2">&copy; {new Date().getFullYear()} ShopEase. All rights reserved.</div>
        <div className="flex justify-center gap-6 text-sm">
          <a href="#" className="hover:underline">Privacy Policy</a>
          <a href="#" className="hover:underline">Terms of Service</a>
          <a href="#" className="hover:underline">Contact</a>
        </div>
      </footer>


    </div>
  );
}
