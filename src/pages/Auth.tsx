import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../components/ui/card';
import { Loader2 } from 'lucide-react';

export default function Auth() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    const body = isLogin ? { email, password } : { name, email, password };
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    try {
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">{isLogin ? 'Sign In' : 'Create Account'}</CardTitle>
          <CardDescription>
            {isLogin ? 'Enter your details below to login to your account' : 'Register for full access to WeatherGPT'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="p-3 text-sm bg-red-100 text-red-600 rounded-md border border-red-200">{error}</div>}
            
            {!isLogin && (
              <div className="space-y-2 text-left">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" type="text" placeholder="John Doe" value={name} onChange={e => setName(e.target.value)} required />
              </div>
            )}
            <div className="space-y-2 text-left">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="m@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2 text-left">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (isLogin ? 'Sign In' : 'Register')}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-2 text-center text-sm">
          <div className="text-muted-foreground">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button onClick={() => { setIsLogin(!isLogin); setError(''); }} className="text-primary font-medium hover:underline">
              {isLogin ? 'Register' : 'Sign In'}
            </button>
          </div>
          <Button variant="ghost" onClick={() => navigate('/')}>Back to Home</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
