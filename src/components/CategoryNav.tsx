import React from 'react';
import { CategoryId } from '../types';

interface CategoryNavProps {
  activeCategory: CategoryId;
  onSelectCategory: (cat: CategoryId) => void;
}

interface CatItem {
  id: CategoryId;
  label: string;
  icon: string;
}

const CATEGORIES: CatItem[] = [
  { id: 'all', label: 'All Items', icon: '🛒' },
  { id: 'vegetables', label: 'Vegetables', icon: '🥬' },
  { id: 'fruit', label: 'Fruit', icon: '🍌' },
  { id: 'staples', label: 'Staples', icon: '🍚' },
  { id: 'dairy', label: 'Dairy & Eggs', icon: '🥛' },
  { id: 'meat-and-fish', label: 'Meat & Fish', icon: '🐟' }
];

export const CategoryNav: React.FC<CategoryNavProps> = ({
  activeCategory,
  onSelectCategory
}) => {
  return (
    <div className="bg-white border-b border-gray-100 sticky top-[118px] z-20 shadow-xs">
      <div className="max-w-4xl mx-auto px-4 py-2.5 overflow-x-auto no-scrollbar flex items-center gap-2">
        {CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all min-h-[40px] select-none ${
                isActive
                  ? 'bg-emerald-700 text-white shadow-sm ring-2 ring-emerald-700/20'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              <span className="text-sm">{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
