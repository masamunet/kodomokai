import ChildForm from './ChildForm'

export default function NewChildPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="mx-auto max-w-2xl bg-white shadow sm:rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-6">お子様の追加</h2>
        <ChildForm />
      </div >
    </div >
  )
}
