"use client";

import React, { useState } from "react";
import { Button } from "@mui/material";
import TextInputDialog from "./TextInputDialog";
import { boardClient } from "../lib/board-client";
import { useAuth } from "../lib/auth-context";
import { useRouter } from "next/navigation";

interface Props {
  children?: React.ReactNode;
  startIcon?: React.ReactNode;
}

export default function CreateBoardButton({ children, startIcon }: Props) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [creating, setCreating] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  const handleOpen = () => {
    setTitle("");
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  const handleSubmit = async (value: string) => {
    if (!user) return;

    try {
      setCreating(true);
      const payload = {
        name: value,
        createdAt: new Date().toISOString(),
        createdBy: user.email,
        collaborators: [],
      };

      const { data: board } = await boardClient.create(payload);

      if (board?.id) {
        router.push(`/room/${board.id}`);
      } else {
        setOpen(false);
      }
    } catch (error) {
      console.error("Failed to create board:", error);
    } finally {
      setCreating(false);
    }
  };

  return (
    <>
      <Button
        variant="contained"
        onClick={handleOpen}
        startIcon={startIcon}
        size="large"
      >
        {children}
      </Button>

      <TextInputDialog
        open={open}
        value={title}
        onValueChange={setTitle}
        loading={creating}
        onClose={handleClose}
        title="Create new board"
        inputLabel="Title"
        submitButtonLabel="Create"
        onSubmit={handleSubmit}
      />
    </>
  );
}
