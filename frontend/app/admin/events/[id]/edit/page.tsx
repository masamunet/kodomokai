import { createClient } from '@/lib/supabase/server'
import SingleEventForm from '@/components/admin/SingleEventForm'
import AdminFormLayout from '@/components/admin/AdminFormLayout'
import { notFound } from 'next/navigation'

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: event } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .single()

  if (!event) {
    notFound()
  }

  return (
    <AdminFormLayout
      title="イベント編集"
      backLink={{ href: '/admin/events', label: 'イベント一覧に戻る' }}
    >
      <SingleEventForm event={event} />
    </AdminFormLayout>
  )
}
