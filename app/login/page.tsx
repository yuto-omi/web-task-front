import { Toaster } from 'react-hot-toast';
import { LoginForm } from '@/features/auth/components/login-form';

export default function LoginPage() {
  return (
    <>
      <Toaster position="top-center" />
      <LoginForm />
    </>
  );
}
