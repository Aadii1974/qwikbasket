import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, Briefcase, ChevronRight, Eye, EyeOff, Building, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState('b2c');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', password: '', companyName: '', gstNumber: '', fssaiNumber: '' });
  const [error, setError] = useState(null);
  const { login, signup, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      if (isLogin) {
        await login(formData.phone, formData.password);
      } else {
        await signup({ ...formData, role });
      }
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-[calc(100vh-100px)] flex items-center justify-center bg-gray-50 py-12 px-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md w-full bg-white rounded-[var(--radius-lg)] p-8 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-[var(--border)]">
        <div className="text-center mb-10">
           <h1 className="text-3xl font-extrabold tracking-tight">{isLogin ? 'Welcome Back!' : 'Create Account'}</h1>
           <p className="text-[var(--text-muted)] mt-2 font-medium">{isLogin ? 'Log in to your account' : 'Join Blinkit for faster shopping'}</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-[var(--radius-md)] text-sm font-bold mb-6 flex items-center gap-2 border border-red-100">
             <span>⚠️ {error}</span>
          </div>
        )}

        {!isLogin && (
          <div className="flex bg-gray-100 p-1 rounded-full mb-8">
            <button type="button" onClick={() => setRole('b2c')} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full text-sm font-bold transition-all ${role === 'b2c' ? 'bg-white shadow-sm text-[var(--secondary)]' : 'text-[var(--text-muted)]'}`}><User size={16} /> Individual</button>
            <button type="button" onClick={() => setRole('b2b')} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full text-sm font-bold transition-all ${role === 'b2b' ? 'bg-white shadow-sm text-blue-600' : 'text-[var(--text-muted)]'}`}><Briefcase size={16} /> Business</button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && (
            <div className="space-y-1">
              <label className="text-xs font-black uppercase text-gray-500 tracking-wider ml-1">Full Name</label>
              <div className="relative group">
                 <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[var(--secondary)]" size={18} />
                 <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="John Doe" className="w-full bg-gray-50 border border-gray-100 py-4 pl-12 pr-4 rounded-[var(--radius-md)] outline-none focus:bg-white focus:border-[var(--secondary)] transition" />
              </div>
            </div>
          )}

          {!isLogin && role === 'b2b' && (
             <>
               <div className="space-y-1">
                 <label className="text-xs font-black uppercase text-gray-500 tracking-wider ml-1">Company Name</label>
                 <div className="relative group">
                    <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[var(--secondary)]" size={18} />
                    <input type="text" required value={formData.companyName} onChange={(e) => setFormData({ ...formData, companyName: e.target.value })} placeholder="Acme Supermart" className="w-full bg-gray-50 border border-gray-100 py-4 pl-12 pr-4 rounded-[var(--radius-md)] outline-none focus:bg-white focus:border-[var(--secondary)] transition" />
                 </div>
               </div>
               <div className="flex gap-4">
                 <div className="space-y-1 flex-1">
                   <label className="text-xs font-black uppercase text-gray-500 tracking-wider ml-1">GST No. <span className="text-gray-400 lowercase font-medium">(optional)</span></label>
                   <div className="relative group">
                      <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[var(--secondary)]" size={18} />
                      <input type="text" value={formData.gstNumber} onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })} placeholder="22AAAAA0000A1Z5" className="w-full bg-gray-50 border border-gray-100 py-4 pl-12 pr-4 rounded-[var(--radius-md)] outline-none focus:bg-white focus:border-[var(--secondary)] transition" />
                   </div>
                 </div>
                 <div className="space-y-1 flex-1">
                   <label className="text-xs font-black uppercase text-gray-500 tracking-wider ml-1">FSSAI No. <span className="text-gray-400 lowercase font-medium">(optional)</span></label>
                   <div className="relative group">
                      <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[var(--secondary)]" size={18} />
                      <input type="text" value={formData.fssaiNumber} onChange={(e) => setFormData({ ...formData, fssaiNumber: e.target.value })} placeholder="10012011000123" className="w-full bg-gray-50 border border-gray-100 py-4 pl-12 pr-4 rounded-[var(--radius-md)] outline-none focus:bg-white focus:border-[var(--secondary)] transition" />
                   </div>
                 </div>
               </div>
             </>
          )}

          <div className="space-y-1">
            <label className="text-xs font-black uppercase text-gray-500 tracking-wider ml-1">Phone Number</label>
            <div className="relative group">
               {/* Using standard User/Phone icon placeholder */}
               <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[var(--secondary)]"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
               <input type="tel" required value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="e.g., 9876543210" className="w-full bg-gray-50 border border-gray-100 py-4 pl-12 pr-4 rounded-[var(--radius-md)] outline-none focus:bg-white focus:border-[var(--secondary)] transition" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-black uppercase text-gray-500 tracking-wider ml-1">Password</label>
            <div className="relative group">
               <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[var(--secondary)]" size={18} />
               <input type={showPassword ? "text" : "password"} required value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} placeholder="••••••••" className="w-full bg-gray-50 border border-gray-100 py-4 pl-12 pr-4 rounded-[var(--radius-md)] outline-none focus:bg-white focus:border-[var(--secondary)] transition" />
               <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                 {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
               </button>
            </div>
          </div>

          <button disabled={loading} className="w-full bg-[var(--secondary)] text-white py-4 rounded-[var(--radius-md)] font-black text-lg hover:bg-[var(--secondary-dark)] transition shadow-lg disabled:opacity-50 flex items-center justify-center gap-3">
            {isLogin ? 'Log In' : 'Sign Up'} <ChevronRight size={20} />
          </button>
        </form>

        <div className="mt-10 text-center text-[var(--text-muted)] font-medium">
          {isLogin ? "Don't have an account?" : "Already have an account?"} 
          <button onClick={() => setIsLogin(!isLogin)} className="ml-2 text-[var(--secondary)] font-extrabold hover:underline">
            {isLogin ? 'Sign Up' : 'Log In'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
