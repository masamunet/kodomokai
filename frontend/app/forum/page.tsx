import { getQuestions } from '@/app/actions/forum'
import ForumCard from '@/components/forum/ForumCard'
import QuestionDialog from '@/components/forum/QuestionDialog'
import ForumSearch from '@/components/forum/ForumSearch'
import { MessageCircleQuestion } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function ForumPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const questions = await getQuestions(q)

  return (
    <div className="min-h-screen bg-[#FDFEFF]">
      <header className="bg-white/70 backdrop-blur-xl sticky top-0 z-20 border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
              <MessageCircleQuestion size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">質問掲示板</h1>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Forum & Community</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm font-bold text-gray-500 hover:text-gray-900 px-4 py-2 rounded-xl transition-colors">
              ホームへ戻る
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-10">
        <section className="mb-0"> {/* Adjusted margin to merge with search component */}
          <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-[2.5rem] p-10 text-white shadow-2xl shadow-indigo-200 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl" />
            <div className="relative z-10 max-w-2xl">
              <h2 className="text-3xl font-bold mb-4 leading-tight">
                子ども会のことで<br />わからないことはありますか？
              </h2>
              <p className="text-indigo-100 text-lg opacity-90 max-w-md leading-relaxed mb-8">
                役員への質問や、会員同士の相談など、気軽にお使いください。
              </p>

              <ForumSearch />
            </div>
          </div>
        </section>

        <section className="mt-8">
          {questions.length === 0 ? (
            <div className="bg-white border-2 border-dashed border-gray-100 rounded-[2rem] p-20 text-center">
              <div className="w-16 h-16 bg-gray-50 rounded-3xl flex items-center justify-center text-gray-300 mx-auto mb-4">
                <MessageCircleQuestion size={32} />
              </div>
              <p className="text-gray-400 font-medium">まだ質問がありません。<br />最初の質問を投稿してみませんか？</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {questions.map((q: any) => (
                <ForumCard key={q.id} question={q} />
              ))}
            </div>
          )}
        </section>
      </main>

      <QuestionDialog />
    </div>
  )
}
