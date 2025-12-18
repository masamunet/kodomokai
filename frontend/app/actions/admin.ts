'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { calculateGrade } from '@/lib/grade-utils'
import { getTargetFiscalYear } from '@/lib/fiscal-year'

type ImportResult = {
  success: boolean
  createdCount: number
  failedCount: number
  logs: string[]
  gradeSummary?: Record<string, number>
}

const toHiragana = (str: string) => {
  return str.replace(/[\u30a1-\u30f6]/g, function (match) {
    var chr = match.charCodeAt(0) - 0x60;
    return String.fromCharCode(chr);
  });
}

const parseLine = (line: string) => {
  let parts = line.split(',').map(s => s.trim())
  if (parts.length === 1 && /\s/.test(line)) {
    parts = line.split(/\s+/).map(s => s.trim()).filter(Boolean)
  }
  return parts
}

export async function importUsers(csvContent: string): Promise<ImportResult> {
  const supabase = createAdminClient()
  const logs: string[] = []
  const lines = csvContent.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('#'))
  const createdUserIds: string[] = []

  console.log(`[importUsers] Starting import for ${lines.length} lines`)
  try {
    for (const [index, line] of lines.entries()) {
      const parts = parseLine(line)
      let email, password, lastName, firstName, lastNameKana, firstNameKana

      if (parts.length >= 6) {
        [email, password, lastName, firstName, lastNameKana, firstNameKana] = parts
      } else if (parts.length >= 4) {
        [email, password, lastName, firstName] = parts
        lastNameKana = ''
        firstNameKana = ''
      } else {
        throw new Error(`無効な形式です (行:${index + 1}): "${line}"`)
      }

      const finalLastNameKana = toHiragana(lastNameKana || '')
      const finalFirstNameKana = toHiragana(firstNameKana || '')

      // 1. Create User
      const { data: userData, error: userError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      })

      if (userError) {
        throw new Error(`ユーザー作成失敗 (${email}): ${userError.message}`)
      }
      if (!userData.user) {
        throw new Error(`ユーザー詳細が取得できませんでした (${email})`)
      }

      createdUserIds.push(userData.user.id)

      // 2. Create Profile
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
        throw new Error(`プロフィール作成失敗 (${email}): ${profileError.message}`)
      }

      logs.push(`[SUCCESS] Registered: ${email} (${lastName} ${firstName})`)
    }

    console.log(`[importUsers] Successfully completed all ${createdUserIds.length} creations.`)
    return {
      success: true,
      createdCount: createdUserIds.length,
      failedCount: 0,
      logs
    }

  } catch (err: any) {
    console.error(`[importUsers] Error occurred: ${err.message}. Rolling back ${createdUserIds.length} users.`)
    // ROLLBACK manually
    for (const userId of createdUserIds) {
      await supabase.auth.admin.deleteUser(userId)
    }

    return {
      success: false,
      createdCount: 0,
      failedCount: lines.length,
      logs: [`[FATAL ERROR] 処理を中断しロールバックしました: ${err.message}`, ...logs]
    }
  }
}

const normalizeDate = (dateStr: string) => {
  if (!dateStr) return null
  // 1. Remove Zenkaku spaces and normalize characters
  let str = dateStr.trim().replace(/　/g, ' ')

  // 2. Handle "YYYY年MM月DD日" format
  if (str.includes('年')) {
    str = str.replace(/年/g, '/').replace(/月/g, '/').replace(/日/g, '')
  }

  // 3. Spilt by delimiter (slash or space)
  const parts = str.split(/[\/\s-]/).filter(Boolean)
  if (parts.length === 3) {
    const y = parts[0]
    const m = parts[1].padStart(2, '0')
    const d = parts[2].padStart(2, '0')
    return `${y}-${m}-${d}`
  }

  // Fallback to native Date if possible
  const d = new Date(str)
  if (!isNaN(d.getTime())) {
    return d.toISOString().split('T')[0]
  }

  return null
}

const normalizeGender = (genderStr: string) => {
  if (!genderStr) return null
  const s = genderStr.trim().toLowerCase()
  if (s === 'male' || s === '男' || s === '男の子' || s === 'だんし' || s === '♂') return 'male'
  if (s === 'female' || s === '女' || s === '女の子' || s === 'じょし' || s === '♀') return 'female'
  if (s === 'other' || s === 'その他' || s === 'ほか') return 'other'
  return null
}

export async function importChildren(csvContent: string): Promise<ImportResult> {
  const supabase = createAdminClient()
  const logs: string[] = []
  const lines = csvContent.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('#'))
  const createdChildIds: string[] = []
  const gradeSummary: Record<string, number> = {}
  const targetFiscalYear = await getTargetFiscalYear()

  console.log(`[importChildren] Starting import for ${lines.length} lines. FiscalYear: ${targetFiscalYear}`)
  try {
    for (const [index, line] of lines.entries()) {
      const parts = parseLine(line)
      // parent_email, last_name, first_name, last_name_kana, first_name_kana, gender, birthday, allergies, notes
      if (parts.length < 5) {
        throw new Error(`無効な形式です (行:${index + 1}): "${line}"`)
      }

      const [parentEmail, lastName, firstName, lastNameKana, firstNameKana, gender, birthday, allergies, notes] = parts

      // 1. Find parent profile id
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', parentEmail)
        .eq('email', parentEmail)
        .single()

      if (profileError || !profile) {
        throw new Error(`保護者が見つかりません (${parentEmail})`)
      }

      // 2. Insert child
      const finalLastNameKana = toHiragana(lastNameKana || '')
      const finalFirstNameKana = toHiragana(firstNameKana || '')
      const finalBirthday = normalizeDate(birthday)

      const { data: childData, error: childError } = await supabase
        .from('children')
        .insert({
          parent_id: profile.id,
          last_name: lastName,
          first_name: firstName,
          last_name_kana: finalLastNameKana,
          first_name_kana: finalFirstNameKana,
          full_name: `${lastName} ${firstName}`,
          gender: normalizeGender(gender),
          birthday: finalBirthday,
          allergies: allergies || '',
          notes: notes || '',
        })
        .select()
        .single()

      if (childError) {
        throw new Error(`子供の登録に失敗しました (${lastName} ${firstName}): ${childError.message}`)
      }

      if (childData) {
        createdChildIds.push(childData.id)
        // 3. Count grade
        if (finalBirthday) {
          const grade = calculateGrade(finalBirthday, targetFiscalYear)
          gradeSummary[grade] = (gradeSummary[grade] || 0) + 1
        } else {
          gradeSummary['不明'] = (gradeSummary['不明'] || 0) + 1
        }
      }
      logs.push(`[SUCCESS] Registered: ${lastName} ${firstName} (Parent: ${parentEmail})`)
    }

    console.log(`[importChildren] Successfully completed all ${createdChildIds.length} creations.`)
    return {
      success: true,
      createdCount: createdChildIds.length,
      failedCount: 0,
      logs,
      gradeSummary
    }

  } catch (err: any) {
    console.error(`[importChildren] Error occurred: ${err.message}. Rolling back ${createdChildIds.length} records.`)
    // ROLLBACK manually
    for (const childId of createdChildIds) {
      await supabase.from('children').delete().eq('id', childId)
    }

    return {
      success: false,
      createdCount: 0,
      failedCount: lines.length,
      logs: [`[FATAL ERROR] 処理を中断しロールバックしました: ${err.message}`, ...logs]
    }
  }
}
