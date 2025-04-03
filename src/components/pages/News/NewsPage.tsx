import { useState, useEffect } from "react";
import {
  Box, Button, Chip, IconButton, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TextField, MenuItem, InputLabel, FormControl,
  Paper, TablePagination, TableSortLabel, Menu, InputAdornment, CircularProgress,
  Typography, Tooltip
} from "@mui/material";
import { Edit, Delete, FilterList, Search, Event } from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import "./NewsPage.scss";
import { Link } from "react-router-dom";
import CommonDialog from "@components/commons/CommonDialog";
import { aget, adelete } from "@components/utils/util_axios";
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

interface Article {
  id: string;
  title: string;
  content: string;
  status: "Draft" | "Published" | "Archived";
  date: string;
  tag: string;
  news_type_id: string;
  is_draft: boolean;
  archive: boolean;
  created_at: string;
}

interface NewsType {
  id: string;
  type_name: string;
  description: string;
}

// Function to remove HTML tags and truncate text
const stripHtmlAndTruncate = (html: string, maxLength: number = 100) => {
  if (!html) return '';
  const stripped = html.replace(/<[^>]*>?/gm, '');
  return stripped.length > maxLength 
    ? stripped.substring(0, maxLength) + '...' 
    : stripped;
};

export default function NewsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | "Draft" | "Published" | "Archived">("All");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [order, setOrder] = useState<"asc" | "desc">("asc");
  const [orderBy, setOrderBy] = useState("title");
  const [statusAnchorEl, setStatusAnchorEl] = useState<null | HTMLElement>(null);
  const [dateAnchorEl, setDateAnchorEl] = useState<null | HTMLElement>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [newsTypes, setNewsTypes] = useState<NewsType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNewsData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch news types
      const typesResponse = await aget("/news/types");
      setNewsTypes(typesResponse.data.data);

      // Fetch articles for admin (includes drafts and archived)
      const articlesResponse = await aget("/news/admin/all");
      const formattedArticles = articlesResponse.data.data.map((article: any) => ({
        ...article,
        status: article.archive ? "Archived" : article.is_draft ? "Draft" : "Published",
        date: new Date(article.created_at).toLocaleDateString(),
        tag: typesResponse.data.data.find((type: NewsType) => type.id === article.news_type_id)?.type_name || "Unknown",
      }));
      
      setArticles(formattedArticles);
    } catch (err) {
      console.error("Failed to fetch news data:", err);
      setError("Failed to load news data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNewsData();
  }, []);

  const handleDeleteArticle = async () => {
    if (!selectedArticle) return;
    
    try {
      await adelete(`/news/admin/${selectedArticle.id}`);
      await fetchNewsData(); // Refresh the list
      setDialogOpen(false);
    } catch (err) {
      console.error("Failed to delete article:", err);
      setError("Failed to delete article. Please try again.");
    }
  };

  const handleSort = (property: string) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleStatusFilter = (status: "All" | "Draft" | "Published" | "Archived") => {
    setStatusFilter(status);
    setStatusAnchorEl(null);
  };

  const filteredArticles = articles
    .filter(article => 
      article.title.toLowerCase().includes(search.toLowerCase()) ||
      article.content.toLowerCase().includes(search.toLowerCase())
    )
    .filter(article => {
      if (statusFilter === "All") return true;
      if (statusFilter === "Draft") return article.is_draft && !article.archive;
      if (statusFilter === "Published") return !article.is_draft && !article.archive;
      if (statusFilter === "Archived") return article.archive;
      return true;
    })
    .filter(article => {
      if (!startDate && !endDate) return true;
      const articleDate = new Date(article.created_at);
      return (
        (!startDate || articleDate >= startDate) && 
        (!endDate || articleDate <= endDate)
      );
    })
    .sort((a, b) => {
      const aValue = a[orderBy as keyof Article];
      const bValue = b[orderBy as keyof Article];
      
      if (order === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Published": return "success";
      case "Draft": return "warning";
      case "Archived": return "error";
      default: return "default";
    }
  };

  if (loading) {
    return (
      <Box className="news-container">
        <div className='title-container'>
          <h1>News Management</h1>
        </div>
        <Box className="news-filters">
          <Box>
            <Skeleton width={200} height={40} style={{ marginRight: 16 }} />
            <Skeleton width={40} height={40} circle style={{ marginRight: 16 }} />
            <Skeleton width={40} height={40} circle />
          </Box>
          <Skeleton width={180} height={40} />
        </Box>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                {['Title', 'Content Preview', 'Status', 'Date Created', 'Type', 'Actions'].map((header) => (
                  <TableCell key={header}>
                    <Skeleton width={100} />
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell><Skeleton /></TableCell>
                  <TableCell><Skeleton /></TableCell>
                  <TableCell><Skeleton width={80} /></TableCell>
                  <TableCell><Skeleton width={100} /></TableCell>
                  <TableCell><Skeleton width={60} /></TableCell>
                  <TableCell>
                    <Skeleton width={80} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Box p={2}>
            <Skeleton width={300} height={40} />
          </Box>
        </TableContainer>
      </Box>
    );
  }

  if (error) {
    return (
      <Box className="news-container">
        <div className='title-container'>
          <h1>News Management</h1>
          <Box color="error.main" p={2}>
            {error}
          </Box>
          <Button variant="contained" onClick={fetchNewsData}>
            Retry
          </Button>
        </div>
      </Box>
    );
  }

  return (
    <Box className="news-container">
      <div className='title-container'>
        <h1>News Management</h1>
      </div>
      
      <Box className="news-filters">
        <Box>
          <TextField
            className='field-search'
            placeholder="Search articles..."
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
          
          <IconButton onClick={(e) => setStatusAnchorEl(e.currentTarget)}>
            <FilterList />
          </IconButton>
          
          <Menu
            anchorEl={statusAnchorEl}
            open={Boolean(statusAnchorEl)}
            onClose={() => setStatusAnchorEl(null)}
          >
            <MenuItem onClick={() => handleStatusFilter("All")}>All Status</MenuItem>
            <MenuItem onClick={() => handleStatusFilter("Published")}>Published</MenuItem>
            <MenuItem onClick={() => handleStatusFilter("Draft")}>Draft</MenuItem>
            <MenuItem onClick={() => handleStatusFilter("Archived")}>Archived</MenuItem>
          </Menu>
          
          <IconButton onClick={(e) => setDateAnchorEl(e.currentTarget)}>
            <Event />
          </IconButton>
          
          <Menu
            anchorEl={dateAnchorEl}
            open={Boolean(dateAnchorEl)}
            onClose={() => setDateAnchorEl(null)}
          >
            <Box className='news-page-filter-date' p={2}>
              <DatePicker
                label="Start Date"
                value={startDate}
                onChange={setStartDate}
                slotProps={{ textField: { size: 'small', fullWidth: true } }}
              />
              <DatePicker
                label="End Date"
                value={endDate}
                onChange={setEndDate}
                slotProps={{ textField: { size: 'small', fullWidth: true } }}
              />
            </Box>
          </Menu>
        </Box>

        <Button
          className="btn-create-news"
          variant="contained"
          color="primary"
          component={Link}
          to="/news/create"
        >
          + Create New Article
        </Button>
      </Box>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <TableSortLabel
                  active={orderBy === "title"}
                  direction={orderBy === "title" ? order : "asc"}
                  onClick={() => handleSort("title")}
                >
                  Title
                </TableSortLabel>
              </TableCell>
              <TableCell>Content Preview</TableCell>
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
                  active={orderBy === "created_at"}
                  direction={orderBy === "created_at" ? order : "asc"}
                  onClick={() => handleSort("created_at")}
                >
                  Date Created
                </TableSortLabel>
              </TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredArticles.length > 0 ? (
              filteredArticles
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((article) => (
                  <TableRow key={article.id}>
                    <TableCell className="news-title">
                      {article.title}
                      {article.archive && <span style={{ color: '#999', marginLeft: '8px' }}>(Archived)</span>}
                    </TableCell>
                    <TableCell>
                      <Tooltip title={stripHtmlAndTruncate(article.content, 200)} arrow>
                        <Typography variant="body2" noWrap>
                          {stripHtmlAndTruncate(article.content, 60)}
                        </Typography>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={article.status} 
                        color={getStatusColor(article.status)} 
                      />
                    </TableCell>
                    <TableCell>{article.date}</TableCell>
                    <TableCell>
                      <Chip label={article.tag} variant="outlined" />
                    </TableCell>
                    <TableCell>
                      <IconButton 
                        color="primary" 
                        component={Link} 
                        to={`/news/edit/${article.id}`}
                        disabled={article.archive}
                      >
                        <Edit />
                      </IconButton>
                      <IconButton 
                        color="error" 
                        onClick={() => {
                          setSelectedArticle(article);
                          setDialogOpen(true);
                        }}
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No articles found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredArticles.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </TableContainer>
      
      <CommonDialog
        open={dialogOpen}
        maxWidth='sm'
        onClose={() => setDialogOpen(false)}
        onConfirm={handleDeleteArticle}
        title="Delete Article"
        description={`Are you sure you want to delete "${selectedArticle?.title}"?`}
        children={
          <div style={{padding: '20px'}}>
            <p>Are you sure you want to delete "{selectedArticle?.title}"?</p>
            <p style={{color: 'red'}}>You cannot undo this action.</p>
          </div>
        }
        footer={
          <>
            <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button variant='contained' color="error" onClick={handleDeleteArticle}>
              Delete
            </Button>
          </>
        }
      />
    </Box>
  );
}