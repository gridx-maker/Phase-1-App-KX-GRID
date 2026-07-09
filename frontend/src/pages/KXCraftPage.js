import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import axios from 'axios';
import { 
  ArrowLeft, ExternalLink, ShoppingBag, Star, Gift, 
  Frame, Car, Palette, Award, Heart, Package, Truck, Loader2
} from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const KXCraftPage = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favourites, setFavourites] = useState(() => {
    try { return JSON.parse(localStorage.getItem('kxcraft_favs') || '[]'); } catch { return []; }
  });

  const toggleFavourite = (productId) => {
    setFavourites(prev => {
      const updated = prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId];
      localStorage.setItem('kxcraft_favs', JSON.stringify(updated));
      return updated;
    });
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API}/kxcraft/products`);
      setProducts(response.data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const categoryIcons = { motorsport: Car, frames: Frame, souvenirs: Gift, personalized: Palette };

  const uniqueCategories = ['all', ...new Set(products.map(p => p.category))];
  const categories = uniqueCategories.map(cat => ({
    id: cat,
    name: cat === 'all' ? 'All Products' : cat.charAt(0).toUpperCase() + cat.slice(1).replace(/_/g, ' '),
    icon: cat === 'all' ? Package : (categoryIcons[cat] || Package)
  }));

  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(p => p.category === selectedCategory);

  const features = [
    { icon: Award, title: 'Premium Quality', desc: 'Handcrafted with finest wood' },
    { icon: Truck, title: 'Pan India Delivery', desc: 'Free shipping on orders above ₹999' },
    { icon: Gift, title: 'Gift Wrapping', desc: 'Complimentary premium packaging' },
    { icon: Palette, title: 'Customization', desc: 'Personalize any product' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/')} 
              className="text-zinc-400 hover:text-white transition-colors"
              data-testid="back-btn"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="overflow-hidden h-8 md:h-10 flex items-center">
              <img src="https://customer-assets.emergentagent.com/job_b4ac6a41-177f-4a95-b224-80c582d4333d/artifacts/mctfn4tr_Typograpghy%20White%20Transparent-04.png" alt="KotlerX" className="h-32 md:h-44 object-contain" />
            </div>
          </div>
          <Button 
            onClick={() => document.getElementById('kxcraft-products')?.scrollIntoView({ behavior: 'smooth' })}
            variant="outline" 
            className="border-white/10 text-white hover:bg-white/5 gap-2 text-sm"
            data-testid="shop-btn"
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="hidden sm:inline">Shop</span>
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-24 md:pt-28 pb-8 md:pb-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-900/20 via-transparent to-orange-900/10" />
        <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
          <div className="flex flex-col-reverse md:flex-row items-center justify-between">
            <div className="max-w-2xl flex-1">
              <h2 className="font-unbounded font-bold text-3xl md:text-5xl lg:text-6xl text-white mt-3 mb-4 leading-tight">
              Motorsport<br />
              <span className="text-amber-400">Collectibles</span>
            </h2>
            <p className="font-inter text-sm md:text-lg text-zinc-400 mb-6 md:mb-8 max-w-lg">
              Premium handcrafted wooden products inspired by the world of motorsport. Each piece tells a story of speed, precision, and passion.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button 
                onClick={() => document.getElementById('kxcraft-products')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-amber-500 hover:bg-amber-400 text-black font-bold gap-2 h-10 md:h-12 px-6 md:px-8" data-testid="explore-btn">
                Explore Collection
                <ExternalLink className="w-4 h-4" />
              </Button>
              <Button 
                onClick={() => window.open('https://wa.me/919884794704?text=Hi%20KXCraft,%20I%20want%20to%20place%20a%20custom%20order', '_blank')}
                variant="outline" className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10 h-10 md:h-12 px-6 md:px-8" data-testid="custom-order-btn">
                Custom Orders
              </Button>
            </div>
            </div>
            {/* Big KX Craft logo on right */}
            <div className="flex items-center justify-center flex-shrink-0">
              <img 
                src="https://customer-assets.emergentagent.com/job_b4ac6a41-177f-4a95-b224-80c582d4333d/artifacts/pv00c127_Craft%20White%20Transparent.png" 
                alt="KX Craft" 
                className="w-[180px] md:w-[400px] lg:w-[500px] h-auto object-contain opacity-90"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-6 md:py-10 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
            {features.map((f, i) => (
              <div key={i} className="flex items-center gap-3 p-3 md:p-4 rounded-xl bg-white/5">
                <f.icon className="w-6 h-6 md:w-8 md:h-8 text-amber-400 flex-shrink-0" />
                <div>
                  <p className="text-xs md:text-sm font-semibold text-white">{f.title}</p>
                  <p className="text-[10px] md:text-xs text-zinc-500">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-6 md:py-8">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex gap-2 md:gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-2 px-3 md:px-5 py-2 md:py-3 rounded-full transition-all whitespace-nowrap text-xs md:text-sm ${
                  selectedCategory === cat.id
                    ? 'bg-amber-500 text-black font-bold'
                    : 'bg-white/5 text-zinc-400 hover:bg-white/10'
                }`}
                data-testid={`cat-${cat.id}`}
              >
                <cat.icon className="w-4 h-4" />
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section id="kxcraft-products" className="pb-16 md:pb-20">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          {loading ? (
            <div className="text-center py-12">
              <Loader2 className="w-10 h-10 text-amber-400 animate-spin mx-auto" />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
              <p className="text-zinc-500">No products in this category yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
              {filteredProducts.map((product) => (
                <div
                  key={product.product_id}
                  className="group rounded-xl overflow-hidden bg-white/5 border border-white/5 hover:border-amber-500/30 transition-all"
                  data-testid={`product-${product.product_id}`}
                >
                  {/* Image */}
                  <div className="aspect-square relative overflow-hidden bg-zinc-900">
                    <img
                      src={product.image_base64 || product.image_url || 'https://via.placeholder.com/400'}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {product.badge && (
                      <span className="absolute top-2 left-2 bg-amber-500 text-black text-[10px] md:text-xs font-bold px-2 py-0.5 rounded-full">
                        {product.badge}
                      </span>
                    )}
                    <button 
                      onClick={(e) => { e.stopPropagation(); toggleFavourite(product.product_id); }}
                      className="absolute top-2 right-2 w-7 h-7 md:w-8 md:h-8 rounded-full bg-black/50 flex items-center justify-center hover:bg-black/70 transition-colors"
                      data-testid={`fav-${product.product_id}`}
                    >
                      <Heart className={`w-3.5 h-3.5 md:w-4 md:h-4 transition-colors ${favourites.includes(product.product_id) ? 'text-red-500 fill-red-500' : 'text-white'}`} />
                    </button>
                  </div>

                  {/* Info */}
                  <div className="p-3 md:p-4">
                    <h3 className="font-semibold text-white text-xs md:text-sm mb-1 leading-tight line-clamp-2">
                      {product.name}
                    </h3>
                    {product.description && (
                      <p className="text-[10px] md:text-xs text-zinc-500 mb-2 line-clamp-2">{product.description}</p>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="font-unbounded font-bold text-amber-400 text-sm md:text-base">
                        ₹{product.price}
                      </span>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-amber-400" fill="currentColor" />
                        <span className="text-[10px] md:text-xs text-zinc-400">{product.rating}</span>
                      </div>
                    </div>
                    {product.external_link && (
                      <a 
                        href={product.external_link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="mt-3 flex items-center justify-center gap-2 text-sm font-bold bg-amber-500 text-black rounded-lg py-2.5 hover:bg-amber-400 transition-colors"
                        data-testid={`buy-${product.product_id}`}
                      >
                        <ShoppingBag className="w-4 h-4" />
                        Buy Now
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 md:py-20 bg-gradient-to-r from-amber-900/20 to-orange-900/20 border-t border-white/5">
        <div className="max-w-4xl mx-auto px-4 md:px-6 text-center">
          <h2 className="font-unbounded font-bold text-2xl md:text-4xl text-white mb-3 md:mb-4">
            Want Something Unique?
          </h2>
          <p className="text-zinc-400 text-sm md:text-base mb-6 md:mb-8">
            We create custom wooden pieces for teams, events, and individuals. 
            Tell us your vision and we'll bring it to life.
          </p>
          <Button 
            onClick={() => window.open('https://wa.me/919884794704?text=Hi%20KXCraft,%20I%20want%20to%20enquire%20about%20a%20custom%20piece', '_blank')}
            className="bg-amber-500 hover:bg-amber-400 text-black font-bold h-10 md:h-14 px-8 md:px-10 text-sm md:text-lg gap-2" data-testid="enquire-btn">
            Enquire Now
            <ExternalLink className="w-4 h-4 md:w-5 md:h-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 md:py-8 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 md:px-6 text-center">
          <img src="https://customer-assets.emergentagent.com/job_b4ac6a41-177f-4a95-b224-80c582d4333d/artifacts/pv00c127_Craft%20White%20Transparent.png" alt="KX Craft" className="h-10 mx-auto mb-2 object-contain" />
          <p className="text-xs md:text-sm text-zinc-500">
            A KotlerX Initiative
          </p>
        </div>
      </footer>
    </div>
  );
};

export default KXCraftPage;
