import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchCategories } from '../services/categoryService';

interface FilterProps {
  filters: {
    category: string;
    size: string;
    minPrice: string;
    maxPrice: string;
  };
  onFilterChange: (name: string, value: string) => void;
}

const ProductFilter: React.FC<FilterProps> = ({ filters, onFilterChange }) => {
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  });

  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  return (
    <div className="space-y-4 p-4 bg-white rounded-lg shadow">
      <h2 className="text-lg font-semibold">Filters</h2>
      
      {/* Category Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Category
        </label>
        <select
          value={filters.category}
          onChange={(e) => onFilterChange('category', e.target.value)}
          className="w-full border border-gray-300 rounded-md p-2"
        >
          <option value="">All Categories</option>
          {categories?.map((category) => (
            <option key={category.slug} value={category.slug}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      {/* Size Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Size
        </label>
        <select
          value={filters.size}
          onChange={(e) => onFilterChange('size', e.target.value)}
          className="w-full border border-gray-300 rounded-md p-2"
        >
          <option value="">All Sizes</option>
          {sizes.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </div>

      {/* Price Range Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Price Range
        </label>
        <div className="flex space-x-2">
          <input
            type="number"
            placeholder="Min"
            value={filters.minPrice}
            onChange={(e) => onFilterChange('minPrice', e.target.value)}
            className="w-1/2 border border-gray-300 rounded-md p-2"
          />
          <input
            type="number"
            placeholder="Max"
            value={filters.maxPrice}
            onChange={(e) => onFilterChange('maxPrice', e.target.value)}
            className="w-1/2 border border-gray-300 rounded-md p-2"
          />
        </div>
      </div>
    </div>
  );
};

export default ProductFilter; 