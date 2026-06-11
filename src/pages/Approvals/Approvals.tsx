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
  const { approvals, pushedToManufacturing, approveApproval, rejectApproval } = useAppStore();
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [reviewModal, setReviewModal] = useState<{
    approvalId: string;
    action: 'approve' | 'reject';
  } | null>(null);
  const [reviewComment, setReviewComment] = useState('');

const displayApprovals = approvals.filter((a) => {
  if (activeTab !== 'pending') {
    const sameTaskApprovals = approvals.filter((x) => x.taskId === a.taskId);
    if (sameTaskApprovals.some((x) => x.level === 'level_2')) {
      return a.level === 'level_2';
    }
    return true;
  }
  if (a.status !== 'pending') return false;
  if (a.level === 'level_2') {
    const level1 = approvals.find(
      (x) => x.taskId === a.taskId && x.level === 'level_1'
    );
    if (level1 && level1.status !== 'approved') return false;
  }
  return true;
});

const pendingCount = approvals.filter((a) => {
  if (a.status !=='pending') return false;
  if (a.level ==='level_2') {
    const level1 = approvals.find(
      (x) => x.taskId === a.taskId && x.level ==='level_1'
    );
    return level1?.status ==='approved';
  }
  return true;
}).length;

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
            两级审批流程：流体工程师验证 → 项目总工程师确认 → 推送制造组
          </p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
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
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary text-sm">已推送制造</p>
              <p className="text-2xl font-bold text-accent font-mono mt-1">
                {pushedToManufacturing.length}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-accent/10">
              <CheckSquare className="w-6 h-6 text-accent" />
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
        {displayApprovals.map((approval, index) => {
          const taskLevel1 = approvals.find(
            (a) => a.taskId === approval.taskId && a.level ==="level_1"
          );
          const taskLevel2 = approvals.find(
            (a) => a.taskId === approval.taskId && a.level ==="level_2"
          );
          const level1Status = taskLevel1?.status || "pending";
          const level2Status = taskLevel2?.status || "pending";
          const isPushed = pushedToManufacturing.includes(approval.taskId);

          const isExpanded = expandedId === approval.id;

          return (
            <div
              key={approval.id}
              className="card overflow-hidden animate-fade-in opacity-0"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div
                className="p-5 cursor-pointer relative"
                onClick={() => setExpandedId(isExpanded ? null : approval.id)}
              >
                <div className="flex items-center justify-between">
                {isPushed && (
                  <div className="absolute top-3 right-3 z-10">
                    <span className="badge badge-success flex items-center gap-1 shadow-sm">
                      <CheckCircle className="w-3 h-3" />
                      已推送至制造工艺组
                    </span>
                  </div>
                )}

                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                      <FileText className="w-6 h-6 text-accent" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-text-primary pr-44">
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
                          {approval.level ==="level_1" ? "验证通过" : "确认通过"}
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
                              <div className="w-10 h-10 rounded-full bg-success/15 flex items-center justify-center border-2 border-success">
                                <CheckCircle className="w-5 h-5 text-success" />
                              </div>
                              <span className="text-xs font-medium text-text-primary mt-2 whitespace-nowrap">提交</span>
                            </div>
                            <div className={
                              (level1Status === "approved" || level1Status === "rejected")
                                ? "flex-1 h-1 mx-2 bg-success"
                                : "flex-1 h-1 mx-2 bg-border"
                            } />
                            <div className="flex flex-col items-center">
                              <div className={
                                "w-10 h-10 rounded-full flex items-center justify-center border-2 " + (
                                  level1Status === "approved"
                                    ? "bg-success/15 border-success"
                                    : level1Status === "rejected"
                                    ? "bg-error/15 border-error"
                                    : approval.level === "level_1"
                                    ? "bg-accent/15 border-accent ring-4 ring-accent/15 animate-pulse"
                                    : "bg-surface border-border"
                                )
                              }>
                                {level1Status === "approved" ? (
                                  <CheckCircle className="w-5 h-5 text-success" />
                                ) : level1Status === "rejected" ? (
                                  <XCircle className="w-5 h-5 text-error" />
                                ) : (
                                  <User className={
                                    "w-5 h-5 " + (
                                      approval.level === "level_1"
                                        ? "text-accent"
                                        : "text-text-muted"
                                    )
                                  } />
                                )}
                              </div>
                              <span className={
                                "text-xs font-medium mt-2 whitespace-nowrap " + (
                                  approval.level === "level_1" && approval.status === "pending"
                                    ? "text-accent"
                                    : "text-text-primary"
                                )
                              }>流体工程师</span>
                              <span className={
                                "text-[10px] mt-0.5 whitespace-nowrap " + (
                                  level1Status === "pending"
                                    ? "text-text-muted"
                                    : level1Status === "approved"
                                    ? "text-success"
                                    : "text-error"
                                )
                              }>
                                {level1Status === "pending"
                                  ? "待验证"
                                  : level1Status === "approved"
                                  ? "已验证"
                                  : "已驳回"}
                              </span>
                            </div>
                            <div className={
                              (level2Status === "approved" || level2Status === "rejected")
                                ? "flex-1 h-1 mx-2 bg-success"
                                : level1Status === "approved"
                                ? "flex-1 h-1 mx-2 bg-accent/40"
                                : "flex-1 h-1 mx-2 bg-border"
                            } />
                            <div className="flex flex-col items-center">
                              <div className={
                                "w-10 h-10 rounded-full flex items-center justify-center border-2 " + (
                                  level2Status === "approved"
                                    ? "bg-success/15 border-success"
                                    : level2Status === "rejected"
                                    ? "bg-error/15 border-error"
                                    : (level1Status === "approved" && approval.level === "level_2")
                                    ? "bg-accent/15 border-accent ring-4 ring-accent/15 animate-pulse"
                                    : level1Status === "approved"
                                    ? "bg-surface border-accent/40"
                                    : "bg-surface border-border"
                                )
                              }>
                                {level2Status === "approved" ? (
                                  <CheckCircle className="w-5 h-5 text-success" />
                                ) : level2Status === "rejected" ? (
                                  <XCircle className="w-5 h-5 text-error" />
                                ) : (
                                  <User className={
                                    "w-5 h-5 " + (
                                      level1Status === "approved"
                                        ? approval.level === "level_2"
                                          ? "text-accent"
                                          : "text-text-secondary"
                                        : "text-text-muted"
                                    )
                                  } />
                                )}
                              </div>
                              <span className={
                                "text-xs font-medium mt-2 whitespace-nowrap " + (
                                  level1Status === "approved" && approval.level === "level_2" && approval.status === "pending"
                                    ? "text-accent"
                                    : "text-text-primary"
                                )
                              }>总工程师</span>
                              <span className={
                                "text-[10px] mt-0.5 whitespace-nowrap " + (
                                  level1Status !== "approved"
                                    ? "待解锁"
                                    : level2Status === "pending"
                                    ? "待确认"
                                    : level2Status === "approved"
                                    ? "已确认"
                                    : "已驳回"
                                )
                              }>
                                {level1Status !== "approved"
                                  ? "待解锁"
                                  : level2Status === "pending"
                                  ? "待确认"
                                  : level2Status === "approved"
                                  ? "已确认"
                                  : "已驳回"}
                              </span>
                            </div>
                            <div className={
                              isPushed
                                ? "flex-1 h-1 mx-2 bg-success"
                                : level2Status === "approved"
                                ? "flex-1 h-1 mx-2 bg-accent/40"
                                : "flex-1 h-1 mx-2 bg-border"
                            } />
                            <div className="flex flex-col items-center">
                              <div className={
                                "w-10 h-10 rounded-full flex items-center justify-center border-2 " + (
                                  isPushed
                                    ? "bg-success/15 border-success"
                                    : level2Status === "approved"
                                    ? "bg-surface border-accent/40"
                                    : "bg-surface border-border"
                                )
                              }>
                                {isPushed ? (
                                  <CheckCircle className="w-5 h-5 text-success" />
                                ) : (
                                  <FileText className={
                                    "w-5 h-5 " + (
                                      level2Status === "approved"
                                        ? "text-accent"
                                        : "text-text-muted"
                                    )
                                  } />
                                )}
                              </div>
                              <span className={
                                "text-xs font-medium mt-2 whitespace-nowrap " + (
                                  isPushed ? "text-success" : "text-text-primary"
                                )
                              }>制造工艺组</span>
                              <span className={
                                "text-[10px] mt-0.5 whitespace-nowrap " + (
                                  isPushed
                                    ? "text-success"
                                    : level2Status === "approved"
                                    ? "text-accent"
                                    : "text-text-muted"
                                )
                              }>
                                {isPushed ? "已推送" : level2Status === "approved" ? "待推送" : "待解锁"}
                              </span>
                            </div>
                          </div>
                          {isPushed && (
                            <div className="mt-4 p-3 bg-success/10 border border-success/20 rounded-lg flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-success flex-shrink-0" />
                              <p className="text-xs text-success font-medium">
                                全部审批已通过，任务已推送至制造工艺组进行生产准备
                              </p>
                            </div>
                          )}
                          {!isPushed && (level1Status === "rejected" || level2Status === "rejected") && (
                            <div className="mt-4 p-3 bg-error/10 border border-error/20 rounded-lg flex items-center gap-2">
                              <XCircle className="w-4 h-4 text-error flex-shrink-0" />
                              <p className="text-xs text-error font-medium">
                                审批流程已驳回，如需继续请重新提交审批
                              </p>
                            </div>
                          )}
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-text-primary mb-3 flex items-center gap-2">
                            <MessageSquare className="w-4 h-4 text-accent" />
                            审批意见
                          </h4>
                          <div className="space-y-3">
                            {taskLevel1?.comment && (
                              <div className="p-4 bg-surface rounded-lg border border-border">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-medium px-2 py-0.5 bg-accent/10 text-accent rounded">
                                      流体工程师（一级）
                                    </span>
                                    {taskLevel1?.approver && (
                                      <span className="text-xs text-text-secondary">
                                        {taskLevel1.approver}
                                      </span>
                                    )}
                                  </div>
                                  {taskLevel1?.approvedAt && (
                                    <span className="text-xs text-text-muted">
                                      {formatDate(taskLevel1.approvedAt)}
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-text-primary italic">
                                  "{taskLevel1.comment}"
                                </p>
                              </div>
                            )}
                            {taskLevel2?.comment && (
                              <div className="p-4 bg-surface rounded-lg border border-border">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-medium px-2 py-0.5 bg-accent/10 text-accent rounded">
                                      总工程师（二级）
                                    </span>
                                    {taskLevel2?.approver && (
                                      <span className="text-xs text-text-secondary">
                                        {taskLevel2.approver}
                                      </span>
                                    )}
                                  </div>
                                  {taskLevel2?.approvedAt && (
                                    <span className="text-xs text-text-muted">
                                      {formatDate(taskLevel2.approvedAt)}
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-text-primary italic">
                                  "{taskLevel2.comment}"
                                </p>
                              </div>
                            )}
                            {!taskLevel1?.comment && !taskLevel2?.comment && (
                              <div className="p-4 bg-surface rounded-lg border border-border text-center">
                                <p className="text-sm text-text-muted">暂无审批意见</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="p-4 bg-surface rounded-lg border border-border">
                          <p className="text-xs text-text-muted mb-1">提交时间</p>
                          <p className="text-sm font-medium text-text-primary">
                            {formatDate(approval.submittedAt)}
                          </p>
                          <p className="text-xs text-text-muted mt-1">
                            {formatRelativeTime(approval.submittedAt)}
                          </p>
                        </div>
                        <div className="p-4 bg-surface rounded-lg border border-border">
                          <p className="text-xs text-text-muted mb-1">当前审批</p>
                          <p className={
                            "text-sm font-semibold " + (
                              approval.status === "pending"
                                ? "text-accent"
                                : approval.status === "approved"
                                ? "text-success"
                                : "text-error"
                            )
                          }>
                            {approval.level === "level_1"
                              ? "流体工程师验证"
                              : "总工程师确认"}
                          </p>
                          <p className="text-xs text-text-muted mt-1">
                            {approval.status === "pending"
                              ? approval.level === "level_1"
                                ? "等待流体工程师验证通过"
                                : "等待总工程师最终确认"
                              : approval.status === "approved"
                              ? approval.level === "level_1"
                                ? "流体工程师已验证通过"
                                : "总工程师已确认通过"
                              : approval.level === "level_1"
                              ? "流体工程师已驳回"
                              : "总工程师已驳回"}
                          </p>
                        </div>
                        <div className="p-4 bg-surface rounded-lg border border-border">
                          <p className="text-xs text-text-muted mb-1">当前审批人</p>
                          <p className="text-sm font-medium text-text-primary">
                            {approval.approver || "待审批"}
                          </p>
                        </div>
                        {taskLevel1?.approvedAt && (
                          <div className="p-4 bg-success/5 rounded-lg border border-success/20">
                            <p className="text-xs text-success/80 mb-1">一级通过时间</p>
                            <p className="text-sm font-medium text-success">
                              {formatDate(taskLevel1.approvedAt)}
                            </p>
                            <p className="text-xs text-success/70 mt-1">
                              {formatRelativeTime(taskLevel1.approvedAt)}
                            </p>
                          </div>
                        )}
                        {taskLevel2?.approvedAt && (
                          <div className="p-4 bg-success/5 rounded-lg border border-success/20">
                            <p className="text-xs text-success/80 mb-1">二级通过时间</p>
                            <p className="text-sm font-medium text-success">
                              {formatDate(taskLevel2.approvedAt)}
                            </p>
                            <p className="text-xs text-success/70 mt-1">
                              {formatRelativeTime(taskLevel2.approvedAt)}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {displayApprovals.length === 0 && (
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
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center p-0" onClick={() => setReviewModal(null)}>
          <div
            className="w-full max-w-2xl bg-surface rounded-t-2xl shadow-2xl animate-slide-up max-h-[80vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-12 h-1 bg-text-muted/30 rounded-full" />
            </div>
            <div className="p-6 pt-2 overflow-y-auto max-h-[calc(80vh-3rem)]">
              <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
                {reviewModal.action === 'approve' ? (
                  <>
                    <ThumbsUp className="w-5 h-5 text-success" />
                    {(() => {
                      const a = approvals.find(ap => ap.id === reviewModal.approvalId);
                      return a?.level === 'level_1' ? '验证通过确认' : '确认通过审批';
                    })()}
                  </>
                ) : (
                  <>
                    <ThumbsDown className="w-5 h-5 text-error" />
                    驳回审批
                  </>
                )}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="label">
                    {reviewModal.action === 'approve' ? '审批意见' : '驳回原因'}
                  </label>
                  <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    className="input min-h-[100px] resize-y"
                    placeholder={reviewModal.action === 'approve' ? '请输入审批意见（可选）...' : '请输入驳回原因（必填）...'}
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setReviewModal(null)}
                    className="btn-secondary flex-1"
                  >
                    取消
                  </button>
                  <button
                    onClick={() => {
                      const action = reviewModal.action;
                      const id = reviewModal.approvalId;
                      if (action === 'approve') {
                        approveApproval(id, reviewComment);
                      } else {
                        rejectApproval(id, reviewComment);
                      }
                      setReviewModal(null);
                      setReviewComment('');
                    }}
                    className={reviewModal.action === 'approve' ? 'btn-success flex-1 font-medium' : 'btn-error flex-1 font-medium'}
                  >
                    {reviewModal.action === 'approve' ? (() => {
                      const a = approvals.find(ap => ap.id === reviewModal.approvalId);
                      return a?.level === 'level_1' ? '确认验证通过' : '确认审批通过';
                    })() : '确认驳回'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
