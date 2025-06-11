import { Metadata } from 'next'
import ResetForm from '@/components/auth/ResetForm'

export const metadata: Metadata = {
  title: 'Reset Password · BodyCount',
  description: 'Reset your BodyCount account password. Enter your email to receive a password reset link.',
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">
          <ResetForm />
        </div>
      </div>
    </div>
  )
}