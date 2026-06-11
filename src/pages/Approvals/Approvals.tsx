import { useState } from 'react';
import {
  CheckSquare,
  User,
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  AlertTriangle,
} from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { formatDate, formatRelativeTime } from '../../utils/formatters';
import { ApprovalStatus, ApprovalLevel } from '../../types';

const statusColors: Record<ApprovalStatus, string> = {
  pending: 'badge-warning',
  approved: 'badge-success',
  rejected: 'badge-danger',
};

const statusLabels: Record<ApprovalStatus, string> = {
  pending: '待审批',
  approved: '已通过',
  rejected: '已驳回',
};

const levelLabels: Record<ApprovalLevel, string> = {
  level_1: '一级审批',
  level_2: '二级审批',
};

export function Approvals() {
  const { approvals, approveApproval, rejectApproval } = useAppStore();
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [reviewModal, setReviewModal] = useState<{
    approvalId: string;
    action: 'approve' | 'reject';
  } | null>(null);
  const [reviewComment, setReviewComment] = useState('');

  const filteredApprovals = approvals.filter((a) =>
    activeTab === 'pending' ? a.status === 'pending' : a.status !== 'pending'
  );

  const pendingCount = approvals.filter((a) => a.status === 'pending').length;

  const handleReview = () => {
    if (!reviewModal) return;
    if (reviewModal.action === 'approve') {
      approveApproval(reviewModal.approvalId, reviewComment);
    } else {
      rejectApproval(reviewModal.approvalId, reviewComment);
    }
    setReviewModal(null);
    setReviewComment('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">审批中心</h1>
          <p className="text-text-secondary text-sm mt-1">
            两级审批流程：流体工程师验证 → 项目总工程师确认
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-sm">待审批</p>
              <p className="text-2xl font-bold text-status-warning font-mono mt-1">
                {pendingCount}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-status-warning/10">
              <Clock className="w-6 h-6 text-status-warning" />
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-sm">已通过</p>
              <p className="text-2xl font-bold text-status-success font-mono mt-1">
                {approvals.filter((a) => a.status === 'approved').length}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-status-success/10">
              <CheckCircle className="w-6 h-6 text-status-success" />
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-sm">已驳回</p>
              <p className="text-2xl font-bold text-status-danger font-mono mt-1">
                {approvals.filter((a) => a.status === 'rejected').length}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-status-danger/10">
              <XCircle className="w-6 h-6 text-status-danger" />
            </div>
          </div>
        </div>
      </div>

      <div className="card p-4">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              activeTab === 'pending'
                ? 'bg-accent/20 text-accent border border-accent/30'
                : 'text-text-secondary hover:text-text-primary hover:bg-bg-tertiary'
            }`}
          >
            待处理
            <span
              className={`px-2 py-0.5 text-xs rounded-full ${
                activeTab === 'pending' ? 'bg-accent/30' : 'bg-bg-tertiary'
              }`}
            >
              {pendingCount}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              activeTab === 'history'
                ? 'bg-accent/20 text-accent border border-accent/30'
                : 'text-text-secondary hover:text-text-primary hover:bg-bg-tertiary'
            }`}
          >
            历史记录
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {filteredApprovals.map((approval, index) => {
          const isExpanded = expandedId === approval.id;

          return (
            <div
              key={approval.id}
              className="card overflow-hidden animate-fade-in opacity-0"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div
                className="p-5 cursor-pointer"
                onClick={() => setExpandedId(isExpanded ? null : approval.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                      <FileText className="w-6 h-6 text-accent" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-text-primary">
                        {approval.taskName}
                      </h3>
                      <div className="flex items-center gap-3 mt-1 text-sm">
                        <span className={`badge ${statusColors[approval.status]}`}>
                          {statusLabels[approval.status]}
                        </span>
                        <span className="badge badge-info">
                          {levelLabels[approval.level]}
                        </span>
                        <span className="text-text-muted flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {formatRelativeTime(approval.submittedAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {approval.status === 'pending' && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setReviewModal({ approvalId: approval.id, action: 'reject' });
                          }}
                          className="btn-danger text-sm flex items-center gap-2"
                        >
                          <ThumbsDown className="w-4 h-4" />
                          驳回
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setReviewModal({ approvalId: approval.id, action: 'approve' });
                          }}
                          className="btn-success text-sm flex items-center gap-2"
                        >
                          <ThumbsUp className="w-4 h-4" />
                          通过
                        </button>
                      </div>
                    )}
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-text-muted" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-text-muted" />
                    )}
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-5 pt-5 border-t border-border animate-fade-in">
                    <div className="grid grid-cols-3 gap-6">
                      <div className="col-span-2 space-y-4">
                        <div>
                          <h4 className="text-sm font-medium text-text-primary mb-3 flex items-center gap-2">
                            <CheckSquare className="w-4 h-4 text-accent" />
                            审批流程
                          </h4>
                          <div className="flex items-center">
                            <div className="flex flex-col items-center">
                              <div className="w-8 h-8 rounded-full bg-status-success/20 flex items-center justify-center">
                                <CheckCircle className="w-4 h-4 text-status-success" />
                              </div>
                              <span className="text-xs text-text-secondary mt-1">提交</span>
                            </div>
                            <div className="flex-1 h-0.5 bg-border mx-2" />
                            <div className="flex flex-col items-center">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                  approval.level === 'level_1' || approval.status === 'approved'
                                    ? 'bg-accent/20'
                                    : 'bg-bg-tertiary'
                                }`}
                              >
                                {approval.status === 'approved' ? (
                                  <CheckCircle className="w-4 h-4 text-status-success" />
                                ) : approval.status === 'rejected' && approval.level === 'level_1' ? (
                                  <XCircle className="w-4 h-4 text-status-danger" />
                                ) : (
                                  <User
                                    className={`w-4 h-4 ${
                                      approval.level === 'level_1'
                                        ? 'text-accent'
                                        : 'text-text-muted'
                                    }`}
                                  />
                                )}
                              </div>
                              <span className="text-xs text-text-secondary mt-1">
                                流体工程师
                              </span>
                            </div>
                            <div className="flex-1 h-0.5 bg-border mx-2" />
                            <div className="flex flex-col items-center">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                  approval.level === 'level_2' && approval.status === 'pending'
                                    ? 'bg-status-warning/20'
                                    : approval.status === 'approved'
                                    ? 'bg-status-success/20'
                                    : 'bg-bg-tertiary'
                                }`}
                              >
                                {approval.status === 'approved' ? (
                                  <CheckCircle className="w-4 h-4 text-status-success" />
                                ) : (
                                  <User
                                    className={`w-4 h-4 ${
                                      approval.level === 'level_2'
                                        ? 'text-status-warning'
                                        : 'text-text-muted'
                                    }`}
                                  />
                                )}
                              </div>
                              <span className="text-xs text-text-secondary mt-1">总工程师</span>
                            </div>
                            <div className="flex-1 h-0.5 bg-border mx-2" />
                            <div className="flex flex-col items-center">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                  approval.status === 'approved'
                                    ? 'bg-status-success/20'
                                    : 'bg-bg-tertiary'
                                }`}
                              >
                                <CheckSquare
                                  className={`w-4 h-4 ${
                                    approval.status === 'approved'
                                      ? 'text-status-success'
                                      : 'text-text-muted'
                                  }`}
                                />
                              </div>
                              <span className="text-xs text-text-secondary mt-1">完成</span>
                            </div>
                          </div>
                        </div>

                        {approval.comment && (
                          <div className="p-4 bg-bg-tertiary/50 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <MessageSquare className="w-4 h-4 text-accent" />
                              <span className="text-sm font-medium text-text-primary">
                                审批意见
                              </span>
                            </div>
                            <p className="text-sm text-text-secondary pl-6">
                              "{approval.comment}"
                            </p>
                            {approval.approver && (
                              <p className="text-xs text-text-muted mt-2 pl-6">
                                — {approval.approver} 于{' '}
                                {approval.approvedAt
                                  ? formatDate(approval.approvedAt)
                                  : '-'}
                              </p>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="space-y-3">
                        <div className="p-3 bg-bg-tertiary/30 rounded-lg">
                          <p className="text-xs text-text-muted mb-1">提交时间</p>
                          <p className="text-sm text-text-primary">
                            {formatDate(approval.submittedAt)}
                          </p>
                        </div>
                        <div className="p-3 bg-bg-tertiary/30 rounded-lg">
                          <p className="text-xs text-text-muted mb-1">审批级别</p>
                          <p className="text-sm text-text-primary">
                            {levelLabels[approval.level]}
                          </p>
                        </div>
                        <div className="p-3 bg-bg-tertiary/30 rounded-lg">
                          <p className="text-xs text-text-muted mb-1">审批人</p>
                          <p className="text-sm text-text-primary">
                            {approval.approver || '待审批'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredApprovals.length === 0 && (
        <div className="card p-12 text-center">
          <CheckSquare className="w-16 h-16 text-text-muted mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-semibold text-text-primary mb-2">
            {activeTab === 'pending' ? '暂无待审批项' : '暂无历史记录'}
          </h3>
          <p className="text-text-secondary text-sm">
            {activeTab === 'pending'
              ? '所有审批事项都已处理完毕'
              : '暂无审批历史记录'}
          </p>
        </div>
      )}

      {reviewModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="card p-6 w-full max-w-md animate-fade-in">
            <h3 className="text-lg font-semibold text-text-primary mb-4">
              {reviewModal.action === 'approve' ? '审批通过' : '审批驳回'}
            </h3>
            <div className="mb-4">
              <label className="label">审批意见</label>
              <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                className="input h-24 resize-none"
                placeholder="请输入审批意见..."
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setReviewModal(null);
                  setReviewComment('');
                }}
                className="btn-secondary"
              >
                取消
              </button>
              <button
                onClick={handleReview}
                className={reviewModal.action === 'approve' ? 'btn-success' : 'btn-danger'}
              >
                确认{reviewModal.action === 'approve' ? '通过' : '驳回'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
