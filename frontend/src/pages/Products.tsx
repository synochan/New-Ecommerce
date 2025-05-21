import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import { getProducts, getCategories, Product, Category } from '../services/api';
import { ShoppingBagIcon } from '@heroicons/react/24/outline';

const Products = () => {
  const [searchParams] = useSearchParams();
  const categorySlug = searchParams.get('category');

  const { data: categories, isLoading: categoriesLoading, error: categoriesError } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: () => getCategories().then(res => res.data),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const { data: products, isLoading: productsLoading, error: productsError } = useQuery<Product[]>({
    queryKey: ['products', categorySlug],
    queryFn: () => getProducts(categorySlug || undefined).then(res => res.data),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const isLoading = categoriesLoading || productsLoading;
  const hasError = categoriesError || productsError;

  if (hasError) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] animate-fade-in">
        <div className="text-center">
          <h3 className="text-xl font-semibold mb-2 text-red-500">Error loading data</h3>
          <p className="text-gray-400 mb-4">Please try refreshing the page</p>
          <button
            onClick={() => window.location.reload()}
            className="btn btn-primary"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] animate-fade-in">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-gray-400">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Categories Filter */}
      <div className="sticky top-16 z-40 -mx-4 px-4 py-4 bg-primary border-b border-gray-800">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <Link
            to="/products"
            className={`btn whitespace-nowrap transition-all duration-200 ${
              !categorySlug 
                ? 'bg-accent hover:bg-accent-dark text-white' 
                : 'bg-primary-light hover:bg-accent/10 text-gray-300'
            }`}
          >
            All Products
          </Link>
          {categories?.map(category => (
            <Link
              key={category.id}
              to={`/products?category=${category.slug}`}
              className={`btn whitespace-nowrap transition-all duration-200 ${
                categorySlug === category.slug
                  ? 'bg-accent hover:bg-accent-dark text-white'
                  : 'bg-primary-light hover:bg-accent/10 text-gray-300'
              }`}
            >
              {category.name}
            </Link>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 py-6">
        {products?.map((product, index) => (
          <Link
            key={product.id}
            to={`/products/${product.slug}`}
            className="group bg-primary-light rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 animate-slide-up"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="aspect-square overflow-hidden bg-primary-dark">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
            </div>
            <div className="p-3 md:p-4">
              <div className="flex flex-col gap-1">
                <h3 className="font-semibold text-sm md:text-base group-hover:text-accent transition-colors line-clamp-1">
                  {product.name}
                </h3>
                <p className="text-gray-400 text-xs md:text-sm">{product.category_name}</p>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-accent font-bold text-sm md:text-base">
                    ${product.price.toFixed(2)}
                  </p>
                  <span className={`text-xs ${product.available ? 'text-green-500' : 'text-red-500'}`}>
                    {product.available ? 'In Stock' : 'Out of Stock'}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Empty State */}
      {products?.length === 0 && (
        <div className="flex items-center justify-center min-h-[50vh] animate-fade-in">
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-2">No products found</h3>
            <p className="text-gray-400 mb-4">Try selecting a different category</p>
            <Link to="/products" className="btn btn-primary">
              View All Products
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products; 