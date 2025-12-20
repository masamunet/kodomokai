'use client'

import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { useState } from 'react'
import { login, signup, signInWithGoogle } from './actions'

export default function AuthForm({ orgName = '子供会 管理アプリ' }: { orgName?: string }) {
  const [isLogin, setIsLogin] = useState(true)

  return (
    <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-md">
      <div className="text-center">
        <h2 className="text-3xl font-extrabold text-gray-900">{orgName}</h2>
        <p className="mt-2 text-sm text-gray-600">
          {isLogin ? 'ログイン' : '新規アカウント作成'}
        </p>
      </div>

      <form className="mt-8 space-y-6">
        <div className="flex flex-col gap-4">
          <button
            type="button"
            onClick={() => signInWithGoogle()}
            className="flex w-full items-center justify-center gap-3 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2"
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
            Googleで{isLogin ? 'ログイン' : '登録'}
          </button>

          <div className="relative my-2">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-300"></span>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-gray-500">またはメールで{isLogin ? 'ログイン' : '登録'}</span>
            </div>
          </div>
        </div>

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
              <Link href="/forgot-password" className="font-medium text-primary hover:text-primary/80">
                パスワードを忘れた場合
              </Link>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {isLogin ? (
            <button
              formAction={login}
              className="group relative flex w-full justify-center rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              ログイン
            </button>
          ) : (
            <button
              formAction={signup}
              className="group relative flex w-full justify-center rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              登録する
            </button>
          )}

          <div className="text-center">
            {isLogin ? (
              <Link
                href="/register"
                className="text-sm font-semibold text-primary hover:text-primary/80"
              >
                入会はこちら
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm font-semibold text-primary hover:text-primary/80"
              >
                すでにアカウントをお持ちの方はこちら
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  )
}
