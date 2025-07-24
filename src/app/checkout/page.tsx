"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { FaCreditCard, FaShippingFast, FaLock, FaCheck, FaArrowLeft } from 'react-icons/fa';
import Image from "next/image";

interface CartItem {
  id: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

interface ShippingAddress {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface PaymentInfo {
  cardNumber: string;
  cardName: string;
  expiryDate: string;
  cvv: string;
}

export default function CheckoutPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');

  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    firstName: '',
    lastName: '',
    email: session?.user?.email || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India'
  });

  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: ''
  });

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/');
      return;
    }

    // Load user-specific cart from localStorage
    if (session?.user?.email) {
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
    }

    // Load user profile data
    loadUserProfile();
  }, [session, status, router]);

  const loadUserProfile = async () => {
    try {
      const response = await fetch('/api/user/profile');
      if (response.ok) {
        const userData = await response.json();
        if (userData.address) {
          setShippingAddress(prev => ({
            ...prev,
            firstName: userData.name?.split(' ')[0] || '',
            lastName: userData.name?.split(' ').slice(1).join(' ') || '',
            email: userData.email || session?.user?.email || '',
            phone: userData.phone || '',
            address: userData.address.street || '',
            city: userData.address.city || '',
            state: userData.address.state || '',
            zipCode: userData.address.zipCode || '',
            country: userData.address.country || 'India'
          }));
        }
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const calculateSubtotal = () => {
    return cart.reduce((total, item) => {
      const price = item.price;
      return total + (price * item.quantity);
    }, 0);
  };

  const calculateShipping = () => {
    return 10; // Fixed shipping cost
  };

  const calculateTax = () => {
    return calculateSubtotal() * 0.18; // 18% GST
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateShipping() + calculateTax();
  };

  const handleAddressChange = (field: keyof ShippingAddress, value: string) => {
    setShippingAddress(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePaymentChange = (field: keyof PaymentInfo, value: string) => {
    setPaymentInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateStep1 = () => {
    return shippingAddress.firstName && 
           shippingAddress.lastName && 
           shippingAddress.email && 
           shippingAddress.phone && 
           shippingAddress.address && 
           shippingAddress.city && 
           shippingAddress.state && 
           shippingAddress.zipCode;
  };

  const validateStep2 = () => {
    return paymentInfo.cardNumber && 
           paymentInfo.cardName && 
           paymentInfo.expiryDate && 
           paymentInfo.cvv;
  };

  const handleNextStep = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    } else if (currentStep === 2 && validateStep2()) {
      setCurrentStep(3);
    }
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    
    try {
      const orderData = {
        items: cart,
        shippingAddress,
        paymentInfo: {
          cardNumber: paymentInfo.cardNumber.slice(-4), // Only store last 4 digits
          cardName: paymentInfo.cardName
        },
        subtotal: calculateSubtotal(),
        shipping: calculateShipping(),
        tax: calculateTax(),
        total: calculateTotal(),
        status: 'pending'
      };

      console.log('Sending order data:', orderData);

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      console.log('Response status:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('Order result:', result);
        setOrderNumber(result.orderNumber);
        setOrderPlaced(true);
        
        // Clear user-specific cart
        if (session?.user?.email) {
          const cartKey = `cart_${session.user.email}`;
          localStorage.removeItem(cartKey);
        }
        setCart([]);
      } else {
        const errorData = await response.json();
        console.error('Failed to place order:', errorData);
        alert('Failed to place order: ' + (errorData.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Error placing order: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center">
        <div className="text-white text-2xl">Loading Checkout...</div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center">
        <div className="text-white text-2xl">Please log in to checkout</div>
      </div>
    );
  }

  if (cart.length === 0 && !orderPlaced) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-white text-2xl mb-4">Your cart is empty</div>
          <a
            href="/"
            className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
          >
            Continue Shopping
          </a>
        </div>
      </div>
    );
  }

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20 text-center max-w-md">
          <div className="text-green-400 text-6xl mb-4">✓</div>
          <h1 className="text-2xl font-bold text-white mb-4">Order Placed Successfully!</h1>
          <p className="text-gray-300 mb-4">Thank you for your purchase</p>
          <div className="bg-white/5 rounded-lg p-4 mb-6">
            <p className="text-white font-semibold">Order Number:</p>
            <p className="text-blue-400 font-mono text-lg">{orderNumber}</p>
          </div>
          <p className="text-gray-300 text-sm mb-6">
            You will receive an email confirmation shortly. You can track your order in your profile.
          </p>
          <div className="flex gap-4">
            <a
              href="/profile"
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
            >
              View Orders
            </a>
            <a
              href="/"
              className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors duration-200"
            >
              Continue Shopping
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <a
                href="/cart"
                className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors duration-200"
              >
                <FaArrowLeft />
                Back to Cart
              </a>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Checkout</h1>
            </div>
            <div className="flex items-center gap-2 text-gray-300">
              <FaLock />
              <span className="text-sm">Secure Checkout</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Checkout Form */}
          <div className="lg:col-span-2">
            {/* Progress Steps */}
            <div className="flex items-center justify-center mb-8">
              <div className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  currentStep >= 1 ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-600 text-gray-400'
                }`}>
                  <FaShippingFast />
                </div>
                <div className={`w-16 h-1 ${currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-600'}`}></div>
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  currentStep >= 2 ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-600 text-gray-400'
                }`}>
                  <FaCreditCard />
                </div>
                <div className={`w-16 h-1 ${currentStep >= 3 ? 'bg-blue-600' : 'bg-gray-600'}`}></div>
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  currentStep >= 3 ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-600 text-gray-400'
                }`}>
                  <FaCheck />
                </div>
              </div>
            </div>

            {/* Step 1: Shipping Information */}
            {currentStep === 1 && (
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <h2 className="text-xl font-bold text-white mb-6">Shipping Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">First Name</label>
                    <input
                      type="text"
                      value={shippingAddress.firstName}
                      onChange={(e) => handleAddressChange('firstName', e.target.value)}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Last Name</label>
                    <input
                      type="text"
                      value={shippingAddress.lastName}
                      onChange={(e) => handleAddressChange('lastName', e.target.value)}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                    <input
                      type="email"
                      value={shippingAddress.email}
                      onChange={(e) => handleAddressChange('email', e.target.value)}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Phone</label>
                    <input
                      type="tel"
                      value={shippingAddress.phone}
                      onChange={(e) => handleAddressChange('phone', e.target.value)}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-2">Address</label>
                    <input
                      type="text"
                      value={shippingAddress.address}
                      onChange={(e) => handleAddressChange('address', e.target.value)}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">City</label>
                    <input
                      type="text"
                      value={shippingAddress.city}
                      onChange={(e) => handleAddressChange('city', e.target.value)}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">State</label>
                    <input
                      type="text"
                      value={shippingAddress.state}
                      onChange={(e) => handleAddressChange('state', e.target.value)}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">ZIP Code</label>
                    <input
                      type="text"
                      value={shippingAddress.zipCode}
                      onChange={(e) => handleAddressChange('zipCode', e.target.value)}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Country</label>
                    <select
                      value={shippingAddress.country}
                      onChange={(e) => handleAddressChange('country', e.target.value)}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="India">India</option>
                      <option value="USA">USA</option>
                      <option value="UK">UK</option>
                      <option value="Canada">Canada</option>
                    </select>
                  </div>
                </div>
                <div className="mt-6">
                  <button
                    onClick={handleNextStep}
                    disabled={!validateStep1()}
                    className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg transition-colors duration-200 font-semibold"
                  >
                    Continue to Payment
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Payment Information */}
            {currentStep === 2 && (
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <h2 className="text-xl font-bold text-white mb-6">Payment Information</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Card Number</label>
                    <input
                      type="text"
                      value={paymentInfo.cardNumber}
                      onChange={(e) => handlePaymentChange('cardNumber', e.target.value)}
                      placeholder="1234 5678 9012 3456"
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      maxLength={19}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Cardholder Name</label>
                    <input
                      type="text"
                      value={paymentInfo.cardName}
                      onChange={(e) => handlePaymentChange('cardName', e.target.value)}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Expiry Date</label>
                      <input
                        type="text"
                        value={paymentInfo.expiryDate}
                        onChange={(e) => handlePaymentChange('expiryDate', e.target.value)}
                        placeholder="MM/YY"
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        maxLength={5}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">CVV</label>
                      <input
                        type="text"
                        value={paymentInfo.cvv}
                        onChange={(e) => handlePaymentChange('cvv', e.target.value)}
                        placeholder="123"
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        maxLength={4}
                        required
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-6 flex gap-4">
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="flex-1 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors duration-200 font-semibold"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleNextStep}
                    disabled={!validateStep2()}
                    className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg transition-colors duration-200 font-semibold"
                  >
                    Review Order
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Order Review */}
            {currentStep === 3 && (
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <h2 className="text-xl font-bold text-white mb-6">Review Your Order</h2>
                
                <div className="space-y-6">
                  {/* Shipping Address */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Shipping Address</h3>
                    <div className="bg-white/5 rounded-lg p-4">
                      <p className="text-gray-300">
                        {shippingAddress.firstName} {shippingAddress.lastName}
                      </p>
                      <p className="text-gray-300">{shippingAddress.address}</p>
                      <p className="text-gray-300">
                        {shippingAddress.city}, {shippingAddress.state} {shippingAddress.zipCode}
                      </p>
                      <p className="text-gray-300">{shippingAddress.country}</p>
                      <p className="text-gray-300">{shippingAddress.phone}</p>
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Payment Method</h3>
                    <div className="bg-white/5 rounded-lg p-4">
                      <p className="text-gray-300">Card ending in {paymentInfo.cardNumber.slice(-4)}</p>
                      <p className="text-gray-300">{paymentInfo.cardName}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex gap-4">
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="flex-1 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors duration-200 font-semibold"
                  >
                    Back
                  </button>
                  <button
                    onClick={handlePlaceOrder}
                    disabled={loading}
                    className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg transition-colors duration-200 font-semibold"
                  >
                    {loading ? 'Processing...' : 'Place Order'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 sticky top-8">
              <h2 className="text-xl font-bold text-white mb-6">Order Summary</h2>
              
              {/* Cart Items */}
              <div className="space-y-4 mb-6">
                {cart.map((item, idx) => (
                  <div key={item.id ?? idx} className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden relative">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-contain"
                        sizes="48px"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium">{item.name}</p>
                      <p className="text-gray-300 text-sm">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-white font-semibold">${item.price.toFixed(2)}</p>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-2 border-t border-white/10 pt-4">
                <div className="flex justify-between text-gray-300">
                  <span>Subtotal</span>
                  <span>${calculateSubtotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Shipping</span>
                  <span>${calculateShipping().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Tax (18% GST)</span>
                  <span>${calculateTax().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-white font-bold text-lg border-t border-white/10 pt-2">
                  <span>Total</span>
                  <span>${calculateTotal().toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 