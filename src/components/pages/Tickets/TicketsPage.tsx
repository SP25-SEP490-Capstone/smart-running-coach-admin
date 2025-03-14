import { useState } from "react";
import {
  Box, Button, Chip, IconButton, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TextField, Paper, TablePagination, TableSortLabel, Menu, MenuItem, InputAdornment
} from "@mui/material";
import { Visibility, ChatBubbleOutline, Cancel, FilterList, Edit, Search } from "@mui/icons-material";
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { Link } from "react-router-dom";
import CommonDialog from "@components/commons/CommonDialog";
import AlternateEmailIcon from '@mui/icons-material/AlternateEmail';
import "./TicketsPage.scss";

const tickets = [
  { id: "TKT-001", subject: "Unable to access account", email: "sarah.parker@example.com", status: "Open", priority: "High", updated: "2024-01-15 14:30", read: false },
  { id: "TKT-002", subject: "Payment processing error", email: "john.doe@example.com", status: "Pending", priority: "Medium", updated: "2024-01-15 13:45", read: true },
  { id: "TKT-003", subject: "Feature request: Dark mode", email: "mike.wilson@example.com", status: "Closed", priority: "Low", updated: "2024-01-15 12:20", read: false },
  { id: "TKT-004", subject: "Integration issues with API", email: "tech.team@example.com", status: "Open", priority: "High", updated: "2024-01-15 11:15", read: true },
  { id: "TKT-005", subject: "Billing cycle question", email: "finance@example.com", status: "Pending", priority: "Medium", updated: "2024-01-15 10:30", read: false },
  { id: "TKT-006", subject: "Password reset not working", email: "user.support@example.com", status: "Open", priority: "High", updated: "2024-01-15 09:45", read: true },
  { id: "TKT-007", subject: "Export data functionality", email: "data.team@example.com", status: "Closed", priority: "Low", updated: "2024-01-15 08:20", read: false },
];

const getStatusChip = (status: string) => {
  const colors = { Open: "success", Pending: "warning", Closed: "default" };
  return <Chip label={status} color={colors[status]} variant="contained" />;
};

const getPriorityChip = (priority: string) => {
  const colors = { High: "error", Medium: "warning", Low: "success" };
  return <Chip label={priority} color={colors[priority]} variant="contained" />;
};

export default function TicketsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [order, setOrder] = useState<"asc" | "desc">("asc");
  const [orderBy, setOrderBy] = useState("updated");
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
  const [dateAnchorEl, setDateAnchorEl] = useState<null | HTMLElement>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<number | null>(null);

  const handleSort = (property: string) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterClick = (event: React.MouseEvent<HTMLElement>) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  const handleDateClick = (event: React.MouseEvent<HTMLElement>) => {
    setDateAnchorEl(event.currentTarget);
  };

  const handleDateClose = () => {
    setDateAnchorEl(null);
  };

  const handleDeleteClick = (index: number) => {
    setSelectedTicket(index);
    setDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedTicket !== null) {
      tickets.splice(selectedTicket, 1);
    }
    setDialogOpen(false);
    setSelectedTicket(null);
  };

  const handleToggleRead = (index: number) => {
    tickets[index].read = !tickets[index].read;
  };

  const filteredTickets = tickets
    .filter((ticket) => ticket.subject.toLowerCase().includes(search.toLowerCase()))
    .filter((ticket) => statusFilter === "" || ticket.status === statusFilter)
    .filter((ticket) => priorityFilter === "" || ticket.priority === priorityFilter)
    .filter((ticket) => {
      const ticketDate = new Date(ticket.updated);
      return (!startDate || ticketDate >= startDate) && (!endDate || ticketDate <= endDate);
    })
    .sort((a, b) => {
      if (order === "asc") {
        return a[orderBy] > b[orderBy] ? 1 : -1;
      } else {
        return a[orderBy] < b[orderBy] ? 1 : -1;
      }
    });

  return (
    <Box className="tickets-page">
      <div className='title-container'>
        <h1>Tickets</h1>
      </div>
      <Box display="flex" justifyContent="space-between" mb={2}>
        <Box className='filter-container'>
          <TextField
            variant="outlined"
            placeholder="Search tickets..."
            size="small"
            className="search-box"
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
          <IconButton onClick={handleFilterClick}>
            <FilterList />
          </IconButton>
          <p className='status-filter'>{statusFilter || "All status"}</p>
          <Menu
            anchorEl={filterAnchorEl}
            open={Boolean(filterAnchorEl)}
            onClose={handleFilterClose}
          >
            <MenuItem onClick={() => setStatusFilter("")}>All Status</MenuItem>
            <MenuItem onClick={() => setStatusFilter("Open")}>Open</MenuItem>
            <MenuItem onClick={() => setStatusFilter("Pending")}>Pending</MenuItem>
            <MenuItem onClick={() => setStatusFilter("Closed")}>Closed</MenuItem>
          </Menu>
          <IconButton onClick={handleDateClick}>
            <CalendarMonthIcon />
          </IconButton>
          <Menu
            anchorEl={dateAnchorEl}
            open={Boolean(dateAnchorEl)}
            onClose={handleDateClose}
          >
            <Box className='tickets-page-filter-date' p={2}>
              <DatePicker
                label="Start Date"
                value={startDate}
                onChange={(newValue) => setStartDate(newValue)}
                renderInput={(params) => <TextField {...params} size="small" fullWidth />}
              />
              <DatePicker
                label="End Date"
                value={endDate}
                onChange={(newValue) => setEndDate(newValue)}
                renderInput={(params) => <TextField {...params} size="small" fullWidth />}
              />
            </Box>
          </Menu>
        </Box>
        <Box>
          <Link to="/tickets/compose">
            <Button variant="contained" color="primary" className="btn-email-manual" startIcon={<AlternateEmailIcon />}>Send email manually</Button>
          </Link>
        </Box>
      </Box>
      <TableContainer component={Paper} className="table-container">
        <Table>
          <TableHead>
            <TableRow className="table-header">
              <TableCell>Ticket ID</TableCell>
              <TableCell>Subject</TableCell>
              <TableCell>Customer Email</TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === "status"}
                  direction={orderBy === "status" ? order : "asc"}
                  onClick={() => handleSort("status")}
                >
                  Status
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === "priority"}
                  direction={orderBy === "priority" ? order : "asc"}
                  onClick={() => handleSort("priority")}
                >
                  Priority
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === "updated"}
                  direction={orderBy === "updated" ? order : "asc"}
                  onClick={() => handleSort("updated")}
                >
                  Last Updated
                </TableSortLabel>
              </TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredTickets
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((ticket, index) => (
                <TableRow key={ticket.id} className="table-row">
                  <TableCell>{ticket.id}</TableCell>
                  <TableCell>{ticket.subject}</TableCell>
                  <TableCell>{ticket.email}</TableCell>
                  <TableCell>{getStatusChip(ticket.status)}</TableCell>
                  <TableCell>{getPriorityChip(ticket.priority)}</TableCell>
                  <TableCell>{ticket.updated}</TableCell>
                  <TableCell>
                    <IconButton size="small" color={ticket.read ? "default" : "primary"} onClick={() => handleToggleRead(index)}>
                      <Visibility />
                    </IconButton>
                    <IconButton size="small" color="primary" component={Link} to={`/tickets/edit/${ticket.id}`}>
                      <Edit />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => handleDeleteClick(index)}>
                      <Cancel />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredTickets.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>
      <CommonDialog
        open={dialogOpen}
        maxWidth='sm'
        onClose={() => setDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Ticket"
        description="Are you sure you want to delete this ticket?"
        children={<Box sx={{ padding: 2 }}>
          <p>Do you wish to delete this ticket?</p>
        </Box>}
        footer={<Button variant='contained' color="error" onClick={handleDeleteConfirm}>Delete</Button>}
      />
    </Box>
  );
}