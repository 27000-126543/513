import { Bell, Search, Settings, User } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { USER_ROLE_LABELS } from '../../utils/constants';

export function Topbar() {
  const { currentUser, alerts, approvals } = useAppStore();

  const pendingAlerts = alerts.filter((a) => a.status === 'pending').length;
  const pendingApprovals = approvals.filter((a) => a.status === 'pending').length;

  return (
    <header className="h-16 bg-bg-secondary border-b border-border flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="搜索任务、报告、预警..."
            className="w-72 pl-9 pr-4 py-2 bg-bg-tertiary border border-border rounded-lg text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent/50 transition-colors"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-tertiary transition-colors">
          <Bell className="w-5 h-5" />
          {pendingAlerts > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-status-danger text-white text-xs font-bold rounded-full flex items-center justify-center">
              {pendingAlerts}
            </span>
          )}
        </button>

        <button className="relative p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-tertiary transition-colors">
          <Settings className="w-5 h-5" />
        </button>

        <div className="h-8 w-px bg-border" />

        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-accent to-accent-dark flex items-center justify-center text-bg-primary font-bold text-sm">
            {currentUser.avatar}
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium text-text-primary">
              {currentUser.name}
            </p>
            <p className="text-xs text-text-muted">
              {USER_ROLE_LABELS[currentUser.role]}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
