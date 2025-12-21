import { getQuestionDetail, createAnswer } from '@/app/actions/forum'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { ForumDetailScreen } from '@/components/screens/forum/ForumDetail'

export const dynamic = 'force-dynamic'

export default async function QuestionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const question = await getQuestionDetail(id)
  if (!question) notFound()

  async function handleSubmitAnswer(formData: FormData) {
    'use server'
    const res = await createAnswer(formData)
    if (res.success) {
      revalidatePath(`/forum/${id}`)
    }
  }

  return <ForumDetailScreen question={question} user={user} handleSubmitAnswer={handleSubmitAnswer} />
}
