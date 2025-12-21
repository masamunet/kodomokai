'use client';

import { useMemo } from 'react'
import { Box } from '@/ui/layout/Box'
import { Stack, HStack } from '@/ui/layout/Stack'
import { Text } from '@/ui/primitives/Text'
import { Heading } from '@/ui/primitives/Heading'
import { ClickableListItem } from '@/components/admin/patterns/ClickableListItem'

interface OfficerListProps {
  assignments: any[]
  titleYear: string
}

export default function OfficerList({ assignments, titleYear }: OfficerListProps) {
  const officerCount = useMemo(() => {
    return new Set((assignments || []).map((a: any) => a.profile_id)).size
  }, [assignments])

  return (
    <Stack className="gap-6">
      {/* Stats */}
      <Box className="bg-muted/30 p-6 rounded-lg border border-border">
        <Heading size="h3" className="text-lg font-bold text-foreground mb-4">概要</Heading>
        <HStack className="gap-8">
          <Box>
            <Text className="text-sm text-muted-foreground block mb-1">対象年度</Text>
            <Text weight="bold" className="text-lg text-foreground">{titleYear}度</Text>
          </Box>
          <Box>
            <Text className="text-sm text-muted-foreground block mb-1">役員総数</Text>
            <Text weight="bold" className="text-lg text-foreground">{officerCount}名</Text>
          </Box>
        </HStack>
      </Box>

      <Box>
        <Stack className="gap-3">
          {(assignments || []).length === 0 ? (
            <Box className="p-12 text-center text-muted-foreground bg-muted/10 border border-dashed border-border rounded-lg">
              任命された役員はいません
            </Box>
          ) : (
            (assignments || []).map((assignment: any) => (
              <ClickableListItem
                key={assignment.id}
                href={`/admin/users/${assignment.profile_id}?view=officer`}
              >
                <Box className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <Box className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                    {/* Role */}
                    <Box className="sm:w-40 shrink-0">
                      <Text weight="bold" className="text-lg text-foreground block">
                        {assignment.role?.name}
                      </Text>
                    </Box>

                    {/* Profile Information */}
                    <Box>
                      <HStack className="items-baseline gap-2 mb-1">
                        <Text weight="semibold" className="text-primary">
                          {assignment.profile.full_name}
                        </Text>
                        <Text className="text-xs text-muted-foreground">
                          ({assignment.profile.last_name_kana} {assignment.profile.first_name_kana})
                        </Text>
                      </HStack>
                      <HStack className="text-xs text-muted-foreground gap-4 flex-wrap">
                        <Text>{assignment.profile.email}</Text>
                        <Text>任期: {assignment.start_date} 〜 {assignment.end_date}</Text>
                      </HStack>
                    </Box>
                  </Box>

                  {/* Visual Indicator */}
                  <Box className="hidden sm:block">
                    <Text className="text-primary opacity-0 group-hover:opacity-100 transition-opacity font-medium text-sm">
                      詳細を見る →
                    </Text>
                  </Box>
                </Box>
              </ClickableListItem>
            ))
          )}
        </Stack>
      </Box>
    </Stack>
  )
}
