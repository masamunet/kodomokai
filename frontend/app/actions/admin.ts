'use server'

import { createAdminClient } from '@/lib/supabase/admin'

type ImportResult = {
  success: boolean
  createdCount: number
  failedCount: number
  logs: string[]
}

export async function importUsers(csvContent: string): Promise<ImportResult> {
  const supabase = createAdminClient()
  const logs: string[] = []
  let createdCount = 0
  let failedCount = 0

  // 1. Parse CSV
  const lines = csvContent.split('\n').map(l => l.trim()).filter(l => l)

  for (const line of lines) {
    // Skip comments or empty
    if (line.startsWith('#') || !line) continue

    // Expected format: email,password,last_name,first_name,last_name_kana,first_name_kana
    let parts = line.split(',').map(s => s.trim())

    // Fallback: If no commas found (length 1), try splitting by whitespace (space or tab)
    // and ensure we actually have separators
    if (parts.length === 1 && /\s/.test(line)) {
      parts = line.split(/\s+/).map(s => s.trim()).filter(Boolean)
    }

    // Support both 4 and 6 columns for backward compatibility
    // If 4 cols: assume no kana provided
    // If 6 cols: extract kana
    let email, password, lastName, firstName, lastNameKana, firstNameKana

    if (parts.length >= 6) {
      [email, password, lastName, firstName, lastNameKana, firstNameKana] = parts
    } else if (parts.length >= 4) {
      [email, password, lastName, firstName] = parts
      lastNameKana = ''
      firstNameKana = ''
    } else {
      logs.push(`[SKIP] Invalid format: "${line}" (detected ${parts.length} columns). Usage: email,password,last_name,first_name,last_name_kana,first_name_kana`)
      failedCount++
      continue
    }

    if (!email || !password || !lastName || !firstName) {
      logs.push(`[SKIP] Missing required fields: "${line}"`)
      failedCount++
      continue
    }

    // Convert keys to Hiragana
    const toHiragana = (str: string) => {
      return str.replace(/[\u30a1-\u30f6]/g, function (match) {
        var chr = match.charCodeAt(0) - 0x60;
        return String.fromCharCode(chr);
      });
    }

    const finalLastNameKana = toHiragana(lastNameKana || '')
    const finalFirstNameKana = toHiragana(firstNameKana || '')

    try {
      // 2. Create User
      const { data: userData, error: userError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // Auto confirm
        user_metadata: {
          // Store minimal metadata if needed
        }
      })

      if (userError) {
        logs.push(`[ERROR] Failed to create user ${email}: ${userError.message}`)
        failedCount++
        continue
      }

      if (!userData.user) {
        logs.push(`[ERROR] User creation returned no data for ${email}`)
        failedCount++
        continue
      }

      // 3. Create Profile
      // user.id is available now
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: userData.user.id,
          email: email,
          last_name: lastName,
          first_name: firstName,
          last_name_kana: finalLastNameKana,
          first_name_kana: finalFirstNameKana,
          full_name: `${lastName} ${firstName}`,
          updated_at: new Date().toISOString(),
        })

      if (profileError) {
        logs.push(`[WARNING] User ${email} created but Profile failed: ${profileError.message}`)
        // We consider this a "success" in terms of account creation, but log warning
        createdCount++
      } else {
        logs.push(`[SUCCESS] Created ${email} (${lastName} ${firstName})`)
        createdCount++
      }


    } catch (e: any) {
      logs.push(`[ERROR] Exception for ${email}: ${e.message}`)
      failedCount++
    }
  }

  return {
    success: true,
    createdCount,
    failedCount,
    logs
  }
}
