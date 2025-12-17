'use client'

import { Input } from '@/components/ui/input'
import { useState } from 'react'
import { login, signup } from './actions'

export default function AuthForm() {
  const [isLogin, setIsLogin] = useState(true)

  return (
    <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-md">
      <div className="text-center">
        <h2 className="text-3xl font-extrabold text-gray-900">子供会 管理アプリ</h2>
        <p className="mt-2 text-sm text-gray-600">
          {isLogin ? 'ログイン' : '新規アカウント作成'}
        </p>
      </div>

      <form className="mt-8 space-y-6">
        <div className="space-y-4 rounded-md shadow-sm">
          {!isLogin && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700">お名前 <span className="text-red-500">*</span></label>
                <div className="mt-1 flex gap-2">
                  <div className="w-1/2">
                    <Input type="text" name="last_name" placeholder="苗字" required />
                  </div>
                  <div className="w-1/2">
                    <Input type="text" name="first_name" placeholder="名前" required />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">ふりがな</label>
                <div className="mt-1 flex gap-2">
                  <div className="w-1/2">
                    <Input type="text" name="last_name_kana" placeholder="みょうじ" />
                  </div>
                  <div className="w-1/2">
                    <Input type="text" name="first_name_kana" placeholder="なまえ" />
                  </div>
                </div>
              </div>
            </>
          )}

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
                placeholder="メールアドレス"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              パスワード
            </label>
            <div className="mt-1">
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete={isLogin ? "current-password" : "new-password"}
                required
                placeholder="パスワード"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm">
            {isLogin && (
              <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
                パスワードを忘れた場合
              </a>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {isLogin ? (
            <button
              formAction={login}
              className="group relative flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              ログイン
            </button>
          ) : (
            <button
              formAction={signup}
              className="group relative flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              登録する
            </button>
          )}

          <div className="text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm font-semibold text-indigo-600 hover:text-indigo-500"
            >
              {isLogin ? '新規アカウント作成はこちら' : 'すでにアカウントをお持ちの方はこちら'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
