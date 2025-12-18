'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Loader2, ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!password) return

    setStatus('loading')
    setErrorMessage('')

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({ password })

      if (!error || error.message.includes('New password should be different')) {
        setStatus('success')
        setTimeout(() => {
          router.push('/')
        }, 3000)
      } else {
        setStatus('error')
        setErrorMessage(error.message || 'パスワードの更新に失敗しました')
      }
    } catch (e) {
      setStatus('error')
      setErrorMessage('予期せぬエラーが発生しました')
    }
  }

  if (status === 'success') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md mx-auto space-y-8 text-center"
      >
        <h2 className="text-2xl font-bold text-gray-900">パスワードを更新しました</h2>
        <p className="mt-4 text-gray-600">
          新しいパスワードの設定が完了しました。<br />
          トップページへ移動します...
        </p>
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
        <h2 className="text-2xl font-bold text-gray-900">新しいパスワードの設定</h2>
        <p className="mt-2 text-sm text-gray-600">
          新しいパスワードを入力してください。
        </p>
      </div>

      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            新しいパスワード
          </label>
          <div className="mt-1">
            <Input
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="8文字以上"
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
              'パスワードを変更する'
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
