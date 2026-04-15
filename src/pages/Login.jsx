import { useState } from 'react';
import { supabase } from '@/api/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    setMessage('');

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setError(error.message);
      else setMessage('Check your email to confirm your account!');
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-6xl mb-3">🦸‍♀️</div>
          <h1 className="text-3xl font-black text-primary">HeroHabit</h1>
          <p className="text-muted-foreground font-semibold mt-1">Your daily habit hero! 🌟</p>
        </div>

        <div className="bg-white rounded-3xl border-2 border-border p-6 shadow-sm space-y-4">
          <h2 className="text-xl font-black text-center">
            {isSignUp ? 'Create Account 🌱' : 'Welcome Back! 👋'}
          </h2>

          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-3 text-sm font-semibold text-red-600">
              {error}
            </div>
          )}

          {message && (
            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-3 text-sm font-semibold text-green-600">
              {message}
            </div>
          )}

          <div>
            <Label className="text-xs font-bold text-muted-foreground mb-1 block">Email</Label>
            <Input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="rounded-xl font-semibold"
            />
          </div>

          <div>
            <Label className="text-xs font-bold text-muted-foreground mb-1 block">Password</Label>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              className="rounded-xl font-semibold"
            />
          </div>

          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full rounded-xl font-black"
          >
            {loading ? '...' : isSignUp ? 'Create Account 🚀' : 'Log In'}
          </Button>

          <button
            onClick={() => { setIsSignUp(!isSignUp); setError(''); setMessage(''); }}
            className="w-full text-sm font-bold text-muted-foreground hover:text-primary transition-colors"
          >
            {isSignUp ? 'Already have an account? Log in' : "Don't have an account? Sign up"}
          </button>
        </div>
      </div>
    </div>
  );
}