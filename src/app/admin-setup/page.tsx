"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminSetup() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSetupAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const response = await fetch('/api/admin/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        setTimeout(() => {
          router.push('/');
        }, 2000);
      } else {
        setError(data.error);
      }
    } catch (error) {
      setError('Failed to set up admin');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center">
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20 w-full max-w-md">
        <h1 className="text-2xl font-bold text-white mb-6 text-center">Admin Setup</h1>
        
        <form onSubmit={handleSetupAdmin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Your Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 text-white rounded-lg transition-colors duration-200 font-semibold"
          >
            {loading ? 'Setting up...' : 'Make Me Admin'}
          </button>
        </form>

        {message && (
          <div className="mt-4 p-3 bg-green-500/20 border border-green-500/30 rounded-lg">
            <p className="text-green-400 text-sm">{message}</p>
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <div className="mt-6 text-center">
          <p className="text-gray-300 text-sm">
            This will give you admin access to manage users and view analytics.
          </p>
        </div>
      </div>
    </div>
  );
} 