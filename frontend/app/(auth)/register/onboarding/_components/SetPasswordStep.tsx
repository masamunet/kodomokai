'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Input } from '@/ui/primitives/Input'

const schema = z.object({
  password: z.string().min(8, 'パスワードは8文字以上で入力してください'),
  passwordConfirm: z.string()
}).refine((data) => data.password === data.passwordConfirm, {
  message: "パスワードが一致しません",
  path: ["passwordConfirm"],
})

type FormData = z.infer<typeof schema>

type Props = {
  data: { password: string }
  updateData: (data: { password: string }) => void
  onNext: () => void
}

export default function SetPasswordStep({ data, updateData, onNext }: Props) {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      password: data.password || '',
      passwordConfirm: data.password || ''
    }
  })

  const onSubmit = (formData: FormData) => {
    updateData({ password: formData.password })
    onNext()
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-medium text-gray-900">パスワード設定</h3>
        <p className="text-sm text-gray-500">
          ログインに使用するパスワードを設定してください。
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            パスワード
          </label>
          <div className="mt-1">
            <Input
              type="password"
              {...register('password')}
              className={errors.password ? 'border-red-500' : ''}
              placeholder="8文字以上"
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            パスワード（確認）
          </label>
          <div className="mt-1">
            <Input
              type="password"
              {...register('passwordConfirm')}
              className={errors.passwordConfirm ? 'border-red-500' : ''}
              placeholder="もう一度入力してください"
            />
            {errors.passwordConfirm && (
              <p className="mt-1 text-sm text-red-600">{errors.passwordConfirm.message}</p>
            )}
          </div>
        </div>

        <div className="pt-4 space-y-3">
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            次へ
          </button>

          <button
            type="button"
            onClick={onNext}
            className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            後で設定する（スキップ）
          </button>
        </div>
      </form>
    </div>
  )
}
