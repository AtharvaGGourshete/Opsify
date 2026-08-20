import { auth } from "@/auth";
import SignIn from "@/components/auth/sign-in";

export default async function Home() {
  const session = await auth();

  if (!session?.user) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <SignIn />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-8 bg-white text-black">
      <div className="mx-auto max-w-3xl space-y-8">
        {/* User Card */}
        {/* <div className="flex items-center justify-between rounded-xl border p-6 shadow-sm">
          <div className="flex items-center gap-4">
            {session.user.image && (
              <img
                src={session.user.image}
                alt={session.user.name || "User"}
                className="h-16 w-16 rounded-full"
              />
            )}

            <div>
              <h1 className="text-xl font-semibold">
                {session.user.name}
              </h1>

              <p className="text-sm text-gray-500">
                {session.user.email}
              </p>

              <p className="mt-1 text-sm">
                <span className="font-medium">GitHub ID:</span>{" "}
                {session.user.githubId}
              </p>
            </div>
          </div>

          <SignOut />
        </div> */}
      </div>
    </main>
  );
}