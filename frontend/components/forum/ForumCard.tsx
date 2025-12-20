'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { MessageSquare, CheckCircle2, Clock } from 'lucide-react'
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
      className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all group relative overflow-hidden"
    >
      <div className={`absolute top-0 left-0 w-1 h-full ${question.is_resolved ? 'bg-green-400' : 'bg-indigo-500'}`} />

      <Link href={`/forum/${question.id}`} className="block">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="font-semibold text-gray-700 bg-gray-50 px-2.5 py-1 rounded-full border border-gray-100">
              {question.profiles?.last_name} {question.profiles?.first_name}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={12} />
              {formatDistanceToNow(new Date(question.created_at), { addSuffix: true, locale: ja })}
            </span>
          </div>
          {question.is_resolved && (
            <span className="flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-md border border-green-100 uppercase tracking-wider">
              <CheckCircle2 size={12} />
              解決済み
            </span>
          )}
        </div>

        <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors mb-2 line-clamp-1">
          {question.title}
        </h3>

        <p className="text-gray-600 text-sm line-clamp-2 mb-4 leading-relaxed">
          {question.content}
        </p>

        <div className="flex items-center gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-1.5">
            <div className="p-1.5 bg-gray-50 rounded-lg group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
              <MessageSquare size={16} />
            </div>
            <span>{answerCount} 件の回答</span>
          </div>
          {reactionCount > 0 && (
            <div className="flex items-center -space-x-1">
              {Array.from(new Set(question.forum_reactions.map((r: any) => r.emoji))).slice(0, 3).map((emoji: any, i) => (
                <span key={i} className="text-base">{emoji}</span>
              ))}
              <span className="ml-2 text-xs">{reactionCount}</span>
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  )
}
