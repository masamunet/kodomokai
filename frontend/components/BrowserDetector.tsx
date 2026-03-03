'use client'

import { useEffect, useState } from 'react'
import { AlertCircle, ExternalLink } from 'lucide-react'
import { Box } from '@/ui/layout/Box'
import { Stack, HStack } from '@/ui/layout/Stack'
import { Heading } from '@/ui/primitives/Heading'
import { Text } from '@/ui/primitives/Text'
import { Button } from '@/ui/primitives/Button'

export function BrowserDetector() {
  const [isInAppBrowser, setIsInAppBrowser] = useState(false)
  const [os, setOs] = useState<'ios' | 'android' | 'other'>('other')
  const [currentUrl, setCurrentUrl] = useState('')

  useEffect(() => {
    setCurrentUrl(window.location.href)

    const ua = navigator.userAgent || navigator.vendor || (window as any).opera || ''

    // Detect OS
    if (/iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream) {
      setOs('ios')
    } else if (/android/i.test(ua)) {
      setOs('android')
    }

    // Detect In-App Browsers
    // LINE, Instagram, Facebook, Twitter, and other common ones
    const inAppBrowserRules = [
      'Line',           // LINE
      'Instagram',      // Instagram
      'FBAN', 'FBAV',   // Facebook
      'Twitter',        // Twitter
      'MicroMessenger'  // WeChat
    ]

    const isMatched = inAppBrowserRules.some(rule => new RegExp(rule, 'i').test(ua))

    // Additional check for iOS specifically: if it has Safari but no Version/ inside an app viewer context
    // Some in-app browsers do have "Safari" in UA but are not standard safari.
    const isIOSMobile = /iPhone|iPod/.test(ua)
    const isSafari = /Safari/i.test(ua) && !/Chrome/i.test(ua) && !/CriOS/i.test(ua)
    // If it's iOS and NOT Safari (and not Chrome on iOS, which is acceptable usually, but wait, do we want to force Safari?)
    // Actually, usually blocking LINE/Instagram is the main goal. 

    if (isMatched) {
      setIsInAppBrowser(true)
    }
  }, [])

  if (!isInAppBrowser) return null

  const getOpenButton = () => {
    if (os === 'ios') {
      // For iOS, the only reliable way to break out of *some* in-app browsers is to copy the link and prompt the user.
      // Alternatively, x-webkit-airplay or ftp urls work sometimes, but are hacky.
      // Usually, just guiding them to use "Open in Safari" from the app's menu is best.
      return (
        <Stack className="items-center mt-6 w-full">
          <Text className="text-sm font-bold text-slate-800 bg-slate-100 py-3 px-4 rounded-lg text-left w-full">
            1. 画面右上のメニュー（︙等）または共有ボタン（<ExternalLink size={14} className="inline mx-1" />）をタップ<br />
            2. 「デフォルトのブラウザで開く」または「Safariで開く」を選択
          </Text>
        </Stack>
      )
    } else if (os === 'android') {
      // For Android, intent:// URLs can often force Chrome to open.
      const urlWithoutScheme = currentUrl.replace(/^https?:\/\//, '')
      const intentUrl = `intent://${urlWithoutScheme}#Intent;scheme=https;package=com.android.chrome;end;`

      return (
        <Button
          asChild
          className="w-full mt-6 h-14 font-bold text-lg"
          activeScale={true}
        >
          <a href={intentUrl}>
            Chromeで開き直す
          </a>
        </Button>
      )
    }
    return null
  }

  return (
    <Box className="fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-center p-6 text-center shadow-2xl overflow-y-auto">
      <Box className="max-w-md w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
        <Box className="bg-amber-100 text-amber-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle size={40} />
        </Box>
        <Heading size="h1" className="text-2xl font-black text-slate-900 mb-4">
          標準ブラウザで<br />開いてください
        </Heading>
        <Text className="text-slate-600 mb-6 leading-relaxed">
          現在ご利用のアプリ（LINEやInstagramなど）のブラウザでは、ファイルのダウンロードやカメラ機能などが正常に動作しない場合があります。<br /><br />
          お手数ですが、<Text weight="bold" className="text-slate-900">Safari</Text>や<Text weight="bold" className="text-slate-900">Chrome</Text>などの標準ブラウザで開き直してください。
        </Text>

        {getOpenButton()}

        <Box className="mt-8 pt-6 border-t border-slate-200">
          <Text className="text-xs text-slate-400 mb-2">リンクをコピーしてブラウザに貼り付けることもできます</Text>
          <HStack className="items-center gap-2">
            <Box className="flex-1 bg-slate-50 border border-slate-200 p-2 text-xs text-slate-600 truncate rounded-md">
              {currentUrl}
            </Box>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(currentUrl)
                alert('リンクをコピーしました。SafariやChromeを開いて貼り付けてください。')
              }}
            >
              コピー
            </Button>
          </HStack>
        </Box>
      </Box>
    </Box>
  )
}
