import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  CircularProgress,
} from "@mui/material";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (value: string) => void;
  loading?: boolean;
  value: string;
  onValueChange: (v: string) => void;
  title: string;
  submitButtonLabel?: string;
  inputLabel?: string;
}

export default function TextInputDialog({
  open,
  onClose,
  onSubmit,
  loading = false,
  value,
  onValueChange,
  title,
  submitButtonLabel = "Submit",
  inputLabel = "Input",
}: Props) {
  const handleSubmit = async () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    await onSubmit(trimmed);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
        style={{ display: "contents" }}
        autoComplete="off"
      >
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label={inputLabel}
            type="text"
            fullWidth
            value={value}
            onChange={(e) => onValueChange(e.target.value)}
            disabled={loading}
          />
        </DialogContent>
        <DialogActions>
          <Button type="button" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading || !value.trim()}
          >
            {loading ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              submitButtonLabel
            )}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
