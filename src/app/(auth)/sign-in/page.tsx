"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../../_components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../_components/ui/card";
import { Input } from "../../_components/ui/input";
import { Label } from "../../_components/ui/label";
import { Separator } from "../../_components/ui/separator";
import { signIn } from "../actions";
import { IconMail, IconLock } from "@tabler/icons-react";

export default function SignIn() {
  const [error, setError] = useState<string>();
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const res = await signIn(formData);
    if (res && 'error' in res) {
      setError(res.error);
    } else if (res && 'redirect' in res) {
      router.push(res.redirect);
    }
  };

  return (
    <div className="w-full max-w-md">
      <Card className="border-border/40 shadow-lg">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl font-bold text-center">Welcome Back</CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <Separator className="opacity-40" />
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-destructive-foreground bg-destructive/10 rounded-md">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium">
                Email Address
              </Label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <IconMail size={20} />
                </div>
                <Input
                  id="username"
                  name="username"
                  type="email"
                  placeholder="you@example.com"
                  required
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <IconLock size={20} />
                </div>
                <Input
                  id="password"
                  type="password"
                  name="password"
                  required
                  className="pl-10"
                />
              </div>
            </div>
            <Button type="submit" className="w-full">
              Sign In
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
