"use client";

import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Chip,
} from "@mui/material";
import LoginIcon from "@mui/icons-material/Login";
import LogoutIcon from "@mui/icons-material/Logout";
import PersonIcon from "@mui/icons-material/Person";
import { useAuth } from "@/app/lib/auth-context";
import { useRouter } from "next/navigation";

export default function Header() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  const handleSignOut = () => {
    logout();
    router.push("/");
  };

  return (
    <AppBar position="static" elevation={1}>
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Collaborative Board
        </Typography>

        <Box suppressHydrationWarning>
          {loading ? (
            <Chip label="Loading..." />
          ) : user ? (
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Chip
                icon={<PersonIcon />}
                label={user.email}
                color="primary"
                variant="outlined"
              />
              <Button
                color="inherit"
                startIcon={<LogoutIcon />}
                onClick={handleSignOut}
              >
                Logout
              </Button>
            </Box>
          ) : (
            <Button color="inherit" startIcon={<LoginIcon />} href="/auth">
              Login
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}
