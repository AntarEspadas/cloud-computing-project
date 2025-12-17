"use client";

import { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Alert,
  CircularProgress,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useAuth } from "@/app/lib/auth-context";

interface ConfirmAuthFormProps {
  email: string;
  onConfirmSuccess: () => void;
}

export default function ConfirmAuthForm({
  email,
  onConfirmSuccess,
}: ConfirmAuthFormProps) {
  const { confirmUser } = useAuth();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const result = await confirmUser(email, code);
      if (result === true) {
        setSuccess("Account confirmed! Redirecting...");
        onConfirmSuccess();
      } else if (typeof result === "string") {
        setError(result);
      }
    } catch {
      setError("Confirmation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ maxWidth: 450, mx: "auto", p: 4 }}>
      <Typography variant="h4" textAlign="center" mb={3} fontWeight="bold">
        Confirm Your Account
      </Typography>

      <Typography variant="body1" textAlign="center" mb={3}>
        Enter the confirmation code sent to {email}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Box component="form" onSubmit={handleConfirm}>
        <TextField
          fullWidth
          label="Confirmation Code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          margin="normal"
          required
        />
        <Button
          type="submit"
          fullWidth
          variant="contained"
          size="large"
          sx={{ mt: 3 }}
          disabled={loading}
          startIcon={
            loading ? <CircularProgress size={20} /> : <CheckCircleIcon />
          }
        >
          {loading ? "Confirming..." : "Confirm Account"}
        </Button>
      </Box>
    </Paper>
  );
}
