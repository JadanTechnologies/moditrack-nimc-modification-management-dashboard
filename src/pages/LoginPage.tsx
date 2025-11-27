import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldCheck } from 'lucide-react';
export function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore(state => state.login);
  const handleLogin = (role: 'Admin' | 'Staff') => {
    login(role);
    navigate('/');
  };
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-6">
          <div className="bg-primary p-4 rounded-full">
            <ShieldCheck className="h-10 w-10 text-primary-foreground" />
          </div>
        </div>
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold tracking-tight">ModiTrack</CardTitle>
            <CardDescription>NIMC Modification Management Dashboard</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center text-sm text-muted-foreground">
              Please select your role to sign in.
            </p>
            <div className="flex flex-col space-y-2">
              <Button size="lg" onClick={() => handleLogin('Admin')}>
                Login as Admin
              </Button>
              <Button size="lg" variant="secondary" onClick={() => handleLogin('Staff')}>
                Login as Staff
              </Button>
            </div>
          </CardContent>
        </Card>
        <p className="text-center text-xs text-muted-foreground mt-6">
          Powered by National identity management Commission
        </p>
      </div>
    </div>
  );
}