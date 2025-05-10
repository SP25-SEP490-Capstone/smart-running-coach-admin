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
  TextField,
  Chip,
  CircularProgress,
} from "@mui/material";
import {
  MoreVert,
  ChatBubbleOutline,
  ExpandMore,
  ExpandLess,
  Favorite,
} from "@mui/icons-material";
import CommonBreadcrumb from "@components/commons/CommonBreadcrumb";
import { Link, useParams } from "react-router-dom";
import CommonDialog from "@components/commons/CommonDialog";
import { aget } from "@components/utils/util_axios";
import mapboxgl from "mapbox-gl";
import { CommonAvatar } from "@components/commons/CommonAvatar";
import "mapbox-gl/dist/mapbox-gl.css";
import PDPTabDetail from "./PDPTabDetail";

const mapContainerStyle = {
  width: "100%",
  height: "400px",
  borderRadius: "8px",
  marginTop: "16px",
};

export default function PostsDetailPage() {
  const { id } = useParams<any>();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const [anchorEl, setAnchorEl] = useState<any>(null);
  const [removePostDialogOpen, setRemovePostDialogOpen] = useState(false);
  const [editPostDialogOpen, setEditPostDialogOpen] = useState(false);
  const [expandedReplies, setExpandedReplies] = useState<any>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<any>("details");

  // Mapbox references
  const mapContainer = useRef<any>(null);
  const map = useRef<any>(null);
  const [mapInitialized, setMapInitialized] = useState(false);

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
    if (
      !post?.exerciseSession?.routes ||
      !mapContainer.current ||
      mapInitialized
    )
      return;

    // Initialize map only once
    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || "";

    const pathCoordinates = post.exerciseSession.routes.map((route: any) => ({
      lng: route.longitude,
      lat: route.latitude,
    }));

    const bounds = new mapboxgl.LngLatBounds();
    pathCoordinates.forEach((coord: any) => bounds.extend(coord));

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      bounds: bounds,
      fitBoundsOptions: {
        padding: 50,
      },
    });

    map.current.on("load", () => {
      setMapInitialized(true);

      map.current?.addSource("route", {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates: pathCoordinates.map((coord: any) => [
              coord.lng,
              coord.lat,
            ]),
          },
        },
      });

      map.current?.addControl(
        new mapboxgl.GeolocateControl({
          positionOptions: {
            enableHighAccuracy: true,
          },
          trackUserLocation: true,
          showUserHeading: true,
        })
      );

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

      if (pathCoordinates.length > 0) {
        new mapboxgl.Marker({ color: "#4CAF50" })
          .setLngLat(pathCoordinates[0])
          .setPopup(new mapboxgl.Popup().setHTML("<h3>Start</h3>"))
          .addTo(map.current);

        new mapboxgl.Marker({ color: "#F44336" })
          .setLngLat(pathCoordinates[pathCoordinates.length - 1])
          .setPopup(new mapboxgl.Popup().setHTML("<h3>End</h3>"))
          .addTo(map.current);
      }
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
        setMapInitialized(false);
      }
    };
  }, [post?.exerciseSession?.routes]);

  const handleMenuOpen = (event: any) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleRemovePostClick = () => setRemovePostDialogOpen(true);
  const handleEditPostClick = () => setEditPostDialogOpen(true);

  const handleDialogClose = () => {
    setRemovePostDialogOpen(false);
    setEditPostDialogOpen(false);
  };

  const handleToggleReplies = (commentId: any) => {
    setExpandedReplies((prev: any) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  };

  const handleSearchChange = (event: any) => {
    setSearchQuery(event.target.value);
  };

  const formatDate = (dateString: any) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const calculateDuration = (start: any, end: any) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diff = endDate.getTime() - startDate.getTime();
    return Math.round(diff / (1000 * 60));
  };

  const filteredComments =
    post?.comments.filter(
      (comment: any) =>
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
          { name: "Posts", link: "/posts" },
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
              <Link to={`/users/${post.user.id}`}>
                <Typography className="author">
                  {post.user.name}{" "}
                  <span className="author-username">@{post.user.username}</span>
                </Typography>
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
              activeTab === "details" ? "btn-tab-active" : ""
            }`}
            onClick={() => setActiveTab("details")}
          >
            Post Details
          </Button>
          <Button
            className={`btn-tab btn-tab-right ${
              activeTab === "comments" ? "btn-tab-active" : ""
            }`}
            onClick={() => setActiveTab("comments")}
            sx={{ ml: 2 }}
          >
            Comments ({post.stats.commentCount})
          </Button>
        </Box>

        {activeTab === "details" ? (
          <PDPTabDetail
            post={post}
            calculateDuration={calculateDuration}
            mapContainer={mapContainer}
            mapContainerStyle={mapContainerStyle}
            handleEditPostClick={handleEditPostClick}
            handleRemovePostClick={handleRemovePostClick}
          />
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
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "action.active",
                      mr: 1,
                    }}
                  >
                    <ChatBubbleOutline />
                  </Box>
                ),
              }}
            />

            {filteredComments.length > 0 ? (
              filteredComments.map((comment: any) => (
                <Box key={comment.id} className="comment">
                  <CommonAvatar uri={comment.user.image?.url} />
                  <Box className="comment-content">
                    <Box className="comment-header">
                      <Link to={`/users/${comment.user.id}`}>
                        <Typography className="comment-author">
                          {post.user.name}{" "}
                          <span className="author-username">
                            @{post.user.username}
                          </span>
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
                          <Favorite fontSize="small" />
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
                      comment.subComments.map((reply: any) => (
                        <Box key={reply.id} className="comment reply">
                          <CommonAvatar uri={reply.user.image?.url} />
                          <Box className="comment-content">
                            <Box className="comment-header">
                              <Link to={`/users/${reply.user.id}`}>
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
                                <Favorite fontSize="small" />
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
