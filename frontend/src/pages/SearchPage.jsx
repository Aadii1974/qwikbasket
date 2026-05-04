import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { fetchProducts } from '../services/api';
import ProductCard from '../components/ProductCard';
import { Search } from 'lucide-react';
import { motion } from 'framer-motion';

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(query);

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      try {
        const allProds = await fetchProducts();
        if (query.trim() === '') {
          setProducts([]);
        } else {
          const lowerQuery = query.toLowerCase();
          setProducts((allProds || []).filter(p => 
            p && p.name && (
              p.name.toLowerCase().includes(lowerQuery) || 
              (p.description && p.description.toLowerCase().includes(lowerQuery)) ||
              (p.customerType && p.customerType.toLowerCase().includes(lowerQuery))
            )
          ));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, [query]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setSearchParams({ q: searchInput });
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-24 pt-6">
      <div className="max-w-[1400px] mx-auto px-4 lg:px-8">
        
        {/* Mobile Search Bar (visible mainly on mobile if Header's isn't enough, but useful everywhere) */}
        <form onSubmit={handleSearch} className="mb-8 relative lg:hidden">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            <Search size={20} />
            </span>
            <input
            autoFocus
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder='Search "milk", "bread" or "atta"...'
            className="w-full py-4 pl-12 pr-4 rounded-xl border-2 border-slate-200 outline-none font-black text-slate-900 focus:border-[var(--secondary)] shadow-sm"
            />
        </form>

        <h2 className="text-2xl md:text-3xl font-black mb-6">
          {query ? `Search results for "${query}"` : 'Search for products'}
        </h2>

        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--secondary)]"></div>
          </div>
        ) : (
          <>
            {query && products.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                <Search size={40} className="mx-auto text-slate-300 mb-3" />
                <h3 className="font-black text-slate-400 text-xl">No products found</h3>
                <p className="text-slate-500 font-bold mt-2">Try searching for something else</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-2 md:gap-4">
                {products.map(product => (
                  <motion.div initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} key={product.id}>
                    <ProductCard product={product} allProducts={products} />
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
