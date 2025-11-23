"use client";

import { useState } from "react";
import {
  Box,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Tooltip,
  Stack,
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import BrushIcon from "@mui/icons-material/Brush";
import PanToolIcon from "@mui/icons-material/PanTool";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import ShareIcon from "@mui/icons-material/Share";
import SettingsIcon from "@mui/icons-material/Settings";
import Link from "next/link";

export default function BoardPage() {
  const [tool, setTool] = useState<"pan" | "draw" | "erase">("draw");

  // Example metadata — replace with real data
  const boardName = "Board Name";
  const boardOwner = "Owner";

  return (
    <Box sx={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Top Bar */}
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Tooltip title="Home">
              <Link href="/home" passHref>
                <IconButton>
                  <HomeIcon />
                </IconButton>
              </Link>
            </Tooltip>

            <Box>
              <Typography variant="h6">{boardName}</Typography>
              <Typography variant="caption" color="text.secondary">
                Owned by {boardOwner}
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={1}>
            <Tooltip title="Share board">
              <IconButton>
                <ShareIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title="Settings">
              <IconButton>
                <SettingsIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        </Toolbar>
      </AppBar>

      {/* Main area */}
      <Box sx={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* Left Tool Sidebar */}
        <Box
          sx={{
            width: 70,
            bgcolor: "grey.100",
            borderRight: "1px solid #ddd",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            py: 2,
            gap: 2,
          }}
        >
          <Tooltip title="Pan">
            <IconButton
              color={tool === "pan" ? "primary" : "default"}
              onClick={() => setTool("pan")}
            >
              <PanToolIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="Draw">
            <IconButton
              color={tool === "draw" ? "primary" : "default"}
              onClick={() => setTool("draw")}
            >
              <BrushIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="Erase">
            <IconButton
              color={tool === "erase" ? "primary" : "default"}
              onClick={() => setTool("erase")}
            >
              <HighlightOffIcon />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Canvas */}
        <Box sx={{ flex: 1, position: "relative" }}>
          <canvas></canvas>
        </Box>
      </Box>
    </Box>
  );
}
