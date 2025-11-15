import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Chrome } from 'lucide-react';

const RegisterModal = ({ open, onClose, onSwitchToLogin }) => {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(email, password, name, role);
      toast.success('Registration successful! Please login.');
      onSwitchToLogin();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Registration failed');
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
      <DialogContent data-testid="register-modal">
        <DialogHeader>
          <DialogTitle>Create Account</DialogTitle>
          <DialogDescription>Join thousands of learners today</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              data-testid="register-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="John Doe"
            />
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              data-testid="register-email"
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
              data-testid="register-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              minLength={6}
            />
          </div>

          <div>
            <Label htmlFor="role">I am a</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger data-testid="register-role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="student">Student</SelectItem>
                <SelectItem value="instructor">Instructor</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            data-testid="register-submit-btn"
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700"
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Sign Up'}
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
          data-testid="google-register-btn"
          variant="outline"
          className="w-full"
          onClick={handleGoogleLogin}
        >
          <Chrome className="mr-2 h-4 w-4" />
          Google
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <button
            data-testid="switch-to-login"
            type="button"
            onClick={onSwitchToLogin}
            className="text-green-600 hover:underline font-medium"
          >
            Login
          </button>
        </p>
      </DialogContent>
    </Dialog>
  );
};

export default RegisterModal;