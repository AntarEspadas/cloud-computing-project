"use client";

import { useState } from "react";
import { useRouter } from "next/navigation"; // Next.js Router
import Link from "next/link";
import { motion } from "framer-motion";
// Added TextField and Stack
import { Button, Container, Typography, Paper, Box, TextField, Stack } from "@mui/material";
import CreateIcon from "@mui/icons-material/Create";
import GroupsIcon from "@mui/icons-material/Groups";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import LoginIcon from "@mui/icons-material/Login";

export default function Home() {
  const router = useRouter();
  const [inputRoomId, setInputRoomId] = useState("");

  const handleJoinRoom = () => {
    if (inputRoomId.trim()) {
      // Navigate to the room the user typed
      router.push(`/room/${inputRoomId}`);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 10 }}>
      <Box textAlign="center" mb={6}>
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <Typography variant="h2" fontWeight="bold" gutterBottom>
            Collaborate in Real Time
          </Typography>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Typography variant="h5" color="text.secondary" maxWidth="md" mx="auto" mb={4}>
            Your online whiteboard for brainstorming, teaching, planning, and visual collaboration.
          </Typography>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          
          {/* OPTION A: Quick Create */}
          <Box display="flex" justifyContent="center" gap={2} mb={4}>
            <Link href="/board" passHref>
              <Button variant="contained" size="large" startIcon={<CreateIcon />}>
                New Board (Auto-ID)
              </Button>
            </Link>
          </Box>

          {/* OPTION B: Join Existing */}
          <Paper elevation={0} variant="outlined" sx={{ p: 2, maxWidth: '400px', mx: 'auto', bgcolor: '#f9f9f9' }}>
            <Typography variant="subtitle1" fontWeight="bold" mb={2}>
              Join an existing session
            </Typography>
            <Stack direction="row" spacing={2}>
              <TextField 
                variant="outlined" 
                size="small" 
                placeholder="Enter Room ID..." 
                fullWidth
                value={inputRoomId}
                onChange={(e) => setInputRoomId(e.target.value)}
              />
              <Button 
                variant="contained" 
                color="secondary"
                onClick={handleJoinRoom}
                disabled={!inputRoomId.trim()}
                startIcon={<LoginIcon />}
              >
                Join
              </Button>
            </Stack>
          </Paper>

        </motion.div>
      </Box>

      {/* Feature Grid (Unchanged) */}
      <Box display="grid" gridTemplateColumns={{ xs: '1fr', md: 'repeat(3, 1fr)' }} gap={4} mt={8}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 4 }}>
          <CreateIcon sx={{ fontSize: 40, mb: 2 }} />
          <Typography variant="h5" fontWeight="bold" gutterBottom>Simple Tools</Typography>
          <Typography>Draw, erase, add shapes and notes.</Typography>
        </Paper>

        <Paper elevation={3} sx={{ p: 4, borderRadius: 4 }}>
          <GroupsIcon sx={{ fontSize: 40, mb: 2 }} />
          <Typography variant="h5" fontWeight="bold" gutterBottom>Real-Time Collaboration</Typography>
          <Typography>Work together instantly.</Typography>
        </Paper>

        <Paper elevation={3} sx={{ p: 4, borderRadius: 4 }}>
          <RocketLaunchIcon sx={{ fontSize: 40, mb: 2 }} />
          <Typography variant="h5" fontWeight="bold" gutterBottom>Lightning Fast</Typography>
          <Typography>Optimized for speed.</Typography>
        </Paper>
      </Box>

    </Container>
  );
}