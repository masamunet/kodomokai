'use client'

import { useState, useEffect } from 'react'
import { RegistrationData } from '../RegistrationWizard'
import { registerUser } from '@/app/actions/auth'
import Link from 'next/link'
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

type Props = {
  data: RegistrationData
}

export default function RegisterCompleteStep({ data }: Props) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const submit = async () => {
      setStatus('loading')
      try {
        const result = await registerUser(data)
        if (result.success) {
          setStatus('success')
        } else {
          setStatus('error')
          setErrorMessage(result.message || '登録処理に失敗しました')
        }
      } catch (e: any) {
        setStatus('error')
        setErrorMessage(e.message || '予期せぬエラーが発生しました')
      }
    }

    if (status === 'idle') {
      submit()
    }
  }, [data, status])

  if (status === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-12 w-12 text-indigo-600 animate-spin mb-4" />
        <h3 className="text-lg font-medium text-gray-900">登録処理中...</h3>
        <p className="text-gray-500">アカウントとプロフィールを作成しています。</p>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="text-center py-8">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
          <AlertCircle className="h-6 w-6 text-red-600" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">登録に失敗しました</h3>
        <p className="text-gray-500 mb-6">{errorMessage}</p>
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          やり直す
        </button>
      </div>
    )
  }

  return (
    <div className="text-center py-8">
      <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
        <CheckCircle className="h-10 w-10 text-green-600" />
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-2">登録ありがとうございました！</h3>
      <p className="text-gray-600 mb-8">
        確認メールを送信しました。メール内のリンクをクリックして登録を完了してください。<br />
        その後、ログインしてダッシュボードにアクセスできます。
      </p>

      <div className="space-y-4">
        <Link
          href="/login"
          className="inline-flex w-full justify-center py-3 px-4 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm"
        >
          ログイン画面へ
        </Link>
        <Link
          href="/"
          className="inline-flex w-full justify-center text-sm text-gray-500 hover:text-gray-900"
        >
          トップページに戻る
        </Link>
      </div>
    </div>
  )
}
