"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { setAuthCookie, deleteAuthCookie } from '@/lib/supabase/cookies';
import { useLandlord } from '@/context/user-context';
import { Mail, Lock, User, Home, Key, Smile, AlertCircle, MapPin, Check } from 'lucide-react';
import House from "@/components/ui/house"
import './login.css'

export default function AuthPage() {
  const router = useRouter();
  const { updateLandlord, isAuthenticated } = useLandlord();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Login state
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  });

  // Signup state con campo de ubicación
  const [signupData, setSignupData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    ubication: '' // Nuevo campo agregado
  });

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  // Limpiar datos al cambiar de modo
  const switchMode = (newMode: 'login' | 'signup') => {
    setMode(newMode);
    setError('');
    setSuccessMessage('');
    setLoginData({ email: '', password: '' });
    setSignupData({ name: '', email: '', password: '', confirmPassword: '', ubication: '' });
  };

  // Manejar inicio de sesión
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: loginData.email,
        password: loginData.password
      });

      if (authError) throw authError;
      if (!data.session) throw new Error('No session found');

      await setAuthCookie(data.session.access_token);

      const { data: landlordData, error: profileError } = await supabase
      .from('LANDLORDS')
      .select('id, name, phone, ubication, theme_prefered, accent_color')
      .eq('email', data.user.email)
      .single();

      if (profileError) throw profileError;

      updateLandlord({
        id: data.user.id,
        email: data.user.email!,
        name: landlordData?.name || '',
        phone: landlordData?.phone || '',
        ubication: landlordData?.ubication || '',
        themePrefered: landlordData?.theme_prefered || 'light',
        accent_color: landlordData?.accent_color || '#35ba35'
      });

      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Error during login');
      await deleteAuthCookie();
    } finally {
      setLoading(false);
    }
  };

  // Manejar registro con ubicación
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validación básica
    if (signupData.password !== signupData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (signupData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email: signupData.email,
        password: signupData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: {
            full_name: signupData.name
          }
        }
      });

      if (authError) throw authError;

      // Crear perfil en la tabla LANDLORDS con ubicación
      if (data.user) {
        const { error: profileError } = await supabase
        .from('LANDLORDS')
        .insert([{
          id: data.user.id,
          email: signupData.email,
          name: signupData.name,
          ubication: signupData.ubication, // Guardar la ubicación
          theme_prefered: 'light',
          accent_color: '#35ba35'
        }]);

        if (profileError) throw profileError;
      }

      setSuccessMessage('Account created successfully! Please check your email to verify your account.');

    } catch (err: any) {
      setError(err.message || 'Error during signup');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-div">
    <div className="login-card">
    {/* Panel de bienvenida */}
    <div className={`welcome-panel ${mode === 'login' ? 'slide-right' : 'slide-left'}`}>
    <div className="welcome-content">
    <div className="welcome-box">
    {mode === 'login' ? (
      <>
      <h2 className="welcome-title">
      <Smile className="w-8 h-8" />
      Hello, Friend!
      </h2>
      <p className="welcome-text">
      Register with your personal details to use all of Domera features
      </p>
      <button
      onClick={() => switchMode('signup')}
      className="welcome-button"
      >
      <Key className="w-5 h-5" />
      SIGN UP
      </button>
      </>
    ) : (
      <>
      <h2 className="welcome-title">Welcome Back!</h2>
      <p className="welcome-text">
      Sign in to access your properties and manage your account
      </p>
      <button
      onClick={() => switchMode('login')}
      className="welcome-button"
      >
      SIGN IN
      </button>
      </>
    )}
    </div>

    <div className="brand">
    <House className="w-6 h-6 text-white" />
    <span className="brand-name">Domera</span>
    </div>
    </div>
    </div>

    {/* Formulario */}
    <div className={`form-panel ${mode === 'login' ? 'md:order-2' : 'md:order-1'}`}>
    <div className="form-container">
    <div className="form-header">
    <div className="icon-container">
    <div className="icon-background">
    <div className="icon-circle">
    {mode === 'login' ? (
      <Key className="icon" />
    ) : (
      <User className="icon" />
    )}
    </div>
    </div>
    </div>

    <h1 className="form-title">
    {mode === 'login' ? 'Sign In to Domera' : 'Create Account'}
    </h1>
    <p className="form-subtitle">
    {mode === 'login'
      ? 'Manage your properties efficiently'
  : 'Get started with your free account'}
  </p>
  </div>

  {error && (
    <div className="alert alert-error">
    <AlertCircle className="alert-icon" />
    <p>{error}</p>
    </div>
  )}

  {successMessage && (
    <div className="alert alert-success">
    <Check className="alert-icon" />
    <div>
    <p className="font-bold">Success!</p>
    <p>{successMessage}</p>
    <button
    onClick={() => switchMode('login')}
    className="mt-2 text-sm underline hover:text-blue-600 transition-colors"
    >
    Go to Login
    </button>
    </div>
    </div>
  )}

  {mode === 'login' ? (
    <form onSubmit={handleLogin} className="form">
    <div className="form-group">
    <label className="label">Email</label>
    <div className="input-container">
    <Mail className="input-icon" />
    <input
    type="email"
    name="email"
    value={loginData.email}
    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
    className="input"
    placeholder="Enter your email"
    required
    autoComplete="email"
    />
    </div>
    </div>

    <div className="form-group">
    <label className="label">Password</label>
    <div className="input-container">
    <Lock className="input-icon" />
    <input
    type="password"
    name="password"
    value={loginData.password}
    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
    className="input"
    placeholder="Enter your password"
    required
    autoComplete="current-password"
    />
    </div>
    </div>

    <button
    type="submit"
    disabled={loading}
    className={`button button-login ${loading ? 'disabled' : ''}`}
    >
    {loading ? (
      <>
      <div className="spinner" />
      Signing in...
      </>
    ) : (
      'Sign In'
    )}
    </button>

    <div className="link-text">
    Don't have an account?{' '}
    <button
    type="button"
    onClick={() => switchMode('signup')}
    className="link-button"
    >
    Create Account
    </button>
    </div>
    </form>
  ) : (
    <form onSubmit={handleSignup} className="form">
    <div className="form-group">
    <label className="label">Full Name</label>
    <div className="input-container">
    <User className="input-icon" />
    <input
    type="text"
    name="name"
    value={signupData.name}
    onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
    className="input"
    placeholder="Your full name"
    required
    />
    </div>
    </div>

    <div className="form-group">
    <label className="label">Email</label>
    <div className="input-container">
    <Mail className="input-icon" />
    <input
    type="email"
    name="email"
    value={signupData.email}
    onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
    className="input"
    placeholder="Enter your email"
    required
    autoComplete="email"
    />
    </div>
    </div>

    {/* Nuevo campo de ubicación */}
    <div className="form-group">
    <label className="label">Location</label>
    <div className="input-container">
    <MapPin className="input-icon" />
    <input
    type="text"
    name="ubication"
    value={signupData.ubication}
    onChange={(e) => setSignupData({ ...signupData, ubication: e.target.value })}
    className="input"
    placeholder="City, Country"
    required
    />
    </div>
    </div>

    <div className="form-group">
    <label className="label">Password</label>
    <div className="input-container">
    <Lock className="input-icon" />
    <input
    type="password"
    name="password"
    value={signupData.password}
    onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
    className="input"
    placeholder="Create a password (min. 6 characters)"
    required
    />
    </div>
    </div>

    <div className="form-group">
    <label className="label">Confirm Password</label>
    <div className="input-container">
    <Lock className="input-icon" />
    <input
    type="password"
    name="confirmPassword"
    value={signupData.confirmPassword}
    onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
    className="input"
    placeholder="Confirm your password"
    required
    />
    </div>
    </div>

    <button
    type="submit"
    disabled={loading}
    className={`button button-signup ${loading ? 'disabled' : ''}`}
    >
    {loading ? (
      <>
      <div className="spinner" />
      Creating account...
      </>
    ) : (
      'Create Account'
    )}
    </button>

    <div className="link-text">
    Already have an account?{' '}
    <button
    type="button"
    onClick={() => switchMode('login')}
    className="link-button"
    >
    Sign in
    </button>
    </div>
    </form>
  )}
  </div>
  </div>
  </div>
  </div>
  );
}
