"use client";
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { FaStar, FaEdit, FaTrash, FaSpinner } from 'react-icons/fa';

interface Product {
  _id: string;
  name: string;
  price: number;
  image: string;
  brand: string;
  category: string;
  description: string;
}

interface Review {
  _id: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

interface CartItem extends Product {
  quantity: number;
}

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewError, setReviewError] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [editingReview, setEditingReview] = useState(false);
  const [editReviewText, setEditReviewText] = useState('');
  const [editReviewRating, setEditReviewRating] = useState(5);
  const [loading, setLoading] = useState(true);

  // Fetch product
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`/api/products/${id}`)
      .then(async res => {
        if (!res.ok) {
          setProduct(null);
          setLoading(false);
          return;
        }
        const data = await res.json();
        setProduct(data);
        setLoading(false);
      })
      .catch(() => {
        setProduct(null);
        setLoading(false);
      });
  }, [id]);

  // Fetch reviews
  useEffect(() => {
    if (!id) return;
    fetch(`/api/reviews?productId=${id}`)
      .then(async res => {
        if (!res.ok) {
          setReviews([]);
          return;
        }
        const data = await res.json();
        setReviews(data);
      })
      .catch(() => setReviews([]));
  }, [id]);

  // Fetch related items
  useEffect(() => {
    if (!product) return;
    fetch(`/api/products?brand=${encodeURIComponent(product.brand)}`)
      .then(async res => {
        if (!res.ok) {
          setRelated([]);
          return;
        }
        const data = await res.json();
        setRelated(data.filter((p: Product) => p._id !== product._id));
      })
      .catch(() => setRelated([]));
  }, [product]);

  // Load cart from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && session?.user?.email) {
      const cartKey = `cart_${session.user.email}`;
      const savedCart = localStorage.getItem(cartKey);
      if (savedCart) {
        try {
          // Sanitize: ensure price is a number
          const parsed = JSON.parse(savedCart);
          const sanitized = parsed.map((item: { id: string; name: string; price: number | string; image: string; quantity: number; _id?: string }) => ({
            ...item,
            price: typeof item.price === 'string' ? parseFloat(item.price.replace(/[^\d.]/g, '')) : item.price,
            quantity: item.quantity || 1
          }));
          setCart(sanitized);
        } catch {
          setCart([]);
        }
      }
    }
  }, [session]);

  const handleAddToCart = () => {
    if (!session) {
      router.push('/api/auth/signin');
      return;
    }
    if (!product || !session?.user?.email) return;
    const cartKey = `cart_${session.user.email}`;
    const existing = cart.find((item) => item._id === product._id);
    let newCart;
    if (existing) {
      newCart = cart.map(item => item._id === product._id ? { ...item, quantity: (item.quantity || 1) + 1 } : item);
    } else {
      newCart = [...cart, { ...product, quantity: 1, price: Number(product.price) }];
    }
    setCart(newCart);
    localStorage.setItem(cartKey, JSON.stringify(newCart));
    toast.success('Added to cart!');
  };

  const handleBuyNow = () => {
    if (!session) {
      router.push('/api/auth/signin');
      return;
    }
    handleAddToCart();
    router.push('/checkout');
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewError('');
    if (!reviewText.trim()) {
      setReviewError('Please enter a review.');
      return;
    }
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: id, rating: reviewRating, comment: reviewText })
      });
      const data = await res.json();
      if (!res.ok) {
        setReviewError(data.error || 'Failed to submit review');
      } else {
        setReviewText('');
        setReviewRating(5);
        // Refresh reviews
        fetch(`/api/reviews?productId=${id}`)
          .then(res => res.json())
          .then(data => setReviews(data));
      }
    } catch {
      setReviewError('Failed to submit review');
    }
  };

  // Edit review handler
  const handleEditReview = () => {
    if (!userReview) return;
    setEditReviewText(userReview.comment);
    setEditReviewRating(userReview.rating);
    setEditingReview(true);
  };

  const handleEditReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userReview) return;
    try {
      const res = await fetch(`/api/reviews?id=${userReview._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating: editReviewRating, comment: editReviewText })
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Failed to update review');
      } else {
        toast.success('Review updated!');
        setEditingReview(false);
        // Refresh reviews
        fetch(`/api/reviews?productId=${id}`)
          .then(res => res.json())
          .then(data => setReviews(data));
      }
    } catch {
      toast.error('Failed to update review');
    }
  };

  const handleDeleteReview = async () => {
    if (!userReview) return;
    if (!window.confirm('Are you sure you want to delete your review?')) return;
    try {
      const res = await fetch(`/api/reviews?id=${userReview._id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Failed to delete review');
      } else {
        toast.success('Review deleted!');
        // Refresh reviews
        fetch(`/api/reviews?productId=${id}`)
          .then(res => res.json())
          .then(data => setReviews(data));
      }
    } catch {
      toast.error('Failed to delete review');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <FaSpinner className="animate-spin text-4xl mr-2" />
        <span>Loading...</span>
      </div>
    );
  }

  if (!product) {
    return <div className="min-h-screen flex items-center justify-center text-white">Loading...</div>;
  }

  // Calculate average rating and review count
  const averageRating = reviews.length ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) : 0;
  const userReview = session ? reviews.find(r => r.userName === session.user?.name) : null;

  return (
    <div className="min-h-screen bg-black text-white p-2 sm:p-4">
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Image */}
        <div className="flex flex-col items-center">
          <Image src={product.image} alt={product.name} width={400} height={400} className="rounded-xl object-contain bg-white w-full max-w-xs sm:max-w-md md:max-w-lg" />
        </div>
        {/* Product Info */}
        <div className="flex flex-col gap-4 w-full">
          <h1 className="text-2xl sm:text-3xl font-bold break-words">{product.name}</h1>
          <div className="text-lg sm:text-xl text-blue-400 font-bold">${product.price.toFixed(2)}</div>
          <div className="text-gray-300 break-words">{product.description}</div>
          <div className="flex flex-col sm:flex-row gap-4 mt-4 w-full">
            <button onClick={handleAddToCart} className="flex-1 px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white font-semibold">Add to Cart</button>
            <button onClick={handleBuyNow} className="flex-1 px-6 py-2 bg-green-600 hover:bg-green-700 rounded text-white font-semibold">Buy Now</button>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="max-w-3xl mx-auto mt-12">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-4">
          Reviews
          <span className="flex items-center gap-1 text-yellow-400 text-lg">
            {Array.from({ length: 5 }).map((_, i) => (
              <FaStar key={i} color={i < Math.round(averageRating) ? 'gold' : 'gray'} />
            ))}
            <span className="text-white text-base ml-2">{averageRating.toFixed(1)} / 5</span>
            <span className="text-gray-400 text-sm ml-2">({reviews.length} review{reviews.length !== 1 ? 's' : ''})</span>
          </span>
        </h2>
        {userReview && (
          <div className="mb-4 bg-gray-800 p-4 rounded-lg border border-blue-600">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-bold">Your Review</span>
              <span className="text-yellow-400 flex items-center">
                {Array.from({ length: 5 }).map((_, i) => (
                  <FaStar key={i} color={userReview && i < userReview.rating ? 'gold' : 'gray'} />
                ))}
              </span>
              <span className="text-xs text-gray-500 ml-2">{userReview && new Date(userReview.createdAt).toLocaleDateString()}</span>
              <button className="ml-2 text-blue-400 hover:text-blue-600" title="Edit" onClick={handleEditReview}><FaEdit /></button>
              <button className="ml-1 text-red-400 hover:text-red-600" title="Delete" onClick={handleDeleteReview}><FaTrash /></button>
            </div>
            {editingReview ? (
              <form onSubmit={handleEditReviewSubmit} className="mt-2">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-semibold">Edit Rating:</span>
                  <select value={editReviewRating} onChange={e => setEditReviewRating(Number(e.target.value))} className="bg-gray-800 text-white rounded px-2 py-1">
                    {[5,4,3,2,1].map(r => <option key={r} value={r}>{r} Star{r > 1 && 's'}</option>)}
                  </select>
                </div>
                <textarea
                  value={editReviewText}
                  onChange={e => setEditReviewText(e.target.value)}
                  className="w-full bg-gray-800 text-white rounded p-2 mb-2"
                  rows={3}
                  placeholder="Edit your review..."
                />
                <div className="flex gap-2">
                  <button type="submit" className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white font-semibold">Save</button>
                  <button type="button" className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded text-white font-semibold" onClick={() => setEditingReview(false)}>Cancel</button>
                </div>
              </form>
            ) : (
              <div>{userReview && userReview.comment}</div>
            )}
          </div>
        )}
        {session && !userReview && (
          <form onSubmit={handleReviewSubmit} className="mb-6 bg-gray-900 p-4 rounded-lg">
            <div className="flex items-center gap-4 mb-2">
              <span className="font-semibold">Your Rating:</span>
              <select value={reviewRating} onChange={e => setReviewRating(Number(e.target.value))} className="bg-gray-800 text-white rounded px-2 py-1">
                {[5,4,3,2,1].map(r => <option key={r} value={r}>{r} Star{r > 1 && 's'}</option>)}
              </select>
            </div>
            <textarea
              value={reviewText}
              onChange={e => setReviewText(e.target.value)}
              className="w-full bg-gray-800 text-white rounded p-2 mb-2"
              rows={3}
              placeholder="Write your review..."
            />
            {reviewError && <div className="text-red-400 mb-2">{reviewError}</div>}
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white font-semibold">Submit Review</button>
          </form>
        )}
        <div className="space-y-4">
          {reviews.length === 0 && <div className="text-gray-400">No reviews yet.</div>}
          {reviews.filter(r => !userReview || r._id !== userReview._id).map(r => (
            <div key={r._id} className="bg-gray-900 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold">{r.userName}</span>
                <span className="text-yellow-400 flex items-center">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <FaStar key={i} color={i < r.rating ? 'gold' : 'gray'} />
                  ))}
                </span>
                <span className="text-xs text-gray-500 ml-2">{new Date(r.createdAt).toLocaleDateString()}</span>
              </div>
              <div>{r.comment}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Related Items */}
      <div className="max-w-5xl mx-auto mt-16">
        <h2 className="text-2xl font-bold mb-4">Related Items</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {related.map(item => (
            <div key={item._id} className="bg-gray-900 rounded-lg p-4 flex flex-col items-center">
              <Image src={item.image} alt={item.name} width={120} height={120} className="rounded mb-2 object-contain bg-white w-full max-w-[100px] sm:max-w-[120px]" />
              <div className="font-semibold text-center break-words">{item.name}</div>
              <div className="text-blue-400 font-bold mb-2">${item.price.toFixed(2)}</div>
              <button onClick={() => router.push(`/product/${item._id}`)} className="bg-blue-700 hover:bg-blue-800 px-3 py-1 rounded text-white text-sm w-full mt-2">View</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 