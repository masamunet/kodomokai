
'use client'

import { useState } from 'react'

type Template = {
  id: string
  name: string
  subject: string
  body: string
}

export default function TemplateSelector({
  templates,
  sendAction,
}: {
  templates: Template[]
  sendAction: (formData: FormData) => void
}) {
  const [selectedTemplateId, setSelectedTemplateId] = useState('')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')

  const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const templateId = e.target.value
    setSelectedTemplateId(templateId)

    if (templateId) {
      const template = templates.find((t) => t.id === templateId)
      if (template) {
        setSubject(template.subject)
        setBody(template.body)
      }
    }
  }

  return (
    <form action={sendAction} className="space-y-6 bg-white p-6 shadow sm:rounded-md">
      <div>
        <label htmlFor="template" className="block text-sm font-medium leading-6 text-gray-900">
          テンプレートから選択
        </label>
        <div className="mt-2">
          <select
            id="template"
            name="template_id"
            className="block w-full rounded-md border-0 py-1.5 p-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            value={selectedTemplateId}
            onChange={handleTemplateChange}
          >
            <option value="">テンプレートを選択しない</option>
            {templates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="subject" className="block text-sm font-medium leading-6 text-gray-900">
          件名
        </label>
        <div className="mt-2">
          <input
            type="text"
            name="subject"
            id="subject"
            required
            className="block w-full rounded-md border-0 py-1.5 p-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
        </div>
      </div>

      <div>
        <label htmlFor="body" className="block text-sm font-medium leading-6 text-gray-900">
          本文
        </label>
        <div className="mt-2">
          <textarea
            id="body"
            name="body"
            rows={10}
            required
            className="block w-full rounded-md border-0 py-1.5 p-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button
          type="submit"
          className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          配信する
        </button>
      </div>
    </form>
  )
}
