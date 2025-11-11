import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl">User Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-zinc-600">
            Profile page for user: {id}
          </p>
          <p className="text-sm text-zinc-500 mt-2">
            Coming soon
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
