'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { sendMagicLink } from '@/app/actions/auth'
import { signInWithGoogle } from '@/app/login/actions'
import Link from 'next/link'
import { motion } from 'framer-motion'


export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorCode, setErrorCode] = useState('') // Added errorCode state

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setErrorCode('') // Reset errorCode
    setLoading(true)

    try {
      const result = await sendMagicLink(email)
      if (result.success) {
        setIsSubmitted(true)
      } else {
        setError(result.message || 'メール送信に失敗しました')
        if (result.code) { // Check for result.code
          setErrorCode(result.code) // Set errorCode
        }
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
          <div className="bg-red-50 border border-red-200 rounded-md p-4 space-y-3">
            <div className="text-red-600 text-sm text-center font-medium">
              {error}
            </div>
            {errorCode === 'ALREADY_REGISTERED' && (
              <div className="flex flex-col space-y-2 mt-2">
                <Link
                  href="/login"
                  className="text-center text-sm text-indigo-600 hover:text-indigo-500 font-medium"
                >
                  ログイン画面へ移動
                </Link>
                <Link
                  href="/forgot-password"
                  className="text-center text-sm text-gray-500 hover:text-gray-700 underline"
                >
                  パスワードをお忘れの方
                </Link>
              </div>
            )}
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

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-300"></span>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-2 text-gray-500">または</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => signInWithGoogle()}
          className="flex w-full items-center justify-center gap-3 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Googleで登録
        </button>
      </form>
    </motion.div>
  )
}
