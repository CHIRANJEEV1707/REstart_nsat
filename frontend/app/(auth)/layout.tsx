import React from "react";
import { AuthModal } from "@/components/auth-modal";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  // TODO: Connect modal open/close state to global store or route
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <>
      <AuthModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
      {children}
    </>
  );
}