import { getQuestionDetail, createAnswer } from '@/app/actions/forum'
import { createClient } from '@/lib/supabase/server'
import ReactionBar from '@/components/forum/ReactionBar'
import { ArrowLeft, MessageSquare, CheckCircle2, User, Send, Clock, ShieldCheck } from 'lucide-react'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'
import { ja } from 'date-fns/locale'
import { revalidatePath } from 'next/cache'

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

  return (
    <div className="min-h-screen bg-[#FDFEFF] pb-20">
      <header className="bg-white/70 backdrop-blur-xl sticky top-0 z-20 border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center gap-4">
          <Link
            href="/forum"
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-500"
          >
            <ArrowLeft size={20} />
          </Link>
          <h1 className="font-bold text-gray-900 truncate">質問の詳細</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Question Header */}
        <section className="bg-white rounded-[2rem] border border-gray-100 p-8 shadow-sm mb-8 relative overflow-hidden">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                <User size={24} />
              </div>
              <div>
                <div className="font-bold text-gray-900">
                  {question.profiles?.last_name} {question.profiles?.first_name}
                </div>
                <div className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                  <Clock size={12} />
                  {formatDistanceToNow(new Date(question.created_at), { addSuffix: true, locale: ja })}
                </div>
              </div>
            </div>
            {question.is_resolved && (
              <span className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-600 rounded-full text-xs font-bold border border-green-100 uppercase tracking-wider">
                <CheckCircle2 size={14} />
                解決済み
              </span>
            )}
          </div>

          <h2 className="text-2xl font-black text-gray-900 mb-4 leading-tight">
            {question.title}
          </h2>

          <div className="text-gray-700 text-lg leading-relaxed mb-8 whitespace-pre-wrap">
            {question.content}
          </div>

          <div className="border-t border-gray-50 pt-4">
            <ReactionBar
              targetType="question"
              targetId={question.id}
              reactions={question.forum_reactions}
              userId={user?.id}
            />
          </div>
        </section>

        {/* Answers List */}
        <section className="mb-12">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2 px-2">
            <MessageSquare size={20} className="text-indigo-600" />
            回答 {question.forum_answers?.length || 0} 件
          </h3>

          <div className="space-y-6">
            {question.forum_answers?.length === 0 ? (
              <div className="bg-gray-50/50 border-2 border-dashed border-gray-100 rounded-3xl p-12 text-center text-gray-400 font-medium">
                まだ回答はありません。あなたの知っていることを教えてあげませんか？
              </div>
            ) : (
              question.forum_answers.map((answer: any) => (
                <div key={answer.id} className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm relative transition-all hover:border-indigo-100">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400">
                        <User size={20} />
                      </div>
                      <div>
                        <div className="font-bold text-gray-800 text-sm">
                          {answer.profiles?.last_name} {answer.profiles?.first_name}
                        </div>
                        <div className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5 uppercase font-bold tracking-widest">
                          <Clock size={10} />
                          {formatDistanceToNow(new Date(answer.created_at), { addSuffix: true, locale: ja })}
                        </div>
                      </div>
                    </div>
                    {answer.is_best_answer && (
                      <span className="flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-600 rounded-lg text-[10px] font-black border border-amber-100 uppercase">
                        <ShieldCheck size={12} />
                        Best Answer
                      </span>
                    )}
                  </div>

                  <div className="text-gray-700 leading-relaxed mb-6 whitespace-pre-wrap">
                    {answer.content}
                  </div>

                  <div className="border-t border-gray-50 pt-3">
                    <ReactionBar
                      targetType="answer"
                      targetId={answer.id}
                      reactions={answer.forum_reactions}
                      userId={user?.id}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Post Answer Form */}
        <section className="sticky bottom-8 z-30">
          <form action={handleSubmitAnswer} className="bg-white/80 backdrop-blur-2xl border border-gray-200 rounded-[2rem] p-4 shadow-2xl flex items-end gap-3 max-w-2xl mx-auto ring-4 ring-white/50">
            <input type="hidden" name="question_id" value={question.id} />
            <div className="flex-1">
              <textarea
                name="content"
                required
                rows={1}
                placeholder="回答を入力する..."
                className="w-full bg-gray-50/50 border-none rounded-2xl py-3 px-4 focus:ring-0 focus:bg-white transition-all text-sm outline-none resize-none min-h-[48px]"
              />
            </div>
            <button
              type="submit"
              className="bg-indigo-600 text-white p-3 rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
            >
              <Send size={20} />
            </button>
          </form>
        </section>
      </main>
    </div>
  )
}
