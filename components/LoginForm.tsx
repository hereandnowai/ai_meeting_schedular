
import React, { useState } from 'react';
import { Input } from './Input';
import { Button } from './Button';
import { APP_NAME, LOGO_URL } from '../constants';
import { ArrowRightOnRectangleIcon, EnvelopeIcon } from '@heroicons/react/24/outline';


interface LoginFormProps {
  onLogin: (email: string) => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(''); // Mock password field
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email) {
      setError('Please enter your email.');
      return;
    }
    // Mock password validation or just proceed
    if (!password) {
        setError('Please enter your password.');
        return;
    }

    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      onLogin(email);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#004040] to-[#005F5F] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-2xl">
        <div>
          <img
            className="mx-auto h-16 w-auto"
            src={LOGO_URL} 
            alt={`${APP_NAME} Logo`}
          />
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to {APP_NAME}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your credentials to access your account.
             <br/> (Hint: use <code className="bg-gray-200 p-0.5 rounded">admin@example.com</code> for admin access)
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <Input
            label="Email address"
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            icon={EnvelopeIcon}
            error={error.includes("email") ? error : undefined}
          />
           <Input
            label="Password"
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            error={error.includes("password") ? error : undefined}
          />
          {error && !error.includes("email") && !error.includes("password") && <p className="text-sm text-red-600">{error}</p>}
          
          <Button type="submit" isLoading={isLoading} loadingText="Signing in..." fullWidth icon={ArrowRightOnRectangleIcon}>
            Sign in
          </Button>
        </form>
         <p className="mt-4 text-center text-xs text-gray-500">
            This is a demo application. Authentication is mocked.
          </p>
      </div>
    </div>
  );
};