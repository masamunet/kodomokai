import { Box } from "@/ui/layout/Box"
import AuthForm from "@/app/login/AuthForm"

interface LoginScreenProps {
  orgName: string
}

export function LoginScreen({ orgName }: LoginScreenProps) {
  return (
    <Box className="flex h-screen w-full items-center justify-center bg-gray-50">
      <AuthForm orgName={orgName} />
    </Box>
  )
}
