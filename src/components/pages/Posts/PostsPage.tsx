import { useEffect, useState } from "react";
import {
  Paper,
  Typography,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  IconButton,
  TablePagination,
  TableSortLabel,
  InputAdornment,
  Chip,
  Menu,
  MenuItem,
  Divider,
} from "@mui/material";
import {
  Search,
  Download,
  Edit,
  Delete,
  Refresh,
  FilterList,
} from "@mui/icons-material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import "./PostsPage.scss";
import { Link } from "react-router-dom";
import { aget } from "@components/utils/util_axios";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { CommonAvatar } from "@components/commons/CommonAvatar";
import * as XLSX from "xlsx";
import { exportToExcel } from "@components/utils/util_xlsx";

interface Post {
  id: string;
  title: string;
  content: string;
  user: {
    id: string;
    username: string;
    name: string;
    email: string;
    image?: {
      url: string;
    };
  };
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  stats: {
    upvotes: number;
    downvotes: number;
    voteScore: number;
    commentCount: number;
  };
  images: {
    id: string;
    url: string;
  }[];
  exerciseSessionId?: string;
}

interface ApiResponse {
  statistics: {
    totalPosts: number;
    activePosts: number;
    deletedPosts: number;
    totalComments: number;
  };
  posts: Post[];
  pagination: {
    currentPage: number;
    totalPages: number;
    itemsPerPage: number;
    totalItems: number;
  };
}

const statusColors = {
  Active: "#d4edda",
  Deleted: "#f8d7da",
};

export default function PostsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  }>({
    key: "created_at",
    direction: "desc",
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "deleted"
  >("all");
  const [dateRange, setDateRange] = useState<{ from?: string; to?: string }>(
    {}
  );
  const [voteRange, setVoteRange] = useState<{ min?: number; max?: number }>(
    {}
  );
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(
    null
  );

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: (page + 1).toString(),
        limit: rowsPerPage.toString(),
        sortBy: sortConfig.key,
        sortOrder: sortConfig.direction,
        search: searchTerm,
        status: statusFilter,
        ...(dateRange.from && { fromDate: dateRange.from }),
        ...(dateRange.to && { toDate: dateRange.to }),
        ...(voteRange.min !== undefined && {
          minVotes: voteRange.min.toString(),
        }),
        ...(voteRange.max !== undefined && {
          maxVotes: voteRange.max.toString(),
        }),
      });

      const response = await aget(
        `/posts/admin/dashboard?${params.toString()}`
      );
      if (response.status === 200) {
        setData(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (!data?.posts) return;

    const exportData = data.posts.map(post => ({
      ID: post.id,
      Title: post.title,
      Author: post.user.name,
      Username: post.user.username,
      Email: post.user.email,
      Status: post.isDeleted ? 'Deleted' : 'Active',
      Upvotes: post.stats.upvotes,
      Downvotes: post.stats.downvotes,
      VoteScore: post.stats.voteScore,
      Comments: post.stats.commentCount,
      CreatedAt: formatDate(post.createdAt),
      UpdatedAt: formatDate(post.updatedAt),
      ImageCount: post.images.length,
      ExerciseSessionId: post.exerciseSessionId || 'N/A'
    }));

    exportToExcel(exportData, 'posts_export');
  };

  useEffect(() => {
    fetchPosts();
  }, [
    page,
    rowsPerPage,
    sortConfig,
    searchTerm,
    statusFilter,
    dateRange,
    voteRange,
  ]);

  const handleSort = (key: string) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleStatusFilterChange = (status: "all" | "active" | "deleted") => {
    setStatusFilter(status);
    setPage(0);
    handleCloseFilterMenu();
  };

  const handleDateFilterChange = (type: "from" | "to", value?: string) => {
    setDateRange((prev) => ({ ...prev, [type]: value }));
    setPage(0);
  };

  const handleVoteFilterChange = (type: "min" | "max", value?: number) => {
    setVoteRange((prev) => ({ ...prev, [type]: value }));
    setPage(0);
  };

  const getStatus = (isDeleted: boolean) => {
    return isDeleted ? "Deleted" : "Active";
  };

  const getAvatarInitial = (username: string) => {
    return username ? username.charAt(0).toUpperCase() : "";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setDateRange({});
    setVoteRange({});
    setPage(0);
  };

  const handleOpenFilterMenu = (event: React.MouseEvent<HTMLElement>) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleCloseFilterMenu = () => {
    setFilterAnchorEl(null);
  };

  return (
    <div className="posts-page">
      <div className="title-container">
        <h1 className="title">Posts Management</h1>
        <Button
          className="btn-refresh"
          variant="contained"
          onClick={fetchPosts}
          disabled={loading}
        >
          <Refresh />
        </Button>
      </div>

      {loading && !data ? (
        <Box className="stats">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="stat-card">
              <Skeleton height={20} width="60%" />
              <Skeleton height={30} width="80%" />
            </div>
          ))}
        </Box>
      ) : (
        <Box className="stats">
          <div className="stat-card total">
            <div className="label">Total Posts</div>
            <div className="value">{data?.statistics.totalPosts || 0}</div>
          </div>
          <div className="stat-card active">
            <div className="label">Active Posts</div>
            <div className="value">{data?.statistics.activePosts || 0}</div>
          </div>
          <div className="stat-card pending">
            <div className="label">Deleted Posts</div>
            <div className="value">{data?.statistics.deletedPosts || 0}</div>
          </div>
          <div className="stat-card reported">
            <div className="label">Total Comments</div>
            <div className="value">{data?.statistics.totalComments || 0}</div>
          </div>
        </Box>
      )}

      <Box className="actions">
        <TextField
          className="input-search"
          placeholder="Search posts..."
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />

        <Button
          className="btn-filter"
          variant="outlined"
          startIcon={<FilterList />}
          onClick={handleOpenFilterMenu}
        >
          Filters
        </Button>

        <Menu
          anchorEl={filterAnchorEl}
          open={Boolean(filterAnchorEl)}
          onClose={handleCloseFilterMenu}
          PaperProps={{
            style: {
              padding: "16px",
              width: "350px",
            },
          }}
        >
          <Typography variant="subtitle1" gutterBottom>
            Status Filter
          </Typography>
          <Box className="filter-group" sx={{ mb: 2 }}>
            <Chip
              label="All"
              onClick={() => handleStatusFilterChange("all")}
              color={statusFilter === "all" ? "primary" : "default"}
              sx={{ mr: 1 }}
            />
            <Chip
              label="Active"
              onClick={() => handleStatusFilterChange("active")}
              color={statusFilter === "active" ? "primary" : "default"}
              sx={{ mr: 1 }}
            />
            <Chip
              label="Deleted"
              onClick={() => handleStatusFilterChange("deleted")}
              color={statusFilter === "deleted" ? "primary" : "default"}
            />
          </Box>

          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle1" gutterBottom>
            Date Range
          </Typography>
          <Box className="date-filters" sx={{ mb: 2 }}>
            <TextField
              label="From Date"
              type="date"
              size="small"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={dateRange.from || ""}
              onChange={(e) => handleDateFilterChange("from", e.target.value)}
              sx={{ mb: 1 }}
            />
            <TextField
              label="To Date"
              type="date"
              size="small"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={dateRange.to || ""}
              onChange={(e) => handleDateFilterChange("to", e.target.value)}
            />
          </Box>

          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle1" gutterBottom>
            Vote Range
          </Typography>
          <Box className="vote-filters" sx={{ display: "flex", gap: "16px" }}>
            <TextField
              label="Min Votes"
              type="number"
              size="small"
              fullWidth
              value={voteRange.min || ""}
              onChange={(e) =>
                handleVoteFilterChange(
                  "min",
                  e.target.value ? parseInt(e.target.value) : undefined
                )
              }
            />
            <TextField
              label="Max Votes"
              type="number"
              size="small"
              fullWidth
              value={voteRange.max || ""}
              onChange={(e) =>
                handleVoteFilterChange(
                  "max",
                  e.target.value ? parseInt(e.target.value) : undefined
                )
              }
            />
          </Box>
        </Menu>

        <Button
          className="btn-reset"
          variant="outlined"
          onClick={handleResetFilters}
        >
          Reset Filters
        </Button>
        <Button 
          className="btn-export" 
          variant="contained"
          startIcon={<Download />}
          onClick={handleExport}
          disabled={loading || !data?.posts?.length}
        >
          Export
        </Button>
      </Box>

      <TableContainer component={Paper} className="table">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <TableSortLabel
                  active={sortConfig.key === "title"}
                  direction={
                    sortConfig.key === "title" ? sortConfig.direction : "asc"
                  }
                  onClick={() => handleSort("title")}
                >
                  Post Title
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortConfig.key === "user.username"}
                  direction={
                    sortConfig.key === "user.username"
                      ? sortConfig.direction
                      : "asc"
                  }
                  onClick={() => handleSort("user.username")}
                >
                  Author
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortConfig.key === "isDeleted"}
                  direction={
                    sortConfig.key === "isDeleted"
                      ? sortConfig.direction
                      : "asc"
                  }
                  onClick={() => handleSort("isDeleted")}
                >
                  Status
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortConfig.key === "stats.voteScore"}
                  direction={
                    sortConfig.key === "stats.voteScore"
                      ? sortConfig.direction
                      : "desc"
                  }
                  onClick={() => handleSort("stats.voteScore")}
                >
                  Votes
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortConfig.key === "stats.commentCount"}
                  direction={
                    sortConfig.key === "stats.commentCount"
                      ? sortConfig.direction
                      : "desc"
                  }
                  onClick={() => handleSort("stats.commentCount")}
                >
                  Comments
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortConfig.key === "createdAt"}
                  direction={
                    sortConfig.key === "createdAt"
                      ? sortConfig.direction
                      : "desc"
                  }
                  onClick={() => handleSort("createdAt")}
                >
                  Date
                </TableSortLabel>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading && !data?.posts
              ? [...Array(rowsPerPage)].map((_, index) => (
                  <TableRow key={index}>
                    {[...Array(7)].map((_, i) => (
                      <TableCell key={i}>
                        <Skeleton />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              : data?.posts.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell className="post-title">
                      <Link to={`/posts/${post.id}`}>
                        <p className="post-title">{post.title}</p>
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <CommonAvatar uri={post.user.image?.url} />
                        <Box marginLeft={1}>
                          <Typography className="post-author">
                            {post.user.name}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            @{post.user.username}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box
                        className="status-badge"
                        style={{
                          backgroundColor:
                            statusColors[getStatus(post.isDeleted)],
                        }}
                      >
                        {getStatus(post.isDeleted)}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <span className="votes-up">
                        <FavoriteIcon className="vote-icon" />{" "}
                        <span>{post.stats.upvotes}</span>
                      </span>
                    </TableCell>
                    <TableCell>{post.stats.commentCount}</TableCell>
                    <TableCell>{formatDate(post.createdAt)}</TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={data?.pagination.totalItems || 0}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          disabled={loading}
        />
      </TableContainer>
    </div>
  );
}