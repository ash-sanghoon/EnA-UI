import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Settings, 
  FolderKanban, 
  AlertCircle, 
  Search,
  BookOpen,
  Bell
} from 'lucide-react';

const AppLayout = ({ children }) => {
  const [activeSection, setActiveSection] = useState('dashboard');

  const mainMenuItems = [
    { id: 'dashboard', icon: <LayoutDashboard />, label: '대시보드' },
    { id: 'projects', icon: <FolderKanban />, label: '프로젝트 관리' },
    { id: 'symbol-management', icon: <Settings />, label: '심볼 관리' },
    { id: 'unrecognized', icon: <AlertCircle />, label: '미인식 처리' },
    { id: 'results', icon: <Search />, label: '결과 조회' }
  ];

  const secondaryMenuItems = [
    { id: 'documentation', icon: <BookOpen />, label: 'Documentation' },
    { id: 'help', icon: <Bell />, label: '도움말' }
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-purple-700 text-white flex flex-col">
        {/* Logo */}
        <div className="p-4 border-b border-purple-600">
          <h1 className="text-xl font-bold">P&ID Analyzer</h1>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 p-4">
          <div className="space-y-1">
            {mainMenuItems.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`flex items-center w-full px-4 py-2 rounded-lg text-sm ${
                  activeSection === item.id 
                    ? 'bg-purple-800 text-white' 
                    : 'text-purple-100 hover:bg-purple-600'
                }`}
              >
                <span className="mr-3">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>

          {/* Secondary Navigation */}
          <div className="mt-8 pt-8 border-t border-purple-600">
            {secondaryMenuItems.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`flex items-center w-full px-4 py-2 rounded-lg text-sm ${
                  activeSection === item.id 
                    ? 'bg-purple-800 text-white' 
                    : 'text-purple-100 hover:bg-purple-600'
                }`}
              >
                <span className="mr-3">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-purple-600">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center">
              <span className="text-sm font-medium">UN</span>
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium">Username</div>
              <div className="text-xs text-purple-200">Admin</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
};

export default AppLayout;

