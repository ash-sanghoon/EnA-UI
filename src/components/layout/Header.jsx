// src/components/layout/Header.jsx
import React from 'react';
import { Bell, Settings, Search } from 'lucide-react';

const Header = () => {
  return (
    <header className="h-16 bg-white border-b flex items-center justify-between px-6">
      {/* Left side - Search */}
      <div className="flex-1 max-w-xl">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="검색..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
          />
        </div>
      </div>

      {/* Right side - Actions */}
      <div className="flex items-center space-x-4">
        <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg">
          <Bell className="h-5 w-5" />
        </button>
        <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg">
          <Settings className="h-5 w-5" />
        </button>
        <div className="h-8 w-px bg-gray-200"></div>
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
            <span className="text-sm font-medium text-purple-600">JD</span>
          </div>
          <div className="text-sm">
            <div className="font-medium text-gray-700">John Doe</div>
            <div className="text-gray-500">Admin</div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;