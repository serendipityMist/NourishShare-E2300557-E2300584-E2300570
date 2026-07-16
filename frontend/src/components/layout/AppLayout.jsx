import { useState } from 'react';
import Sidebar from './Sidebar.jsx';
import TopBar from './TopBar.jsx';
import ToastStack from '../ui/ToastStack.jsx';

export default function AppLayout({ children, title, searchValue, onSearchChange, searchPlaceholder }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-surface paper-texture">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <TopBar
        title={title}
        onMenuClick={() => setSidebarOpen(true)}
        searchValue={searchValue}
        onSearchChange={onSearchChange}
        searchPlaceholder={searchPlaceholder}
      />
      <main className="md:ml-64 p-lg">
        <div className="max-w-[1200px] mx-auto">{children}</div>
      </main>
      <ToastStack />
    </div>
  );
}
