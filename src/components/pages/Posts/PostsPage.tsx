import { useState } from "react";
import {
  Container, Paper, Typography, Box, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Avatar, TextField, IconButton, TablePagination,
  TableSortLabel,
  InputAdornment
} from "@mui/material";
import { Search, FilterList, Download, Edit, Delete } from "@mui/icons-material";
import "./PostsPage.scss";
import { Link } from "react-router-dom";

const posts = [
  { id: 1, title: "The Future of Artificial Intelligence", author: "Sarah Johnson", status: "Published", votes: 1234, downvotes: 123, comments: 89, date: "2024-02-10", avatar: "S" },
  { id: 2, title: "10 Tips for Sustainable Living", author: "Michael Chen", status: "Pending", votes: 1234, downvotes: 123, comments: 45, date: "2024-02-09", avatar: "M" },
  { id: 3, title: "Understanding Cryptocurrency", author: "Alex Thompson", status: "Removed", votes: 1234, downvotes: 123, comments: 167, date: "2024-02-08", avatar: "A" },
  { id: 4, title: "The Impact of Remote Work", author: "Emily Rodriguez", status: "Published", votes: 1234, downvotes: 123, comments: 73, date: "2024-02-07", avatar: "E" },
  { id: 5, title: "Essential Cooking Skills", author: "David Kim", status: "Published", votes: 1234, downvotes: 123, comments: 124, date: "2024-02-06", avatar: "D" },
];

const statusColors = {
  Published: "#d4edda",
  Pending: "#fff3cd",
  Removed: "#f8d7da",
};

export default function PostsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedPosts = [...posts].sort((a, b) => {
    if (sortConfig.key) {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
    }
    return 0;
  });

  const filteredPosts = sortedPosts.filter((post) =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <div className="posts-page">
      <div className='title-container'>
        <h1 className="title">Posts Management</h1>
      </div>
      <Box className="stats">
        <div className="stat-card total">
          <div className="label">Total Posts</div>
          <div className="value">12,345</div>
        </div>
        <div className="stat-card active">
          <div className="label">Active Posts</div>
          <div className="value">10,234</div>
        </div>
        <div className="stat-card pending">
          <div className="label">Pending Posts</div>
          <div className="value">1,234</div>
        </div>
        <div className="stat-card reported">
          <div className="label">Reported Posts</div>
          <div className="value">877</div>
        </div>
      </Box>
      <Box className="actions">
        <TextField
          className='input-search'
          placeholder="Search posts..."
          variant="outlined"
          size="small"
          onChange={(e) => setSearchTerm(e.target.value)}
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
      </Box>
      <TableContainer component={Paper} className='table'>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <TableSortLabel
                  active={sortConfig.key === 'title'}
                  direction={sortConfig.key === 'title' ? sortConfig.direction : 'asc'}
                  onClick={() => handleSort('title')}
                >
                  Post Title
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortConfig.key === 'author'}
                  direction={sortConfig.key === 'author' ? sortConfig.direction : 'asc'}
                  onClick={() => handleSort('author')}
                >
                  Author
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortConfig.key === 'status'}
                  direction={sortConfig.key === 'status' ? sortConfig.direction : 'asc'}
                  onClick={() => handleSort('status')}
                >
                  Status
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortConfig.key === 'votes'}
                  direction={sortConfig.key === 'votes' ? sortConfig.direction : 'asc'}
                  onClick={() => handleSort('votes')}
                >
                  Votes
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortConfig.key === 'comments'}
                  direction={sortConfig.key === 'comments' ? sortConfig.direction : 'asc'}
                  onClick={() => handleSort('comments')}
                >
                  Comments
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortConfig.key === 'date'}
                  direction={sortConfig.key === 'date' ? sortConfig.direction : 'asc'}
                  onClick={() => handleSort('date')}
                >
                  Date
                </TableSortLabel>
              </TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredPosts.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((post, index) => (
              <TableRow key={index}>
                <TableCell className='post-title'>
                  <Link to={`/posts/${post.id}`}>
                    <p className='post-title'>{post.title}</p>
                  </Link>
                </TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center">
                    <Avatar className='post-avatar'>{post.avatar}</Avatar>
                    <Typography marginLeft={1} className='post-author'>{post.author}</Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box className="status-badge" style={{ backgroundColor: statusColors[post.status] }}>
                    {post.status}
                  </Box>
                </TableCell>
                <TableCell>
                  <span className="votes-up">⬆ {post.votes}</span> <span className="votes-down">⬇ {post.downvotes}</span>
                </TableCell>
                <TableCell>{post.comments}</TableCell>
                <TableCell>{post.date}</TableCell>
                <TableCell>
                  <IconButton><Edit /></IconButton>
                  <IconButton color="error"><Delete /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredPosts.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>
    </div>
  );
}