'use client'

import { Input } from '@/ui/primitives/Input'
import Link from 'next/link'
import { useState } from 'react'
import { login, signup, signInWithGoogle } from './actions'

import { LoginScreen } from '@/components/screens/Login'

export default function AuthForm({ orgName = '子供会 管理アプリ' }: { orgName?: string }) {
  return <LoginScreen orgName={orgName} />
}
