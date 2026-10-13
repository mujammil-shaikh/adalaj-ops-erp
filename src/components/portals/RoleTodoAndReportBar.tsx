import React, { useState } from 'react';
import {
  CheckSquare,
  Square,
  Plus,
  Calendar,
  Send,
  Clock,
  Sparkles,
  AlertCircle,
  FileText,
  X,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { UserRole, DailyTodoItem, DayEndReport } from '../../types';
import { db } from '../../lib/storage';

interface RoleTodoAndReportBarProps {
  currentRole: UserRole;
  currentUserName: string;
  onNavigateModule?: (module: string) => void;
}

export const RoleTodoAndReportBar: React.FC<RoleTodoAndReportBarProps> = ({
  currentRole,
  currentUserName,
  onNavigateModule,
}) => {
  const [todos, setTodos] = useState<DailyTodoItem[]>(() => db.getDailyTodos(currentRole));
  const [reports, setReports] = useState<DayEndReport[]>(() => db.getDayEndReports(currentRole));
  const [isExpanded, setIsExpanded] = useState(true);

  // Modal states
  const [showAddTodoModal, setShowAddTodoModal] = useState(false);
  const [showSubmitReportModal, setShowSubmitReportModal] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Form states - New Todo
  const [todoTitle, setTodoTitle] = useState('');
  const [todoDesc, setTodoDesc] = useState('');
  const [todoPriority, setTodoPriority] = useState<'urgent' | 'high' | 'normal'>('high');
  const [todoDueDate, setTodoDueDate] = useState(() => new Date().toISOString().split('T')[0]);

  // Form states - Day-End Report
  const [reportShift, setReportShift] = useState<'morning' | 'evening' | 'general' | 'night'>('general');
  const [primaryMetricLabel, setPrimaryMetricLabel] = useState('Daily Volume Processed / Invoiced');
  const [primaryMetricValue, setPrimaryMetricValue] = useState('');
  const [summaryNotes, setSummaryNotes] = useState('');
  const [blockersOrWastage, setBlockersOrWastage] = useState('');

  const refreshData = () => {
    setTodos(db.getDailyTodos(currentRole));
    setReports(db.getDayEndReports(currentRole));
  };

  const handleToggleTodo = (id: string) => {
    db.toggleDailyTodo(id);
    refreshData();
  };

  const handleAddTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!todoTitle.trim()) return;

    const newTodo: DailyTodoItem = {
      id: `todo_${Date.now()}`,
      role: currentRole,
      title: todoTitle.trim(),
      description: todoDesc.trim() || undefined,
      priority: todoPriority,
      dueDate: todoDueDate,
      isCompleted: false,
      assignedBy: currentUserName,
    };

    db.addDailyTodo(newTodo);
    refreshData();
    setShowAddTodoModal(false);
    setTodoTitle('');
    setTodoDesc('');
    showNotification('Daily task added to your stack!');
  };

  const handleSubmitDayEndReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!primaryMetricValue.trim() || !summaryNotes.trim()) return;

    const completedCount = todos.filter((t) => t.isCompleted).length;

    const newReport: DayEndReport = {
      id: `rpt_${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      shift: reportShift,
      role: currentRole,
      submittedBy: currentUserName,
      primaryMetricLabel,
      primaryMetricValue,
      summaryNotes,
      blockersOrWastage: blockersOrWastage.trim() || undefined,
      tasksCompletedCount: completedCount,
      timestamp: new Date().toISOString(),
    };

    db.submitDayEndReport(newReport);
    refreshData();
    setShowSubmitReportModal(false);
    setPrimaryMetricValue('');
    setSummaryNotes('');
    setBlockersOrWastage('');
    showNotification('Day-End Report saved and logged to plant audit register!');
  };

  const showNotification = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const pendingTodos = todos.filter((t) => !t.isCompleted);
  const completedTodos = todos.filter((t) => t.isCompleted);

  return (
    <div className="mb-6 rounded-2xl border border-amber-900/10 dark:border-slate-800 bg-white/95 dark:bg-slate-900/90 shadow-sm overflow-hidden transition-all">
      {/* Toast */}
      {toastMsg && (
        <div className="bg-emerald-600 text-white text-xs font-bold px-4 py-2 text-center animate-fade-in flex items-center justify-center gap-2">
          <Sparkles className="w-4 h-4" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="p-3.5 sm:p-4 flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-amber-500/5 via-slate-500/5 to-transparent border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-[#9E1C23]/10 dark:bg-amber-400/10 text-[#9E1C23] dark:text-amber-400">
            <CheckSquare className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white">
                Daily Operations Stack & Shift Reporting
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#9E1C23]/10 text-[#9E1C23] dark:bg-amber-400/20 dark:text-amber-300">
                {pendingTodos.length} Pending
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Assigned to <strong>{currentUserName}</strong> · Role: {currentRole.replace('_', ' ').toUpperCase()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddTodoModal(true)}
            className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Task</span>
          </button>

          <button
            onClick={() => setShowSubmitReportModal(true)}
            className="px-3.5 py-1.5 rounded-xl bg-[#9E1C23] hover:bg-[#83161C] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Submit Day-End Report</span>
          </button>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            aria-label="Toggle stack view"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="p-3 sm:p-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Column 1 & 2: Active To-Do List */}
          <div className="lg:col-span-2 space-y-2">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center justify-between">
              <span>Today's Action Items</span>
              <span className="text-[10px] text-slate-400">
                {completedTodos.length} of {todos.length} Completed
              </span>
            </div>

            {todos.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400 border border-dashed rounded-xl">
                No active tasks assigned for this role today. Click "+ Add Task" to create one.
              </div>
            ) : (
              <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                {todos.map((item) => (
                  <div
                    key={item.id}
                    className={`p-2.5 rounded-xl border flex items-start gap-3 transition-colors ${
                      item.isCompleted
                        ? 'bg-slate-50 dark:bg-slate-900/40 border-slate-200/60 dark:border-slate-800 text-slate-400 line-through'
                        : item.priority === 'urgent'
                        ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/60 text-slate-800 dark:text-slate-100'
                        : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100'
                    }`}
                  >
                    <button
                      onClick={() => handleToggleTodo(item.id)}
                      className="mt-0.5 text-slate-400 hover:text-[#9E1C23] dark:hover:text-amber-400 flex-shrink-0 cursor-pointer"
                    >
                      {item.isCompleted ? (
                        <CheckSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-xs font-semibold ${item.isCompleted ? 'line-through text-slate-400' : ''}`}>
                          {item.title}
                        </span>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          {item.priority === 'urgent' && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wide bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-200">
                              Urgent
                            </span>
                          )}
                          <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
                            <Clock className="w-2.5 h-2.5" />
                            {item.dueDate}
                          </span>
                        </div>
                      </div>

                      {item.description && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                          {item.description}
                        </p>
                      )}

                      {item.actionModule && onNavigateModule && !item.isCompleted && (
                        <button
                          onClick={() => onNavigateModule(item.actionModule!)}
                          className="mt-1 text-[10px] font-bold text-[#9E1C23] dark:text-amber-400 hover:underline inline-flex items-center gap-1"
                        >
                          Open Module ➔
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Column 3: Recent Day-End Report Snapshot */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 p-3 space-y-2">
            <div className="text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-[#9E1C23] dark:text-amber-400" />
                Latest Day-End Log
              </span>
              {reports[0] && (
                <span className="text-[10px] text-slate-400 font-mono">
                  {reports[0].date}
                </span>
              )}
            </div>

            {reports.length === 0 ? (
              <p className="text-[11px] text-slate-400 italic py-4 text-center">
                No shift reports logged yet today. Click "Submit Day-End Report" when closing your work shift.
              </p>
            ) : (
              <div className="space-y-2 text-xs">
                <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">
                    {reports[0].primaryMetricLabel}
                  </div>
                  <div className="text-sm font-black text-slate-900 dark:text-amber-400 mt-0.5">
                    {reports[0].primaryMetricValue}
                  </div>
                </div>

                <div className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
                  <strong>Notes:</strong> {reports[0].summaryNotes}
                </div>

                {reports[0].blockersOrWastage && (
                  <div className="text-[10px] p-1.5 rounded bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 text-amber-800 dark:text-amber-300">
                    <strong>Scrap / Watch:</strong> {reports[0].blockersOrWastage}
                  </div>
                )}

                <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-200 dark:border-slate-800">
                  <span>Shift: {reports[0].shift.toUpperCase()}</span>
                  <span>By: {reports[0].submittedBy.split(' ')[0]}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL 1: ADD TO-DO ITEM */}
      {showAddTodoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md shadow-2xl p-5 space-y-4 text-slate-900 dark:text-slate-100">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#9E1C23] dark:text-amber-400" />
                <h3 className="font-bold text-sm">Add New Daily Task</h3>
              </div>
              <button onClick={() => setShowAddTodoModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddTodo} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Task Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Verify 30% advance deposit for container export"
                  value={todoTitle}
                  onChange={(e) => setTodoTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Details / Specific Instructions</label>
                <textarea
                  rows={2}
                  placeholder="Optional details, lot numbers, or customer reference..."
                  value={todoDesc}
                  onChange={(e) => setTodoDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Priority</label>
                  <select
                    value={todoPriority}
                    onChange={(e) => setTodoPriority(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold"
                  >
                    <option value="urgent">Urgent</option>
                    <option value="high">High</option>
                    <option value="normal">Normal</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Due Date</label>
                  <input
                    type="date"
                    required
                    value={todoDueDate}
                    onChange={(e) => setTodoDueDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddTodoModal(false)}
                  className="px-3.5 py-1.5 rounded-lg border text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-[#9E1C23] hover:bg-[#83161C] text-white font-bold"
                >
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: SUBMIT DAY-END REPORT */}
      {showSubmitReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl p-5 space-y-4 text-slate-900 dark:text-slate-100">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Send className="w-5 h-5 text-[#9E1C23] dark:text-amber-400" />
                <div>
                  <h3 className="font-bold text-sm">Submit Day-End Shift Report</h3>
                  <p className="text-[11px] text-slate-400">
                    Logged to central plant audit trail for Executive Review
                  </p>
                </div>
              </div>
              <button onClick={() => setShowSubmitReportModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitDayEndReport} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Shift</label>
                  <select
                    value={reportShift}
                    onChange={(e) => setReportShift(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold"
                  >
                    <option value="general">General Shift (Day)</option>
                    <option value="morning">Morning Shift</option>
                    <option value="evening">Evening Shift</option>
                    <option value="night">Night Shift</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Key Performance Metric</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kilograms Packed / Invoiced"
                    value={primaryMetricLabel}
                    onChange={(e) => setPrimaryMetricLabel(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Daily Achievement Metric Value *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 4,200 kg packed (8,400 pouches) or ₹18.5 Lakhs invoiced"
                  value={primaryMetricValue}
                  onChange={(e) => setPrimaryMetricValue(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Daily Operational Summary & Highlights *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Summarize today's achievements, machine operation hours, orders staged, or billing completed..."
                  value={summaryNotes}
                  onChange={(e) => setSummaryNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Blockers, Scrap / Film Wastage or Notes for Tomorrow</label>
                <input
                  type="text"
                  placeholder="e.g. Film reject 12 pouches, Auger #1 seal inspection due tomorrow"
                  value={blockersOrWastage}
                  onChange={(e) => setBlockersOrWastage(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowSubmitReportModal(false)}
                  className="px-3.5 py-1.5 rounded-lg border text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-1.5 rounded-lg bg-[#9E1C23] hover:bg-[#83161C] text-white font-bold shadow"
                >
                  Submit & Log Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
