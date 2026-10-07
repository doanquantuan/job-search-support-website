import React from "react";
import { LoginForm } from "@/features/auth/components/LoginForm";

export const LoginPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/20 p-4">
      <LoginForm />
    </div>
  );
};
