'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import RegisterAccountStep from './_components/RegisterAccountStep'
import RegisterParentStep from './_components/RegisterParentStep'
import RegisterChildrenStep from './_components/RegisterChildrenStep'
import RegisterConfirmStep from './_components/RegisterConfirmStep'
import RegisterCompleteStep from './_components/RegisterCompleteStep'

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

  const updateFormData = <K extends keyof RegistrationData>(section: K, data: RegistrationData[K]) => {
    setFormData(prev => ({
      ...prev,
      [section]: data
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
        <div className="flex justify-between mt-2 text-xs text-muted-foreground">
          {['アカウント', '保護者', 'お子様', '確認', '完了'].map((label, index) => {
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
            <RegisterAccountStep
              data={formData.account}
              updateData={(data) => updateFormData('account', data)}
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
              updateData={(data) => updateFormData('children', data)}
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
