import { useEffect, useState } from "react";
import {
  Container, Paper, Typography, Box, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Avatar, TextField, IconButton, TablePagination,
  TableSortLabel, InputAdornment
} from "@mui/material";
import { Search, FilterList, Download, Edit, Delete } from "@mui/icons-material";
import "./PostsPage.scss";
import { Link } from "react-router-dom";
import { aget } from "@components/utils/util_axios";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

interface Post {
  id: string;
  title: string;
  user: {
    username: string;
  };
  is_deleted: boolean;
  created_at: string;
  upvote_count: number;
  downvote_count: number;
  comment_count: number;
}

const statusColors = {
  Active: "#d4edda",
  Deleted: "#f8d7da",
};

export default function PostsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

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
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const fetchPostsApi = () => {
    setLoading(true);
    aget("/posts").then((res) => {
      if (res.status === 200) {
        setPosts(res.data.data);
      }
    }).finally(() => {
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchPostsApi();
  }, []);

  const getStatus = (isDeleted: boolean) => {
    return isDeleted ? "Deleted" : "Active";
  };

  const getAvatarInitial = (username: string) => {
    return username ? username.charAt(0).toUpperCase() : "";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div className="posts-page">
      <div className='title-container'>
        <h1 className="title">Posts Management</h1>
      </div>
      {loading ? (
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
            <div className="value">{posts.length}</div>
          </div>
          <div className="stat-card active">
            <div className="label">Active Posts</div>
            <div className="value">{posts.filter(p => !p.is_deleted).length}</div>
          </div>
          <div className="stat-card pending">
            <div className="label">Deleted Posts</div>
            <div className="value">{posts.filter(p => p.is_deleted).length}</div>
          </div>
          <div className="stat-card reported">
            <div className="label">Total Comments</div>
            <div className="value">{posts.reduce((sum, post) => sum + post.comment_count, 0)}</div>
          </div>
        </Box>
      )}
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
                  active={sortConfig.key === 'user.username'}
                  direction={sortConfig.key === 'user.username' ? sortConfig.direction : 'asc'}
                  onClick={() => handleSort('user.username')}
                >
                  Author
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortConfig.key === 'is_deleted'}
                  direction={sortConfig.key === 'is_deleted' ? sortConfig.direction : 'asc'}
                  onClick={() => handleSort('is_deleted')}
                >
                  Status
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortConfig.key === 'upvote_count'}
                  direction={sortConfig.key === 'upvote_count' ? sortConfig.direction : 'asc'}
                  onClick={() => handleSort('upvote_count')}
                >
                  Votes
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortConfig.key === 'comment_count'}
                  direction={sortConfig.key === 'comment_count' ? sortConfig.direction : 'asc'}
                  onClick={() => handleSort('comment_count')}
                >
                  Comments
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortConfig.key === 'created_at'}
                  direction={sortConfig.key === 'created_at' ? sortConfig.direction : 'asc'}
                  onClick={() => handleSort('created_at')}
                >
                  Date
                </TableSortLabel>
              </TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              [...Array(rowsPerPage)].map((_, index) => (
                <TableRow key={index}>
                  {[...Array(7)].map((_, i) => (
                    <TableCell key={i}>
                      <Skeleton />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              filteredPosts.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((post) => (
                <TableRow key={post.id}>
                  <TableCell className='post-title'>
                    <Link to={`/posts/${post.id}`}>
                      <p className='post-title'>{post.title}</p>
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <Avatar className='post-avatar'>{getAvatarInitial(post.user.username)}</Avatar>
                      <Typography marginLeft={1} className='post-author'>{post.user.username}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box className="status-badge" style={{ backgroundColor: statusColors[getStatus(post.is_deleted)] }}>
                      {getStatus(post.is_deleted)}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <span className="votes-up">⬆ {post.upvote_count}</span> <span className="votes-down">⬇ {post.downvote_count}</span>
                  </TableCell>
                  <TableCell>{post.comment_count}</TableCell>
                  <TableCell>{formatDate(post.created_at)}</TableCell>
                  <TableCell>
                    <IconButton><Edit /></IconButton>
                    <IconButton color="error"><Delete /></IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
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