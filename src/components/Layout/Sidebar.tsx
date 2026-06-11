import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Layers,
  AlertTriangle,
  FileBarChart,
  Sparkles,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  Droplets,
} from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { NAV_ITEMS } from '../../utils/constants';
import { cn } from '../../utils/formatters';

const iconMap: Record<string, typeof LayoutDashboard> = {
  LayoutDashboard,
  Layers,
  AlertTriangle,
  FileBarChart,
  Sparkles,
  CheckSquare,
};

export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useAppStore();
  const location = useLocation();

  return (
    <aside
      className={cn(
        'h-screen bg-bg-secondary border-r border-border flex flex-col transition-all duration-300',
        sidebarCollapsed ? 'w-16' : 'w-60'
      )}
    >
      <div className="h-16 flex items-center justify-between px-4 border-b border-border">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-accent to-accent-dark flex items-center justify-center flex-shrink-0">
            <Droplets className="w-5 h-5 text-bg-primary" />
          </div>
          {!sidebarCollapsed && (
            <span className="font-bold text-lg text-gradient whitespace-nowrap">
              CavSim Pro
            </span>
          )}
        </div>
      </div>

      <nav className="flex-1 py-4 px-2 overflow-y-auto scrollbar-thin">
        <ul className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = iconMap[item.icon] || LayoutDashboard;
            const isActive = location.pathname.startsWith(item.path);

            return (
              <li key={item.id}>
                <NavLink
                  to={item.path}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 relative group',
                    isActive
                      ? 'bg-accent/10 text-accent border border-accent/30'
                      : 'text-text-secondary hover:text-text-primary hover:bg-bg-tertiary'
                  )}
                >
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-accent rounded-r-full" />
                  )}
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {!sidebarCollapsed && (
                    <span className="text-sm font-medium whitespace-nowrap">
                      {item.label}
                    </span>
                  )}
                  {item.badge && !sidebarCollapsed && (
                    <span className="ml-auto px-2 py-0.5 text-xs font-bold rounded-full bg-status-danger text-white">
                      {item.badge}
                    </span>
                  )}
                  {item.badge && sidebarCollapsed && (
                    <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-status-danger" />
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      <button
        onClick={toggleSidebar}
        className="h-12 flex items-center justify-center border-t border-border text-text-muted hover:text-text-primary hover:bg-bg-tertiary transition-colors"
      >
        {sidebarCollapsed ? (
          <ChevronRight className="w-5 h-5" />
        ) : (
          <ChevronLeft className="w-5 h-5" />
        )}
      </button>
    </aside>
  );
}
