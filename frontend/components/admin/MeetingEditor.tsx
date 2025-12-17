'use client'

import { useState, useTransition, useEffect } from 'react'
import { upsertRegularMeeting, upsertMeetingAgenda, deleteMeetingAgenda, copyAgendasFromPreviousYear } from '@/app/actions/meetings'
import { generateGoogleCalendarUrl } from '@/lib/calendar'
import MarkdownEditor from '@/components/ui/MarkdownEditor'
import CopyLinkButton from '@/components/ui/CopyLinkButton'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Calendar, ChevronDown, ChevronUp } from 'lucide-react'
import Link from 'next/link'

type Meeting = {
  id: string
  target_year: number
  target_month: number
  scheduled_date: string | null
  start_time: string | null
  location: string | null
  description: string | null
}

type Agenda = {
  id: string
  title: string
  description: string | null
  display_order: number
}

type Props = {
  year: number
  month: number
  meeting?: Meeting
  agendas: Agenda[]
  defaultItemsExpanded?: boolean
}

export default function MeetingEditor({ year, month, meeting, agendas, defaultItemsExpanded = false }: Props) {
  const [isEditingSchedule, setIsEditingSchedule] = useState(false)
  const [isAddingAgenda, setIsAddingAgenda] = useState(false)
  const [isAgendasExpanded, setIsAgendasExpanded] = useState(true) // Default Section to OPEN
  const [editingAgendaId, setEditingAgendaId] = useState<string | null>(null)

  // Lifted state for expanded agenda items
  // Initialize with all IDs if defaultItemsExpanded is true, otherwise empty
  const [expandedAgendaIds, setExpandedAgendaIds] = useState<string[]>(() =>
    defaultItemsExpanded ? agendas.map(a => a.id) : []
  )

  const [isPending, startTransition] = useTransition()

  // Sync expandedAgendaIds if agendas change (e.g. newly added item) IF we are in "Always Expand" mode? 
  // Or just rely on user interaction. 
  // Let's ensure that if we navigate from List to Detail, the state re-initializes correctly (key change or mount).
  // Next.js navigation preserves state if component tree is identical. 
  // We might want to use a useEffect to enforce defaultItemsExpanded behavior on prop change.
  useEffect(() => {
    if (defaultItemsExpanded) {
      setExpandedAgendaIds(agendas.map(a => a.id))
    } else {
      // If default is false, we don't necessarily want to close everything if user opened some?
      // But if we navigate FROM Detail TO List, we probably want to reset.
      setExpandedAgendaIds([])
    }
  }, [defaultItemsExpanded, agendas.length]) // Re-eval if count changes or prop changes

  const toggleAgendaExpansion = (id: string) => {
    setExpandedAgendaIds(prev =>
      prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id]
    )
  }

  // Schedule Form State
  const [scheduleForm, setScheduleForm] = useState({
    scheduled_date: meeting?.scheduled_date || '',
    start_time: meeting?.start_time || '',
    location: meeting?.location || '',
    description: meeting?.description || '',
  })

  const handleScheduleSubmit = async (formData: FormData) => {
    formData.append('target_year', year.toString())
    formData.append('target_month', month.toString())
    if (meeting?.id) formData.append('id', meeting.id)

    startTransition(async () => {
      const result = await upsertRegularMeeting(formData)
      if (result.success) {
        setIsEditingSchedule(false)
      } else {
        alert(result.message)
      }
    })
  }

  const handleCopyAgendas = async () => {
    if (!meeting?.id) return
    if (!confirm('昨年度の同月の議題をコピーしますか？')) return

    startTransition(async () => {
      const result = await copyAgendasFromPreviousYear(meeting.id)
      if (!result.success) {
        alert(result.message)
      }
    })
  }

  const handleDeleteAgenda = async (id: string) => {
    if (!confirm('この議題を削除しますか？')) return
    const formData = new FormData()
    formData.append('id', id)
    startTransition(async () => {
      await deleteMeetingAgenda(formData)
    })
  }

  return (
    <div className="bg-card shadow-sm rounded-lg p-6 mb-6 border border-border">
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
              <span className="bg-muted text-muted-foreground text-sm font-medium px-2.5 py-0.5 rounded">{month}月</span>
              {meeting?.id ? (
                <Link href={`/admin/meetings/${meeting.id}`} className="hover:underline hover:text-primary transition-colors">
                  {meeting?.scheduled_date ? new Date(meeting.scheduled_date).toLocaleDateString('ja-JP', { weekday: 'short', month: 'short', day: 'numeric' }) : '日程未定'}
                </Link>
              ) : (
                <span>
                  {meeting?.scheduled_date ? new Date(meeting.scheduled_date).toLocaleDateString('ja-JP', { weekday: 'short', month: 'short', day: 'numeric' }) : '日程未定'}
                </span>
              )}
            </h3>
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            {meeting?.start_time?.slice(0, 5) || '--:--'} @ {meeting?.location || '場所未定'}
          </div>
          {meeting?.description && <div className="text-sm text-muted-foreground mt-1">{meeting.description}</div>}

          {meeting?.id && (
            <div className="mt-2">
              <CopyLinkButton meetingId={meeting.id} />
            </div>
          )}
        </div>
        <button
          onClick={() => setIsEditingSchedule(!isEditingSchedule)}
          className="text-sm bg-muted hover:bg-muted/80 text-muted-foreground px-3 py-1 rounded transition-colors"
        >
          {isEditingSchedule ? 'キャンセル' : '日程編集'}
        </button>
      </div>

      {meeting?.scheduled_date && (
        <div className="mb-4">
          <a
            href={generateGoogleCalendarUrl(meeting)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800 hover:underline"
          >
            <Calendar size={14} />
            Googleカレンダーに登録
          </a>
        </div>
      )}

      {isEditingSchedule && (
        <form action={handleScheduleSubmit} className="mb-6 bg-muted/50 p-4 rounded-lg border border-border">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground">開催日</label>
              <input type="date" name="scheduled_date" defaultValue={scheduleForm.scheduled_date} className="mt-1 block w-full rounded-md border-input bg-background shadow-sm focus:border-ring focus:ring-ring text-foreground" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground">開始時間</label>
              <input type="time" name="start_time" defaultValue={scheduleForm.start_time || ''} className="mt-1 block w-full rounded-md border-input bg-background shadow-sm focus:border-ring focus:ring-ring text-foreground" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-foreground">場所</label>
              <input type="text" name="location" defaultValue={scheduleForm.location} placeholder="例: 公民館 第1会議室" className="mt-1 block w-full rounded-md border-input bg-background shadow-sm focus:border-ring focus:ring-ring text-foreground" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-foreground">備考</label>
              <textarea name="description" defaultValue={scheduleForm.description} className="mt-1 block w-full rounded-md border-input bg-background shadow-sm focus:border-ring focus:ring-ring text-foreground" rows={2}></textarea>
            </div>
          </div>
          <div className="mt-4 text-right">
            <button type="submit" disabled={isPending} className="bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-500 disabled:opacity-50">
              保存
            </button>
          </div>
        </form>
      )}

      {/* Agendas Section */}
      <div className="border-t border-border pt-4 mt-4">
        <div className="flex justify-between items-center mb-4">
          <div
            className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => setIsAgendasExpanded(!isAgendasExpanded)}
          >
            <h4 className="font-bold text-foreground flex items-center gap-2">
              議題
              {isAgendasExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </h4>
            {!isAgendasExpanded && agendas.length > 0 && (
              <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                {agendas.length}件
              </span>
            )}
          </div>
          <div className="flex gap-2">
            {agendas.length === 0 && meeting?.id && (
              <button
                type="button"
                onClick={handleCopyAgendas}
                disabled={isPending}
                className="text-sm text-indigo-600 hover:text-indigo-500 disabled:opacity-50"
              >
                昨年度からコピー
              </button>
            )}
            <button
              onClick={() => {
                setIsAgendasExpanded(true)
                setIsAddingAgenda(!isAddingAgenda)
              }}
              className="text-sm bg-muted text-indigo-600 px-3 py-1 rounded hover:bg-muted/80"
            >
              + 議題追加
            </button>
          </div>
        </div>

        {isAgendasExpanded && (
          <>
            {isAddingAgenda && (
              <AgendaForm
                meetingId={meeting?.id}
                defaultDisplayOrder={agendas.length > 0 ? Math.max(...agendas.map(a => a.display_order)) + 1 : 1}
                onCancel={() => setIsAddingAgenda(false)}
                onComplete={() => setIsAddingAgenda(false)}
              />
            )}

            <div className="space-y-3">
              {agendas.map(agenda => (
                <div key={agenda.id} className="bg-card p-3 border border-border rounded shadow-sm hover:shadow-md transition-shadow">
                  {editingAgendaId === agenda.id ? (
                    <AgendaForm
                      meetingId={meeting?.id}
                      agenda={agenda}
                      onCancel={() => setEditingAgendaId(null)}
                      onComplete={() => setEditingAgendaId(null)}
                    />
                  ) : (
                    <AgendaItemView
                      agenda={agenda}
                      isExpanded={expandedAgendaIds.includes(agenda.id)}
                      onToggle={() => toggleAgendaExpansion(agenda.id)}
                      onEdit={() => setEditingAgendaId(agenda.id)}
                      onDelete={() => handleDeleteAgenda(agenda.id)}
                    />
                  )}
                </div>
              ))}
              {agendas.length === 0 && !isAddingAgenda && (
                <div className="text-center text-muted-foreground py-4 text-sm">
                  議題は登録されていません
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function AgendaItemView({ agenda, isExpanded, onToggle, onEdit, onDelete }: { agenda: Agenda, isExpanded: boolean, onToggle: () => void, onEdit: () => void, onDelete: () => void }) {
  return (
    <div className="flex justify-between items-start">
      <div className="flex-1">
        <div
          className="font-medium text-foreground flex items-center gap-2 cursor-pointer hover:text-primary transition-colors"
          onClick={onToggle}
        >
          {agenda.title}
          <span className="text-muted-foreground">
            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </span>
        </div>
        {isExpanded && (
          <div className="text-sm text-muted-foreground mt-2 prose prose-sm dark:prose-invert max-w-none">
            {agenda.description ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{agenda.description}</ReactMarkdown>
            ) : (
              <span className="text-muted-foreground/50 italic">(詳細なし)</span>
            )}
          </div>
        )}
      </div>
      <div className="flex gap-2 ml-4">
        <button onClick={onEdit} className="text-muted-foreground hover:text-primary">
          ✎
        </button>
        <button onClick={onDelete} className="text-muted-foreground hover:text-destructive">
          🗑
        </button>
      </div>
    </div>
  )
}

function AgendaForm({ meetingId, agenda, defaultDisplayOrder = 1, onCancel, onComplete }: { meetingId?: string, agenda?: Agenda, defaultDisplayOrder?: number, onCancel: () => void, onComplete: () => void }) {
  const [isPending, startTransition] = useTransition()

  if (!meetingId) {
    return <div className="text-destructive text-sm p-2">先に定例会の日程を保存してください（スケジュール未登録の場合は議題を追加できません）</div>
  }

  const handleSubmit = async (formData: FormData) => {
    formData.append('meeting_id', meetingId)
    if (agenda?.id) formData.append('id', agenda.id)

    startTransition(async () => {
      await upsertMeetingAgenda(formData)
      onComplete()
    })
  }

  return (
    <form action={handleSubmit} className="bg-muted/30 p-3 rounded mb-3 border border-border">
      <div className="grid gap-3">
        <div>
          <input
            name="title"
            defaultValue={agenda?.title}
            placeholder="議題タイトル"
            required
            className="w-full rounded border-input bg-background focus:border-ring focus:ring-ring text-foreground"
          />
        </div>
      </div>
      <div>
        <MarkdownEditor
          name="description"
          defaultValue={agenda?.description || ''}
          placeholder="詳細（Markdown対応）"
          rows={6}
        />
      </div>
      <div>
        <div>
          <input
            type="number"
            name="display_order"
            defaultValue={agenda?.display_order || defaultDisplayOrder}
            placeholder="表示順 (0, 1, 2...)"
            className="w-24 rounded border-input bg-background focus:border-ring focus:ring-ring text-sm text-foreground"
          />
        </div>
      </div>
      <div className="flex justify-end gap-2 mt-3">
        <button type="button" onClick={onCancel} className="text-sm text-muted-foreground hover:text-foreground">キャンセル</button>
        <button type="submit" disabled={isPending} className="text-sm bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-500 disabled:opacity-50">
          保存
        </button>
      </div>
    </form>
  )
}
