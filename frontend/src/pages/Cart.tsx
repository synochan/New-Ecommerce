import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { TrashIcon } from '@heroicons/react/24/outline';

const Cart = () => {
  const { state: { items, total }, removeItem, updateQuantity } = useCart();

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
        <p className="text-gray-400 mb-8">Add some products to your cart to get started</p>
        <Link to="/products" className="btn btn-primary">
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map(({ product, quantity }) => (
            <div
              key={product.id}
              className="bg-primary-light rounded-lg p-4 flex gap-4"
            >
              {/* Product Image */}
              <Link to={`/products/${product.slug}`} className="w-24 h-24">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover rounded"
                />
              </Link>

              {/* Product Info */}
              <div className="flex-1">
                <Link
                  to={`/products/${product.slug}`}
                  className="text-lg font-semibold hover:text-accent"
                >
                  {product.name}
                </Link>
                <p className="text-gray-400 text-sm">{product.category_name}</p>
                <div className="mt-2 flex items-center gap-4">
                  <input
                    type="number"
                    min="1"
                    max={product.stock}
                    value={quantity}
                    onChange={(e) => updateQuantity(product.id, Math.max(1, Math.min(product.stock, parseInt(e.target.value) || 1)))}
                    className="input w-20"
                  />
                  <button
                    onClick={() => removeItem(product.id)}
                    className="text-red-500 hover:text-red-400"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Price */}
              <div className="text-right">
                <p className="text-accent font-bold">${(product.price * quantity).toFixed(2)}</p>
                <p className="text-sm text-gray-400">${product.price.toFixed(2)} each</p>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="bg-primary-light rounded-lg p-6 h-fit">
          <h2 className="text-xl font-bold mb-4">Order Summary</h2>
          <div className="space-y-2 mb-4">
            <div className="flex justify-between">
              <span className="text-gray-400">Subtotal</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Shipping</span>
              <span>Free</span>
            </div>
            <div className="border-t border-gray-700 pt-2 mt-2">
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span className="text-accent">${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
          <button
            className="btn btn-primary w-full"
            onClick={() => alert('Checkout functionality will be implemented later')}
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart; 