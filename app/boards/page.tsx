"use client";

import {
  Menu,
  MenuItem,
  Container,
  Box,
  Typography,
  Alert,
} from "@mui/material";
import { useState, useEffect } from "react";
import Link from "next/link";
import BoardsList, { BoardItem } from "../components/BoardsList";
import TextInputDialog from "../components/TextInputDialog";
import ConfirmDeleteDialog from "../components/ConfirmDeleteDialog";
import CreateBoardButton from "../components/CreateBoardButton";
import { client } from "../lib/amplify";
import { useAuth } from "../lib/auth-context";

export default function BoardsPage() {
  const { user, loading: authLoading } = useAuth();
  const [boards, setBoards] = useState<BoardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedBoardId, setSelectedBoardId] = useState<string | null>(null);

  const [renameOpen, setRenameOpen] = useState(false);
  const [renameTitle, setRenameTitle] = useState("");
  const [renaming, setRenaming] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchBoards = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const { data: boards } = await client.models.Board.list({
          filter: { owner: { eq: user.userId + "::" + user.userId } },
        });
        const transformedBoards = boards.map((board) => ({
          id: board.id,
          name: board.name || "Untitled",
          owner: board.createdBy || "Unknown",
          date: board.createdAt
            ? new Date(board.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })
            : "Unknown",
        }));
        setBoards(transformedBoards);
      } catch (error) {
        console.error("Failed to fetch boards:", error);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchBoards();
    }
  }, [user, authLoading]);

  const openMenu = (id: string, event: React.MouseEvent<HTMLElement>) => {
    setSelectedBoardId(id);
    setMenuAnchor(event.currentTarget);
  };

  const closeMenu = () => {
    setMenuAnchor(null);
  };

  const handleRename = () => {
    const board = boards.find((b) => b.id === selectedBoardId);
    if (board) {
      setRenameTitle(board.name);
      setRenameOpen(true);
    }
    closeMenu();
  };

  const handleConfirmRename = async (newName: string) => {
    const id = selectedBoardId;
    if (!id) {
      setRenameOpen(false);
      return;
    }
    try {
      setRenaming(true);
      await client.models.Board.update({ id, name: newName });
      setBoards((prev) =>
        prev.map((b) => (b.id === id ? { ...b, name: newName } : b))
      );
      setRenameOpen(false);
      setSelectedBoardId(null);
    } catch (error) {
      console.error("Failed to rename board:", error);
    } finally {
      setRenaming(false);
    }
  };

  const handleDelete = () => {
    setDeleteOpen(true);
    closeMenu();
  };

  const handleConfirmDelete = async () => {
    const id = selectedBoardId;
    if (!id) {
      setDeleteOpen(false);
      return;
    }
    try {
      setDeleting(true);
      await client.models.Board.delete({ id });
      setBoards((prev) => prev.filter((b) => b.id !== id));
      setDeleteOpen(false);
      setSelectedBoardId(null);
    } catch (error) {
      console.error("Failed to delete board:", error);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >
          <Typography variant="h5" fontWeight={600}>
            Your boards
          </Typography>
          {user && <CreateBoardButton>Create new</CreateBoardButton>}
        </Box>

        {!authLoading && !user ? (
          <Alert severity="warning">
            Please{" "}
            <Link href="/auth" style={{ fontWeight: "bold" }}>
              login
            </Link>{" "}
            to view your boards.
          </Alert>
        ) : (
          <BoardsList
            boards={boards}
            loading={loading}
            onStar={(id) => console.log("Star board", id)}
            onMoreClick={(id, event) => openMenu(id, event)}
          />
        )}

        <TextInputDialog
          open={renameOpen}
          value={renameTitle}
          onValueChange={setRenameTitle}
          loading={renaming}
          onClose={() => setRenameOpen(false)}
          title="Rename board"
          inputLabel="New name"
          submitButtonLabel="Rename"
          onSubmit={handleConfirmRename}
        />
        <ConfirmDeleteDialog
          open={deleteOpen}
          loading={deleting}
          itemName={boards.find((b) => b.id === selectedBoardId)?.name}
          onClose={() => setDeleteOpen(false)}
          onConfirm={handleConfirmDelete}
        />
      </Container>

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={closeMenu}
      >
        <MenuItem onClick={handleRename}>Rename</MenuItem>
        <MenuItem onClick={handleDelete}>Delete</MenuItem>
      </Menu>
    </>
  );
}
