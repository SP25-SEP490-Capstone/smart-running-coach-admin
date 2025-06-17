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
  Refresh,
  FilterList,
  Settings,
} from "@mui/icons-material";
import "./CertificatesPage.scss";
import { Link } from "react-router-dom";
import { aget } from "@components/utils/util_axios";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { CommonAvatar } from "@components/commons/CommonAvatar";
import { exportToExcel } from "@components/utils/util_xlsx";

interface UserCertificate {
  user: {
    id: string;
    name: string;
    username: string;
    email: string;
    gender: string;
    image?: {
      url: string;
    };
    points: number;
    user_level: string;
    roles: string[];
  };
  certificateAmount: number;
  acceptedAmount: number;
  pendingAmount: number;
  rejectedAmount: number;
  isExpert: boolean;
}

interface ApiResponse {
  status: string;
  data: UserCertificate[];
}

const statusColors = {
  Accepted: "#d4edda",
  Pending: "#fff3cd",
  Rejected: "#f8d7da",
  Expert: "#d4edda",
  "Non-Expert": "#f8d7da",
};

export default function CertificatesPage() {
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
    "all" | "hasAccepted" | "hasPending" | "hasRejected"
  >("all");
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);

  const fetchCertificates = async () => {
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

      const response = await aget(
        `/user-certificates/admin/dashboard?${params.toString()}`
      );
      if (response.status === 200) {
        setData(response.data);
      }
    } catch (error) {
      console.error("Error fetching certificates:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (!data?.data) return;

    const exportData = data.data.map(item => ({
      UserID: item.user.id,
      Name: item.user.name,
      Username: item.user.username,
      Email: item.user.email,
      Gender: item.user.gender,
      Points: item.user.points,
      UserLevel: item.user.user_level,
      Roles: item.user.roles.join(", "),
      TotalCertificates: item.certificateAmount,
      AcceptedCertificates: item.acceptedAmount,
      PendingCertificates: item.pendingAmount,
      RejectedCertificates: item.rejectedAmount,
      ExpertStatus: item.isExpert ? "Expert" : "Non-Expert"
    }));

    exportToExcel(exportData, 'certificates_export');
  };

  useEffect(() => {
    fetchCertificates();
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
    status: "all" | "hasAccepted" | "hasPending" | "hasRejected"
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

  const totalCertificates = data?.data.reduce(
    (sum, item) => sum + item.certificateAmount,
    0
  ) || 0;
  const totalAccepted = data?.data.reduce(
    (sum, item) => sum + item.acceptedAmount,
    0
  ) || 0;
  const totalPending = data?.data.reduce(
    (sum, item) => sum + item.pendingAmount,
    0
  ) || 0;
  const totalRejected = data?.data.reduce(
    (sum, item) => sum + item.rejectedAmount,
    0
  ) || 0;

  return (
    <div className="certificates-page">
      <div className="title-container">
        <h1 className="title">Certificates Management</h1>
        <Button
          className="btn-refresh"
          variant="contained"
          onClick={fetchCertificates}
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
            <div className="label">Total Certificates</div>
            <div className="value">{totalCertificates}</div>
          </div>
          <div className="stat-card accepted">
            <div className="label">Accepted Certificates</div>
            <div className="value">{totalAccepted}</div>
          </div>
          <div className="stat-card pending">
            <div className="label">Pending Certificates</div>
            <div className="value">{totalPending}</div>
          </div>
          <div className="stat-card rejected">
            <div className="label">Rejected Certificates</div>
            <div className="value">{totalRejected}</div>
          </div>
        </Box>
      )}

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
              label="Has Accepted"
              onClick={() => handleStatusFilterChange("hasAccepted")}
              color={statusFilter === "hasAccepted" ? "primary" : "default"}
              sx={{ mr: 1 }}
            />
            <Chip
              label="Has Pending"
              onClick={() => handleStatusFilterChange("hasPending")}
              color={statusFilter === "hasPending" ? "primary" : "default"}
              sx={{ mr: 1 }}
            />
            <Chip
              label="Has Rejected"
              onClick={() => handleStatusFilterChange("hasRejected")}
              color={statusFilter === "hasRejected" ? "primary" : "default"}
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
          disabled={loading || !data?.data?.length}
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
                  active={sortConfig.key === "certificateAmount"}
                  direction={
                    sortConfig.key === "certificateAmount"
                      ? sortConfig.direction
                      : "desc"
                  }
                  onClick={() => handleSort("certificateAmount")}
                >
                  Total Certificates
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortConfig.key === "acceptedAmount"}
                  direction={
                    sortConfig.key === "acceptedAmount"
                      ? sortConfig.direction
                      : "desc"
                  }
                  onClick={() => handleSort("acceptedAmount")}
                >
                  Accepted
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortConfig.key === "pendingAmount"}
                  direction={
                    sortConfig.key === "pendingAmount"
                      ? sortConfig.direction
                      : "desc"
                  }
                  onClick={() => handleSort("pendingAmount")}
                >
                  Pending
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortConfig.key === "rejectedAmount"}
                  direction={
                    sortConfig.key === "rejectedAmount"
                      ? sortConfig.direction
                      : "desc"
                  }
                  onClick={() => handleSort("rejectedAmount")}
                >
                  Rejected
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortConfig.key === "isExpert"}
                  direction={
                    sortConfig.key === "isExpert" ? sortConfig.direction : "desc"
                  }
                  onClick={() => handleSort("isExpert")}
                >
                  Expert Status
                </TableSortLabel>
              </TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading && !data?.data
              ? [...Array(rowsPerPage)].map((_, index) => (
                  <TableRow key={index}>
                    {[...Array(7)].map((_, i) => (
                      <TableCell key={i}>
                        <Skeleton />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              : data?.data.map((item) => (
                  <TableRow key={item.user.id}>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        <CommonAvatar uri={item.user.image?.url} />
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
                    <TableCell>{item.certificateAmount}</TableCell>
                    <TableCell>
                      <Box
                        className="status-badge"
                        style={{ backgroundColor: statusColors.Accepted }}
                      >
                        {item.acceptedAmount}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box
                        className="status-badge"
                        style={{ backgroundColor: statusColors.Pending }}
                      >
                        {item.pendingAmount}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box
                        className="status-badge"
                        style={{ backgroundColor: statusColors.Rejected }}
                      >
                        {item.rejectedAmount}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box
                        className="status-badge"
                        style={{
                          backgroundColor: item.isExpert
                            ? statusColors.Expert
                            : statusColors["Non-Expert"],
                        }}
                      >
                        {item.isExpert ? "Expert" : "Non-Expert"}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        component={Link}
                        to={`/certificates/user/${item.user.id}`}
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
          count={data?.data.length || 0}
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