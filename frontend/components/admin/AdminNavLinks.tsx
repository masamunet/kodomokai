"use client"

import Link from 'next/link'
import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Settings, FileText, ScrollText, Upload, ChevronDown } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

export default function AdminNavLinks() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [position, setPosition] = useState({ top: 0, left: 0 })

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node) &&
        !(event.target as Element).closest('.admin-nav-dropdown')
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    window.addEventListener("resize", () => setIsOpen(false))
    window.addEventListener("scroll", () => setIsOpen(false), true)

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      window.removeEventListener("resize", () => setIsOpen(false))
      window.removeEventListener("scroll", () => setIsOpen(false), true)
    }
  }, [])

  const handleToggle = () => {
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      // Position dropdown 
      // Right aligned to the button
      const width = 192 // w-48 is 12rem = 192px

      // Check if it fits on the right, otherwise align right edge

      setPosition({
        top: rect.bottom + 8,
        left: rect.right - width
      })
    }
    setIsOpen(!isOpen)
  }

  const isActive = (path: string) => pathname?.startsWith(path)

  return (
    <>
      <Link
        href="/admin/events"
        className={cn(
          "px-3 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap",
          isActive('/admin/events') && !isActive('/admin/events/annual')
            ? "text-foreground bg-muted"
            : "text-muted-foreground hover:text-foreground hover:bg-muted"
        )}
      >
        イベント
      </Link>
      <Link
        href="/admin/members"
        className={cn(
          "px-3 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap",
          isActive('/admin/members')
            ? "text-foreground bg-muted"
            : "text-muted-foreground hover:text-foreground hover:bg-muted"
        )}
      >
        名簿
      </Link>

      <div className="h-5 w-px bg-border mx-2 shrink-0" />

      <Link
        href="/admin/roles"
        className={cn(
          "px-3 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap",
          isActive('/admin/roles')
            ? "text-foreground bg-muted"
            : "text-muted-foreground hover:text-foreground hover:bg-muted"
        )}
      >
        役職
      </Link>
      <Link
        href="/admin/officers"
        className={cn(
          "px-3 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap",
          isActive('/admin/officers')
            ? "text-foreground bg-muted"
            : "text-muted-foreground hover:text-foreground hover:bg-muted"
        )}
      >
        任命
      </Link>
      <Link
        href="/admin/accounting"
        className={cn(
          "px-3 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap",
          isActive('/admin/accounting')
            ? "text-foreground bg-muted"
            : "text-muted-foreground hover:text-foreground hover:bg-muted"
        )}
      >
        会計
      </Link>
      <Link
        href="/admin/notifications"
        className={cn(
          "px-3 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap",
          isActive('/admin/notifications')
            ? "text-foreground bg-muted"
            : "text-muted-foreground hover:text-foreground hover:bg-muted"
        )}
      >
        配信
      </Link>

      <div className="relative ml-2">
        <button
          ref={buttonRef}
          onClick={handleToggle}
          className={cn(
            "flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap",
            isOpen || isActive('/admin/settings') || isActive('/admin/constitution') || isActive('/admin/templates') || isActive('/admin/users/import')
              ? "text-foreground bg-muted"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          )}
        >
          <Settings className="h-4 w-4" />
          <span>設定</span>
          <ChevronDown className="h-3 w-3 opacity-50" />
        </button>

        {isOpen && typeof document !== 'undefined' && createPortal(
          <div
            className="admin-nav-dropdown fixed w-48 rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-[100]"
            style={{
              top: position.top,
              left: position.left
            }}
          >
            <Link
              href="/admin/settings"
              className="group flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={() => setIsOpen(false)}
            >
              <Settings className="mr-3 h-4 w-4 text-gray-400 group-hover:text-gray-500" />
              設定
            </Link>
            <Link
              href="/admin/constitution"
              className="group flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={() => setIsOpen(false)}
            >
              <FileText className="mr-3 h-4 w-4 text-gray-400 group-hover:text-gray-500" />
              規約
            </Link>
            <Link
              href="/admin/templates"
              className="group flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={() => setIsOpen(false)}
            >
              <ScrollText className="mr-3 h-4 w-4 text-gray-400 group-hover:text-gray-500" />
              テンプレート
            </Link>
            <Link
              href="/admin/users/import"
              className="group flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={() => setIsOpen(false)}
            >
              <Upload className="mr-3 h-4 w-4 text-gray-400 group-hover:text-gray-500" />
              一括登録
            </Link>
          </div>,
          document.body
        )}
      </div>
    </>
  )
}
