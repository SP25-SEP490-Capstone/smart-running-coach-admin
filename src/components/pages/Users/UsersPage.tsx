import { useState, useEffect } from "react";
import {
  Avatar,
  Button,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TablePagination,
  TextField,
  InputAdornment,
  TableSortLabel,
  Menu,
  MenuItem,
  Box,
  Typography,
  Divider,
  Chip,
} from "@mui/material";
import {
  Search,
  FilterList,
  Download,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Close,
  Check,
  CalendarToday,
  EmojiEvents,
  MilitaryTech,
} from "@mui/icons-material";
import "./UsersPage.scss";
import { Link } from "react-router-dom";
import { aget } from "@components/utils/util_axios";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { exportToExcel, prepareUserDataForExport } from "@utils/util_xlsx";
import { capitalizeFirstLetter } from "@components/utils/util_format";
import { CommonAvatar } from "@components/commons/CommonAvatar";
import DoDisturbIcon from '@mui/icons-material/DoDisturb';

interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  image: { url: string } | null;
  points: number;
  user_level: string;
  roles: string[];
  created_at?: string;
  is_active?: boolean;
}

interface ApiResponse {
  success: boolean;
  data: User[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<string>("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(
    null
  );
  const [filters, setFilters] = useState({
    status: null as string | null,
    role: null as string | null,
    dateFrom: null as string | null,
    dateTo: null as string | null,
  });
  const [totalUsers, setTotalUsers] = useState(0);

  const buildQueryString = () => {
    const params = new URLSearchParams();
    params.append("page", (page + 1).toString());
    params.append("limit", rowsPerPage.toString());

    if (search) params.append("search", search);
    if (sortField) params.append("sortBy", sortField);
    if (sortOrder) params.append("sortOrder", sortOrder);
    if (filters.role) params.append("role", filters.role);
    if (filters.status) params.append("status", filters.status);
    if (filters.dateFrom) params.append("dateFrom", filters.dateFrom);
    if (filters.dateTo) params.append("dateTo", filters.dateTo);

    return params.toString();
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const queryString = buildQueryString();
      const response = await aget<ApiResponse>(
        `/users/admin/users?${queryString}`
      );
      if (response.data.success) {
        setUsers(response.data.data);
        setTotalUsers(response.data.pagination.total);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 500); // Debounce search

    return () => clearTimeout(timer);
  }, [page, rowsPerPage, search, sortField, sortOrder, filters]);

  const handleSort = (field: string) => {
    const isAsc = sortField === field && sortOrder === "asc";
    setSortField(field);
    setSortOrder(isAsc ? "desc" : "asc");
    setPage(0); // Reset to first page when sorting changes
  };

  const handleFilterClick = (event: React.MouseEvent<HTMLElement>) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  const applyFilters = () => {
    setPage(0); // Reset to first page when filters change
    handleFilterClose();
  };

  const clearFilters = () => {
    setFilters({
      status: null,
      role: null,
      dateFrom: null,
      dateTo: null,
    });
    setPage(0);
    handleFilterClose();
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    return dayjs(dateString).format("MMM D, YYYY");
  };

  const formatDateTimeForExport = (dateString?: string) => {
    if (!dateString) return "";
    return dayjs(dateString).format("MMM D, YYYY h:mm A");
  };

  const getRole = (roles: string[]) => {
    if (!roles || roles.length === 0) return "User";
    if (roles.includes("ADMIN")) return "Admin";
    if (roles.includes("RUNNER")) return "Runner";
    if (roles.includes("EXPERT")) return "Expert";
    return roles[0] || "User";
  };

  const handleExport = () => {
    const exportData = prepareUserDataForExport(users, formatDateTimeForExport);
    exportToExcel(exportData, "users_export");
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

  return (
    <div className="users-page">
      <div className="header">
        <div className="title-container">
          <h1>Users</h1>
        </div>
        <div className="actions">
          <div className="left">
            <TextField
              className="input-search"
              placeholder="Search users by name, email or role..."
              variant="outlined"
              size="small"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
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
              onClick={handleFilterClick}
            >
              Filter
              {Object.values(filters).some(Boolean) && (
                <span className="filter-badge"></span>
              )}
            </Button>
            <Menu
              anchorEl={filterAnchorEl}
              open={Boolean(filterAnchorEl)}
              onClose={handleFilterClose}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "right",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
            >
              <Box sx={{ p: 2, width: 300 }}>
                <Typography variant="subtitle1">Filter Users</Typography>
                <Divider sx={{ my: 1 }} />

                <Typography variant="subtitle2" sx={{ mt: 1 }}>
                  Status
                </Typography>
                <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                  <Button
                    variant={
                      filters.status === "active" ? "contained" : "outlined"
                    }
                    size="small"
                    startIcon={filters.status === "active" ? <Check /> : null}
                    onClick={() =>
                      setFilters({
                        ...filters,
                        status: filters.status === "active" ? null : "active",
                      })
                    }
                  >
                    Active
                  </Button>
                  <Button
                    variant={
                      filters.status === "inactive" ? "contained" : "outlined"
                    }
                    size="small"
                    startIcon={filters.status === "inactive" ? <Check /> : null}
                    onClick={() =>
                      setFilters({
                        ...filters,
                        status:
                          filters.status === "inactive" ? null : "inactive",
                      })
                    }
                  >
                    Inactive
                  </Button>
                </Box>

                <Typography variant="subtitle2">Role</Typography>
                <TextField
                  select
                  fullWidth
                  size="small"
                  value={filters.role || ""}
                  onChange={(e) =>
                    setFilters({ ...filters, role: e.target.value || null })
                  }
                  sx={{ mb: 2 }}
                >
                  <MenuItem value="">All Roles</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                  <MenuItem value="runner">Runner</MenuItem>
                  <MenuItem value="expert">Expert</MenuItem>
                  <MenuItem value="user">User</MenuItem>
                </TextField>

                <Typography variant="subtitle2">Date Range</Typography>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <Box
                    sx={{
                      display: "flex",
                      gap: 1,
                      mb: 2,
                      flexDirection: "column",
                    }}
                  >
                    <DatePicker
                      label="From"
                      value={filters.dateFrom ? dayjs(filters.dateFrom) : null}
                      onChange={(newValue) =>
                        setFilters({
                          ...filters,
                          dateFrom: newValue ? newValue.toISOString() : null,
                        })
                      }
                      slotProps={{
                        textField: { size: "small", fullWidth: true },
                      }}
                    />
                    <DatePicker
                      label="To"
                      value={filters.dateTo ? dayjs(filters.dateTo) : null}
                      onChange={(newValue) =>
                        setFilters({
                          ...filters,
                          dateTo: newValue ? newValue.toISOString() : null,
                        })
                      }
                      slotProps={{
                        textField: { size: "small", fullWidth: true },
                      }}
                    />
                  </Box>
                </LocalizationProvider>

                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Button onClick={clearFilters} startIcon={<Close />}>
                    Clear
                  </Button>
                  <Button onClick={applyFilters} variant="contained">
                    Apply
                  </Button>
                </Box>
              </Box>
            </Menu>
            <Button
              className="btn-export"
              variant="outlined"
              startIcon={<Download />}
              onClick={handleExport}
              disabled={loading}
            >
              Export
            </Button>
          </div>
          <div className="right"></div>
        </div>
      </div>

      <Table className="user-table">
        <TableHead className="user-table-head">
          <TableRow>
            <TableCell>
              <TableSortLabel
                active={sortField === "name"}
                direction={sortField === "name" ? sortOrder : "asc"}
                onClick={() => handleSort("name")}
              >
                User
              </TableSortLabel>
            </TableCell>
            <TableCell>Email</TableCell>
            <TableCell>
              <TableSortLabel
                active={sortField === "roles"}
                direction={sortField === "roles" ? sortOrder : "asc"}
                onClick={() => handleSort("roles")}
              >
                Role
              </TableSortLabel>
            </TableCell>
            <TableCell>
              <TableSortLabel
                active={sortField === "is_active"}
                direction={sortField === "is_active" ? sortOrder : "asc"}
                onClick={() => handleSort("is_active")}
              >
                Status
              </TableSortLabel>
            </TableCell>
            <TableCell>
              <TableSortLabel
                active={sortField === "created_at"}
                direction={sortField === "created_at" ? sortOrder : "asc"}
                onClick={() => handleSort("created_at")}
              >
                Created Date
              </TableSortLabel>
            </TableCell>
            <TableCell>
              <TableSortLabel
                active={sortField === "points"}
                direction={sortField === "points" ? sortOrder : "asc"}
                onClick={() => handleSort("points")}
              >
                Points & Level
              </TableSortLabel>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {loading ? (
            Array(rowsPerPage)
              .fill(0)
              .map((_, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <div className="user-info">
                      <Skeleton circle width={40} height={40} />
                      <Skeleton width={100} style={{ marginLeft: "10px" }} />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Skeleton width={150} />
                  </TableCell>
                  <TableCell>
                    <Skeleton width={80} />
                  </TableCell>
                  <TableCell>
                    <Skeleton width={60} />
                  </TableCell>
                  <TableCell>
                    <Skeleton width={120} />
                  </TableCell>
                  <TableCell>
                    <Skeleton width={100} />
                  </TableCell>
                  <TableCell>
                    <Skeleton
                      width={40}
                      height={40}
                      style={{ marginRight: "10px", display: "inline-block" }}
                    />
                    <Skeleton
                      width={40}
                      height={40}
                      style={{ display: "inline-block" }}
                    />
                  </TableCell>
                </TableRow>
              ))
          ) : users.length > 0 ? (
            users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <Link className="user-info" to={`/users/${user.id}`}>
                    <CommonAvatar
                      uri={user.image?.url}
                      mode={
                        user.roles?.includes("expert") ? "expert" : "runner"
                      }
                      size={32}
                    />
                    <Box sx={{ display: "flex", flexDirection: "column" }}>
                      <span>{user.name}</span>
                      <span className="username">@{user.username}</span>
                    </Box>
                  </Link>
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <span
                    className={`role ${getRole(user.roles)
                      .toLowerCase()
                      .replace(" ", "-")}`}
                  >
                    {user.roles.includes("expert") ? "Expert" : "Runner"}
                  </span>
                </TableCell>
                <TableCell>
                  <span
                    className={`status ${
                      user.is_active ? "active" : "inactive"
                    }`}
                  >
                    {user.is_active ? "Active" : "Inactive"}
                  </span>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <CalendarToday fontSize="small" color="action" />
                    {formatDate(user.created_at)}
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: "flex", gap: 2 }}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      <EmojiEvents fontSize="small" color="warning" />
                      <Typography variant="body2">
                        {user.points}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      <MilitaryTech fontSize="small" color="warning" />
                      <Typography variant="body2">
                        {capitalizeFirstLetter(user.user_level)}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={7} align="center">
                No users found matching your criteria
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={totalUsers}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </div>
  );
}
