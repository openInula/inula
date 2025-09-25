"use client";
import { useState } from 'react';
import { Search } from 'lucide-react';

interface SearchBarProps {
  className?: string;
}

export default function SearchBar({ className = "" }: Readonly<SearchBarProps>) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      // 这里可以添加搜索逻辑
      console.log('Searching for:', query);
    }
  };

  return (
    <form onSubmit={handleSearch} className={`relative ${className}`}>
      <div className={`relative flex items-center transition-all duration-200 rounded-lg ${
        isFocused 
          ? 'ring-2 ring-blue-500/20 shadow-lg' 
          : 'hover:shadow-md'
      }`}>
        <div className="absolute left-3 flex items-center pointer-events-none">
          <Search 
            className={`w-4 h-4 transition-colors duration-200 ${
              isFocused 
                ? 'text-blue-600' 
                : 'text-gray-400 dark:text-gray-500'
            }`} 
          />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="搜索文档、API、示例..."
          className="w-64 pl-10 pr-4 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-0 transition-all duration-200 placeholder:text-gray-400 dark:placeholder:text-gray-500 text-gray-900 dark:text-gray-100"
        />
      </div>
    </form>
  );
} 