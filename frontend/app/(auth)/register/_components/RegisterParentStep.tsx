'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { RegistrationData } from '../onboarding/RegistrationWizard'
import { toHiragana } from '@/lib/utils'

const schema = z.object({
  lastName: z.string().min(1, '苗字を入力してください'),
  firstName: z.string().min(1, '名前を入力してください'),
  lastNameKana: z.string().min(1, '苗字（ふりがな）を入力してください'),
  firstNameKana: z.string().min(1, '名前（ふりがな）を入力してください'),
  phone: z.string().optional().or(z.literal('')),
  address: z.string().min(1, '住所を入力してください'),
})

type FormData = z.infer<typeof schema>

type Props = {
  data: RegistrationData['parent']
  updateData: (data: RegistrationData['parent']) => void
  onNext: () => void
  onPrev: () => void
}

export default function RegisterParentStep({ data, updateData, onNext, onPrev }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: data,
  })

  const onSubmit = (formData: FormData) => {
    updateData({
      ...formData,
      lastNameKana: toHiragana(formData.lastNameKana),
      firstNameKana: toHiragana(formData.firstNameKana),
      // Ensure fallbacks for optional fields
      phone: formData.phone || '',
      address: formData.address || '',
    })
    onNext()
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-medium text-gray-900">保護者情報の入力</h3>
        <p className="text-sm text-gray-500">
          まずはじめに、保護者のお名前を入力します。
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">苗字</label>
            <input
              type="text"
              id="lastName"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
              placeholder="山田"
              {...register('lastName')}
            />
            {errors.lastName && <p className="mt-1 text-xs text-red-600">{errors.lastName.message}</p>}
          </div>
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">名前</label>
            <input
              type="text"
              id="firstName"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
              placeholder="太郎"
              {...register('firstName')}
            />
            {errors.firstName && <p className="mt-1 text-xs text-red-600">{errors.firstName.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="lastNameKana" className="block text-sm font-medium text-gray-700">ふりがな (苗字)</label>
            <input
              type="text"
              id="lastNameKana"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
              placeholder="やまだ"
              autoComplete="off"
              {...register('lastNameKana')}
            />
            {errors.lastNameKana && <p className="mt-1 text-xs text-red-600">{errors.lastNameKana.message}</p>}
          </div>
          <div>
            <label htmlFor="firstNameKana" className="block text-sm font-medium text-gray-700">ふりがな (名前)</label>
            <input
              type="text"
              id="firstNameKana"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
              placeholder="たろう"
              autoComplete="off"
              {...register('firstNameKana')}
            />
            {errors.firstNameKana && <p className="mt-1 text-xs text-red-600">{errors.firstNameKana.message}</p>}
          </div>
        </div>
        <p className="text-xs text-gray-500 -mt-2">※カタカナは登録時に自動的にひらがなに変換されます</p>

        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700">住所</label>
          <input
            type="text"
            id="address"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
            {...register('address')}
          />
          {errors.address && <p className="mt-1 text-xs text-red-600">{errors.address.message}</p>}
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">電話番号</label>
          <input
            type="tel"
            id="phone"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
            placeholder="09012345678"
            {...register('phone')}
          />
          {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone.message}</p>}
        </div>

        <div className="flex justify-between pt-4">
          <button
            type="button"
            onClick={onPrev}
            className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            戻る
          </button>
          <button
            type="submit"
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            次へ
          </button>
        </div>
      </form>
    </div>
  )
}
