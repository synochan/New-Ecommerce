import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getProduct, Product } from '../services/api';
import { ShoppingBagIcon } from '@heroicons/react/24/outline';
import { useCart } from '../context/CartContext';

const ProductDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();

  const { data: product, isLoading, error } = useQuery<Product>({
    queryKey: ['product', slug],
    queryFn: () => getProduct(slug!).then(res => res.data)
  });

  const handleAddToCart = () => {
    if (product) {
      addItem(product, quantity);
      // Show success message
      alert('Product added to cart!');
      // Navigate to cart page
      navigate('/cart');
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
        <p className="text-gray-400">Loading product details...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-semibold mb-2 text-red-500">Error loading product</h3>
        <p className="text-gray-400 mb-4">Unable to load product details</p>
        <button
          onClick={() => navigate(-1)}
          className="btn btn-primary"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4">
      <button
        onClick={() => navigate(-1)}
        className="btn btn-secondary mb-8"
      >
        Back
      </button>

      <div className="grid md:grid-cols-2 gap-12">
        {/* Product Image */}
        <div className="aspect-square rounded-lg overflow-hidden bg-primary-dark">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Product Info */}
        <div>
          <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
          <p className="text-gray-400 mb-4">{product.category_name}</p>
          <p className="text-2xl text-accent font-bold mb-6">${product.price.toFixed(2)}</p>
          
          <div className="bg-primary-light rounded-lg p-6 mb-8">
            <p className="text-lg mb-6">{product.description}</p>
            
            <div className="flex items-center gap-4 mb-6">
              <label className="text-gray-400">Quantity:</label>
              <input
                type="number"
                min="1"
                max={product.stock}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock, parseInt(e.target.value) || 1)))}
                className="input w-20"
              />
            </div>

            <button
              onClick={handleAddToCart}
              disabled={!product.available || product.stock === 0}
              className="btn btn-primary w-full flex items-center justify-center gap-2"
            >
              <ShoppingBagIcon className="h-5 w-5" />
              {product.available && product.stock > 0
                ? 'Add to Cart'
                : 'Out of Stock'}
            </button>
          </div>

          {/* Product Details */}
          <div className="space-y-4">
            <div className="flex justify-between py-2 border-b border-gray-700">
              <span className="text-gray-400">Availability</span>
              <span className={product.available ? 'text-green-500' : 'text-red-500'}>
                {product.available ? 'In Stock' : 'Out of Stock'}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-700">
              <span className="text-gray-400">Stock</span>
              <span>{product.stock} units</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-700">
              <span className="text-gray-400">Category</span>
              <span>{product.category_name}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail; 