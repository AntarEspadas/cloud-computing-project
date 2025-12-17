"use client";

import { Container, Box } from "@mui/material";
import AuthForm from "../components/AuthForm";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const router = useRouter();

  const handleAuthSuccess = () => {
    setTimeout(() => {
      router.push("/boards");
    }, 1000);
  };

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Box>
        <AuthForm onAuthSuccess={handleAuthSuccess} />
      </Box>
    </Container>
  );
}
