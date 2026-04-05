import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { fetchProducts } from '../services/api';
import { Search, ChevronDown, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CategoryPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('relevance');
  const [categoryName, setCategoryName] = useState('Category');

  // Currently relying on old mock categories/product logic until backend Category API is used extensively for products
  useEffect(() => {
    // In a real app, you'd fetch products by category slug: /api/products?category=slug
    const loadProducts = async () => {
      try {
        const allProds = await fetchProducts();
        
        // Example mock logic mapping
        // If slug matches something, filter it. Else show all.
        let filtered = allProds;
        if (slug) {
           filtered = allProds.filter(p => 
              p.category.toLowerCase() === slug.toLowerCase() || 
              p.category === slug ||
              // fallback map
              (slug === 'dairy' && p.category === 'dairy')
           );
           setCategoryName(slug.charAt(0).toUpperCase() + slug.slice(1));
           
           if(filtered.length === 0) filtered = allProds; // fallback to all for demo
        }
        
        setProducts(filtered);
      } catch (err) {
        console.error("Failed to load products", err);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, [slug]);

  // Filtering & Sorting Logic
  const processedProducts = products
    .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'price-low') return parseFloat(a.b2cPrice) - parseFloat(b.b2cPrice);
      if (sortBy === 'price-high') return parseFloat(b.b2cPrice) - parseFloat(a.b2cPrice);
      return 0; // relevance
    });

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="max-w-[1400px] mx-auto px-4 lg:px-8">
        
        {/* Header & Breadcrumb */}
        <div className="mb-8">
           <div className="text-sm text-slate-500 mb-2 flex items-center gap-2">
             <button onClick={() => navigate('/')} className="hover:text-[var(--secondary)]">Home</button> 
             <span>/</span> 
             <span className="text-slate-800 font-bold capitalize">{categoryName}</span>
           </div>
           <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight capitalize">{categoryName}</h1>
        </div>

        {/* Toolbar: Search & Sort */}
        <div className="flex flex-col md:flex-row gap-4 mb-10 w-full justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
           {/* Search */}
           <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input 
                type="text" 
                placeholder={`Search in ${categoryName}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 pl-12 pr-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-[var(--secondary)] transition text-sm font-semibold text-slate-800"
              />
           </div>

           {/* Filters */}
           <div className="flex gap-3 w-full md:w-auto">
              {/* Optional: Filter Button */}
              <button className="flex items-center gap-2 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-100 transition">
                 <Filter size={16} /> Filters
              </button>
              
              {/* Sort Selection */}
              <div className="relative flex-1 md:w-auto min-w-[200px]">
                 <select 
                   value={sortBy}
                   onChange={(e) => setSortBy(e.target.value)}
                   className="w-full appearance-none bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-[var(--secondary)] transition"
                 >
                    <option value="relevance">Sort by: Relevance</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                 </select>
                 <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
              </div>
           </div>
        </div>

        {/* Product Grid */}
        {loading ? (
             <div className="flex justify-center py-20">
                <div className="w-10 h-10 border-4 border-slate-200 border-t-[var(--secondary)] rounded-full animate-spin"></div>
             </div>
        ) : processedProducts.length > 0 ? (
             <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-x-3 gap-y-6"
             >
                <AnimatePresence>
                  {processedProducts.map(product => (
                    <motion.div 
                      key={product.id} 
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ProductCard product={product} />
                    </motion.div>
                  ))}
                </AnimatePresence>
             </motion.div>
        ) : (
             <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
                <h3 className="text-xl font-bold text-slate-800 mb-2">No products found</h3>
                <p className="text-slate-500">Try adjusting your search criteria in {categoryName}.</p>
             </div>
        )}
      </div>
    </div>
  );
}

export default CategoryPage;
