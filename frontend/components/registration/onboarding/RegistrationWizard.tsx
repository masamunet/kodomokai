'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import SetPasswordStep from './SetPasswordStep'
import RegisterParentStep from '../RegisterParentStep'
import RegisterChildrenStep from '../RegisterChildrenStep'
import RegisterConfirmStep from '../RegisterConfirmStep'
import RegisterCompleteStep from '../RegisterCompleteStep'
import { Box } from '@/ui/layout/Box'
import { Stack, HStack } from '@/ui/layout/Stack'
import { Text } from '@/ui/primitives/Text'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

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

type Props = {
  admissionFee: number
  annualFee: number
}

export default function RegistrationWizard({ admissionFee, annualFee }: Props) {
  const [step, setStep] = useState(0) // 0 indicates initializing
  const [formData, setFormData] = useState<RegistrationData>(initialData)
  const [isOAuthUser, setIsOAuthUser] = useState(false)
  const totalSteps = 5

  useEffect(() => {
    const init = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        const email = user.email || ''
        const providers = user.app_metadata.providers || []
        const isOAuth = providers.length > 0 && !providers.includes('email') || providers.includes('google')

        const metadata = user.user_metadata || {}
        let lastName = metadata.family_name || ''
        let firstName = metadata.given_name || ''

        if (!lastName && !firstName && metadata.full_name) {
          const parts = metadata.full_name.split(' ')
          if (parts.length >= 2) {
            lastName = parts[0]
            firstName = parts.slice(1).join(' ')
          } else {
            lastName = metadata.full_name
          }
        }

        setFormData(prev => ({
          ...prev,
          account: { ...prev.account, email },
          parent: {
            ...prev.parent,
            lastName: lastName || prev.parent.lastName,
            firstName: firstName || prev.parent.firstName,
          }
        }))
        setIsOAuthUser(isOAuth)
        setStep(isOAuth ? 2 : 1)
      } else {
        setStep(1)
      }
    }
    init()
  }, [])

  const updateFormData = <K extends keyof RegistrationData>(section: K, data: RegistrationData[K]) => {
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
  const prevStep = () => {
    if (isOAuthUser && step === 2) return
    setStep(prev => prev - 1)
  }

  if (step === 0) {
    return (
      <Box className="flex items-center justify-center py-20">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
      </Box>
    )
  }

  const stepLabels = ['パスワード', '保護者', 'お子様', '確認', '完了']

  return (
    <Box className="w-full">
      <header className="mb-10 px-2">
        <Box className="relative">
          <Box className="h-1.5 bg-muted rounded-full overflow-hidden border border-border/50">
            <Box
              className="h-full bg-primary rounded-full transition-all duration-700 ease-out shadow-[0_0_10px_rgba(var(--primary),0.3)]"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </Box>
        </Box>

        <HStack className="justify-between mt-4 px-1">
          {stepLabels.map((label, index) => {
            const stepNum = index + 1
            const isActive = step === stepNum
            const isCompleted = step > stepNum
            const isOAuthComplete = isOAuthUser && stepNum === 1

            return (
              <Stack key={label} className="items-center gap-1.5 relative group">
                <Box className={cn(
                  "w-2.5 h-2.5 rounded-full border-2 transition-all duration-300",
                  (isCompleted || isOAuthComplete) ? "bg-green-500 border-green-500 scale-125" :
                    isActive ? "bg-primary border-primary scale-125 shadow-[0_0_8px_rgba(var(--primary),0.5)]" :
                      "bg-muted border-border"
                )} />
                <Text
                  weight={isActive ? "bold" : "medium"}
                  className={cn(
                    "text-[10px] tracking-tight transition-colors duration-300",
                    (isCompleted || isOAuthComplete) ? "text-green-600" :
                      isActive ? "text-primary" :
                        "text-muted-foreground/60"
                  )}
                >
                  {label}
                </Text>

                {index < stepLabels.length - 1 && (
                  <Box className="hidden md:block absolute top-[5px] left-[50%] w-[calc(100%-8px)] h-px bg-border -z-10" />
                )}
              </Stack>
            )
          })}
        </HStack>
      </header>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -10, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="min-h-[400px]"
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
              admissionFee={admissionFee}
              annualFeePerChild={annualFee}
              onNext={nextStep}
              onPrev={prevStep}
            />
          )}
          {step === 5 && (
            <RegisterCompleteStep data={formData} />
          )}
        </motion.div>
      </AnimatePresence>
    </Box>
  )
}
