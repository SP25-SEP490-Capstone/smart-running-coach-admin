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
} from "@mui/material";
import {
  Search,
  Download,
  Refresh,
  FilterList,
  Settings,
} from "@mui/icons-material";
import "./SchedulesPage.scss";
import { Link } from "react-router-dom";
import { aget } from "@components/utils/util_axios";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { CommonAvatar } from "@components/commons/CommonAvatar";
import { sendErrorToast } from "@components/utils/util_toastify";

interface UserSchedule {
  user: {
    id: string;
    name: string;
    username: string;
    email: string;
    image: string | null;
  };
  totalSchedules: number;
  userCreated: number;
  expertCreated: number;
  ongoing: number;
  upcoming: number;
  incoming: number;
  canceled: number;
  completed: number;
}

interface ApiResponse {
  status: string;
  data: {
    users: UserSchedule[];
    total: number;
    page: number;
    limit: number;
  };
}

const statusColors = {
  Ongoing: "#bfdbfe",
  Upcoming: "#fef9c3",
  Incoming: "#cffafe",
  Canceled: "#fecaca",
  Completed: "#d4edda",
};

export default function SchedulesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  }>({
    key: "user.username",
    direction: "asc",
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<
    "all" | "hasOngoing" | "hasUpcoming" | "hasIncoming" | "hasCanceled" | "hasCompleted"
  >("all");
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);

  const fetchSchedules = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: (page + 1).toString(),
        limit: rowsPerPage.toString(),
        sortBy: sortConfig.key,
        sortOrder: sortConfig.direction,
        search: searchTerm,
        status: statusFilter,
      });

      const response = await aget(`/schedules/admin/dashboard?${params.toString()}`);
      if (response.status === 200) {
        setData(response.data);
      }
    } catch (error) {
      console.error("Error fetching schedules:", error);
      sendErrorToast("Failed to load schedule data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, [page, rowsPerPage, sortConfig, searchTerm, statusFilter]);

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

  const handleStatusFilterChange = (
    status: "all" | "hasOngoing" | "hasUpcoming" | "hasIncoming" | "hasCanceled" | "hasCompleted"
  ) => {
    setStatusFilter(status);
    setPage(0);
    handleCloseFilterMenu();
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setPage(0);
  };

  const handleOpenFilterMenu = (event: React.MouseEvent<HTMLElement>) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleCloseFilterMenu = () => {
    setFilterAnchorEl(null);
  };

  return (
    <div className="schedules-page">
      <div className="title-container">
        <h1 className="title">Schedules Management</h1>
        <Button
          className="btn-refresh"
          variant="contained"
          onClick={fetchSchedules}
          disabled={loading}
        >
          <Refresh />
        </Button>
      </div>

      <Box className="actions">
        <TextField
          className="input-search"
          placeholder="Search by username or email..."
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
              label="Has Ongoing"
              onClick={() => handleStatusFilterChange("hasOngoing")}
              color={statusFilter === "hasOngoing" ? "primary" : "default"}
              sx={{ mr: 1 }}
            />
            <Chip
              label="Has Upcoming"
              onClick={() => handleStatusFilterChange("hasUpcoming")}
              color={statusFilter === "hasUpcoming" ? "primary" : "default"}
              sx={{ mr: 1 }}
            />
            <Chip
              label="Has Incoming"
              onClick={() => handleStatusFilterChange("hasIncoming")}
              color={statusFilter === "hasIncoming" ? "primary" : "default"}
              sx={{ mr: 1 }}
            />
            <Chip
              label="Has Canceled"
              onClick={() => handleStatusFilterChange("hasCanceled")}
              color={statusFilter === "hasCanceled" ? "primary" : "default"}
              sx={{ mr: 1 }}
            />
            <Chip
              label="Has Completed"
              onClick={() => handleStatusFilterChange("hasCompleted")}
              color={statusFilter === "hasCompleted" ? "primary" : "default"}
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
        <Button className="btn-export" startIcon={<Download />}>
          Export
        </Button>
      </Box>

      <TableContainer component={Paper} className="table">
        <Table>
          <TableHead>
            <TableRow>
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
                  User
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortConfig.key === "totalSchedules"}
                  direction={
                    sortConfig.key === "totalSchedules"
                      ? sortConfig.direction
                      : "desc"
                  }
                  onClick={() => handleSort("totalSchedules")}
                >
                  Total Schedules
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortConfig.key === "userCreated"}
                  direction={
                    sortConfig.key === "userCreated"
                      ? sortConfig.direction
                      : "desc"
                  }
                  onClick={() => handleSort("userCreated")}
                >
                  User-Created
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortConfig.key === "expertCreated"}
                  direction={
                    sortConfig.key === "expertCreated"
                      ? sortConfig.direction
                      : "desc"
                  }
                  onClick={() => handleSort("expertCreated")}
                >
                  Expert-Created
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortConfig.key === "totalSchedules"}
                  direction={
                    sortConfig.key === "totalSchedules"
                      ? sortConfig.direction
                      : "desc"
                  }
                  onClick={() => handleSort("totalSchedules")}
                >
                  Status
                </TableSortLabel>
              </TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading && !data?.data?.users
              ? [...Array(rowsPerPage)].map((_, index) => (
                  <TableRow key={index}>
                    {[...Array(6)].map((_, i) => (
                      <TableCell key={i}>
                        <Skeleton />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              : data?.data?.users.map((item) => (
                  <TableRow key={item.user.id}>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <CommonAvatar uri={item.user?.image?.url} />
                        <Box marginLeft={1}>
                          <Link to={`/users/${item.user.id}`}>
                            <Typography className="user-name">
                              {item.user.name}
                            </Typography>
                          </Link>
                          <Typography variant="caption" color="textSecondary">
                            @{item.user.username} | {item.user.email}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>{item.totalSchedules}</TableCell>
                    <TableCell>{item.userCreated}</TableCell>
                    <TableCell>{item.expertCreated}</TableCell>
                    <TableCell>
                      <Box className="status-badges">
                        {item.ongoing > 0 && (
                          <Box
                            className="status-badge"
                            style={{ backgroundColor: statusColors.Ongoing }}
                          >
                            Ongoing: {item.ongoing}
                          </Box>
                        )}
                        {item.upcoming > 0 && (
                          <Box
                            className="status-badge"
                            style={{ backgroundColor: statusColors.Upcoming }}
                          >
                            Upcoming: {item.upcoming}
                          </Box>
                        )}
                        {item.incoming > 0 && (
                          <Box
                            className="status-badge"
                            style={{ backgroundColor: statusColors.Incoming }}
                          >
                            Incoming: {item.incoming}
                          </Box>
                        )}
                        {item.canceled > 0 && (
                          <Box
                            className="status-badge"
                            style={{ backgroundColor: statusColors.Canceled }}
                          >
                            Canceled: {item.canceled}
                          </Box>
                        )}
                        {item.completed > 0 && (
                          <Box
                            className="status-badge"
                            style={{ backgroundColor: statusColors.Completed }}
                          >
                            Completed: {item.completed}
                          </Box>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        component={Link}
                        to={`/schedules/user/${item.user.id}`}
                      >
                        <Settings fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={data?.data?.total || 0}
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