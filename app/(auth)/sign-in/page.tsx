import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@server/auth/session";
import { SignInForm } from "./sign-in-form";

type SignInPageProps = {
  searchParams?: {
    next?: string | string[];
  };
};

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const nextParam = searchParams?.next;
  const nextPath = Array.isArray(nextParam)
    ? nextParam[0] || "/"
    : typeof nextParam === "string"
      ? nextParam
      : "/";
  const user = await getCurrentUser();
  if (user) {
    redirect(nextPath || "/");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-2xl space-y-8 p-4">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-semibold text-gray-900">Sign in</h1>
          <p className="text-sm text-gray-600">
            Access the back office. Don&apos;t have an account? Ask an admin.
          </p>
        </div>
        <SignInForm redirectTo={nextPath} />
        <div className="text-center text-sm text-gray-500">
          <Link href="/" className="hover:text-gray-700">
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
