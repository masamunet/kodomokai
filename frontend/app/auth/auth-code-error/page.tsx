'use client'

import Link from 'next/link'

export default function AuthCodeError() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 sm:px-6 lg:px-8 bg-gray-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">認証エラー</h2>
          <p className="text-gray-600 mb-6">
            認証コードが無効か、期限切れです。<br />
            もう一度最初からやり直してください。
          </p>
          <div className="space-y-4">
            <Link
              href="/register"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
            >
              新規登録画面へ戻る
            </Link>
            <Link
              href="/login"
              className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
            >
              ログイン画面へ
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
