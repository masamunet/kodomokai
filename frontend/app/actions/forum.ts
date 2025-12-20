'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createQuestion(formData: FormData) {
  const supabase = await createClient()
  const title = formData.get('title') as string
  const content = formData.get('content') as string

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data, error } = await supabase
    .from('forum_questions')
    .insert({
      title,
      content,
      profile_id: user.id
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating question:', error)
    return { success: false, message: '質問の作成に失敗しました' }
  }

  revalidatePath('/forum')
  return { success: true, data }
}

export async function updateQuestion(formData: FormData) {
  const supabase = await createClient()
  const id = formData.get('id') as string
  const title = formData.get('title') as string
  const content = formData.get('content') as string
  const is_resolved = formData.get('is_resolved') === 'true'

  const { error } = await supabase
    .from('forum_questions')
    .update({ title, content, is_resolved })
    .eq('id', id)

  if (error) {
    console.error('Error updating question:', error)
    return { success: false, message: '質問の更新に失敗しました' }
  }

  revalidatePath('/forum')
  revalidatePath(`/forum/${id}`)
  return { success: true }
}

export async function deleteQuestion(id: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('forum_questions')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting question:', error)
    return { success: false, message: '質問の削除に失敗しました' }
  }

  revalidatePath('/forum')
  return { success: true }
}

export async function createAnswer(formData: FormData) {
  const supabase = await createClient()
  const question_id = formData.get('question_id') as string
  const content = formData.get('content') as string

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('forum_answers')
    .insert({
      question_id,
      content,
      profile_id: user.id
    })

  if (error) {
    console.error('Error creating answer:', error)
    return { success: false, message: '回答の投稿に失敗しました' }
  }

  revalidatePath(`/forum/${question_id}`)
  return { success: true }
}

export async function toggleReaction(target_type: 'question' | 'answer', target_id: string, emoji: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // Check if already exists
  const { data: existing } = await supabase
    .from('forum_reactions')
    .select('id')
    .eq('profile_id', user.id)
    .eq('emoji', emoji)
    .eq(target_type === 'question' ? 'question_id' : 'answer_id', target_id)
    .maybeSingle()

  if (existing) {
    // Remove
    await supabase.from('forum_reactions').delete().eq('id', existing.id)
  } else {
    // Add
    await supabase.from('forum_reactions').insert({
      [target_type === 'question' ? 'question_id' : 'answer_id']: target_id,
      profile_id: user.id,
      emoji
    })
  }

  // Revalidate appropriately
  // For simplicity, we can't easily revalidate the specific forum detail if we don't know the question_id
  // But usually questions/answers are on the same page.
  revalidatePath('/forum', 'layout')
  return { success: true }
}

export async function getQuestions(query?: string) {
  const supabase = await createClient()
  let dbQuery = supabase
    .from('forum_questions')
    .select(`
      *,
      profiles (
        first_name,
        last_name
      ),
      forum_answers (
        id,
        content,
        created_at,
        profiles (
          first_name,
          last_name
        )
      ),
      forum_reactions (emoji)
    `)

  if (query) {
    dbQuery = dbQuery.or(`title.ilike.%${query}%,content.ilike.%${query}%`)
  }

  const { data, error } = await dbQuery.order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching questions:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code
    })
    return []
  }

  return data
}

export async function getQuestionDetail(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('forum_questions')
    .select(`
      *,
      profiles (
        first_name,
        last_name
      ),
      forum_answers (
        *,
        profiles (first_name, last_name),
        forum_reactions (*)
      ),
      forum_reactions (*)
    `)
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching question detail:', error)
    return null
  }

  return data
}

/**
 * 回答が0件の質問の数を取得する
 */
export async function getUnansweredCount() {
  const supabase = await createClient()

  // 質問とその回答（のIDのみ）を取得
  const { data, error } = await supabase
    .from('forum_questions')
    .select('id, forum_answers(id)')

  if (error) {
    console.error('Error fetching unanswered count:', error)
    return 0
  }

  // 回答リストが空、または存在しないものをカウント
  const unanswered = data.filter(q => !q.forum_answers || (q.forum_answers as any[]).length === 0)
  return unanswered.length
}
