import { useEffect, useState, useRef } from "react";
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
  Grid,
  CircularProgress,
  Badge,
} from "@mui/material";
import {
  MoreVert,
  ThumbUp,
  ChatBubbleOutline,
  Edit,
  Delete,
  DirectionsRun,
  Timer,
  LocalFireDepartment,
  Terrain,
  Speed,
  Favorite,
  Reply,
  ExpandMore,
  ExpandLess,
} from "@mui/icons-material";
import CommonBreadcrumb from "@components/commons/CommonBreadcrumb";
import { Link, useParams } from "react-router-dom";
import CommonDialog from "@components/commons/CommonDialog";
import { aget } from "@components/utils/util_axios";
import mapboxgl from "mapbox-gl";
import { CommonAvatar } from "@components/commons/CommonAvatar";
import { getNameFromExerciseType } from "@components/utils/util_exerciseType";

// Mapbox CSS (required)
import "mapbox-gl/dist/mapbox-gl.css";

interface PostData {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
  status: string;
  images: {
    id: string;
    url: string;
  }[];
  user: {
    id: string;
    username: string;
    name: string;
    email: string;
    image?: {
      url: string;
    };
  };
  stats: {
    upvotes: number;
    commentCount: number;
  };
  exerciseSession: {
    id: string;
    startTime: string;
    endTime: string;
    exerciseType: number;
    routes: {
      time: string;
      latitude: number;
      longitude: number;
    }[];
  } | null;
  votes: {
    id: string;
    user: {
      id: string;
      username: string;
    };
    createdAt: string;
  }[];
  comments: {
    id: string;
    content: string;
    user: {
      id: string;
      username: string;
      name: string;
      email: string;
    };
    createdAt: string;
    updatedAt: string;
    upvotes: number;
    votes: {
      id: string;
      user: {
        id: string;
        username: string;
      };
      createdAt: string;
    }[];
    subComments: {
      id: string;
      content: string;
      user: {
        id: string;
        username: string;
        name: string;
        email: string;
      };
      createdAt: string;
      updatedAt: string;
      upvotes: number;
      votes: {
        id: string;
        user: {
          id: string;
          username: string;
        };
        createdAt: string;
      }[];
    }[];
  }[];
}

const mapContainerStyle = {
  width: "100%",
  height: "400px",
  borderRadius: "8px",
  marginTop: "16px",
};

export default function PostsDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<PostData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [removePostDialogOpen, setRemovePostDialogOpen] = useState(false);
  const [editPostDialogOpen, setEditPostDialogOpen] = useState(false);
  const [expandedReplies, setExpandedReplies] = useState<
    Record<string, boolean>
  >({});
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"details" | "comments">("details");

  // Mapbox references
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  const fetchPost = async () => {
    try {
      setLoading(true);
      const response = await aget(`/posts/admin/post/${id}`);
      setPost(response.data.data);
    } catch (err) {
      setError("Failed to load post data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchPost();
    }
  }, [id]);

  useEffect(() => {
    if (!post?.exerciseSession?.routes || !mapContainer.current || mapLoaded)
      return;

    // Initialize map only once
    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || "";

    const pathCoordinates = post.exerciseSession.routes.map((route) => ({
      lng: route.longitude,
      lat: route.latitude,
    }));

    const bounds = new mapboxgl.LngLatBounds();
    pathCoordinates.forEach((coord) => bounds.extend(coord));

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      bounds: bounds,
      fitBoundsOptions: {
        padding: 50,
      },
    });

    map.current.on("load", () => {
      setMapLoaded(true);

      map.current?.addSource("route", {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates: pathCoordinates.map((coord) => [coord.lng, coord.lat]),
          },
        },
      });

      map.current?.addLayer({
        id: "route",
        type: "line",
        source: "route",
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": "#003363",
          "line-width": 4,
        },
      });

      // Add start and end markers
      if (pathCoordinates.length > 0) {
        // Start marker
        new mapboxgl.Marker({ color: "#4CAF50" })
          .setLngLat(pathCoordinates[0])
          .setPopup(new mapboxgl.Popup().setHTML("<h3>Start</h3>"))
          .addTo(map.current);

        // End marker
        new mapboxgl.Marker({ color: "#F44336" })
          .setLngLat(pathCoordinates[pathCoordinates.length - 1])
          .setPopup(new mapboxgl.Popup().setHTML("<h3>End</h3>"))
          .addTo(map.current);
      }
      setMapLoaded(false);
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [post?.exerciseSession?.routes, mapLoaded]);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) =>
    setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleRemovePostClick = () => setRemovePostDialogOpen(true);
  const handleEditPostClick = () => setEditPostDialogOpen(true);

  const handleDialogClose = () => {
    setRemovePostDialogOpen(false);
    setEditPostDialogOpen(false);
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const calculateDuration = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diff = endDate.getTime() - startDate.getTime();
    return Math.round(diff / (1000 * 60)); // minutes
  };

  const filteredComments =
    post?.comments.filter(
      (comment) =>
        comment.user.username
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        comment.content.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

  if (loading) {
    return (
      <Box className="posts-detail-page loading">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Box className="posts-detail-page error">{error}</Box>;
  }

  if (!post) {
    return <Box className="posts-detail-page">Post not found</Box>;
  }

  return (
    <Box className="posts-detail-page">
      <CommonBreadcrumb
        items={[
          { name: "Dashboard", link: "/dashboard" },
          { name: "Posts", link: "/admin/posts" },
          { name: post.title },
        ]}
      />

      <Box className="post-container">
        <Box className="post-header">
          <p className="post-id">ID: {post.id}</p>
          <Typography variant="h4" className="post-title">
            {post.title}
            {post.isDeleted && (
              <Chip label="Deleted" size="small" color="error" sx={{ ml: 2 }} />
            )}
          </Typography>

          <Box className="post-meta">
            <CommonAvatar uri={post.user.image?.url} />
            <Box>
              <Link to={`/admin/users/${post.user.id}`}>
                <Typography className="author">{post.user.username}</Typography>
              </Link>
              <Typography className="time" variant="caption">
                {formatDate(post.createdAt)}
                {post.updatedAt &&
                  post.createdAt !== post.updatedAt &&
                  ` (updated ${formatDate(post.updatedAt)})`}
              </Typography>
            </Box>
          </Box>
        </Box>

        <Box className="post-tabs">
          <Button
            className={`btn-tab btn-tab-left ${
              activeTab === "details" ? "btn-tag-active" : ""
            }`}
            onClick={() => setActiveTab("details")}
          >
            Post Details
          </Button>
          <Button
            className={`btn-tab btn-tab-right ${
              activeTab === "comments" ? "btn-tag-active" : ""
            }`}
            onClick={() => setActiveTab("comments")}
            sx={{ ml: 2 }}
          >
            Comments ({post.stats.commentCount})
          </Button>
        </Box>

        {activeTab === "details" ? (
          <>
            <Box className="post-content-section">
              <Typography className="post-content">{post.content}</Typography>

              {post.images?.length > 0 && (
                <Box className="post-images">
                  {post.images.map((image) => (
                    <img
                      key={image.id}
                      src={image.url}
                      alt="Post content"
                      className="post-image"
                    />
                  ))}
                </Box>
              )}
            </Box>

            <Box className="post-stats">
              <Box className="stat-box">
                <Favorite className="stat-icon" fontSize="small" />
                <Typography variant="body2">
                  {post.stats.upvotes} Upvotes
                </Typography>
              </Box>
              <Box className="stat-box">
                <ChatBubbleOutline fontSize="small" />
                <Typography variant="body2">
                  {post.stats.commentCount} Comments
                </Typography>
              </Box>
            </Box>

            {post.exerciseSession && (
              <Box className="exercise-session-card">
                <Typography variant="h6" className="section-title">
                  <DirectionsRun sx={{ mr: 1 }} /> Exercise Session
                </Typography>

                <Grid container spacing={2} className="session-stats">
                  <Grid item xs={6} sm={3}>
                    <Card variant="outlined" className="stat-card">
                      <CardContent>
                        <Timer color="primary" />
                        <Typography variant="h6">
                          {calculateDuration(
                            post.exerciseSession.startTime,
                            post.exerciseSession.endTime
                          )}{" "}
                          min
                        </Typography>
                        <Typography variant="caption">Duration</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Card variant="outlined" className="stat-card">
                      <CardContent>
                        <LocalFireDepartment color="primary" />
                        <Typography variant="h6">
                          {getNameFromExerciseType(
                            post.exerciseSession.exerciseType
                          )}
                        </Typography>
                        <Typography variant="caption">Exercise Type</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Card variant="outlined" className="stat-card">
                      <CardContent>
                        <Favorite color="error" />
                        <Typography variant="h6">
                          {post.exerciseSession.routes.length}
                        </Typography>
                        <Typography variant="caption">Route Points</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>

                {post.exerciseSession.routes.length > 0 && (
                  <Box className="map-section">
                    <Typography variant="subtitle1" className="section-title">
                      Exercise Route
                    </Typography>
                    <div
                      ref={mapContainer}
                      style={mapContainerStyle}
                      className="map-container"
                    />
                  </Box>
                )}
              </Box>
            )}

            <Box className="post-actions">
              <Button
                variant="contained"
                color="primary"
                startIcon={<Edit />}
                onClick={handleEditPostClick}
              >
                Edit Post
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<Delete />}
                onClick={handleRemovePostClick}
                sx={{ ml: 2 }}
              >
                {post.isDeleted ? "Permanently Delete" : "Delete Post"}
              </Button>
            </Box>
          </>
        ) : (
          <Box className="comments-section">
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search comments..."
              value={searchQuery}
              onChange={handleSearchChange}
              sx={{ mb: 3 }}
              size="small"
              InputProps={{
                startAdornment: (
                  <Box sx={{ color: "action.active", mr: 1 }}>
                    <ChatBubbleOutline />
                  </Box>
                ),
              }}
            />

            {filteredComments.length > 0 ? (
              filteredComments.map((comment) => (
                <Box key={comment.id} className="comment">
                  <Avatar className="comment-avatar">
                    {comment.user.username.charAt(0).toUpperCase()}
                  </Avatar>
                  <Box className="comment-content">
                    <Box className="comment-header">
                      <Link to={`/admin/users/${comment.user.id}`}>
                        <Typography className="comment-author">
                          {comment.user.username}
                        </Typography>
                      </Link>
                      <Typography className="comment-time">
                        {formatDate(comment.createdAt)}
                      </Typography>
                    </Box>
                    <Typography variant="body2">{comment.content}</Typography>
                    <Box className="comment-actions">
                      <Box className="vote-actions">
                        <IconButton size="small">
                          <ThumbUp fontSize="small" />
                          <Typography variant="caption" sx={{ ml: 0.5 }}>
                            {comment.upvotes}
                          </Typography>
                        </IconButton>
                      </Box>
                      {comment.subComments.length > 0 && (
                        <Button
                          size="small"
                          startIcon={
                            expandedReplies[comment.id] ? (
                              <ExpandLess />
                            ) : (
                              <ExpandMore />
                            )
                          }
                          onClick={() => handleToggleReplies(comment.id)}
                        >
                          {comment.subComments.length} replies
                        </Button>
                      )}
                      <IconButton size="small" onClick={handleMenuOpen}>
                        <MoreVert fontSize="small" />
                      </IconButton>
                    </Box>

                    {expandedReplies[comment.id] &&
                      comment.subComments.map((reply) => (
                        <Box key={reply.id} className="comment reply">
                          <Avatar className="comment-avatar">
                            {reply.user.username.charAt(0).toUpperCase()}
                          </Avatar>
                          <Box className="comment-content">
                            <Box className="comment-header">
                              <Link to={`/admin/users/${reply.user.id}`}>
                                <Typography className="comment-author">
                                  {reply.user.username}
                                </Typography>
                              </Link>
                              <Typography className="comment-time">
                                {formatDate(reply.createdAt)}
                              </Typography>
                            </Box>
                            <Typography variant="body2">
                              {reply.content}
                            </Typography>
                            <Box className="comment-actions">
                              <IconButton size="small">
                                <ThumbUp fontSize="small" />
                                <Typography variant="caption" sx={{ ml: 0.5 }}>
                                  {reply.upvotes}
                                </Typography>
                              </IconButton>
                            </Box>
                          </Box>
                        </Box>
                      ))}
                  </Box>
                </Box>
              ))
            ) : (
              <Box className="no-comments">
                <Typography variant="body2" color="textSecondary">
                  No comments found
                </Typography>
              </Box>
            )}
          </Box>
        )}
      </Box>

      {/* Edit Post Dialog */}
      <CommonDialog
        open={editPostDialogOpen}
        onClose={handleDialogClose}
        title="Edit Post"
        maxWidth="md"
        footer={
          <>
            <Button onClick={handleDialogClose}>Cancel</Button>
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                /* Handle post edit */
                handleDialogClose();
              }}
            >
              Save Changes
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
          rows={8}
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
        title={post.isDeleted ? "Permanently Delete Post" : "Delete Post"}
        footer={
          <>
            <Button onClick={handleDialogClose}>Cancel</Button>
            <Button
              variant="contained"
              color="error"
              onClick={() => {
                /* Handle post removal */
                handleDialogClose();
              }}
            >
              {post.isDeleted ? "Permanently Delete" : "Delete"}
            </Button>
          </>
        }
      >
        <Typography>
          {post.isDeleted
            ? "This will permanently delete the post and all associated data. This action cannot be undone."
            : "Are you sure you want to delete this post? The post will be archived and can be restored later."}
        </Typography>
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2">Reason for deletion:</Typography>
          <Select fullWidth size="small" defaultValue="" sx={{ mt: 1 }}>
            <MenuItem value="">Select a reason</MenuItem>
            <MenuItem value="inappropriate">Inappropriate Content</MenuItem>
            <MenuItem value="spam">Spam</MenuItem>
            <MenuItem value="violation">Policy Violation</MenuItem>
            <MenuItem value="other">Other</MenuItem>
          </Select>
        </Box>
      </CommonDialog>
    </Box>
  );
}
