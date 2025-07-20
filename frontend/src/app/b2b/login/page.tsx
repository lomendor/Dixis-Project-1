'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useB2BLogin } from '@/lib/api/services/b2b/useB2BAuth';

export default function B2BLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const b2bLogin = mounted ? useB2BLogin() : { mutate: () => {}, isLoading: false, error: null };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      return;
    }

    // Use the real B2B authentication hook
    b2bLogin.mutate({
      email,
      password,
      rememberMe,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Dixis B2B</h1>
          <p className="mt-2 text-sm text-gray-600">Πλατφόρμα για Επιχειρήσεις</p>
        </div>
        
        <h2 className="mt-6 text-center text-2xl font-bold text-gray-900">
          Σύνδεση στο B2B Portal
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Ή{' '}
          <Link href="/" className="font-medium text-green-600 hover:text-green-500">
            επιστροφή στο κανονικό κατάστημα
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Επιχείρησης
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  placeholder="company@example.com"
                />
              </div>
            </div>            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Κωδικός Πρόσβασης
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                />
              </div>
            </div>

            {b2bLogin.isError && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                {b2bLogin?.error?.message || 'Σφάλμα σύνδεσης. Παρακαλώ δοκιμάστε ξανά.'}
              </div>
            )}

            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-900">Να με θυμάσαι</span>
              </label>
            </div>

            <div>
              <button
                type="submit"
                disabled={b2bLogin.isPending || !email || !password}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {b2bLogin.isPending ? 'Σύνδεση...' : 'Σύνδεση'}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 mb-4">
              Δεν έχετε λογαριασμό;{' '}
              <Link href="/b2b/register" className="font-medium text-green-600 hover:text-green-500">
                Εγγραφή επιχείρησης
              </Link>
            </p>
            
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-xs text-blue-700 font-medium mb-1">Demo Διαπιστευτήρια:</p>
              <p className="text-xs text-blue-600">Email: demo@business.com</p>
              <p className="text-xs text-blue-600">Κωδικός: demo123</p>
            </div>
            
            <p className="text-xs text-gray-500 mt-4">
              Για υποστήριξη επικοινωνήστε στο{' '}
              <a href="mailto:b2b@dixis.io" className="text-green-600 hover:text-green-500">
                b2b@dixis.io
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}