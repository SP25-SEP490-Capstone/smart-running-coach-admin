import { useState } from "react";
import "./PostsDetailPage.scss";
import { Avatar, Button, Typography, Box, Select, MenuItem, IconButton, Menu, TextField } from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CommonBreadcrumb from "@components/commons/CommonBreadcrumb";
import { Link } from "react-router-dom";
import CommonDialog from "@components/commons/CommonDialog";

export default function PostsDetailPage() {
  const [post, setPost] = useState({
    title: "The Future of Web Development: A Deep Dive into New Technologies",
    author: "Alex Johnson",
    time: "2 days ago",
    category: "Technology",
    status: "Published",
    upvotes: 1234,
    downvotes: 123,
    comments: 89,
    views: 5678,
    text: "The landscape of web development is constantly evolving, with new technologies and frameworks emerging regularly. In this comprehensive guide, we'll explore the latest trends and tools that are shaping the future of web development..."
  });

  const [anchorEl, setAnchorEl] = useState(null);
  const [removePostDialogOpen, setRemovePostDialogOpen] = useState(false);
  const [editPostDialogOpen, setEditPostDialogOpen] = useState(false);
  const [editCommentDialogOpen, setEditCommentDialogOpen] = useState(false);
  const [removeCommentDialogOpen, setRemoveCommentDialogOpen] = useState(false);
  const [expandedReplies, setExpandedReplies] = useState({}); // Track expanded replies for each comment
  const [searchQuery, setSearchQuery] = useState(""); // Search query for comments

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleRemovePostClick = () => setRemovePostDialogOpen(true);
  const handleEditPostClick = () => setEditPostDialogOpen(true);
  const handleEditCommentClick = () => setEditCommentDialogOpen(true);
  const handleRemoveCommentClick = () => setRemoveCommentDialogOpen(true);

  const handleDialogClose = () => {
    setRemovePostDialogOpen(false);
    setEditPostDialogOpen(false);
    setEditCommentDialogOpen(false);
    setRemoveCommentDialogOpen(false);
  };

  const handleToggleReplies = (commentId) => {
    setExpandedReplies((prev) => ({
      ...prev,
      [commentId]: !prev[commentId], // Toggle replies for the specific comment
    }));
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value); // Update search query
  };

  // Sample comments data
  const comments = [
    {
      id: 1,
      name: "Sarah Miller",
      time: "1 hour ago",
      text: "This is a fantastic analysis!",
      up: 45,
      down: 2,
      replies: [
        { id: 11, name: "John Doe", time: "30 minutes ago", text: "I agree!", up: 10, down: 0 },
        { id: 12, name: "Jane Smith", time: "20 minutes ago", text: "Great point!", up: 8, down: 1 },
      ],
    },
    {
      id: 2,
      name: "David Chen",
      time: "2 hours ago",
      text: "I appreciate the detailed breakdown!",
      up: 32,
      down: 1,
      replies: [
        { id: 21, name: "Alice Johnson", time: "1 hour ago", text: "Well said!", up: 5, down: 0 },
      ],
    },
    {
      id: 3,
      name: "Emily Wilson",
      time: "3 hours ago",
      text: "Great post! Loved the CSS insights.",
      up: 28,
      down: 0,
      replies: [],
    },
  ];

  // Filter comments based on search query
  const filteredComments = comments.filter(
    (comment) =>
      comment.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comment.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box className="posts-detail-page">
      <CommonBreadcrumb
        items={[
          { name: "Dashboard", link: "/dashboard" },
          { name: "Posts", link: "/posts" },
          { name: post.title },
        ]}
      />

      <Box className="post-card">
        <p className="post-id">#101</p>
        <Typography className="post-title">{post.title}</Typography>
        <Box className="post-meta">
          <Avatar className="avatar" />
          <Link to={`/users/${post.authorId}`}>
            <p className="author">{post.author}</p>
          </Link>
          <Typography className="time">
            {post.time} • {post.category}
          </Typography>
          <Typography className={`status ${post.status.toLowerCase()}`}>
            {post.status}
          </Typography>
        </Box>

        <Box className="post-stats">
          {[
            { icon: <ThumbUpIcon fontSize="small" />, label: "Upvotes", value: post.upvotes },
            { icon: <ThumbDownIcon fontSize="small" />, label: "Downvotes", value: post.downvotes },
            { icon: <ChatBubbleOutlineIcon fontSize="small" />, label: "Comments", value: post.comments },
            { icon: <VisibilityIcon fontSize="small" />, label: "Views", value: post.views },
          ].map((stat, index) => (
            <Box key={index} className="stat-box">
              <p className='stat-box-label'>{stat.icon} <span>{stat.label}</span></p>
              <p className='stat-box-value'>{stat.value}</p>
            </Box>
          ))}
        </Box>

        <Typography className="post-content">{post.text}</Typography>

        <Box className="post-actions">
          <Button variant="contained" color="primary" startIcon={<EditIcon />} onClick={handleEditPostClick}>
            Edit Post
          </Button>
          <Button variant="contained" color="error" startIcon={<DeleteIcon />} onClick={handleRemovePostClick}>
            Remove Post
          </Button>
        </Box>

        <Box className='post-mod-container'>
          <Select defaultValue="" displayEmpty className="removal-reason">
            <MenuItem value="">Select a reason...</MenuItem>
            <MenuItem value="inappropriate">Inappropriate Content</MenuItem>
            <MenuItem value="spam">Spam</MenuItem>
            <MenuItem value="other">Other</MenuItem>
          </Select>
          <TextField
            className="moderator-note"
            label="Moderator Note"
            variant="outlined"
            fullWidth
            placeholder="Add a note for moderators..."
          />
        </Box>
      </Box>

      <Box className="comments-section">
        <Typography variant="h6">Comments ({post.comments})</Typography>

        {/* Search for Comments */}
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search comments..."
          value={searchQuery}
          onChange={handleSearchChange}
          sx={{ marginBottom: 2 }}
        />

        {filteredComments.map((comment) => (
          <Box key={comment.id} className="comment">
            <Avatar className="comment-avatar" />
            <Box className="comment-content">
              <Box className="comment-header">
                <Link to={`/users/${comment.id}`}>
                  <Typography className="comment-author">{comment.name}</Typography>
                </Link>
                <Typography className="comment-time">{comment.time}</Typography>
              </Box>
              <Typography>{comment.text}</Typography>
              <Box className="comment-stats">
                <IconButton size="small">
                  <ThumbUpIcon fontSize="small" /> <Typography variant="caption">{comment.up}</Typography>
                </IconButton>
                <IconButton size="small">
                  <ThumbDownIcon fontSize="small" /> <Typography variant="caption">{comment.down}</Typography>
                </IconButton>
                <IconButton size="small" onClick={() => handleToggleReplies(comment.id)}>
                  <ChatBubbleOutlineIcon fontSize="small" /> <Typography variant="caption">{comment.replies.length} replies</Typography>
                </IconButton>
                <IconButton size="small" onClick={handleMenuOpen}>
                  <MoreVertIcon fontSize="small" />
                </IconButton>
                <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
                  <MenuItem onClick={handleEditCommentClick}>Edit Comment</MenuItem>
                  <MenuItem onClick={handleRemoveCommentClick}>Remove Comment</MenuItem>
                  <MenuItem onClick={handleMenuClose}>Report</MenuItem>
                </Menu>
              </Box>

              {/* Render Replies */}
              {expandedReplies[comment.id] && comment.replies.map((reply) => (
                <Box key={reply.id} className="comment reply">
                  <Avatar className="comment-avatar" />
                  <Box className="comment-content">
                    <Box className="comment-header">
                      <Link to={`/users/${reply.id}`}>
                        <Typography className="comment-author">{reply.name}</Typography>
                      </Link>
                      <Typography className="comment-time">{reply.time}</Typography>
                    </Box>
                    <Typography>{reply.text}</Typography>
                    <Box className="comment-stats">
                      <IconButton size="small">
                        <ThumbUpIcon fontSize="small" /> <Typography variant="caption">{reply.up}</Typography>
                      </IconButton>
                      <IconButton size="small">
                        <ThumbDownIcon fontSize="small" /> <Typography variant="caption">{reply.down}</Typography>
                      </IconButton>
                    </Box>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        ))}
      </Box>

      {/* Edit Post Dialog */}
      <CommonDialog
        open={editPostDialogOpen}
        onClose={handleDialogClose}
        title="Edit Post"
        footer={
          <>
            <Button onClick={handleDialogClose}>Cancel</Button>
            <Button color="primary" onClick={() => { /* Handle post edit */ handleDialogClose(); }}>
              Save
            </Button>
          </>
        }
      >
        <TextField
          fullWidth
          multiline
          rows={6}
          variant="outlined"
          defaultValue={post.text}
        />
      </CommonDialog>

      {/* Remove Post Dialog */}
      <CommonDialog
        open={removePostDialogOpen}
        onClose={handleDialogClose}
        title="Remove Post"
        footer={
          <>
            <Button onClick={handleDialogClose}>Cancel</Button>
            <Button color="error" onClick={() => { /* Handle post removal */ handleDialogClose(); }}>
              Remove
            </Button>
          </>
        }
      >
        <Typography>Are you sure you want to remove this post?</Typography>
      </CommonDialog>

      {/* Edit Comment Dialog */}
      <CommonDialog
        open={editCommentDialogOpen}
        onClose={handleDialogClose}
        title="Edit Comment"
        footer={
          <>
            <Button onClick={handleDialogClose}>Cancel</Button>
            <Button color="primary" onClick={() => { /* Handle comment edit */ handleDialogClose(); }}>
              Save
            </Button>
          </>
        }
      >
        <TextField
          fullWidth
          multiline
          rows={4}
          variant="outlined"
          defaultValue="This is a fantastic analysis!"
        />
      </CommonDialog>

      {/* Remove Comment Dialog */}
      <CommonDialog
        open={removeCommentDialogOpen}
        onClose={handleDialogClose}
        title="Remove Comment"
        footer={
          <>
            <Button onClick={handleDialogClose}>Cancel</Button>
            <Button color="error" onClick={() => { /* Handle comment removal */ handleDialogClose(); }}>
              Remove
            </Button>
          </>
        }
      >
        <Typography>Are you sure you want to remove this comment?</Typography>
      </CommonDialog>
    </Box>
  );
}