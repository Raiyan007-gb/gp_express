'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Check if user is already logged in
  useEffect(() => {
    const token = getCookie('admin_session');
    if (token) {
      try {
        // Verify the token
        const decrypted = decryptData(token);
        const userData = JSON.parse(decrypted);
        if (userData.email === 'admin@tdi.com') {
          router.push('/');
        }
      } catch (e) {
        // Invalid token, clear it
        document.cookie = 'admin_session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      }
    }
  }, [router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simple validation
    if (!email || !password) {
      setError('Email and password are required');
      setLoading(false);
      return;
    }

    // Check credentials
    if (email === 'admin@tdi.com' && password === 'tdiadmingpexpress') {
      // Create encrypted session token
      const userData = { email, timestamp: new Date().getTime() };
      const encrypted = encryptData(JSON.stringify(userData));
      
      // Set cookie with encrypted data (expires in 24 hours)
      const expiryDate = new Date();
      expiryDate.setTime(expiryDate.getTime() + 24 * 60 * 60 * 1000);
      document.cookie = `admin_session=${encrypted}; expires=${expiryDate.toUTCString()}; path=/; samesite=lax`;
      
      // Redirect to home page
      router.push('/');
    } else {
      setError('Invalid email or password');
      setLoading(false);
    }
  };

  // Simple encryption function (for demo purposes)
  // In a real app, use a proper encryption library
  function encryptData(data: string): string {
    // This is a very basic encryption for demonstration
    // In production, use a proper encryption library
    return btoa(data) + '_' + Math.random().toString(36).substring(2, 15);
  }

  // Simple decryption function (for demo purposes)
  function decryptData(encryptedData: string): string {
    // Extract the actual data part (before the underscore)
    const dataPart = encryptedData.split('_')[0];
    return atob(dataPart);
  }

  // Function to get cookie by name
  function getCookie(name: string): string | null {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md p-8 space-y-8 bg-background/80 rounded-lg shadow-modern border border-primary/20">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-primary">Admin Login</h1>
          <p className="mt-2 text-secondary">Sign in to access the dashboard</p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-md text-red-500">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-secondary mb-1">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-background/40 border border-accent/30 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50"
                placeholder="admin@tdi.com"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-secondary mb-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-background/40 border border-accent/30 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50"
                placeholder="••••••••••••"
              />
            </div>
          </div>

          <div>
            <Button
              type="submit"
              className="w-full py-6 gradient-blue shadow-modern text-lg"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}