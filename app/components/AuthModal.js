'use client'

import { useState, useRef, useEffect } from 'react'
import { X, Mail, Lock, User, Eye, EyeOff, Loader, LogIn, UserPlus } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { signIn } from 'next-auth/react'

export default function AuthModal({ onClose }) {
  const [mode, setMode] = useState('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [shake, setShake] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)
  const modalRef = useRef(null)
  
  // Password strength calculation
  useEffect(() => {
    if (password.length === 0) {
      setPasswordStrength(0);
      return;
    }
    
    let strength = 0;
    
    // Length check
    if (password.length > 8) strength += 1;
    if (password.length > 12) strength += 1;
    
    // Character diversity
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    
    setPasswordStrength(Math.min(strength, 5));
  }, [password]);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose()
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  // Focus first input on mode change
  useEffect(() => {
    if (mode === 'signin') {
      document.getElementById('email-input')?.focus()
    } else {
      document.getElementById('name-input')?.focus()
    }
  }, [mode])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('Email/password login is not enabled yet. Please use Google or GitHub.')
    setShake(true)
    setTimeout(() => setShake(false), 500)
    return
    
    // Validation
    if (mode === 'signup' && !name.trim()) {
      setError('Please enter your name')
      setShake(true)
      setTimeout(() => setShake(false), 500)
      return
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address')
      setShake(true)
      setTimeout(() => setShake(false), 500)
      return
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      setShake(true)
      setTimeout(() => setShake(false), 500)
      return
    }
    
    if (mode === 'signup' && passwordStrength < 3) {
      setError('Please use a stronger password')
      setShake(true)
      setTimeout(() => setShake(false), 500)
      return
    }

    setLoading(true)
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false)
      onClose()
    }, 1500)
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{backgroundColor: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(8px)'}}>
        <motion.div 
          ref={modalRef}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className={`rounded-2xl shadow-xl w-full max-w-md overflow-hidden transition-all ${shake ? 'animate-shake' : ''}`}
          style={{
            background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 20px 50px rgba(0,0,0,0.3)'
          }}
        >
          {/* Decorative elements */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-purple-600 rounded-full opacity-20 blur-3xl"></div>
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-cyan-600 rounded-full opacity-20 blur-3xl"></div>
          
          <div className="p-6 flex items-center justify-between relative z-10" style={{backgroundColor: 'rgba(0,0,0,0.2)', borderBottom: '1px solid rgba(255,255,255,0.05)'}}>
            <div>
              <motion.h2 
                className="text-2xl font-bold text-white flex items-center gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                {mode === 'signin' ? (
                  <>
                    <LogIn size={24} />
                    Welcome Back!
                  </>
                ) : (
                  <>
                    <UserPlus size={24} />
                    Create Account
                  </>
                )}
              </motion.h2>
              <motion.p 
                className="text-sm mt-1 text-gray-300"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.15 }}
              >
                {mode === 'signin' ? 'Sign in to continue your journey' : 'Join our community today'}
              </motion.p>
            </div>
            <motion.button 
              onClick={onClose} 
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
              aria-label="Close"
              whileHover={{ rotate: 90, scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <X size={24} className="text-white" />
            </motion.button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5 relative z-10">
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-3 rounded-lg flex items-center text-sm bg-red-900/70 border border-red-700 text-red-100"
                >
                  <div className="flex-1">{error}</div>
                  <button 
                    type="button" 
                    onClick={() => setError('')}
                    className="p-1 rounded-full hover:bg-red-800"
                  >
                    <X size={16} />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {mode === 'signup' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <label className="block text-sm font-medium mb-2 text-white">Full Name</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <User size={18} />
                  </div>
                  <input
                    id="name-input"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-3 py-3 rounded-xl focus:outline-none focus:ring-2 transition-all bg-gray-800/50 border border-gray-700 text-white placeholder-gray-500 focus:ring-cyan-500 focus:border-cyan-500"
                    placeholder="John Doe"
                    autoFocus
                  />
                </div>
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: mode === 'signin' ? 0.1 : 0.2 }}
            >
              <label className="block text-sm font-medium mb-2 text-white">Email Address</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <Mail size={18} />
                </div>
                <input
                  id="email-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-3 py-3 rounded-xl focus:outline-none focus:ring-2 transition-all bg-gray-800/50 border border-gray-700 text-white placeholder-gray-500 focus:ring-cyan-500 focus:border-cyan-500"
                  placeholder="your@email.com"
                  autoFocus={mode === 'signin'}
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: mode === 'signin' ? 0.2 : 0.3 }}
            >
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-white">Password</label>
                {mode === 'signin' && (
                  <button 
                    type="button" 
                    className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-10 py-3 rounded-xl focus:outline-none focus:ring-2 transition-all bg-gray-800/50 border border-gray-700 text-white placeholder-gray-500 focus:ring-cyan-500 focus:border-cyan-500"
                  placeholder="Your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-gray-700 transition-colors text-gray-400 hover:text-white"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              
              {/* Password strength indicator */}
              {mode === 'signup' && password.length > 0 && (
                <div className="mt-2">
                  <div className="flex items-center gap-1 mb-1">
                    {[...Array(5)].map((_, i) => (
                      <div 
                        key={i} 
                        className={`h-1 rounded-full flex-1 transition-all duration-300 ${
                          i < passwordStrength ? 
                            passwordStrength < 3 ? 'bg-red-500' : 
                            passwordStrength < 5 ? 'bg-yellow-500' : 'bg-green-500'
                            : 'bg-gray-700'
                        }`}
                      ></div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400">
                    {passwordStrength < 2 ? 'Weak password' : 
                     passwordStrength < 4 ? 'Medium password' : 
                     passwordStrength < 5 ? 'Strong password' : 'Very strong password'}
                  </p>
                </div>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: mode === 'signin' ? 0.3 : 0.4 }}
            >
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 font-medium rounded-xl focus:outline-none relative overflow-hidden group"
                style={{
                  background: mode === 'signup' 
                    ? 'linear-gradient(135deg, #22c55e, #16a34a)' 
                    : 'linear-gradient(135deg, #3b82f6, #2563eb)',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.3)',
                }}
              >
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
                <div className="flex items-center justify-center relative z-10">
                  {loading ? (
                    <>
                      <Loader className="animate-spin mr-2" size={18} />
                      Processing...
                    </>
                  ) : (
                    mode === 'signin' ? 'Sign In' : 'Create Account'
                  )}
                </div>
              </button>
            </motion.div>
            
            {/* Social login options */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: mode === 'signin' ? 0.4 : 0.5 }}
              className="pt-2"
            >
              <div className="flex items-center my-4">
                <div className="flex-grow border-t border-gray-700"></div>
                <span className="flex-shrink mx-4 text-gray-400 text-sm">or continue with</span>
                <div className="flex-grow border-t border-gray-700"></div>
              </div>
              
              <div className="grid grid-cols-3 gap-3">
                <button 
                  type="button"
                  className="py-2.5 rounded-xl bg-gray-800/50 hover:bg-gray-700 transition-colors flex items-center justify-center text-white"
                  onClick={() => signIn('github')}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
                  </svg>
                </button>
                <button 
                  type="button"
                  className="py-2.5 rounded-xl bg-gray-800/50 transition-colors flex items-center justify-center text-white opacity-50 cursor-not-allowed"
                  disabled
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z"/>
                  </svg>
                </button>
                <button 
                  type="button"
                  className="py-2.5 rounded-xl bg-gray-800/50 hover:bg-gray-700 transition-colors flex items-center justify-center text-white"
                  onClick={() => signIn('google')}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M21.35 11.1H12v2.9h5.35c-.32 1.87-2.2 3.6-5.35 3.6-3.22 0-5.85-2.67-5.85-5.95S8.78 5.7 12 5.7c1.84 0 3.07.78 3.77 1.45l2.57-2.47C16.76 3.2 14.6 2 12 2 6.73 2 2.5 6.3 2.5 11.65S6.73 21.3 12 21.3c5.5 0 9.15-3.87 9.15-9.32 0-.63-.07-1.1-.16-1.58z"/>
                  </svg>
                </button>
              </div>
            </motion.div>
          </form>

          <div className="px-6 pb-6 border-t text-center relative z-10" style={{borderColor: 'rgba(255,255,255,0.05)'}}>
            {mode === 'signin' ? (
              <p className="text-sm text-gray-400">
                Don&apos;t have an account?{' '}
                <button
                  onClick={() => setMode('signup')}
                  className="font-medium text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  Sign Up
                </button>
              </p>
            ) : (
              <p className="text-sm text-gray-400">
                Already have an account?{' '}
                <button
                  onClick={() => setMode('signin')}
                  className="font-medium text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  Sign In
                </button>
              </p>
            )}
          </div>
          
          {/* Background animation */}
          <div className="absolute inset-0 z-0 opacity-20">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-purple-500 animate-pulse"></div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
