'use client'

'use client'

import { useState, useTransition, useEffect } from 'react'
import { upsertRegularMeeting, upsertMeetingAgenda, deleteMeetingAgenda, copyAgendasFromPreviousYear } from '@/app/actions/meetings'
import { generateGoogleCalendarUrl } from '@/lib/calendar'
import MarkdownEditor from '@/components/ui/MarkdownEditor'
import CopyLinkButton from '@/components/ui/CopyLinkButton'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Calendar as CalendarIcon, ChevronDown, ChevronUp, Edit2, X, Plus, Save, Trash2, ExternalLink, Copy } from 'lucide-react'
import Link from 'next/link'
import { Box } from '@/ui/layout/Box'
import { Stack, HStack } from '@/ui/layout/Stack'
import { Heading } from '@/ui/primitives/Heading'
import { Text } from '@/ui/primitives/Text'
import { Button } from '@/ui/primitives/Button'
import { Input } from '@/ui/primitives/Input'
import { Label } from '@/ui/primitives/Label'
import { cn } from '@/lib/utils'

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
  const [isAgendasExpanded, setIsAgendasExpanded] = useState(true)
  const [editingAgendaId, setEditingAgendaId] = useState<string | null>(null)

  const [expandedAgendaIds, setExpandedAgendaIds] = useState<string[]>(() =>
    defaultItemsExpanded ? agendas.map(a => a.id) : []
  )

  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    const targetIds = defaultItemsExpanded ? agendas.map(a => a.id) : []
    const timer = setTimeout(() => setExpandedAgendaIds(targetIds), 0)
    return () => clearTimeout(timer)
  }, [defaultItemsExpanded, agendas])

  const toggleAgendaExpansion = (id: string) => {
    setExpandedAgendaIds(prev =>
      prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id]
    )
  }

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
    <Box className="bg-card shadow-sm rounded-xl p-6 mb-8 border border-border transition-all hover:shadow-md">
      <Box className="flex justify-between items-start mb-6 gap-4">
        <Box className="flex-1">
          {meeting?.id ? (
            <Link
              href={`/admin/meetings/${meeting.id}`}
              className="group block"
            >
              <HStack className="items-center gap-3 mb-2">
                <Box className="bg-primary/10 text-primary text-sm font-bold px-3 py-1 rounded-full group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                  {month}月
                </Box>
                <Heading size="h3" className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                  {meeting?.scheduled_date ? new Date(meeting.scheduled_date).toLocaleDateString('ja-JP', { weekday: 'short', month: 'short', day: 'numeric' }) : '日程未定'}
                </Heading>
              </HStack>
              <Box className="text-sm text-muted-foreground group-hover:text-foreground/80 transition-colors flex items-center gap-2">
                <Box className="flex items-center gap-1">
                  <span className="opacity-60">🕒</span> {meeting?.start_time?.slice(0, 5) || '--:--'}
                </Box>
                <span className="opacity-30">|</span>
                <Box className="flex items-center gap-1">
                  <span className="opacity-60">📍</span> {meeting?.location || '場所未定'}
                </Box>
              </Box>
            </Link>
          ) : (
            <Box>
              <HStack className="items-center gap-3 mb-2">
                <Box className="bg-muted text-muted-foreground text-sm font-bold px-3 py-1 rounded-full">
                  {month}月
                </Box>
                <Heading size="h3" className="text-xl font-bold text-foreground opacity-60">
                  日程未定
                </Heading>
              </HStack>
            </Box>
          )}

          {meeting?.description && (
            <Box className="mt-3 p-3 bg-muted/30 rounded-lg border-l-4 border-muted">
              <Text className="text-sm text-muted-foreground leading-relaxed">{meeting.description}</Text>
            </Box>
          )}

          {meeting?.id && (
            <Box className="mt-4">
              <CopyLinkButton meetingId={meeting.id} />
            </Box>
          )}
        </Box>

        <Button
          variant={isEditingSchedule ? "outline" : "secondary"}
          size="sm"
          onClick={() => setIsEditingSchedule(!isEditingSchedule)}
          className="shrink-0 gap-2 h-9 font-bold transition-all activeScale"
        >
          {isEditingSchedule ? <X size={14} /> : <Edit2 size={14} />}
          {isEditingSchedule ? 'キャンセル' : '日程編集'}
        </Button>
      </Box>

      {meeting?.scheduled_date && (
        <Box className="mb-6">
          <Button variant="link" size="sm" asChild className="h-auto p-0 text-primary hover:text-primary/80">
            <a
              href={generateGoogleCalendarUrl(meeting)}
              target="_blank"
              rel="noreferrer"
              className="gap-1.5"
            >
              <CalendarIcon size={14} />
              Googleカレンダーに登録
            </a>
          </Button>
        </Box>
      )}

      {isEditingSchedule && (
        <form action={handleScheduleSubmit}>
          <Box className="mb-8 bg-muted/50 p-5 rounded-xl border border-border/60 shadow-inner">
            <Stack className="gap-5">
              <Box className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Box>
                  <Label className="mb-1.5 block">開催日</Label>
                  <Input type="date" name="scheduled_date" defaultValue={scheduleForm.scheduled_date} />
                </Box>
                <Box>
                  <Label className="mb-1.5 block">開始時間</Label>
                  <Input type="time" name="start_time" defaultValue={scheduleForm.start_time || ''} />
                </Box>
                <Box className="md:col-span-2">
                  <Label className="mb-1.5 block">場所</Label>
                  <Input type="text" name="location" defaultValue={scheduleForm.location} placeholder="例: 公民館 第1会議室" />
                </Box>
                <Box className="md:col-span-2">
                  <Label className="mb-1.5 block">備考（開催場所の詳細や持ち物など）</Label>
                  <textarea
                    name="description"
                    defaultValue={scheduleForm.description}
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    rows={2}
                  />
                </Box>
              </Box>
              <Box className="text-right">
                <Button type="submit" disabled={isPending} activeScale={true} className="gap-2 px-8 h-10 font-bold shadow-md">
                  <Save size={16} />
                  保存する
                </Button>
              </Box>
            </Stack>
          </Box>
        </form>
      )}

      {/* Agendas Section */}
      <Box className="border-t border-border pt-6 mt-2">
        <HStack className="justify-between items-center mb-6 gap-4">
          <HStack
            className="items-center gap-2 cursor-pointer hover:opacity-70 transition-opacity"
            onClick={() => setIsAgendasExpanded(!isAgendasExpanded)}
          >
            <Heading size="h4" className="text-lg font-bold text-foreground flex items-center gap-2">
              議題
              {isAgendasExpanded ? <ChevronUp size={20} className="text-muted-foreground" /> : <ChevronDown size={20} className="text-muted-foreground" />}
            </Heading>
            {!isAgendasExpanded && agendas.length > 0 && (
              <Box className="bg-primary text-primary-foreground text-xs font-bold px-2 py-0.5 rounded-full">
                {agendas.length}
              </Box>
            )}
          </HStack>
          <HStack className="gap-2">
            {agendas.length === 0 && meeting?.id && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyAgendas}
                disabled={isPending}
                className="text-primary hover:text-primary hover:bg-primary/5 font-bold"
              >
                <Copy size={14} className="mr-1.5" />
                前年度からコピー
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setIsAgendasExpanded(true)
                setIsAddingAgenda(!isAddingAgenda)
              }}
              className="gap-1.5 font-bold border-primary/20 hover:border-primary/50 text-primary"
            >
              {isAddingAgenda ? <X size={14} /> : <Plus size={14} />}
              {isAddingAgenda ? 'キャンセル' : '議題追加'}
            </Button>
          </HStack>
        </HStack>

        {isAgendasExpanded && (
          <Stack className="gap-4">
            {isAddingAgenda && (
              <Box className="bg-muted/30 p-4 rounded-xl border border-dashed border-border">
                <AgendaForm
                  meetingId={meeting?.id}
                  defaultDisplayOrder={agendas.length > 0 ? Math.max(...agendas.map(a => a.display_order)) + 1 : 1}
                  onCancel={() => setIsAddingAgenda(false)}
                  onComplete={() => setIsAddingAgenda(false)}
                />
              </Box>
            )}

            <Stack className="gap-4">
              {agendas.map(agenda => (
                <Box key={agenda.id} className="bg-background border border-border rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden">
                  {editingAgendaId === agenda.id ? (
                    <Box className="p-4 bg-muted/20">
                      <AgendaForm
                        meetingId={meeting?.id}
                        agenda={agenda}
                        onCancel={() => setEditingAgendaId(null)}
                        onComplete={() => setEditingAgendaId(null)}
                      />
                    </Box>
                  ) : (
                    <AgendaItemView
                      agenda={agenda}
                      isExpanded={expandedAgendaIds.includes(agenda.id)}
                      onToggle={() => toggleAgendaExpansion(agenda.id)}
                      onEdit={() => setEditingAgendaId(agenda.id)}
                      onDelete={() => handleDeleteAgenda(agenda.id)}
                    />
                  )}
                </Box>
              ))}
              {agendas.length === 0 && !isAddingAgenda && (
                <Box className="text-center bg-muted/10 rounded-xl py-12 border border-dashed border-border">
                  <Text className="text-muted-foreground italic">議題はまだ登録されていません</Text>
                </Box>
              )}
            </Stack>
          </Stack>
        )}
      </Box>
    </Box>
  )
}

function AgendaItemView({ agenda, isExpanded, onToggle, onEdit, onDelete }: { agenda: Agenda, isExpanded: boolean, onToggle: () => void, onEdit: () => void, onDelete: () => void }) {
  return (
    <Box className="flex flex-col">
      <HStack className="justify-between items-center p-4 gap-4 cursor-pointer hover:bg-muted/30 transition-colors" onClick={onToggle}>
        <HStack className="flex-1 gap-3">
          <Box className="bg-muted text-muted-foreground w-6 h-6 rounded flex items-center justify-center text-xs font-bold">
            {agenda.display_order}
          </Box>
          <Text weight="bold" className="text-base text-foreground flex-1">
            {agenda.title}
          </Text>
          <Box className="text-muted-foreground">
            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </Box>
        </HStack>

        <HStack className="gap-1 ml-4 shrink-0" onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="icon" onClick={onEdit} className="h-8 w-8 text-muted-foreground hover:text-primary">
            <Edit2 size={14} />
          </Button>
          <Button variant="ghost" size="icon" onClick={onDelete} className="h-8 w-8 text-muted-foreground hover:text-destructive">
            <Trash2 size={14} />
          </Button>
        </HStack>
      </HStack>

      {isExpanded && (
        <Box className="px-11 pb-5 pt-1 border-t border-border/40 bg-muted/5">
          <Box className="text-sm text-muted-foreground prose prose-sm dark:prose-invert max-w-none leading-relaxed">
            {agenda.description ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{agenda.description}</ReactMarkdown>
            ) : (
              <span className="text-muted-foreground/40 italic">（詳細な説明はありません）</span>
            )}
          </Box>
        </Box>
      )}
    </Box>
  )
}

function AgendaForm({ meetingId, agenda, defaultDisplayOrder = 1, onCancel, onComplete }: { meetingId?: string, agenda?: Agenda, defaultDisplayOrder?: number, onCancel: () => void, onComplete: () => void }) {
  const [isPending, startTransition] = useTransition()

  if (!meetingId) {
    return (
      <HStack className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-lg gap-3">
        <X size={18} />
        <Text weight="bold" className="text-sm">
          先に定例会の日程を保存してください（スケジュール未登録の場合は議題を追加できません）
        </Text>
      </HStack>
    )
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
    <form action={handleSubmit}>
      <Stack className="gap-5">
        <Box className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Box className="md:col-span-3">
            <Label className="mb-1.5 block">議題タイトル <Text className="text-destructive">*</Text></Label>
            <Input
              name="title"
              defaultValue={agenda?.title}
              placeholder="何について話し合うかを入力してください"
              required
            />
          </Box>
          <Box>
            <Label className="mb-1.5 block">表示順</Label>
            <Input
              type="number"
              name="display_order"
              defaultValue={agenda?.display_order || defaultDisplayOrder}
              className="w-full"
            />
          </Box>
        </Box>

        <Box>
          <Label className="mb-1.5 block">詳細内容</Label>
          <MarkdownEditor
            name="description"
            defaultValue={agenda?.description || ''}
            placeholder="話し合いの背景や決定事項など（Markdown対応）"
            rows={8}
          />
        </Box>

        <HStack className="justify-end gap-3 pt-2">
          <Button variant="ghost" type="button" onClick={onCancel}>
            キャンセル
          </Button>
          <Button type="submit" disabled={isPending} activeScale={true} className="gap-2 px-6 h-10 font-bold shadow-md">
            <Save size={16} />
            議題を保存
          </Button>
        </HStack>
      </Stack>
    </form>
  )
}
