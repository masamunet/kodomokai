'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
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
  const totalSteps = 5

<<<<<<< HEAD:frontend/app/(auth)/register/RegistrationWizard.tsx
  const updateFormData = <K extends keyof RegistrationData>(section: K, data: RegistrationData[K]) => {
=======
  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.email) {
        setFormData(prev => ({
          ...prev,
          account: { ...prev.account, email: user.email }
        }))
      }
    }
    fetchUser()
  }, [])

<<<<<<< HEAD
  const updateFormData = (section: keyof RegistrationData, data: any) => {
>>>>>>> origin/master:frontend/app/(auth)/register/onboarding/RegistrationWizard.tsx
=======
  const updateFormData = <K extends keyof RegistrationData>(section: K, data: RegistrationData[K]) => {
>>>>>>> origin/master
    setFormData(prev => ({
      ...prev,
      [section]: Array.isArray(prev[section])
        ? data
        : { ...(prev[section] as object), ...(data as object) } as RegistrationData[K]
    }))
  }

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
        <div className="h-2 bg-muted rounded-full border border-border">
          <div
            className="h-2 bg-primary rounded-full transition-all duration-300"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>
<<<<<<< HEAD
<<<<<<< HEAD:frontend/app/(auth)/register/RegistrationWizard.tsx
        <div className="flex justify-between mt-2 text-xs text-muted-foreground">
          {['アカウント', '保護者', 'お子様', '確認', '完了'].map((label, index) => {
=======
        <div className="flex justify-between mt-2 text-xs text-muted-foreground">
          {['パスワード', '保護者', 'お子様', '確認', '完了'].map((label, index) => {
>>>>>>> origin/master
            const isActive = step >= index + 1
            return (
              <span
                key={label}
                className={`${isActive ? 'text-primary font-semibold' : ''} transition-colors`}
              >
                {label}
              </span>
            )
          })}
<<<<<<< HEAD
=======
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          <span className={step >= 1 ? 'text-indigo-600 font-medium' : ''}>パスワード</span>
          <span className={step >= 2 ? 'text-indigo-600 font-medium' : ''}>保護者</span>
          <span className={step >= 3 ? 'text-indigo-600 font-medium' : ''}>お子様</span>
          <span className={step >= 4 ? 'text-indigo-600 font-medium' : ''}>確認</span>
          <span className={step >= 5 ? 'text-indigo-600 font-medium' : ''}>完了</span>
>>>>>>> origin/master:frontend/app/(auth)/register/onboarding/RegistrationWizard.tsx
=======
>>>>>>> origin/master
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
