'use client'

import React, { useState } from 'react'
import Link from 'next/link'
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
  const [isUpdating, setIsUpdating] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      // Calculate new order based on current 'roles' state
      const oldIndex = roles.findIndex((item) => item.id === active.id)
      const newIndex = roles.findIndex((item) => item.id === over.id)
      const newRoles = arrayMove(roles, oldIndex, newIndex)

      // Optimistically update UI
      setRoles(newRoles)

      // Calculate and update display_order for all affected items
      // We re-assign display_order based on index
      const updates = newRoles.map((role, index) => ({
        id: role.id,
        display_order: index + 1,
      }))

      // Call server action to update order
      try {
        await updateRoleOrder(updates)
      } catch (err) {
        console.error('Failed to update order', err)
        // If failed, we should probably revert the state, but for now just log it.
        // To revert, we would need to setRoles(roles) (the old state).
      }
    }
  }

  const handleToggleVisibility = async (id: string, current: boolean) => {
    // Optimistic update
    setRoles((prev) =>
      prev.map((role) =>
        role.id === id ? { ...role, is_visible_in_docs: !current } : role
      )
    )

    const result = await toggleRoleVisibility(id, !current)
    if (!result.success) {
      // Revert
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
        <div className="overflow-hidden bg-white shadow sm:rounded-md">
          <ul role="list" className="divide-y divide-gray-200">
            {roles.length === 0 ? (
              <li className="px-4 py-4 sm:px-6 text-gray-500 text-center">
                登録された役職はありません
              </li>
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
        </div>
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
    zIndex: isDragging ? 10 : 'auto',
    position: isDragging ? 'relative' : 'static',
  } as React.CSSProperties

  return (
    <li ref={setNodeRef} style={style} className="bg-white">
      <div className="flex items-center justify-between px-4 py-4 sm:px-6 hover:bg-gray-50">
        <div className="flex items-center gap-4 flex-1">
          {/* Drag Handle */}
          <button
            type="button"
            className="cursor-move text-gray-400 hover:text-gray-600 p-2 touch-none"
            {...attributes}
            {...listeners}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="8" y1="6" x2="21" y2="6"></line>
              <line x1="8" y1="12" x2="21" y2="12"></line>
              <line x1="8" y1="18" x2="21" y2="18"></line>
              <line x1="3" y1="6" x2="3.01" y2="6"></line>
              <line x1="3" y1="12" x2="3.01" y2="12"></line>
              <line x1="3" y1="18" x2="3.01" y2="18"></line>
            </svg>
          </button>

          <Link href={`/admin/roles/${role.id}`} className="flex-1 block">
            <div className="flex items-center gap-2">
              <p className="truncate text-sm font-medium text-indigo-600">
                {role.name}
              </p>
            </div>
            {role.description && (
              <p className="mt-1 text-sm text-gray-500">{role.description}</p>
            )}
          </Link>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <label htmlFor={`visible-${role.id}`} className="text-sm text-gray-500 cursor-pointer select-none">
              資料表示
            </label>
            <input
              id={`visible-${role.id}`}
              type="checkbox"
              checked={role.is_visible_in_docs ?? true}
              onChange={() => onToggleVisibility(role.id, role.is_visible_in_docs ?? true)}
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
            />
          </div>

          <Link href={`/admin/roles/${role.id}`} className="text-gray-400 hover:text-gray-600">
            &rarr;
          </Link>
        </div>
      </div>
    </li>
  )
}
