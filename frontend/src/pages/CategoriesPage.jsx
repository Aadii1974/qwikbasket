import React, { useState, useEffect } from 'react';
import { fetchCategories } from '../services/api';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { ChevronLeft } from 'lucide-react';

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
  hidden: { opacity: 0, scale: 0.8, y: 20 },
  show: { opacity: 1, scale: 1, y: 0 }
};

const CategoriesPage = () => {
  const { user } = useAuth();
  const isB2B = user?.role === 'b2b';
  const navigate = useNavigate();
  
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      setIsLoading(true);
      try {
        const cs = await fetchCategories();
        setCategories(cs || []);
      } catch (err) {
        console.error("Categories loading error:", err);
      } finally {
        setIsLoading(false);
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

        {/* Categories Grid */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-slate-200 border-t-[var(--secondary)] rounded-full animate-spin"></div>
          </div>
        ) : (
          <motion.div 
            variants={containerVariants} 
            initial="hidden" 
            animate="show"
            className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-x-4 gap-y-8"
          >
             {categories.map((cat) => (
               <Link to={`/category/${cat.id}`} key={cat.id}>
                 <motion.div 
                   variants={itemVariants}
                   whileHover={{ scale: 1.05 }} 
                   className="flex flex-col items-center gap-3 cursor-pointer group w-full"
                 >
                    <div className={`w-[80px] h-[80px] sm:w-[90px] sm:h-[90px] md:w-[110px] md:h-[110px] rounded-full flex items-center justify-center overflow-hidden border-2 shadow-sm transition-all duration-300 relative ${isB2B ? 'bg-white border-slate-100 group-hover:border-[var(--secondary)] group-hover:shadow-lg' : 'bg-white border-transparent group-hover:border-[var(--secondary)] group-hover:shadow-lg'}`}>
                      <img src={cat.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300 rounded-full" alt={cat.name} />
                    </div>
                    <span className={`text-[11px] sm:text-[12px] md:text-[14px] font-black text-center leading-tight px-1 break-words line-clamp-2 w-full ${isB2B ? 'text-slate-600' : 'text-slate-800'}`}>
                      {cat.name}
                    </span>
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
