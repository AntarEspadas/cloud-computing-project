import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  Avatar,
  IconButton,
  Skeleton,
} from "@mui/material";
import Link from "next/link";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import MoreVertIcon from "@mui/icons-material/MoreVert";

export interface BoardItem {
  id: string;
  name: string;
  owner: string;
  date: string;
}

interface BoardsListProps {
  boards: BoardItem[];
  loading?: boolean;
  onStar: (id: string) => void;
  onMoreClick: (id: string, event: React.MouseEvent<HTMLElement>) => void;
}

export default function BoardsList({
  boards,
  loading = false,
  onStar,
  onMoreClick,
}: BoardsListProps) {
  if (loading) {
    return (
      <Grid container spacing={2}>
        {[...Array(5)].map((_, idx) => (
          <Grid size={12} key={idx}>
            <Card variant="outlined">
              <CardContent>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Box display="flex" alignItems="center" gap={2}>
                    <Skeleton variant="circular" width={40} height={40} />
                    <Box>
                      <Skeleton variant="text" width={180} height={28} />
                      <Skeleton variant="text" width={120} height={20} />
                    </Box>
                  </Box>

                  <Box display="flex" alignItems="center" gap={2}>
                    <Skeleton variant="text" width={80} height={20} />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  }

  return (
    <Grid container spacing={2}>
      {boards.map((board) => (
        <Grid size={12} key={board.id}>
          <Link href={`/room/${board.id}`} style={{ textDecoration: "none" }}>
            <Card
              variant="outlined"
              sx={{ cursor: "pointer", "&:hover": { boxShadow: 3 } }}
            >
              <CardContent>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Box display="flex" alignItems="center" gap={2}>
                    <Avatar>{board.name?.charAt(0) ?? "B"}</Avatar>
                    <Box>
                      <Typography variant="subtitle1" fontWeight={600}>
                        {board.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Created by {board.owner}
                      </Typography>
                    </Box>
                  </Box>

                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="body2" color="text.secondary">
                      {board.date}
                    </Typography>
                    <IconButton
                      aria-label="star"
                      onClick={(e) => {
                        e.preventDefault();
                        onStar(board.id);
                      }}
                    >
                      <StarBorderIcon />
                    </IconButton>
                    <IconButton
                      aria-label="more"
                      onClick={(e) => {
                        e.preventDefault();
                        onMoreClick(board.id, e);
                      }}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Link>
        </Grid>
      ))}
    </Grid>
  );
}
