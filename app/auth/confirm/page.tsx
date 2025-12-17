"use client";

import { Container, Box } from "@mui/material";
import ConfirmAuthForm from "../../components/ConfirmAuthForm";
import { useAuth } from "../../lib/auth-context";
import { useRouter } from "next/navigation";

export default function ConfirmPage() {
  const { user } = useAuth();
  const router = useRouter();

  if (!user || !user.email) {
    // If no user or email, redirect back to auth
    router.push("/auth");
    return null;
  }

  const handleConfirmSuccess = () => {
    setTimeout(() => {
      router.push("/boards");
    }, 1000);
  };

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Box>
        <ConfirmAuthForm
          email={user.email}
          onConfirmSuccess={handleConfirmSuccess}
        />
      </Box>
    </Container>
  );
}
