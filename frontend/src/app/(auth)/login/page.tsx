import { signIn } from "@/auth";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  async function handleLogin(formData: FormData) {
    "use server";

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      await signIn("credentials", {
        email,
        password,
        redirectTo: "/dashboard",
      });
    } catch (error) {
      if (error instanceof Error && error.message === "NEXT_REDIRECT") {
        throw error;
      }
      redirect("/login?error=credentials");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Welcome to BidWars</CardTitle>
        <CardDescription>
          Sign in to start bidding
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={handleLogin} className="space-y-4">
          {params.error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              Invalid email or password
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="email@example.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
            />
          </div>

          <Button type="submit" className="w-full">
            Sign In
          </Button>

          <p className="text-sm text-center text-gray-600">
            Don't have an account?{" "}
            <Link href="/register" className="text-blue-600 hover:underline">
              Sign Up
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
