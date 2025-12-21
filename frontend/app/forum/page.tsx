import { getQuestions } from '@/app/actions/forum'
import { ForumScreen } from '@/components/screens/forum/ForumList'

export const dynamic = 'force-dynamic'

export default async function ForumPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const questions = await getQuestions(q)

  return <ForumScreen questions={questions} />
}
