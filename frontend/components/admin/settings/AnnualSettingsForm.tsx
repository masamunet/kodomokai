'use client'

import { useState, useEffect } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { updateAnnualSettings } from '@/app/admin/actions/annual_settings'
import { Button } from '@/ui/primitives/Button'
import { Input } from '@/ui/primitives/Input'
import { Box } from '@/ui/layout/Box'
import { Stack, HStack } from '@/ui/layout/Stack'
import { Text } from '@/ui/primitives/Text'

type Props = {
  fiscalYear: number
  initialInvitationCode: string
}

export default function AnnualSettingsForm({ fiscalYear, initialInvitationCode }: Props) {
  const [invitationCode, setInvitationCode] = useState(initialInvitationCode)
  const [message, setMessage] = useState<string | null>(null)
  const [baseUrl, setBaseUrl] = useState('')

  useEffect(() => {
    // get origin for testing locally or in production
    const timer = setTimeout(() => {
      setBaseUrl(window.location.origin)
    }, 0)
    return () => clearTimeout(timer)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)

    if (!invitationCode || invitationCode.length < 4) {
      setMessage('招待コードは4文字以上で設定してください')
      return
    }

    const result = await updateAnnualSettings(fiscalYear, invitationCode)

    if (result?.success) {
      setMessage(result.message)
      setTimeout(() => setMessage(null), 3000)
    } else {
      setMessage(result?.message || 'エラーが発生しました')
    }
  }

  const registerUrl = `${baseUrl}/register${invitationCode ? `?code=${invitationCode}` : ''}`

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 shadow sm:rounded-md">
      {message && (
        <Box className={`border px-4 py-3 rounded ${message.includes('失敗') || message.includes('エラー') ? 'bg-destructive/10 border-destructive-400 text-destructive' : 'bg-primary/10 border-primary-400 text-primary-700'}`}>
          {message}
        </Box>
      )}

      <Stack className="gap-6 md:flex-row md:items-start md:justify-between">
        <Stack className="gap-4 flex-1">
          <Box>
            <label htmlFor="invitation_code" className="block text-sm font-bold leading-6 text-foreground">
              招待コード（登録用パスワード）
            </label>
            <Text className="text-xs text-muted-foreground mb-2">会員登録画面での認証に使用されます。英数字で設定してください。</Text>
            <Box className="mt-2 max-w-sm">
              <Input
                type="text"
                name="invitation_code"
                id="invitation_code"
                value={invitationCode}
                onChange={(e) => setInvitationCode(e.target.value)}
                required
                placeholder="例: kodomo2025"
                className="font-mono"
              />
            </Box>
          </Box>
          <Box>
            <Button type="submit" className="w-fit">
              招待コードを保存する
            </Button>
          </Box>
        </Stack>

        <Box className="p-6 bg-muted/30 rounded-lg flex flex-col items-center gap-4 min-w-[280px]">
          <Text weight="bold" className="text-sm">登録用QRコード</Text>
          {invitationCode ? (
            <>
              <Box className="p-2 bg-white rounded-md shadow-sm" id="qr-code-container">
                <QRCodeSVG
                  value={registerUrl}
                  size={160}
                  level="Q"
                  includeMargin={false}
                />
              </Box>

              <Button
                variant="outline"
                size="sm"
                type="button"
                className="w-full text-xs"
                onClick={() => {
                  const svg = document.getElementById('qr-code-container')?.querySelector('svg');
                  if (!svg) return;
                  const svgData = new XMLSerializer().serializeToString(svg);
                  const canvas = document.createElement('canvas');
                  const ctx = canvas.getContext('styled-components');
                  const img = new Image();
                  img.onload = () => {
                    // Need actual context to draw, simple SVG download is safer for now.
                    // But let's just trigger SVG download.
                  };
                  // Better approach: Download SVG directly
                  const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = `kodomokai-register-qr-${fiscalYear}.svg`;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
              >
                QRコードをダウンロード (SVG)
              </Button>

              <Box className="w-full mt-2">
                <Text className="text-xs text-muted-foreground mb-1 text-left">登録用URL:</Text>
                <HStack className="gap-2 items-center">
                  <Input
                    readOnly
                    value={registerUrl}
                    className="h-8 text-xs font-mono"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    type="button"
                    className="h-8 px-3"
                    onClick={() => {
                      navigator.clipboard.writeText(registerUrl);
                      alert('URLをコピーしました');
                    }}
                  >
                    コピー
                  </Button>
                </HStack>
              </Box>
            </>
          ) : (
            <Text className="text-sm text-muted-foreground text-center py-8">
              招待コードを設定すると<br />QRコードが表示されます
            </Text>
          )}
        </Box>
      </Stack>
    </form>
  )
}
