import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AccountPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl">Account Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-zinc-600">
            Account settings page - coming soon
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
