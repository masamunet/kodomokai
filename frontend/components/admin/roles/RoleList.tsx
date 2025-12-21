'use client'

import React, { useState } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { updateRoleOrder, toggleRoleVisibility } from '@/app/admin/actions/officer'
import { Box } from '@/ui/layout/Box'
import { Stack, HStack } from '@/ui/layout/Stack'
import { Text } from '@/ui/primitives/Text'
import { Button } from '@/ui/primitives/Button'
import { ClickableListItem } from '@/components/admin/patterns/ClickableListItem'
import { GripVertical, Eye, EyeOff, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

type Role = {
  id: string
  name: string
  description?: string | null
  display_order: number | null
  created_at: string
  is_visible_in_docs: boolean | null
}

type Props = {
  initialRoles: Role[]
}

export function RoleList({ initialRoles }: Props) {
  const [roles, setRoles] = useState(initialRoles)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = roles.findIndex((item) => item.id === active.id)
      const newIndex = roles.findIndex((item) => item.id === over.id)
      const newRoles = arrayMove(roles, oldIndex, newIndex)

      setRoles(newRoles)

      const updates = newRoles.map((role, index) => ({
        id: role.id,
        display_order: index + 1,
      }))

      try {
        await updateRoleOrder(updates)
      } catch (err) {
        console.error('Failed to update order', err)
      }
    }
  }

  const handleToggleVisibility = async (id: string, current: boolean) => {
    setRoles((prev) =>
      prev.map((role) =>
        role.id === id ? { ...role, is_visible_in_docs: !current } : role
      )
    )

    const result = await toggleRoleVisibility(id, !current)
    if (!result.success) {
      setRoles((prev) =>
        prev.map((role) =>
          role.id === id ? { ...role, is_visible_in_docs: current } : role
        )
      )
      alert(result.message)
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={roles.map(r => r.id)} strategy={verticalListSortingStrategy}>
        <Box className="bg-background shadow-sm border border-border sm:rounded-lg overflow-hidden">
          <ul role="list" className="divide-y divide-border">
            {roles.length === 0 ? (
              <Box className="p-12 text-center bg-muted/10">
                <Text className="text-muted-foreground">登録された役職はありません</Text>
              </Box>
            ) : (
              roles.map((role) => (
                <SortableRoleItem
                  key={role.id}
                  role={role}
                  onToggleVisibility={handleToggleVisibility}
                />
              ))
            )}
          </ul>
        </Box>
      </SortableContext>
    </DndContext>
  )
}

function SortableRoleItem({
  role,
  onToggleVisibility,
}: {
  role: Role
  onToggleVisibility: (id: string, current: boolean) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: role.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 20 : 'auto',
    position: isDragging ? 'relative' : 'static',
  } as React.CSSProperties

  const isVisible = role.is_visible_in_docs ?? true

  return (
    <li ref={setNodeRef} style={style} className={cn("list-none", isDragging && "shadow-xl ring-2 ring-primary/20 rounded-md z-50")}>
      <ClickableListItem
        href={`/admin/roles/${role.id}`}
        className={cn(
          "relative border-none",
          isDragging ? "bg-accent" : "bg-card"
        )}
      >
        <HStack className="items-center justify-between w-full">
          <HStack className="items-center gap-4 flex-1">
            {/* Drag Handle */}
            <Box
              className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground p-2 touch-none animate-in fade-in zoom-in-50"
              {...attributes}
              {...listeners}
            >
              <GripVertical size={20} />
            </Box>

            <Stack className="gap-0.5 flex-1">
              <HStack className="items-center gap-2">
                <Text weight="bold" className="text-primary group-hover:underline">
                  {role.name}
                </Text>
                {!isVisible && (
                  <Box className="px-1.5 py-0.5 rounded bg-muted text-[10px] font-bold text-muted-foreground uppercase">
                    非表示
                  </Box>
                )}
              </HStack>
              {role.description && (
                <Text className="text-xs text-muted-foreground line-clamp-1">{role.description}</Text>
              )}
            </Stack>
          </HStack>

          <HStack className="items-center gap-4">
            <Box className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  onToggleVisibility(role.id, isVisible)
                }}
                className={cn(
                  "h-8 gap-1.5 text-xs font-bold transition-all",
                  isVisible ? "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50" : "text-muted-foreground hover:bg-muted"
                )}
              >
                {isVisible ? <Eye size={14} /> : <EyeOff size={14} />}
                <span className="hidden sm:inline">{isVisible ? "資料表示中" : "資料非表示"}</span>
              </Button>
            </Box>

            <Box className="text-muted-foreground group-hover:text-foreground transition-all group-hover:translate-x-0.5">
              <ChevronRight size={18} />
            </Box>
          </HStack>
        </HStack>
      </ClickableListItem>
    </li>
  )
}
