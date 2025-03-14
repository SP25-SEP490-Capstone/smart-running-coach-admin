import { useState } from "react";
import {
  Box, Button, Chip, IconButton, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TextField, MenuItem, InputLabel, FormControl,
  Paper, TablePagination, TableSortLabel, Menu, InputAdornment
} from "@mui/material";
import { Edit, Delete, FilterList, Search, Event } from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import "./NewsPage.scss";
import { Link } from "react-router-dom";
import CommonDialog from "@components/commons/CommonDialog";

const articles = [
  { title: "The Future of Artificial Intelligence in Modern Healthcare", status: "Released", date: "2/15/2024", tag: "Official" },
  { title: "Sustainable Energy Solutions for Urban Development", status: "Draft", date: "2/13/2024", tag: "Event" },
];

export default function NewsPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [order, setOrder] = useState<"asc" | "desc">("asc");
  const [orderBy, setOrderBy] = useState("title");
  const [statusAnchorEl, setStatusAnchorEl] = useState<null | HTMLElement>(null);
  const [dateAnchorEl, setDateAnchorEl] = useState<null | HTMLElement>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<number | null>(null);

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

  const handleStatusClick = (event: React.MouseEvent<HTMLElement>) => {
    setStatusAnchorEl(event.currentTarget);
  };

  const handleStatusClose = () => {
    setStatusAnchorEl(null);
  };

  const handleDateClick = (event: React.MouseEvent<HTMLElement>) => {
    setDateAnchorEl(event.currentTarget);
  };

  const handleDateClose = () => {
    setDateAnchorEl(null);
  };

  const handleDeleteClick = (index: number) => {
    setSelectedArticle(index);
    setDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedArticle !== null) {
      articles.splice(selectedArticle, 1);
    }
    setDialogOpen(false);
    setSelectedArticle(null);
  };

  const filteredArticles = articles
    .filter((article) => article.title.toLowerCase().includes(search.toLowerCase()))
    .filter((article) => status === "" || article.status === status)
    .filter((article) => {
      const articleDate = new Date(article.date);
      return (!startDate || articleDate >= startDate) && (!endDate || articleDate <= endDate);
    })
    .sort((a, b) => {
      if (order === "asc") {
        return a[orderBy] > b[orderBy] ? 1 : -1;
      } else {
        return a[orderBy] < b[orderBy] ? 1 : -1;
      }
    });

  return (
    <Box className="news-container">
      <div className='title-container'>
        <h1>News</h1>
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
          <IconButton onClick={handleStatusClick}>
            <FilterList />
          </IconButton>
          <Menu
            anchorEl={statusAnchorEl}
            open={Boolean(statusAnchorEl)}
            onClose={handleStatusClose}
          >
            <MenuItem onClick={() => setStatus("")}>All Status</MenuItem>
            <MenuItem onClick={() => setStatus("Released")}>Released</MenuItem>
            <MenuItem onClick={() => setStatus("Draft")}>Draft</MenuItem>
          </Menu>
          <IconButton onClick={handleDateClick}>
            <Event />
          </IconButton>
          <Menu
            anchorEl={dateAnchorEl}
            open={Boolean(dateAnchorEl)}
            onClose={handleDateClose}
          >
            <Box className='news-page-filter-date' p={2}>
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
                  active={orderBy === "date"}
                  direction={orderBy === "date" ? order : "asc"}
                  onClick={() => handleSort("date")}
                >
                  Date Created
                </TableSortLabel>
              </TableCell>
              <TableCell>Tags</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredArticles
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((article, index) => (
                <TableRow key={index}>
                  <TableCell className="news-title">{article.title}</TableCell>
                  <TableCell>
                    <Chip label={article.status} color={article.status === "Released" ? "success" : "default"} />
                  </TableCell>
                  <TableCell>{article.date}</TableCell>
                  <TableCell>
                    <Chip label={article.tag} variant="outlined" />
                  </TableCell>
                  <TableCell>
                    <IconButton color="primary" component={Link} to={`/news/edit/1`}>
                      <Edit />
                    </IconButton>
                    <IconButton color="error" onClick={() => handleDeleteClick(index)}>
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredArticles.length}
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
        title="Delete Article"
        description="Are you sure you want to delete this article?"
        children={<Box sx={{padding: 2}}>
          <p>Do you wish to delete this?</p>
        </Box>}
        footer={<Button variant='contained' color="error" onClick={handleDeleteConfirm}>Delete</Button>}
      />
    </Box>
  );
}
