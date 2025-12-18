'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import SetPasswordStep from './_components/SetPasswordStep'
import RegisterParentStep from '../_components/RegisterParentStep'
import RegisterChildrenStep from '../_components/RegisterChildrenStep'
import RegisterConfirmStep from '../_components/RegisterConfirmStep'
import RegisterCompleteStep from '../_components/RegisterCompleteStep'

export type RegistrationData = {
  account: {
    email: string
    password: string
  }
  parent: {
    lastName: string
    firstName: string
    lastNameKana: string
    firstNameKana: string
    phone: string
    address: string
  }
  children: Array<{
    lastName: string
    firstName: string
    lastNameKana: string
    firstNameKana: string
    birthday: string
    gender: string
    allergies: string
    notes: string
  }>
}

const initialData: RegistrationData = {
  account: { email: '', password: '' },
  parent: { lastName: '', firstName: '', lastNameKana: '', firstNameKana: '', phone: '', address: '' },
  children: []
}

export default function RegistrationWizard() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState<RegistrationData>(initialData)

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.email) {
        setFormData(prev => ({
          ...prev,
          account: { ...prev.account, email: user.email! }
        }))
      }
    }
    fetchUser()
  }, [])

  const updateFormData = (section: keyof RegistrationData, data: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: { ...prev[section], ...data }
    }))
  }

  // Handle nested update for account which renders differently in SetPasswordStep
  const updatePassword = (data: { password: string }) => {
    setFormData(prev => ({
      ...prev,
      account: { ...prev.account, password: data.password }
    }))
  }

  const nextStep = () => setStep(prev => prev + 1)
  const prevStep = () => setStep(prev => prev - 1)

  return (
    <div className="overflow-hidden">
      <div className="mb-8">
        <div className="h-2 bg-gray-200 rounded-full">
          <div
            className="h-2 bg-indigo-600 rounded-full transition-all duration-300"
            style={{ width: `${(step / 5) * 100}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          <span className={step >= 1 ? 'text-indigo-600 font-medium' : ''}>パスワード</span>
          <span className={step >= 2 ? 'text-indigo-600 font-medium' : ''}>保護者</span>
          <span className={step >= 3 ? 'text-indigo-600 font-medium' : ''}>お子様</span>
          <span className={step >= 4 ? 'text-indigo-600 font-medium' : ''}>確認</span>
          <span className={step >= 5 ? 'text-indigo-600 font-medium' : ''}>完了</span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -20, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {step === 1 && (
            <SetPasswordStep
              data={{ password: formData.account.password }}
              updateData={updatePassword}
              onNext={nextStep}
            />
          )}
          {step === 2 && (
            <RegisterParentStep
              data={formData.parent}
              updateData={(data) => updateFormData('parent', data)}
              onNext={nextStep}
              onPrev={prevStep}
            />
          )}
          {step === 3 && (
            <RegisterChildrenStep
              data={formData.children}
              parentLastName={formData.parent.lastName}
              parentLastNameKana={formData.parent.lastNameKana}
              updateData={(data) => setFormData(prev => ({ ...prev, children: data }))}
              onNext={nextStep}
              onPrev={prevStep}
            />
          )}
          {step === 4 && (
            <RegisterConfirmStep
              data={formData}
              onNext={nextStep}
              onPrev={prevStep}
            />
          )}
          {step === 5 && (
            <RegisterCompleteStep data={formData} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
