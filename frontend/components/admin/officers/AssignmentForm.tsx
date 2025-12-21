'use client'

import { useState } from 'react'
import { assignOfficer } from '@/app/admin/actions/officer'
import Link from 'next/link'
import { Box } from '@/ui/layout/Box'
import { Stack, HStack } from '@/ui/layout/Stack'
import { Text } from '@/ui/primitives/Text'
import { Heading } from '@/ui/primitives/Heading'
import { Button } from '@/ui/primitives/Button'
import { Input } from '@/ui/primitives/Input'
import { Label } from '@/ui/primitives/Label'
import { Card, CardContent } from '@/ui/primitives/Card'
import { AlertCircle, ShieldCheck, UserPlus, Calendar } from 'lucide-react'

type Props = {
  roles: any[]
  profiles: any[]
}

export default function AssignmentForm({ roles, profiles }: Props) {
  const [message, setMessage] = useState<string | null>(null)

  const handleSubmit = async (formData: FormData) => {
    setMessage(null)
    const result = await assignOfficer(formData)

    if (result && !result.success) {
      setMessage(result.message)
    }
  }

  return (
    <Card className="border-border shadow-sm overflow-hidden bg-background">
      <CardContent className="p-6 sm:p-8">
        <form action={handleSubmit}>
          <Stack className="gap-8">
            {message && (
              <Box className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-xl flex items-center gap-3">
                <AlertCircle size={18} />
                <Text weight="bold" className="text-sm">{message}</Text>
              </Box>
            )}

            <Box className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Stack className="gap-2">
                <Label htmlFor="fiscal_year">
                  対象年度
                </Label>
                <Input
                  type="number"
                  name="fiscal_year"
                  id="fiscal_year"
                  defaultValue={2025}
                  required
                  className="w-32"
                />
              </Stack>

              <Stack className="gap-2">
                <Label htmlFor="role_id">
                  役職
                </Label>
                <Box asChild className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                  <select
                    id="role_id"
                    name="role_id"
                    required
                  >
                    <option value="">選択してください</option>
                    {roles?.map(role => (
                      <option key={role.id} value={role.id}>{role.name}</option>
                    ))}
                  </select>
                </Box>
              </Stack>

              <Stack className="gap-2 md:col-span-2">
                <Label htmlFor="profile_id">
                  対象会員
                </Label>
                <Box asChild className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                  <select
                    id="profile_id"
                    name="profile_id"
                    required
                  >
                    <option value="">選択してください</option>
                    {profiles?.map(profile => (
                      <option key={profile.id} value={profile.id}>{profile.full_name} ({profile.email})</option>
                    ))}
                  </select>
                </Box>
              </Stack>

              <Stack className="gap-2">
                <Label htmlFor="start_date">
                  任期開始日
                </Label>
                <Input
                  type="date"
                  name="start_date"
                  id="start_date"
                  defaultValue="2025-04-01"
                />
              </Stack>

              <Stack className="gap-2">
                <Label htmlFor="end_date">
                  任期終了日
                </Label>
                <Input
                  type="date"
                  name="end_date"
                  id="end_date"
                  defaultValue="2026-03-31"
                />
              </Stack>
            </Box>

            <HStack className="justify-end gap-3 pt-6 border-t border-border mt-2">
              <Button variant="outline" asChild activeScale={true}>
                <Link href="/admin/officers">キャンセル</Link>
              </Button>
              <Button
                type="submit"
                className="gap-2 shadow-lg shadow-primary/20"
                activeScale={true}
              >
                <UserPlus size={18} />
                任命する
              </Button>
            </HStack>
          </Stack>
        </form>
      </CardContent>
    </Card>
  )
}
