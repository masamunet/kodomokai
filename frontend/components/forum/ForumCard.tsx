'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, CheckCircle2, Clock, ChevronDown, ChevronUp } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ja } from 'date-fns/locale'

type Props = {
  question: any
}

export default function ForumCard({ question }: Props) {
  const answerCount = question.forum_answers?.length || 0
  const reactionCount = question.forum_reactions?.length || 0

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden flex flex-col"
    >
      <div className={`absolute top-0 left-0 w-2 h-full ${question.is_resolved ? 'bg-green-400' : 'bg-indigo-500'}`} />

      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span className="font-bold text-indigo-600 bg-indigo-50 px-4 py-1.5 rounded-full border border-indigo-100">
            {question.profiles?.last_name} {question.profiles?.first_name}
          </span>
          <span className="flex items-center gap-1 font-medium">
            <Clock size={14} />
            {formatDistanceToNow(new Date(question.created_at), { addSuffix: true, locale: ja })}
          </span>
        </div>
        {question.is_resolved && (
          <span className="flex items-center gap-1.5 text-[10px] font-bold text-green-600 bg-green-50 px-3 py-1.5 rounded-xl border border-green-100 uppercase tracking-widest">
            <CheckCircle2 size={14} />
            解決済み
          </span>
        )}
      </div>

      <Link href={`/forum/${question.id}`} className="block group/title mb-6">
        <h3 className="text-2xl font-black text-gray-900 group-hover/title:text-indigo-600 transition-colors mb-3 leading-tight tracking-tight">
          {question.title}
        </h3>
        <p className="text-gray-600 text-base leading-relaxed line-clamp-3">
          {question.content}
        </p>
      </Link>

      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-indigo-600">
            <div className="p-2 bg-indigo-50 rounded-2xl">
              <MessageSquare size={18} />
            </div>
            <span className="font-black text-sm">{answerCount} 件の回答</span>
          </div>

          {reactionCount > 0 && (
            <div className="flex items-center -space-x-2">
              {Array.from(new Set(question.forum_reactions.map((r: any) => r.emoji))).slice(0, 3).map((emoji: any, i) => (
                <span key={i} className="text-xl bg-white rounded-full w-9 h-9 flex items-center justify-center border-2 border-gray-50 shadow-sm ring-2 ring-white">{emoji}</span>
              ))}
              <span className="ml-4 font-black text-xs text-indigo-300">{reactionCount}</span>
            </div>
          )}
        </div>

        <Link
          href={`/forum/${question.id}`}
          className="bg-gray-50 text-gray-900 group-hover:bg-indigo-600 group-hover:text-white px-5 py-2.5 rounded-[1.25rem] text-xs font-black transition-all shadow-sm flex items-center gap-2"
        >
          詳細・回答する
        </Link>
      </div>

      {answerCount > 0 && (
        <div className="mt-2 space-y-4 border-t border-gray-50 pt-8">
          <h4 className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] mb-4">Answers</h4>
          <div className="space-y-4 max-h-[300px] overflow-y-auto no-scrollbar pr-2">
            {question.forum_answers.map((answer: any) => (
              <div key={answer.id} className="bg-gray-50/50 rounded-3xl p-5 border border-gray-100/50 hover:bg-white hover:border-indigo-100 hover:shadow-lg hover:shadow-indigo-50/50 transition-all group/answer">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-bold text-xs text-gray-400 group-hover/answer:text-indigo-400 transition-colors">
                    {answer.profiles?.last_name} {answer.profiles?.first_name}
                  </span>
                  <span className="text-[10px] font-bold text-gray-300">
                    {formatDistanceToNow(new Date(answer.created_at), { addSuffix: true, locale: ja })}
                  </span>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed">
                  {answer.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  )
}
