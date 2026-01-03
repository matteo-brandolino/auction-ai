import { signIn } from "@/auth";
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
import { apiClient } from "@/lib/api-client";

export default function RegisterPage() {
  async function handleRegister(formData: FormData) {
    "use server";

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const name = formData.get("name") as string;

    try {
      await apiClient.register({ email, password, name });
    } catch (error) {
      console.error("Registration failed:", error);
      return;
    }

    await signIn("credentials", {
      email,
      password,
      redirectTo: "/dashboard",
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Registrati ad AuctionAI</CardTitle>
        <CardDescription>
          Crea un account per iniziare ad analizzare immobili all'asta
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={handleRegister} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome completo</Label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="Mario Rossi"
              required
            />
          </div>

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
              minLength={8}
              required
            />
          </div>

          <Button type="submit" className="w-full">
            Registrati
          </Button>

          <p
            className="text-sm text-center 
  text-gray-600"
          >
            Hai già un account?{" "}
            <Link
              href="/login"
              className="text-blue-600 
  hover:underline"
            >
              Accedi
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
