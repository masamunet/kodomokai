'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function toggleMaterialDistribution(
  fiscalYear: number,
  materialType: string,
  currentStatus: boolean
) {
  const supabase = await createClient()

  // Upsert the status
  const { error } = await supabase
    .from('general_assembly_materials')
    .upsert(
      {
        fiscal_year: fiscalYear,
        material_type: materialType,
        is_distributed: !currentStatus,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: 'fiscal_year, material_type',
      }
    )

  if (error) {
    console.error('Error toggling material distribution:', JSON.stringify(error, null, 2))
    throw new Error(`Failed to update distribution status: ${error.message}`)
  }

  revalidatePath('/admin/general-assembly')
}

export async function getDistributedMaterials(fiscalYear: number) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('general_assembly_materials')
    .select('material_type, is_distributed')
    .eq('fiscal_year', fiscalYear)

  if (error) {
    console.error('Error fetching distributed materials:', JSON.stringify(error, null, 2))
    return []
  }

  return data || []
}
