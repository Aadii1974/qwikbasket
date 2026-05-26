import React, { useState, useEffect } from 'react';
import { fetchCategories } from '../services/api';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useLoading } from '../context/LoadingContext';
import { ChevronLeft } from 'lucide-react';
import useSEO from '../hooks/useSEO';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 16 },
  show: { opacity: 1, scale: 1, y: 0 }
};

const CategoriesPage = () => {
  const { user } = useAuth();
  const { startLoading, stopLoading } = useLoading();
  const isB2B = user?.role === 'b2b';
  const navigate = useNavigate();
  
  useSEO({
    title: 'All Categories – Shop Fresh Fruits, Vegetables, Dairy',
    description: 'Explore our wide range of farm-sourced fresh grocery categories. From organic fruits and vegetables to daily dairy essentials, delivered to you in 45-60 minutes.',
    canonical: '/categories',
    keywords: ['grocery categories', 'buy organic produce', 'fresh milk online', 'fruits online India'],
  });
  
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      setIsLoading(true);
      startLoading();
      try {
        const cs = await fetchCategories();
        setCategories(cs || []);
      } catch (err) {
        console.error("Categories loading error:", err);
      } finally {
        setIsLoading(false);
        stopLoading();
      }
    };
    loadCategories();
  }, []);

  return (
    <div className={`min-h-screen py-8 ${isB2B ? 'bg-[var(--background)]' : 'bg-slate-50'}`}>
      <div className="max-w-[1400px] mx-auto px-4 lg:px-8">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => navigate(-1)} 
            className="p-2 bg-white rounded-full shadow-sm hover:shadow-md transition-shadow"
          >
            <ChevronLeft size={24} className="text-slate-700" />
          </button>
          <h1 className={`text-3xl md:text-5xl font-black tracking-tight ${isB2B ? 'text-slate-900' : 'text-slate-900'}`}>
            All Categories
          </h1>
        </div>

        {/* Categories Grid — Box Style */}
        {isLoading ? null : (
          <motion.div 
            variants={containerVariants} 
            initial="hidden" 
            animate="show"
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4"
          >
             {categories.map((cat) => (
               <Link to={`/category/${cat.id}`} key={cat.id}>
                 <motion.div 
                   variants={itemVariants}
                   whileHover={{ scale: 1.03, y: -4 }} 
                   className="flex flex-col cursor-pointer group w-full bg-white rounded-2xl md:rounded-3xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
                 >
                    {/* Image Container */}
                    <div className="w-full aspect-square bg-slate-50 overflow-hidden relative">
                      <img 
                        src={cat.image} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                        alt={cat.name} 
                      />
                      {/* Subtle gradient overlay at bottom */}
                      <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/10 to-transparent" />
                    </div>
                    {/* Name */}
                    <div className="px-3 py-3 md:px-4 md:py-4">
                      <span className={`text-[12px] sm:text-[13px] md:text-[15px] font-extrabold leading-tight line-clamp-2 block ${isB2B ? 'text-slate-600 group-hover:text-[var(--secondary)]' : 'text-slate-800 group-hover:text-[var(--secondary)]'} transition-colors duration-200`}>
                        {cat.name}
                      </span>
                    </div>
                 </motion.div>
               </Link>
             ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default CategoriesPage;
