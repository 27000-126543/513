import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { useAppStore } from '../../store/appStore';
import { cn } from '../../utils/formatters';

export function Layout() {
  const { sidebarCollapsed } = useAppStore();

  return (
    <div className="flex h-screen bg-bg-primary overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <main
          className={cn(
            'flex-1 overflow-y-auto scrollbar-thin p-6 transition-all duration-300'
          )}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
