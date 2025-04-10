import { useEffect, useState } from "react";
import "./PostsDetailPage.scss";
import { 
  Avatar, 
  Button, 
  Typography, 
  Box, 
  Select, 
  MenuItem, 
  IconButton, 
  Menu, 
  TextField,
  Chip,
  Divider,
  Card,
  CardContent,
  Grid
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DirectionsRunIcon from "@mui/icons-material/DirectionsRun";
import TimerIcon from "@mui/icons-material/Timer";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import TerrainIcon from "@mui/icons-material/Terrain";
import SpeedIcon from "@mui/icons-material/Speed";
import FavoriteIcon from "@mui/icons-material/Favorite";
import CommonBreadcrumb from "@components/commons/CommonBreadcrumb";
import { Link, useParams } from "react-router-dom";
import CommonDialog from "@components/commons/CommonDialog";
import { aget } from "@components/utils/util_axios";
import { GoogleMap, Polyline, Marker } from "@react-google-maps/api";

interface PostData {
  id: string;
  title: string;
  content: string;
  created_at: string;
  comment_count: number;
  upvote_count: number;
  is_upvoted: boolean;
  images: string[];
  tags: string[];
  user: {
    id: string;
    username: string;
    is_active: boolean;
  };
  exercise_session_record_id: string | null;
}

interface ExerciseSession {
  id: string;
  duration_minutes: number;
  total_distance: number;
  total_calories: number;
  total_steps: number;
  avg_pace: string;
  heart_rate: {
    min: number;
    avg: number;
    max: number;
  };
  routes: {
    time: string;
    latitude: number;
    longitude: number;
  }[];
  User: {
    id: string;
    name: string;
    email: string;
  };
}

interface Comment {
  id: string;
  name: string;
  time: string;
  text: string;
  up: number;
  down: number;
  replies: Comment[];
}

export default function PostsDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<PostData | null>(null);
  const [exerciseSession, setExerciseSession] = useState<ExerciseSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [removePostDialogOpen, setRemovePostDialogOpen] = useState(false);
  const [editPostDialogOpen, setEditPostDialogOpen] = useState(false);
  const [editCommentDialogOpen, setEditCommentDialogOpen] = useState(false);
  const [removeCommentDialogOpen, setRemoveCommentDialogOpen] = useState(false);
  const [expandedReplies, setExpandedReplies] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState("");

  const fetchPost = async () => {
    try {
      setLoading(true);
      const response = await aget(`/posts/${id}`);
      setPost(response.data.data);
      
      // If post has an exercise session, fetch that data
      if (response.data.data.exercise_session_record_id) {
        await fetchExerciseSession(response.data.data.exercise_session_record_id);
      }
      
      // TODO: Fetch comments for this post
      // const commentsResponse = await aget(`/posts/${id}/comments`);
      // setComments(commentsResponse.data.data);
      
    } catch (err) {
      setError("Failed to load post data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchExerciseSession = async (sessionId: string) => {
    try {
      const response = await aget(`/record-exercise-session/${sessionId}`);
      setExerciseSession(response.data.data);
    } catch (err) {
      console.error("Failed to load exercise session data", err);
    }
  };

  useEffect(() => {
    if (id) {
      fetchPost();
    }
  }, [id]);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
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

  const handleToggleReplies = (commentId: string) => {
    setExpandedReplies((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleUpvote = async () => {
    if (!post) return;
    try {
      // TODO: Implement upvote API call
      // await apost(`/posts/${post.id}/upvote`);
      setPost({
        ...post,
        upvote_count: post.is_upvoted ? post.upvote_count - 1 : post.upvote_count + 1,
        is_upvoted: !post.is_upvoted
      });
    } catch (err) {
      console.error("Failed to upvote", err);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const filteredComments = comments.filter(
    (comment) =>
      comment.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comment.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return <Box className="posts-detail-page">Loading...</Box>;
  }

  if (error) {
    return <Box className="posts-detail-page">{error}</Box>;
  }

  if (!post) {
    return <Box className="posts-detail-page">Post not found</Box>;
  }

  // Prepare map data if exercise session exists with routes
  const mapCenter = exerciseSession?.routes?.length > 0 ? {
    lat: exerciseSession.routes[0].latitude,
    lng: exerciseSession.routes[0].longitude
  } : { lat: 0, lng: 0 };

  const pathCoordinates = exerciseSession?.routes?.map(route => ({
    lat: route.latitude,
    lng: route.longitude
  })) || [];

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
        <Typography variant="h4" className="post-title">{post.title}</Typography>
        
        <Box className="post-meta">
          <Avatar className="avatar">{post.user.username.charAt(0).toUpperCase()}</Avatar>
          <Link to={`/users/${post.user.id}`}>
            <Typography className="author">{post.user.username}</Typography>
          </Link>
          <Typography className="time">
            {formatDate(post.created_at)}
          </Typography>
          <Box className="tags-container">
            {post.tags.map((tag, index) => (
              <Chip key={index} label={tag} size="small" className="tag" />
            ))}
          </Box>
        </Box>

        <Box className="post-stats">
          <Box className="stat-box" onClick={handleUpvote}>
            <ThumbUpIcon fontSize="small" color={post.is_upvoted ? "primary" : "inherit"} />
            <Typography variant="caption">{post.upvote_count} Upvotes</Typography>
          </Box>
          <Box className="stat-box">
            <ChatBubbleOutlineIcon fontSize="small" />
            <Typography variant="caption">{post.comment_count} Comments</Typography>
          </Box>
        </Box>

        <Typography className="post-content">{post.content}</Typography>

        {post.images?.length > 0 && (
          <Box className="post-images">
            {post.images.map((image, index) => (
              <img key={index} src={image} alt={`Post image ${index + 1}`} className="post-image" />
            ))}
          </Box>
        )}

        {exerciseSession && (
          <Box className="exercise-session-card">
            <Typography variant="h6" className="session-title">
              <DirectionsRunIcon /> Exercise Session Details
            </Typography>
            
            <Grid container spacing={2} className="session-stats">
              <Grid item xs={6} sm={3}>
                <Card variant="outlined" className="stat-card">
                  <CardContent>
                    <TimerIcon color="primary" />
                    <Typography variant="h6">{exerciseSession.duration_minutes} min</Typography>
                    <Typography variant="caption">Duration</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Card variant="outlined" className="stat-card">
                  <CardContent>
                    <TerrainIcon color="primary" />
                    <Typography variant="h6">{(exerciseSession.total_distance / 1000).toFixed(2)} km</Typography>
                    <Typography variant="caption">Distance</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Card variant="outlined" className="stat-card">
                  <CardContent>
                    <LocalFireDepartmentIcon color="primary" />
                    <Typography variant="h6">{exerciseSession.total_calories}</Typography>
                    <Typography variant="caption">Calories</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Card variant="outlined" className="stat-card">
                  <CardContent>
                    <SpeedIcon color="primary" />
                    <Typography variant="h6">{exerciseSession.avg_pace} min/km</Typography>
                    <Typography variant="caption">Avg Pace</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {exerciseSession.heart_rate && (
              <Box className="heart-rate-section">
                <Typography variant="subtitle1">
                  <FavoriteIcon color="error" /> Heart Rate
                </Typography>
                <Box className="heart-rate-stats">
                  <Typography>Min: {exerciseSession.heart_rate.min} bpm</Typography>
                  <Typography>Avg: {exerciseSession.heart_rate.avg} bpm</Typography>
                  <Typography>Max: {exerciseSession.heart_rate.max} bpm</Typography>
                </Box>
              </Box>
            )}

            {pathCoordinates.length > 0 && (
              <Box className="map-container">
                <Typography variant="subtitle1">Route Map</Typography>
                <GoogleMap
                  mapContainerStyle={{ width: '100%', height: '300px' }}
                  center={mapCenter}
                  zoom={14}
                >
                  <Polyline
                    path={pathCoordinates}
                    options={{
                      strokeColor: "#4285F4",
                      strokeOpacity: 1.0,
                      strokeWeight: 4,
                    }}
                  />
                  {pathCoordinates.length > 0 && (
                    <>
                      <Marker position={pathCoordinates[0]} label="S" />
                      <Marker position={pathCoordinates[pathCoordinates.length - 1]} label="E" />
                    </>
                  )}
                </GoogleMap>
              </Box>
            )}
          </Box>
        )}

        <Box className="post-actions">
          <Button variant="contained" color="primary" startIcon={<EditIcon />} onClick={handleEditPostClick}>
            Edit Post
          </Button>
          <Button variant="contained" color="error" startIcon={<DeleteIcon />} onClick={handleRemovePostClick}>
            Remove Post
          </Button>
        </Box>

        <Box className='post-mod-container'>
          <Select defaultValue="" displayEmpty className="removal-reason" size="small">
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
            size="small"
            placeholder="Add a note for moderators..."
          />
        </Box>
      </Box>

      <Box className="comments-section">
        <Typography variant="h6">Comments ({post.comment_count})</Typography>

        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search comments..."
          value={searchQuery}
          onChange={handleSearchChange}
          sx={{ marginBottom: 2 }}
          size="small"
        />

        {filteredComments.length > 0 ? (
          filteredComments.map((comment) => (
            <Box key={comment.id} className="comment">
              <Avatar className="comment-avatar">{comment.name.charAt(0).toUpperCase()}</Avatar>
              <Box className="comment-content">
                <Box className="comment-header">
                  <Link to={`/users/${comment.id}`}>
                    <Typography className="comment-author">{comment.name}</Typography>
                  </Link>
                  <Typography className="comment-time">{comment.time}</Typography>
                </Box>
                <Typography variant="body2">{comment.text}</Typography>
                <Box className="comment-stats">
                  <IconButton size="small">
                    <ThumbUpIcon fontSize="small" /> <Typography variant="caption">{comment.up}</Typography>
                  </IconButton>
                  <IconButton size="small">
                    <ThumbDownIcon fontSize="small" /> <Typography variant="caption">{comment.down}</Typography>
                  </IconButton>
                  {comment.replies.length > 0 && (
                    <IconButton size="small" onClick={() => handleToggleReplies(comment.id)}>
                      <ChatBubbleOutlineIcon fontSize="small" /> 
                      <Typography variant="caption">{comment.replies.length} replies</Typography>
                    </IconButton>
                  )}
                  <IconButton size="small" onClick={handleMenuOpen}>
                    <MoreVertIcon fontSize="small" />
                  </IconButton>
                  <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
                    <MenuItem onClick={handleEditCommentClick}>Edit Comment</MenuItem>
                    <MenuItem onClick={handleRemoveCommentClick}>Remove Comment</MenuItem>
                    <MenuItem onClick={handleMenuClose}>Report</MenuItem>
                  </Menu>
                </Box>

                {expandedReplies[comment.id] && comment.replies.map((reply) => (
                  <Box key={reply.id} className="comment reply">
                    <Avatar className="comment-avatar">{reply.name.charAt(0).toUpperCase()}</Avatar>
                    <Box className="comment-content">
                      <Box className="comment-header">
                        <Link to={`/users/${reply.id}`}>
                          <Typography className="comment-author">{reply.name}</Typography>
                        </Link>
                        <Typography className="comment-time">{reply.time}</Typography>
                      </Box>
                      <Typography variant="body2">{reply.text}</Typography>
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
          ))
        ) : (
          <Typography variant="body2" color="textSecondary" className="no-comments">
            No comments yet. Be the first to comment!
          </Typography>
        )}
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
          label="Title"
          variant="outlined"
          defaultValue={post.title}
          margin="normal"
        />
        <TextField
          fullWidth
          multiline
          rows={6}
          variant="outlined"
          label="Content"
          defaultValue={post.content}
          margin="normal"
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