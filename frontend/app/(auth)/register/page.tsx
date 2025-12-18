'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { sendMagicLink } from '@/app/actions/auth'
import { motion } from 'framer-motion'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await sendMagicLink(email)
      if (result.success) {
        setIsSubmitted(true)
      } else {
        setError(result.message || 'メール送信に失敗しました')
      }
    } catch (err) {
      setError('予期せぬエラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  if (isSubmitted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md mx-auto space-y-8 text-center"
      >
        <h2 className="text-2xl font-bold text-gray-900">メールを確認してください</h2>
        <p className="mt-4 text-gray-600">
          <strong>{email}</strong> 宛に確認メールを送信しました。<br />
          メール内のリンクをクリックして、登録手続きへ進んでください。
        </p>
        <div className="mt-6 text-sm text-gray-500">
          メールが届かない場合は、迷惑メールフォルダをご確認ください。
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md mx-auto space-y-8"
    >
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">新規入会</h2>
        <p className="mt-2 text-sm text-gray-600">
          まずはメールアドレスを入力してください。<br />
          ご本人確認のためのメールを送信します。
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            メールアドレス
          </label>
          <div className="mt-1">
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
              disabled={loading}
              className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
        </div>

        {error && (
          <div className="text-red-600 text-sm text-center">
            {error}
          </div>
        )}

        <div>
          <button
            type="submit"
            disabled={loading}
            className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${loading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200`}
          >
            {loading ? '送信中...' : '確認メールを送信'}
          </button>
        </div>
      </form>
    </motion.div>
  )
}
