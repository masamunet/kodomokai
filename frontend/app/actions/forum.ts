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
    .eq('target_type', target_type)
    .eq('target_id', target_id)
    .eq('profile_id', user.id)
    .eq('emoji', emoji)
    .maybeSingle()

  if (existing) {
    // Remove
    await supabase.from('forum_reactions').delete().eq('id', existing.id)
  } else {
    // Add
    await supabase.from('forum_reactions').insert({
      target_type,
      target_id,
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

export async function getQuestions() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('forum_questions')
    .select(`
      *,
      profiles (
        first_name,
        last_name
      ),
      forum_answers (id),
      forum_reactions (emoji)
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching questions:', error)
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
