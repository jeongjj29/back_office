import Link from "next/link";
import { SignInForm } from "./sign-in-form";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-2xl space-y-8 p-4">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-semibold text-gray-900">Sign in</h1>
          <p className="text-sm text-gray-600">
            Access the back office. Don't have an account? Ask an admin.
          </p>
        </div>
        <SignInForm />
        <div className="text-center text-sm text-gray-500">
          <Link href="/" className="hover:text-gray-700">
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
