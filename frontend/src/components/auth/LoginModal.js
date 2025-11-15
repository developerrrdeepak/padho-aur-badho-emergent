import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Chrome } from 'lucide-react';

const LoginModal = ({ open, onClose, onSwitchToRegister }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Login successful!');
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    const redirectUrl = `${window.location.origin}/auth/callback`;
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent data-testid="login-modal">
        <DialogHeader>
          <DialogTitle>Welcome Back!</DialogTitle>
          <DialogDescription>Login to continue your learning journey</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              data-testid="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="your@email.com"
            />
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              data-testid="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>

          <Button
            data-testid="login-submit-btn"
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </Button>
        </form>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
          </div>
        </div>

        <Button
          data-testid="google-login-btn"
          variant="outline"
          className="w-full"
          onClick={handleGoogleLogin}
        >
          <Chrome className="mr-2 h-4 w-4" />
          Google
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Don't have an account?{' '}
          <button
            data-testid="switch-to-register"
            type="button"
            onClick={onSwitchToRegister}
            className="text-green-600 hover:underline font-medium"
          >
            Sign up
          </button>
        </p>
      </DialogContent>
    </Dialog>
  );
};

export default LoginModal;