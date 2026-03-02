import { EventAddScreen } from '@/components/screens/admin/events/EventAddScreen'
import { getTargetFiscalYear } from '@/lib/fiscal-year'

export default async function NewEventPage() {
  const targetFiscalYear = await getTargetFiscalYear()
  return <EventAddScreen targetFiscalYear={targetFiscalYear} />
}
