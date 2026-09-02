import { Slot, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { AuthProvider, useAuth } from '../store/AuthContext';
import { AppDataProvider } from '../store/AppDataContext';
import { StatusBar } from 'expo-status-bar';

function RootGuard() {
  const { user } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    const inAuth = segments[0] === '(auth)';

    if (!user && !inAuth) {
      router.replace('/(auth)/login');
    } else if (user && inAuth) {
      if (user.role === 'patient') router.replace('/(patient)/dashboard');
      else if (user.role === 'doctor') router.replace('/(doctor)/dashboard');
      else router.replace('/(admin)/dashboard');
    }
  }, [user, segments]);

  return <Slot />;
}

export default function RootLayout() {
  return (
    <AppDataProvider>
      <AuthProvider>
        <StatusBar style="light" />
        <RootGuard />
      </AuthProvider>
    </AppDataProvider>
  );
}
