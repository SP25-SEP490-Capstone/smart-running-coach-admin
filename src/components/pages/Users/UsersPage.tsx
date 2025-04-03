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
  Divider
} from "@mui/material";
import {
  Search,
  FilterList,
  Download,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Close,
  Check,
  CalendarToday
} from "@mui/icons-material";
import "./UsersPage.scss";
import { Link } from "react-router-dom";
import { aget } from "@components/utils/util_axios";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { exportToExcel, prepareUserDataForExport } from "@utils/util_xlsx";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [filters, setFilters] = useState({
    status: null,
    role: null,
    dateFrom: null,
    dateTo: null
  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await aget('/users');
        if (response.status === 200) {
          setUsers(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleSort = (field) => {
    const isAsc = sortField === field && sortOrder === "asc";
    setSortField(field);
    setSortOrder(isAsc ? "desc" : "asc");
  };

  const handleFilterClick = (event) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  const applyFilters = () => {
    setPage(0);
    handleFilterClose();
  };

  const clearFilters = () => {
    setFilters({
      status: null,
      role: null,
      dateFrom: null,
      dateTo: null
    });
    setPage(0);
    handleFilterClose();
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return dayjs(dateString).format('MMM D, YYYY');
  };

  const formatDateTimeForExport = (dateString) => {
    if (!dateString) return '';
    return dayjs(dateString).format('MMM D, YYYY h:mm A');
  };

  const getRole = (userRoles) => {
    if (!userRoles || userRoles.length === 0) return 'User';
    const roles = userRoles.map(ur => ur.Role?.role_name);
    if (roles.includes('admin')) return 'Admin';
    if (roles.includes('runner')) return 'Runner';
    if (roles.includes('expert')) return 'Expert';
    return roles[0] || 'User';
  };

  const handleExport = () => {
    const filteredData = applyFiltersToUsers(users);
    const exportData = prepareUserDataForExport(filteredData, formatDateTimeForExport);
    exportToExcel(exportData, 'users_export');
  };

  const applyFiltersToUsers = (usersList) => {
    return usersList.filter(user => {
      // Search filter
      const matchesSearch = 
        user.name?.toLowerCase().includes(search.toLowerCase()) ||
        user.email?.toLowerCase().includes(search.toLowerCase()) ||
        getRole(user.UserRole).toLowerCase().includes(search.toLowerCase());

      // Status filter
      const matchesStatus = 
        !filters.status || 
        (filters.status === 'active' && user.is_active) || 
        (filters.status === 'inactive' && !user.is_active);

      // Role filter
      const matchesRole = 
        !filters.role || 
        getRole(user.UserRole).toLowerCase().includes(filters.role.toLowerCase());

      // Date range filter
      const userDate = dayjs(user.created_at);
      const matchesDateFrom = !filters.dateFrom || userDate.isSameOrAfter(dayjs(filters.dateFrom), 'day');
      const matchesDateTo = !filters.dateTo || userDate.isSameOrBefore(dayjs(filters.dateTo), 'day');

      return matchesSearch && matchesStatus && matchesRole && matchesDateFrom && matchesDateTo;
    });
  };

  const sortedUsers = [...applyFiltersToUsers(users)].sort((a, b) => {
    if (!sortField) return 0;
    
    let aValue, bValue;
    
    if (sortField === 'role') {
      aValue = getRole(a.UserRole);
      bValue = getRole(b.UserRole);
    } else if (sortField === 'created') {
      aValue = dayjs(a.created_at);
      bValue = dayjs(b.created_at);
    } else if (sortField === 'status') {
      aValue = a.is_active;
      bValue = b.is_active;
    } else {
      aValue = a[sortField];
      bValue = b[sortField];
    }

    if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
    if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedUsers = sortedUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <div className="users-page">
      <div className="header">
        <div className='title-container'>
          <h1>Users</h1>
        </div>
        <div className="actions">
          <div className="left">
            <TextField
              className='input-search'
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
              className='btn-filter' 
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
                vertical: 'bottom',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
            >
              <Box sx={{ p: 2, width: 300 }}>
                <Typography variant="subtitle1">Filter Users</Typography>
                <Divider sx={{ my: 1 }} />
                
                <Typography variant="subtitle2" sx={{ mt: 1 }}>Status</Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <Button
                    variant={filters.status === 'active' ? 'contained' : 'outlined'}
                    size="small"
                    startIcon={filters.status === 'active' ? <Check /> : null}
                    onClick={() => setFilters({...filters, status: filters.status === 'active' ? null : 'active'})}
                  >
                    Active
                  </Button>
                  <Button
                    variant={filters.status === 'inactive' ? 'contained' : 'outlined'}
                    size="small"
                    startIcon={filters.status === 'inactive' ? <Check /> : null}
                    onClick={() => setFilters({...filters, status: filters.status === 'inactive' ? null : 'inactive'})}
                  >
                    Inactive
                  </Button>
                </Box>

                <Typography variant="subtitle2">Role</Typography>
                <TextField
                  select
                  fullWidth
                  size="small"
                  value={filters.role || ''}
                  onChange={(e) => setFilters({...filters, role: e.target.value || null})}
                  sx={{ mb: 2 }}
                >
                  <MenuItem value="">All Roles</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                  <MenuItem value="runner">Coach Expert</MenuItem>
                  <MenuItem value="user">User</MenuItem>
                </TextField>

                <Typography variant="subtitle2">Date Range</Typography>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <Box sx={{ display: 'flex', gap: 1, mb: 2, flexDirection: 'column' }}>
                    <DatePicker
                      label="From"
                      value={filters.dateFrom ? dayjs(filters.dateFrom) : null}
                      onChange={(newValue) => setFilters({...filters, dateFrom: newValue ? newValue.toISOString() : null})}
                      slotProps={{ textField: { size: 'small', fullWidth: true } }}
                    />
                    <DatePicker
                      label="To"
                      value={filters.dateTo ? dayjs(filters.dateTo) : null}
                      onChange={(newValue) => setFilters({...filters, dateTo: newValue ? newValue.toISOString() : null})}
                      slotProps={{ textField: { size: 'small', fullWidth: true } }}
                    />
                  </Box>
                </LocalizationProvider>

                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Button onClick={clearFilters} startIcon={<Close />}>Clear</Button>
                  <Button onClick={applyFilters} variant="contained">Apply</Button>
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
        <TableHead>
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
                active={sortField === "role"}
                direction={sortField === "role" ? sortOrder : "asc"}
                onClick={() => handleSort("role")}
              >
                Role
              </TableSortLabel>
            </TableCell>
            <TableCell>
              <TableSortLabel
                active={sortField === "status"}
                direction={sortField === "status" ? sortOrder : "asc"}
                onClick={() => handleSort("status")}
              >
                Status
              </TableSortLabel>
            </TableCell>
            <TableCell>
              <TableSortLabel
                active={sortField === "created"}
                direction={sortField === "created" ? sortOrder : "asc"}
                onClick={() => handleSort("created")}
              >
                Created Date
              </TableSortLabel>
            </TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {loading ? (
            Array(rowsPerPage).fill(0).map((_, index) => (
              <TableRow key={index}>
                <TableCell>
                  <div className="user-info">
                    <Skeleton circle width={40} height={40} />
                    <Skeleton width={100} style={{ marginLeft: '10px' }} />
                  </div>
                </TableCell>
                <TableCell><Skeleton width={150} /></TableCell>
                <TableCell><Skeleton width={80} /></TableCell>
                <TableCell><Skeleton width={60} /></TableCell>
                <TableCell><Skeleton width={120} /></TableCell>
                <TableCell>
                  <Skeleton width={40} height={40} style={{ marginRight: '10px', display: 'inline-block' }} />
                  <Skeleton width={40} height={40} style={{ display: 'inline-block' }} />
                </TableCell>
              </TableRow>
            ))
          ) : (
            paginatedUsers.length > 0 ? (
              paginatedUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <Link className="user-info" to={`/users/${user.id}`}>
                      <Avatar className="avatar">{user.name?.charAt(0)}</Avatar>
                      <span>{user.name}</span>
                    </Link>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <span className={`role ${getRole(user.UserRole).toLowerCase().replace(" ", "-")}`}>
                      {getRole(user.UserRole)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={`status ${user.is_active ? 'active' : 'inactive'}`}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CalendarToday fontSize="small" color="action" />
                      {formatDate(user.created_at)}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Button className="btn-edit"><EditIcon /></Button>
                    <Button className="btn-delete"><DeleteIcon /></Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No users found matching your criteria
                </TableCell>
              </TableRow>
            )
          )}
        </TableBody>
      </Table>

      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={sortedUsers.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </div>
  );
}