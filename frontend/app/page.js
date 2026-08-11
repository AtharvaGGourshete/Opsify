import { auth } from "@/auth";
import SignIn from "@/components/auth/sign-in";
import SignOut from "@/components/auth/sign-out";

export default async function Home() {
  const session = await auth();

  if (!session?.user) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <SignIn />
        </div>
      </main>
    );
  }

  console.log(session.user);

  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-xl rounded-xl border p-6 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-4">
          {session.user.image && (
            <img
              src={session.user.image}
              alt={session.user.name || "User"}
              className="h-16 w-16 rounded-full"
            />
          )}

          <div>
            <h1 className="text-xl font-semibold">{session.user.name}</h1>

            <p className="text-gray-500">{session.user.email}</p>
          </div>
        </div>

        <div>
          <SignOut />
        </div>
      </div>
    </main>
  );
}
