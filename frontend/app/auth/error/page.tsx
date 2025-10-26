"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { AlertCircle, ArrowLeft, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function AuthErrorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [errorMessage, setErrorMessage] = useState<string>("An authentication error occurred");

  useEffect(() => {
    const error = searchParams.get("error");
    
    if (error) {
      switch (error) {
        case "Configuration":
          setErrorMessage("There is a problem with the server configuration.");
          break;
        case "AccessDenied":
          setErrorMessage("Access denied. You do not have permission to sign in.");
          break;
        case "Verification":
          setErrorMessage("The verification link is invalid or has expired.");
          break;
        case "OAuthSignin":
          setErrorMessage("Error in the OAuth sign-in process.");
          break;
        case "OAuthCallback":
          setErrorMessage("Error in the OAuth callback process.");
          break;
        case "OAuthCreateAccount":
          setErrorMessage("Could not create OAuth provider account.");
          break;
        case "EmailCreateAccount":
          setErrorMessage("Could not create email provider account.");
          break;
        case "Callback":
          setErrorMessage("Error in the OAuth callback handler.");
          break;
        case "OAuthAccountNotLinked":
          setErrorMessage("Email already in use with different provider.");
          break;
        case "EmailSignin":
          setErrorMessage("Error sending the verification email.");
          break;
        case "CredentialsSignin":
          setErrorMessage("Invalid email or password.");
          break;
        case "SessionRequired":
          setErrorMessage("Authentication required. Please sign in.");
          break;
        default:
          setErrorMessage("An unknown authentication error occurred.");
          break;
      }
    }
  }, [searchParams]);

  return (
    <main className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20" />

      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md mx-auto"
        >
          <Link href="/" className="flex items-center justify-center space-x-2 mb-8">
            <GraduationCap className="h-10 w-10 text-primary" />
            <span className="text-3xl font-bold font-[var(--font-space-grotesk)] text-gradient">
              REstart
            </span>
          </Link>

          <Card className="glassmorphic border-2 shadow-2xl">
            <CardContent className="p-8">
              <div className="flex flex-col items-center text-center mb-6">
                <div className="h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
                  <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
                </div>
                <h1 className="text-2xl font-bold mb-2 font-[var(--font-space-grotesk)]">
                  Authentication Error
                </h1>
                <p className="text-muted-foreground">
                  {errorMessage}
                </p>
              </div>

              <div className="space-y-4">
                <Button
                  onClick={() => router.push("/auth/signin")}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600"
                >
                  Try Again
                </Button>
                <Button variant="outline" className="w-full" onClick={() => router.push("/")}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </main>
  );
}
