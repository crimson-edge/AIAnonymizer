'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signupSchema } from '@/lib/validations/auth';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import { SubscriptionTier } from '@prisma/client';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const TIER_DETAILS = {
  FREE: {
    name: 'Free',
    description: 'Get started with basic features',
    tokens: '10,000 tokens/month',
    price: 'Free forever'
  },
  BASIC: {
    name: 'Basic',
    description: 'Perfect for regular users',
    tokens: '100,000 tokens/month',
    price: '$10/month'
  },
  PREMIUM: {
    name: 'Premium',
    description: 'For power users',
    tokens: '1,000,000 tokens/month',
    price: '$49/month'
  }
};

export default function SignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultTier = (searchParams.get('plan')?.toUpperCase() || 'FREE') as SubscriptionTier;
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    selectedTier: defaultTier
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          selectedTier: formData.selectedTier
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create account');
      }

      // If it's a paid tier, redirect to Stripe checkout
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
        return;
      }

      // For free tier, sign in and redirect
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      router.push('/dashboard');
    } catch (err) {
      console.error('Signup error:', err);
      setError(err instanceof Error ? err.message : 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-md">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              type="text"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              type="text"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              required
            />
          </div>
        </div>

        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
        </div>

        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />
        </div>

        <div>
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            id="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            required
          />
        </div>

        <div className="space-y-4">
          <Label>Select Your Plan</Label>
          <RadioGroup
            value={formData.selectedTier}
            onValueChange={(value) => setFormData({ ...formData, selectedTier: value as SubscriptionTier })}
            className="grid grid-cols-1 gap-4 sm:grid-cols-3"
          >
            {Object.entries(TIER_DETAILS).map(([tier, details]) => (
              <div key={tier} className={`relative flex cursor-pointer rounded-lg px-5 py-4 border ${
                formData.selectedTier === tier ? 'border-primary bg-primary/5' : 'border-border'
              }`}>
                <RadioGroupItem value={tier} id={tier} className="sr-only" />
                <div className="flex flex-col">
                  <Label htmlFor={tier} className="font-medium">
                    {details.name}
                  </Label>
                  <span className="text-sm text-muted-foreground">{details.description}</span>
                  <span className="mt-1 font-medium">{details.price}</span>
                  <span className="text-sm text-muted-foreground">{details.tokens}</span>
                </div>
              </div>
            ))}
          </RadioGroup>
        </div>
      </div>

      {error && (
        <div className="text-sm text-red-500">
          {error}
        </div>
      )}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Creating Account...' : 'Create Account'}
      </Button>
    </form>
  );
}
