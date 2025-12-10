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

export default function LoginPage() {
  async function handleLogin(formData: FormData) {
    "use server";

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/dashboard",
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Accedi ad AuctionAI</CardTitle>
        <CardDescription>
          Inserisci le tue credenziali per accedere
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="email@esempio.com"
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
            Accedi
          </Button>

          <p
            className="text-sm text-center 
  text-gray-600"
          >
            Non hai un account?{" "}
            <Link href="/register" className="text-blue-600 hover:underline">
              Registrati
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
