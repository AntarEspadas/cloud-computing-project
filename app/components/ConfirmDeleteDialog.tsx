import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  CircularProgress,
} from "@mui/material";

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  loading?: boolean;
  itemName?: string;
}

export default function ConfirmDeleteDialog({
  open,
  onClose,
  onConfirm,
  loading = false,
  itemName,
}: Props) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>Delete board</DialogTitle>
      <DialogContent>
        <Typography>
          Are you sure you want to delete &quot;{itemName ?? "this board"}
          &quot;? This action cannot be undone.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          color="error"
          variant="contained"
          onClick={onConfirm}
          disabled={loading}
        >
          {loading ? <CircularProgress size={20} color="inherit" /> : "Delete"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
