'use client'

import { RegistrationData } from '../RegistrationWizard'

type Props = {
  data: RegistrationData
  onNext: () => void
  onPrev: () => void
}

export default function RegisterConfirmStep({ data, onNext, onPrev }: Props) {
  // Mock fees
  const admissionFee = 1000 // 入会金 per family
  const annualFeePerChild = 500 // 会費 per child
  const totalAnnualFee = data.children.length * annualFeePerChild
  const total = admissionFee + totalAnnualFee

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-medium text-gray-900">入力内容の確認</h3>
        <p className="text-sm text-gray-500">
          以下の内容で登録します。よろしければ「登録する」ボタンを押してください。
        </p>
      </div>

      <div className="bg-white border rounded-lg overflow-hidden text-sm">
        {/* Account */}
        <div className="p-4 border-b bg-gray-50 font-medium text-gray-700">アカウント情報</div>
        <div className="p-4 border-b">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-gray-500">メールアドレス</div>
            <div className="col-span-2 font-medium">{data.account.email}</div>
          </div>
        </div>

        {/* Parent */}
        <div className="p-4 border-b bg-gray-50 font-medium text-gray-700">保護者情報</div>
        <div className="p-4 border-b space-y-3">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-gray-500">氏名</div>
            <div className="col-span-2 font-medium">{data.parent.lastName} {data.parent.firstName}</div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-gray-500">ふりがな</div>
            <div className="col-span-2 font-medium">{data.parent.lastNameKana} {data.parent.firstNameKana}</div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-gray-500">電話番号</div>
            <div className="col-span-2 font-medium">{data.parent.phone || '-'}</div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-gray-500">住所</div>
            <div className="col-span-2 font-medium">{data.parent.address}</div>
          </div>
        </div>

        {/* Children */}
        <div className="p-4 border-b bg-gray-50 font-medium text-gray-700">お子様情報 ({data.children.length}名)</div>
        <div className="p-4 border-b space-y-4">
          {data.children.map((child, i) => (
            <div key={i} className="pb-3 border-b last:border-0 last:pb-0">
              <div className="font-medium">{child.lastName} {child.firstName} ({child.lastNameKana} {child.firstNameKana})</div>
              <div className="text-gray-600 mt-1">
                {child.birthday} / {child.gender === 'male' ? '男' : child.gender === 'female' ? '女' : '他'}
              </div>
              {child.allergies && <div className="text-red-600 mt-1 text-xs">アレルギー: {child.allergies}</div>}
            </div>
          ))}
        </div>

        {/* Fees */}
        <div className="p-4 bg-indigo-50 border-t border-indigo-100">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-600">入会金</span>
            <span className="font-medium">{admissionFee.toLocaleString()}円</span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-600">年会費 ({data.children.length}名分)</span>
            <span className="font-medium">{totalAnnualFee.toLocaleString()}円</span>
          </div>
          <div className="border-t border-indigo-200 mt-2 pt-2 flex justify-between items-center font-bold text-lg text-indigo-900">
            <span>合計</span>
            <span>{total.toLocaleString()}円</span>
          </div>
        </div>
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
          type="button"
          onClick={onNext}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          登録する
        </button>
      </div>

    </div>
  )
}
