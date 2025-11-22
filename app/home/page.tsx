"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button, Container, Typography, Grid, Paper, Box } from "@mui/material";
import CreateIcon from "@mui/icons-material/Create";
import GroupsIcon from "@mui/icons-material/Groups";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";

export default function Home() {
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
            Fast, intuitive, and built for teams.
          </Typography>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <Box display="flex" justifyContent="center" gap={2}>
            <Link href="/board" passHref>
              <Button variant="contained" size="large" startIcon={<CreateIcon />}>Start Drawing</Button>
            </Link>
            <Link href="/signup" passHref>
              <Button variant="outlined" size="large" startIcon={<GroupsIcon />}>Create Team</Button>
            </Link>
          </Box>
        </motion.div>
      </Box>

      <Box display="grid" gridTemplateColumns={{ xs: '1fr', md: 'repeat(3, 1fr)' }} gap={4}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 4 }}>
          <CreateIcon sx={{ fontSize: 40, mb: 2 }} />
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Simple Tools
          </Typography>
          <Typography>Draw, erase, add shapes and notes. Everything you need to think visually.</Typography>
        </Paper>

        <Paper elevation={3} sx={{ p: 4, borderRadius: 4 }}>
          <GroupsIcon sx={{ fontSize: 40, mb: 2 }} />
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Real-Time Collaboration
          </Typography>
          <Typography>Work together instantly. See changes live as they happen.</Typography>
        </Paper>

        <Paper elevation={3} sx={{ p: 4, borderRadius: 4 }}>
          <RocketLaunchIcon sx={{ fontSize: 40, mb: 2 }} />
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Lightning Fast
          </Typography>
          <Typography>Optimized for speed so you can focus on ideas, not lag.</Typography>
        </Paper>
      </Box>

    </Container>
  );
}
