import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { 
  LayoutDashboard, 
  FolderKanban, 
  Settings, 
  AlertCircle, 
  Search,
  BookOpen,
  Bell,
  ChevronDown,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const Sidebar = () => {
  const router = useRouter();
  const [isCompanyMenuOpen, setIsCompanyMenuOpen] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const mainMenuItems = [
    { id: 'dashboard', path: '/', icon: <LayoutDashboard />, label: '대시보드' },
    { id: 'projects', path: '/projects', icon: <FolderKanban />, label: '프로젝트' },
    { id: 'symbols', path: '/symbols', icon: <Settings />, label: '심볼 관리' }
  ];

  const secondaryMenuItems = [
    { id: 'documentation', path: '/docs', icon: <BookOpen />, label: 'Documentation' },
    { id: 'help', path: '/help', icon: <Bell />, label: '도움말' }
  ];

  const isActive = (path) => router.pathname === path;

  return (
    <div 
      className={`${
        isCollapsed ? 'w-20' : 'w-64'
      } h-screen bg-purple-700 text-white flex flex-col transition-all duration-300 relative`}
    >
      {/* Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-6 w-6 h-6 bg-purple-700 border rounded-full flex items-center justify-center text-purple-200 hover:text-white"
      >
        {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>

      {/* Logo */}
      <div className={`p-4 border-b border-purple-600 ${isCollapsed ? 'hidden' : ''}`}>
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold truncate">P&ID Analyzer</h1>
          <button 
            onClick={() => setIsCompanyMenuOpen(!isCompanyMenuOpen)}
            className="text-purple-200 hover:text-white"
          >
            <ChevronDown className={`w-5 h-5 transform transition-transform ${
              isCompanyMenuOpen ? '' : '-rotate-90'
            }`} />
          </button>
        </div>
        {isCompanyMenuOpen && (
          <div className="mt-2 px-2 py-1 bg-purple-800 rounded text-sm truncate">
            Saudi Aramco - Ras Tanura
          </div>
        )}
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 overflow-y-auto p-4">
        <div className="space-y-1">
          {mainMenuItems.map(item => (
            <button
              key={item.id}
              onClick={() => router.push(item.path)}
              className={`flex items-center ${
                isCollapsed ? 'justify-center' : 'space-x-3'
              } w-full px-4 py-2 rounded-lg text-sm transition-colors ${
                isActive(item.path)
                  ? 'bg-purple-800 text-white'
                  : 'text-purple-100 hover:bg-purple-600'
              }`}
            >
              <span className="mr-3">{item.icon}</span>
              {!isCollapsed && <span className="truncate">{item.label}</span>}
            </button>
          ))}
        </div>

        {/* Secondary Navigation */}
        <div className={`mt-8 pt-8 border-t border-purple-600 ${isCollapsed ? 'hidden' : ''}`}>
          {secondaryMenuItems.map(item => (
            <button
              key={item.id}
              onClick={() => router.push(item.path)}
              className={`flex items-center ${
                isCollapsed ? 'justify-center' : 'space-x-3'
              } w-full px-4 py-2 rounded-lg text-sm transition-colors ${
                isActive(item.path)
                  ? 'bg-purple-800 text-white'
                  : 'text-purple-100 hover:bg-purple-600'
              }`}
            >
              <span className="mr-3">{item.icon}</span>
              {!isCollapsed && <span className="truncate">{item.label}</span>}
            </button>
          ))}
        </div>
      </nav>

      {/* User Profile */}
      <div className={`p-4 border-t ${isCollapsed ? 'hidden' : ''}`}>
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center">
            <span className="text-sm font-medium">JD</span>
          </div>
          <div>
            <div className="text-sm font-medium truncate">John Doe</div>
            <div className="text-xs text-purple-200 truncate">System Admin</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;