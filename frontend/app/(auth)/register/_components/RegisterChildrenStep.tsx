'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { RegistrationData } from '../onboarding/RegistrationWizard'
import { Trash2, Plus } from 'lucide-react'
import { toHiragana } from '@/lib/utils'

// Schema for a single child
const childSchema = z.object({
  lastName: z.string().min(1, '苗字を入力してください'),
  firstName: z.string().min(1, '名前を入力してください'),
  lastNameKana: z.string().min(1, '苗字（ふりがな）を入力してください'),
  firstNameKana: z.string().min(1, '名前（ふりがな）を入力してください'),
  birthday: z.string().min(1, '生年月日を入力してください'),
  gender: z.string().min(1, '性別を選択してください'),
  allergies: z.string().optional(),
  notes: z.string().optional(),
})

type ChildFormData = z.infer<typeof childSchema>

type Props = {
  data: RegistrationData['children']
  parentLastName: string // To pre-fill
  parentLastNameKana: string // To pre-fill
  updateData: (data: RegistrationData['children']) => void
  onNext: () => void
  onPrev: () => void
}

export default function RegisterChildrenStep({ data, parentLastName, parentLastNameKana, updateData, onNext, onPrev }: Props) {
  const [isAdding, setIsAdding] = useState(data.length === 0)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChildFormData>({
    resolver: zodResolver(childSchema),
    defaultValues: {
      lastName: parentLastName,
      lastNameKana: parentLastNameKana,
      gender: 'male' // Default
    },
  })

  const onAddChild = (childData: ChildFormData) => {
    updateData([...data, {
      ...childData,
      lastNameKana: toHiragana(childData.lastNameKana),
      firstNameKana: toHiragana(childData.firstNameKana),
      allergies: childData.allergies || '',
      notes: childData.notes || '',
    }])
    reset({
      lastName: parentLastName,
      lastNameKana: parentLastNameKana,
      gender: 'male'
    })
    setIsAdding(false)
  }

  const onRemoveChild = (index: number) => {
    const newData = [...data]
    newData.splice(index, 1)
    updateData(newData)
    if (newData.length === 0) {
      setIsAdding(true)
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-medium text-gray-900">お子様情報の入力</h3>
        <p className="text-sm text-gray-500">
          お子様のお名前を入力します。一人ずつ追加してください。
        </p>
      </div>

      {/* List of added children */}
      {data.length > 0 && (
        <div className="space-y-4 mb-8">
          {data.map((child, index) => (
            <div key={index} className="bg-gray-50 p-4 rounded-md relative border border-gray-200">
              <button
                onClick={() => onRemoveChild(index)}
                className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
              >
                <Trash2 className="h-5 w-5" />
              </button>
              <div className="font-medium text-gray-900">
                {child.lastName} {child.firstName}
                <span className="text-sm text-gray-500 ml-2">({child.lastNameKana} {child.firstNameKana})</span>
              </div>
              <div className="text-sm text-gray-600 mt-1">
                {child.birthday}生 / {child.gender === 'male' ? '男の子' : child.gender === 'female' ? '女の子' : 'その他'}
              </div>
            </div>
          ))}

          {!isAdding && (
            <button
              type="button"
              onClick={() => setIsAdding(true)}
              className="w-full py-2 border-2 border-dashed border-gray-300 rounded-md text-sm text-gray-600 hover:border-indigo-500 hover:text-indigo-500 flex items-center justify-center gap-2"
            >
              <Plus className="h-4 w-4" />
              もう一人追加する
            </button>
          )}
        </div>
      )}

      {/* Add Form */}
      {isAdding && (
        <div className="bg-white border rounded-md p-4 shadow-sm">
          <h4 className="text-sm font-medium text-gray-900 mb-4 border-b pb-2">新規追加</h4>
          <form id="child-form" onSubmit={handleSubmit(onAddChild)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700">苗字</label>
                <input type="text" {...register('lastName')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm border px-3 py-2" />
                {errors.lastName && <p className="text-xs text-red-600">{errors.lastName.message}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700">名前</label>
                <input type="text" {...register('firstName')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm border px-3 py-2" placeholder="花子" />
                {errors.firstName && <p className="text-xs text-red-600">{errors.firstName.message}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700">ふりがな(苗字)</label>
                <input type="text" {...register('lastNameKana')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm border px-3 py-2" autoComplete="off" />
                {errors.lastNameKana && <p className="text-xs text-red-600">{errors.lastNameKana.message}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700">ふりがな(名前)</label>
                <input type="text" {...register('firstNameKana')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm border px-3 py-2" placeholder="はなこ" autoComplete="off" />
                {errors.firstNameKana && <p className="text-xs text-red-600">{errors.firstNameKana.message}</p>}
              </div>
            </div>
            <p className="text-[10px] text-gray-500 -mt-2">※カタカナは登録時に自動的にひらがなに変換されます</p>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700">生年月日</label>
                <input type="date" {...register('birthday')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm border px-3 py-2" />
                {errors.birthday && <p className="text-xs text-red-600">{errors.birthday.message}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700">性別</label>
                <select {...register('gender')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm border px-3 py-2">
                  <option value="male">男の子</option>
                  <option value="female">女の子</option>
                  <option value="other">その他</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700">アレルギー (任意)</label>
              <input type="text" {...register('allergies')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm border px-3 py-2" placeholder="卵、そば等" />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700">特記事項 (任意)</label>
              <textarea {...register('notes')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm border px-3 py-2" rows={2}></textarea>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              {data.length > 0 && (
                <button type="button" onClick={() => setIsAdding(false)} className="bg-white text-gray-600 border px-3 py-1.5 rounded-md text-sm">キャンセル</button>
              )}
              <button type="submit" className="bg-indigo-600 text-white px-3 py-1.5 rounded-md text-sm hover:bg-indigo-700">
                {data.length > 0 ? '追加する' : 'この内容で登録'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="flex justify-between pt-4">
        <button
          type="button"
          onClick={onPrev}
          className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          戻る
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={data.length === 0 || isAdding}
          className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white 
            ${data.length === 0 || isAdding ? 'bg-gray-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'}`}
        >
          次へ
        </button>
      </div>
    </div>
  )
}
