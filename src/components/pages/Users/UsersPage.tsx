import { useState } from "react";
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
  TableSortLabel
} from "@mui/material";
import {
  Search,
  FilterList,
  FileDownload,
  Download,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowUpward,
  ArrowDownward
} from "@mui/icons-material";
import "./UsersPage.scss";
import { Link } from "react-router-dom";

const usersData = [
  { id: 1, name: "Sarah Wilson", email: "sarah.wilson@example.com", role: "Admin", status: "Active", created: "2024-01-15 09:30 AM" },
  { id: 2, name: "Michael Chen", email: "michael.chen@example.com", role: "Coach Expert", status: "Active", created: "2024-01-15 08:45 AM" },
  { id: 3, name: "Emma Thompson", email: "emma.t@example.com", role: "User", status: "Inactive", created: "2024-01-14 03:20 PM" },
  { id: 4, name: "James Rodriguez", email: "james.r@example.com", role: "Coach Expert", status: "Active", created: "2024-01-15 10:15 AM" },
  { id: 5, name: "Lisa Wang", email: "lisa.wang@example.com", role: "Admin", status: "Active", created: "2024-01-15 09:00 AM" }
];

export default function UsersPage() {
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const handleSort = (field) => {
    const isAsc = sortField === field && sortOrder === "asc";
    setSortField(field);
    setSortOrder(isAsc ? "desc" : "asc");
  };

  const sortedUsers = [...usersData]
    .filter(user =>
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (!sortField) return 0;
      if (a[sortField] < b[sortField]) return sortOrder === "asc" ? -1 : 1;
      if (a[sortField] > b[sortField]) return sortOrder === "asc" ? 1 : -1;
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
              placeholder="Search posts..."
              variant="outlined"
              size="small"
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
            <Button className='btn-filter' variant="outlined" startIcon={<FilterList />}>Filter</Button>
            <Button className="btn-export" variant="outlined" startIcon={<Download />}>Export</Button>

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
            <TableCell>Status</TableCell>
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
          {paginatedUsers.map((user, index) => (
            <TableRow key={index}>
              <TableCell>
                <Link className="user-info" to={`/users/${user.id}`}>
                  <Avatar className="avatar">{user.name.charAt(0)}</Avatar>
                  <span>{user.name}</span>
                </Link>
              </TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell><span className={`role ${user.role.toLowerCase().replace(" ", "-")}`}>{user.role}</span></TableCell>
              <TableCell><span className={`status ${user.status.toLowerCase()}`}>{user.status}</span></TableCell>
              <TableCell>{user.created}</TableCell>
              <TableCell>
                <Button className="btn-edit"><EditIcon /></Button>
                <Button className="btn-delete"><DeleteIcon /></Button>
              </TableCell>
            </TableRow>
          ))}
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