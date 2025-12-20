'use client'

import { useState, useTransition } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SmilePlus } from 'lucide-react'
import { toggleReaction } from '@/app/actions/forum'

type Reaction = {
  emoji: string
  profile_id: string
}

type Props = {
  targetType: 'question' | 'answer'
  targetId: string
  reactions: Reaction[]
  userId?: string
}

const COMMON_EMOJIS = ['👍', '❤️', '😊', '🙏', '🎉', '💡']

export default function ReactionBar({ targetType, targetId, reactions, userId }: Props) {
  const [isPending, startTransition] = useTransition()
  const [showPicker, setShowPicker] = useState(false)

  // Group reactions by emoji
  const grouped = reactions.reduce((acc, r) => {
    acc[r.emoji] = acc[r.emoji] || []
    acc[r.emoji].push(r.profile_id)
    return acc
  }, {} as Record<string, string[]>)

  const handleToggle = (emoji: string) => {
    startTransition(async () => {
      await toggleReaction(targetType, targetId, emoji)
    })
    setShowPicker(false)
  }

  return (
    <div className="flex flex-wrap items-center gap-2 mt-3">
      <div className="flex flex-wrap gap-1.5">
        {Object.entries(grouped).map(([emoji, uids]) => {
          const isActive = userId && uids.includes(userId)
          return (
            <motion.button
              key={emoji}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleToggle(emoji)}
              disabled={isPending}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm border transition-all ${isActive
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm'
                  : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
            >
              <span>{emoji}</span>
              <span className={`font-medium ${isActive ? 'text-indigo-600' : 'text-gray-400'}`}>
                {uids.length}
              </span>
            </motion.button>
          )
        })}
      </div>

      <div className="relative">
        <button
          onClick={() => setShowPicker(!showPicker)}
          className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          title="リアクションを追加"
        >
          <SmilePlus size={20} />
        </button>

        <AnimatePresence>
          {showPicker && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowPicker(false)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 5 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 5 }}
                className="absolute left-0 bottom-full mb-2 z-20 bg-white border border-gray-200 rounded-xl shadow-xl p-2 flex gap-1"
              >
                {COMMON_EMOJIS.map(emoji => (
                  <button
                    key={emoji}
                    onClick={() => handleToggle(emoji)}
                    className="text-2xl p-2 hover:bg-gray-50 rounded-lg transition-transform hover:scale-125"
                  >
                    {emoji}
                  </button>
                ))}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
