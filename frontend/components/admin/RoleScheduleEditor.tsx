'use client'

import { useState } from 'react'
import { upsertOfficerTask, deleteOfficerTask } from '@/app/admin/actions/officer'
import { Plus, Trash2, Pencil, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'

type Task = {
  id: string
  title: string
  description: string | null
  is_monthly: boolean
  target_month: number | null
}

type Props = {
  roleId: string
  tasks: Task[]
}

const MONTHS = [
  { val: 4, label: '4月' },
  { val: 5, label: '5月' },
  { val: 6, label: '6月' },
  { val: 7, label: '7月' },
  { val: 8, label: '8月' },
  { val: 9, label: '9月' },
  { val: 10, label: '10月' },
  { val: 11, label: '11月' },
  { val: 12, label: '12月' },
  { val: 1, label: '1月' },
  { val: 2, label: '2月' },
  { val: 3, label: '3月' },
]

export default function RoleScheduleEditor({ roleId, tasks }: Props) {
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [defaultMonth, setDefaultMonth] = useState<number | null>(null)

  // Categorize tasks
  const monthlyTasks = tasks.filter(t => t.is_monthly)
  const annualTasks = tasks.filter(t => !t.is_monthly && t.target_month)
  const otherTasks = tasks.filter(t => !t.is_monthly && !t.target_month)

  const handleEdit = (task: Task) => {
    setEditingTask(task)
    setIsFormOpen(true)
  }

  const handleAdd = (month?: number) => {
    setEditingTask(null)
    setDefaultMonth(month || null)
    setIsFormOpen(true)
  }

  const closeForm = () => {
    setIsFormOpen(false)
    setEditingTask(null)
    setDefaultMonth(null)
  }

  return (
    <div className="space-y-8 mt-8">
      <h2 className="text-xl font-bold border-b border-border pb-2 text-foreground">年間スケジュール設定</h2>

      {/* Monthly Tasks */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2 text-foreground">
            <span className="bg-muted text-muted-foreground px-2 py-0.5 rounded text-sm">毎月</span>
            の業務
          </h3>
          <button
            onClick={() => handleAdd()}
            className="text-sm bg-primary text-primary-foreground px-3 py-1 rounded hover:opacity-90 flex items-center gap-1 transition-colors"
          >
            <Plus size={16} /> 追加
          </button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {monthlyTasks.map(task => (
            <TaskCard key={task.id} task={task} onEdit={handleEdit} roleId={roleId} />
          ))}
          {monthlyTasks.length === 0 && <p className="text-muted-foreground text-sm col-span-full">登録されている業務はありません</p>}
        </div>
      </section>

      {/* Annual Schedule */}
      <section className="space-y-6">
        <h3 className="text-lg font-semibold flex items-center gap-2 text-foreground">
          <Calendar size={20} />
          年間スケジュール
        </h3>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {MONTHS.map(month => {
            const currentMonthTasks = annualTasks.filter(t => t.target_month === month.val)
            return (
              <div key={month.val} className="bg-card border border-border rounded-lg p-4 shadow-sm relative group">
                <div className="flex items-center justify-between mb-3 border-b border-border pb-2">
                  <span className="font-bold text-lg text-foreground">{month.label}</span>
                  <button
                    onClick={() => handleAdd(month.val)}
                    className="text-muted-foreground hover:text-primary p-1 transition-colors"
                    title={`${month.label}に業務を追加`}
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <div className="space-y-3">
                  {currentMonthTasks.map(task => (
                    <div key={task.id} className="bg-muted/50 p-2 rounded border border-border text-sm relative group/task hover:bg-muted transition-colors">
                      <div className="font-medium text-foreground">{task.title}</div>
                      {task.description && <div className="text-muted-foreground text-xs mt-1 whitespace-pre-wrap">{task.description}</div>}
                      <div className="absolute top-1 right-1 opacity-0 group-hover/task:opacity-100 flex items-center bg-background/80 rounded shadow-sm">
                        <button onClick={() => handleEdit(task)} className="p-1 hover:text-primary transition-colors"><Pencil size={12} /></button>
                        <form action={async (formData) => { await deleteOfficerTask(formData) }}>
                          <input type="hidden" name="id" value={task.id} />
                          <input type="hidden" name="role_id" value={roleId} />
                          <button type="submit" className="p-1 hover:text-destructive transition-colors"><Trash2 size={12} /></button>
                        </form>
                      </div>
                    </div>
                  ))}
                  {currentMonthTasks.length === 0 && <div className="text-muted-foreground text-xs text-center py-2">- 予定なし -</div>}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Other Tasks */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2 text-foreground">
            その他・随時
          </h3>
          <button
            onClick={() => handleAdd()}
            className="text-sm bg-muted text-muted-foreground px-3 py-1 rounded hover:bg-muted/80 flex items-center gap-1 transition-colors"
          >
            <Plus size={16} /> 追加
          </button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {otherTasks.map(task => (
            <TaskCard key={task.id} task={task} onEdit={handleEdit} roleId={roleId} />
          ))}
          {otherTasks.length === 0 && <p className="text-muted-foreground text-sm col-span-full">登録されている業務はありません</p>}
        </div>
      </section>

      {/* Edit/Add Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-card border border-border rounded-lg shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold mb-4 text-foreground">{editingTask ? '業務を編集' : '新しい業務を追加'}</h3>
            <form
              action={async (formData) => {
                await upsertOfficerTask(formData)
                closeForm()
              }}
              className="space-y-4"
            >
              <input type="hidden" name="id" value={editingTask?.id || ''} />
              <input type="hidden" name="role_id" value={roleId} />

              <div>
                <label className="block text-sm font-medium text-foreground">タイトル</label>
                <input
                  type="text"
                  name="title"
                  required
                  defaultValue={editingTask?.title || ''}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground">説明</label>
                <textarea
                  name="description"
                  defaultValue={editingTask?.description || ''}
                  rows={3}
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="is_monthly"
                    id="is_monthly"
                    defaultChecked={editingTask ? editingTask.is_monthly : (defaultMonth === null)}
                    className="h-4 w-4 rounded border-input text-primary focus:ring-ring"
                  />
                  <label htmlFor="is_monthly" className="ml-2 block text-sm text-foreground">毎月の業務として登録</label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground">実施月（年間スケジュールの場合）</label>
                <select
                  name="target_month"
                  defaultValue={editingTask?.target_month || defaultMonth || ''}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">指定なし（その他・随時）</option>
                  {MONTHS.map(m => (
                    <option key={m.val} value={m.val}>{m.label}</option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground mt-1">※「毎月の業務」にチェックがある場合、月指定は無視されます</p>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-border mt-4">
                <button
                  type="button"
                  onClick={closeForm}
                  className="px-4 py-2 text-sm font-medium text-foreground bg-background border border-input rounded-md hover:bg-muted transition-colors"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-md hover:bg-primary/90 transition-colors"
                >
                  保存
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function TaskCard({ task, onEdit, roleId }: { task: Task, onEdit: (t: Task) => void, roleId: string }) {
  return (
    <div className="bg-card border border-border rounded-lg p-4 shadow-sm flex flex-col justify-between group hover:shadow-md transition-shadow">
      <div>
        <h4 className="font-bold text-foreground">{task.title}</h4>
        <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">{task.description}</p>
      </div>
      <div className="flex justify-end gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onEdit(task)}
          className="p-1.5 text-muted-foreground hover:text-primary hover:bg-muted rounded transition-colors"
        >
          <Pencil size={16} />
        </button>
        <form action={async (formData) => { await deleteOfficerTask(formData) }}>
          <input type="hidden" name="id" value={task.id} />
          <input type="hidden" name="role_id" value={roleId} />
          <button
            type="submit"
            className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded transition-colors"
            onClick={(e) => {
              if (!confirm('本当に削除しますか？')) {
                e.preventDefault()
              }
            }}
          >
            <Trash2 size={16} />
          </button>
        </form>
      </div>
    </div>
  )
}
