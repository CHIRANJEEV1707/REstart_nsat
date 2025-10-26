"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, ArrowRight, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "react-hot-toast";
import { api } from "@/lib/api";
import { useAuthStore } from "@/lib/stores/auth";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AuthMode = "login" | "register" | "verify";

const emailSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

const otpSchema = z.object({
  otp: z.string().length(6, "OTP must be 6 digits"),
});

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { setUser, setTokens } = useAuthStore();

  const {
    register: registerEmail,
    handleSubmit: handleEmailSubmit,
    formState: { errors: emailErrors },
  } = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: "",
    },
  });

  const {
    register: registerOTP,
    handleSubmit: handleOTPSubmit,
    formState: { errors: otpErrors },
  } = useForm<z.infer<typeof otpSchema>>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: "",
    },
  });

  const handleEmailStep = async (data: z.infer<typeof emailSchema>) => {
    try {
      setIsLoading(true);
      setEmail(data.email);
      
      await api.post("/auth/register-otp/", { email: data.email });
      
      setMode("verify");
      toast.success("OTP sent to your email");
    } catch (error) {
      toast.error("Failed to send OTP. Please try again.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPVerification = async (data: z.infer<typeof otpSchema>) => {
    try {
      setIsLoading(true);
      
      const response = await api.post("/auth/verify-otp/", {
        email,
        otp: data.otp,
      });
      
      const { access, refresh, user } = response.data;
      
      setTokens(access, refresh);
      setUser(user);
      
      toast.success("Successfully logged in!");
      onClose();
    } catch (error) {
      toast.error("Invalid OTP. Please try again.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"}/auth/google/`;
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.2 } },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
  };

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.2 } },
    exit: { opacity: 0, transition: { duration: 0.2 } },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/50 z-50"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={overlayVariants}
            onClick={onClose}
          />
          <motion.div
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md bg-background rounded-xl shadow-lg overflow-hidden"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={modalVariants}
          >
            <div className="relative p-6">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X size={20} />
              </button>
              
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold">
                  {mode === "login" || mode === "register" ? "Welcome to REstart" : "Verify your email"}
                </h2>
                <p className="text-muted-foreground mt-1">
                  {mode === "login" || mode === "register"
                    ? "Enter your email to continue"
                    : `We've sent a code to ${email}`}
                </p>
              </div>
              
              {(mode === "login" || mode === "register") && (
                <form onSubmit={handleEmailSubmit(handleEmailStep)} className="space-y-4">
                  <div className="space-y-2">
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                      <input
                        {...registerEmail("email")}
                        className="w-full pl-10 pr-4 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                        placeholder="Email address"
                        disabled={isLoading}
                      />
                    </div>
                    {emailErrors.email && (
                      <p className="text-destructive text-sm">{emailErrors.email.message}</p>
                    )}
                  </div>
                  
                  <button
                    type="submit"
                    className="w-full bg-primary text-white py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        Continue <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                  
                  <div className="relative flex items-center gap-4 py-2">
                    <div className="flex-grow border-t border-border"></div>
                    <span className="text-muted-foreground text-sm">or</span>
                    <div className="flex-grow border-t border-border"></div>
                  </div>
                  
                  <button
                    type="button"
                    onClick={handleGoogleAuth}
                    className="w-full bg-background border border-border py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-muted/50 transition-colors"
                    disabled={isLoading}
                  >
                    <svg width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                      <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
                      <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
                      <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
                      <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
                    </svg>
                    Continue with Google
                  </button>
                </form>
              )}
              
              {mode === "verify" && (
                <form onSubmit={handleOTPSubmit(handleOTPVerification)} className="space-y-4">
                  <div className="space-y-2">
                    <input
                      {...registerOTP("otp")}
                      className="w-full px-4 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-center text-lg tracking-widest"
                      placeholder="Enter 6-digit OTP"
                      maxLength={6}
                      disabled={isLoading}
                    />
                    {otpErrors.otp && (
                      <p className="text-destructive text-sm text-center">{otpErrors.otp.message}</p>
                    )}
                  </div>
                  
                  <button
                    type="submit"
                    className="w-full bg-primary text-white py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      "Verify & Continue"
                    )}
                  </button>
                  
                  <p className="text-sm text-center text-muted-foreground">
                    Didn&apos;t receive the code?{" "}
                    <button
                      type="button"
                      onClick={() => handleEmailStep({ email })}
                      className="text-primary hover:underline"
                      disabled={isLoading}
                    >
                      Resend
                    </button>
                  </p>
                </form>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}