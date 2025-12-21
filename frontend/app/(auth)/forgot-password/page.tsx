'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { sendPasswordResetEmail } from '@/app/actions/auth'
import Link from 'next/link'
import { Input } from '@/ui/primitives/Input'
import { Loader2, ArrowLeft } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setStatus('loading')
    setErrorMessage('')

    try {
      const result = await sendPasswordResetEmail(email)
      if (result.success) {
        setIsSubmitted(true)
        setStatus('success')
      } else {
        setStatus('error')
        setErrorMessage(result.message || '送信に失敗しました')
      }
    } catch (e) {
      setStatus('error')
      setErrorMessage('予期せぬエラーが発生しました')
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
          <strong>{email}</strong> 宛にパスワード再設定用のメールを送信しました。<br />
          メール内のリンクをクリックして、新しいパスワードを設定してください。
        </p>
        <div className="mt-8">
          <Link
            href="/login"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
          >
            ログイン画面に戻る
          </Link>
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
        <h2 className="text-2xl font-bold text-gray-900">パスワード再設定</h2>
        <p className="mt-2 text-sm text-gray-600">
          登録済みのメールアドレスを入力してください。<br />
          再設定用のリンクを送信します。
        </p>
      </div>

      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
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
              className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="example@email.com"
            />
          </div>
        </div>

        {status === 'error' && (
          <div className="text-red-600 text-sm text-center">
            {errorMessage}
          </div>
        )}

        <div>
          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {status === 'loading' ? (
              <Loader2 className="animate-spin h-5 w-5" />
            ) : (
              '送信する'
            )}
          </button>
        </div>

        <div className="text-center">
          <Link
            href="/login"
            className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            ログイン画面に戻る
          </Link>
        </div>
      </form>
    </motion.div>
  )
}
