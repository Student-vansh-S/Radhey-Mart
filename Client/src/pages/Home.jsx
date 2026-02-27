import { useState, useEffect, useCallback } from 'react';
import { fetchProducts } from '../api/products';
import ProductCard from '../components/ProductCard';
import { ProductSkeleton } from '../components/Skeleton';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetchProducts({ search, category });
      setProducts(res.data.data.products);
      setCategories(res.data.data.categories);
    } catch (e) {
      setError('Failed to load products. Is the backend running?');
    } finally {
      setLoading(false);
    }
  }, [search, category]);

  useEffect(() => { load(); }, [load]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
  };

  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
    setSearch('');
    setSearchInput('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-white mb-2">Welcome to <span className="text-gray-400">Radhey Mart</span></h1>
        <p className="text-brand-muted">Discover quality products at great prices</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search products..."
            className="input flex-1"
          />
          <button type="submit" className="btn-primary px-5">Search</button>
          {(search || category) && (
            <button
              type="button"
              onClick={() => { setSearch(''); setCategory(''); setSearchInput(''); }}
              className="btn-secondary px-4"
            >
              Clear
            </button>
          )}
        </form>

        <select
          value={category}
          onChange={handleCategoryChange}
          className="input sm:w-48"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Results info */}
      {!loading && (
        <p className="text-brand-muted text-sm mb-4">
          {search && `Results for "${search}" — `}{products.length} product{products.length !== 1 ? 's' : ''}{category ? ` in "${category}"` : ''}
        </p>
      )}

      {/* Error */}
      {error && (
        <div className="card border-red-500/40 bg-red-900/10 text-red-400 text-center py-8 mb-6">
          {error}
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading
          ? Array.from({ length: 8 }).map((_, i) => <ProductSkeleton key={i} />)
          : products.map((p) => <ProductCard key={p.id} product={p} />)
        }
      </div>

      {!loading && products.length === 0 && !error && (
        <div className="text-center py-16 text-brand-muted">
          <div className="text-5xl mb-4">🔍</div>
          <p className="text-lg">No products found</p>
        </div>
      )}
    </div>
  );
}
