'use client'

import { useState, useTransition } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, Send } from 'lucide-react'
import { createQuestion } from '@/app/actions/forum'

export default function QuestionDialog() {
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (formData: FormData) => {
    setError(null)
    startTransition(async () => {
      const result = await createQuestion(formData)
      if (result.success) {
        setIsOpen(false)
      } else {
        setError(result.message || 'エラーが発生しました')
      }
    })
  }

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 z-30 bg-indigo-600 text-white p-4 rounded-full shadow-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 pr-6"
      >
        <Plus size={24} />
        <span className="font-bold">質問する</span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h2 className="text-xl font-bold text-gray-900">新しい質問を投稿</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500"
                >
                  <X size={20} />
                </button>
              </div>

              <form action={handleSubmit} className="p-6 space-y-5">
                {error && (
                  <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm border border-red-100 italic">
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">
                    タイトル
                  </label>
                  <input
                    name="title"
                    required
                    placeholder="何について聞きたいですか？"
                    className="w-full rounded-2xl border-gray-200 bg-gray-50 p-4 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">
                    内容
                  </label>
                  <textarea
                    name="content"
                    required
                    rows={5}
                    placeholder="具体的な内容や、知りたいことを書いてください。"
                    className="w-full rounded-2xl border-gray-200 bg-gray-50 p-4 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none resize-none"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isPending}
                    className="w-full bg-indigo-600 text-white rounded-2xl p-4 font-bold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 disabled:opacity-50"
                  >
                    <Send size={18} />
                    {isPending ? '投稿中...' : '質問を投稿する'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
