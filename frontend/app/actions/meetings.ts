'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

// --- Regular Meeting Schedule ---

export async function getRegularMeetings(year: number) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('regular_meetings')
    .select('*, meeting_agendas(*)')
    .eq('target_year', year)
    .order('target_month', { ascending: true })

  if (error) {
    console.error('Error fetching regular meetings:', error)
    return []
  }

  // Client-side sort for agendas to be safe
  const sortedData = data.map(meeting => ({
    ...meeting,
    meeting_agendas: meeting.meeting_agendas?.sort((a: any, b: any) =>
      (a.display_order - b.display_order) || (new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    ) || []
  }))

  return sortedData
}

export async function getRegularMeeting(id: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('regular_meetings')
    .select('*, meeting_agendas(*)')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching regular meeting:', error)
    return null
  }

  // Client-side sort for agendas to be safe
  const sortedData = {
    ...data,
    meeting_agendas: data.meeting_agendas?.sort((a: any, b: any) =>
      (a.display_order - b.display_order) || (new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    ) || []
  }

  return sortedData
}

export async function upsertRegularMeeting(formData: FormData) {
  const supabase = await createClient()

  const id = formData.get('id') as string // Update if exists
  const target_year = parseInt(formData.get('target_year') as string)
  const target_month = parseInt(formData.get('target_month') as string)
  const scheduled_date = formData.get('scheduled_date') as string
  const start_time = formData.get('start_time') as string
  const location = formData.get('location') as string
  const description = formData.get('description') as string

  const payload = {
    target_year,
    target_month,
    scheduled_date: scheduled_date || null,
    start_time: start_time || null,
    location,
    description,
  }

  let error
  if (id) {
    const res = await supabase
      .from('regular_meetings')
      .update(payload)
      .eq('id', id)
    error = res.error
  } else {
    // Check if one already exists for this year/month to prevent duplicates (optional but good UI assumes 1:1)
    // For now we just insert.
    const res = await supabase
      .from('regular_meetings')
      .insert(payload)
    error = res.error
  }

  if (error) {
    console.error('Upsert meeting error:', error)
    return { success: false, message: '定例会の保存に失敗しました: ' + error.message }
  }

  revalidatePath('/admin/meetings')
  return { success: true, message: '定例会情報を保存しました' }
}

// --- Meeting Agendas ---

export async function getMeetingAgendas(meetingId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('meeting_agendas')
    .select('*')
    .eq('meeting_id', meetingId)
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching agendas:', error)
    return []
  }

  return data
}

export async function upsertMeetingAgenda(formData: FormData) {
  const supabase = await createClient()

  const id = formData.get('id') as string
  const meeting_id = formData.get('meeting_id') as string
  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const display_order = parseInt(formData.get('display_order') as string) || 0

  const payload = {
    meeting_id,
    title,
    description: description || null,
    display_order,
  }

  let error
  if (id) {
    const res = await supabase
      .from('meeting_agendas')
      .update(payload)
      .eq('id', id)
    error = res.error
  } else {
    const res = await supabase
      .from('meeting_agendas')
      .insert(payload)
    error = res.error
  }

  if (error) {
    console.error('Upsert agenda error:', error)
    return { success: false, message: '議題の保存に失敗しました: ' + error.message }
  }

  revalidatePath('/admin/meetings')
  return { success: true, message: '議題を保存しました' }
}

export async function deleteMeetingAgenda(formData: FormData) {
  const supabase = await createClient()
  const id = formData.get('id') as string

  const { error } = await supabase
    .from('meeting_agendas')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Delete agenda error:', error)
    return { success: false, message: '議題の削除に失敗しました: ' + error.message }
  }

  revalidatePath('/admin/meetings')
  return { success: true, message: '議題を削除しました' }
}

export async function copyAgendasFromPreviousYear(targetMeetingId: string) {
  const supabase = await createClient()

  // 1. Get Target Meeting Info
  const { data: targetMeeting, error: targetError } = await supabase
    .from('regular_meetings')
    .select('*')
    .eq('id', targetMeetingId)
    .single()

  if (targetError || !targetMeeting) {
    return { success: false, message: '対象の定例会が見つかりません' }
  }

  const prevYear = targetMeeting.target_year - 1
  const month = targetMeeting.target_month

  // 2. Find Previous Year Meeting
  // We assume there's only one meeting for that month.
  const { data: prevMeeting, error: prevError } = await supabase
    .from('regular_meetings')
    .select('id')
    .eq('target_year', prevYear)
    .eq('target_month', month)
    .single() // If multiple, take one. If none, error.

  if (prevError || !prevMeeting) {
    return { success: false, message: '昨年度の同月の定例会データが見つかりません' }
  }

  // 3. Get Agendas from Previous Year
  const { data: prevAgendas, error: agendasError } = await supabase
    .from('meeting_agendas')
    .select('title, description, display_order') // Don't select ID or timestamps
    .eq('meeting_id', prevMeeting.id)

  if (agendasError) {
    return { success: false, message: '昨年度の議題の取得に失敗しました' }
  }

  if (!prevAgendas || prevAgendas.length === 0) {
    return { success: false, message: '昨年度の定例会にはコピーできる議題がありません' }
  }

  // 4. Insert into Current Meeting
  const newAgendas = prevAgendas.map(agenda => ({
    meeting_id: targetMeetingId,
    title: agenda.title,
    description: agenda.description,
    display_order: agenda.display_order
  }))

  const { error: insertError } = await supabase
    .from('meeting_agendas')
    .insert(newAgendas)

  if (insertError) {
    return { success: false, message: '議題のコピーに失敗しました: ' + insertError.message }
  }

  revalidatePath('/admin/meetings')
  return { success: true, message: `昨年度から${newAgendas.length}件の議題をコピーしました` }
}
