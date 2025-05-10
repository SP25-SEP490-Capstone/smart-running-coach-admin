import { ChatBubbleOutline, Delete, Edit, Favorite } from "@mui/icons-material";
import { Box, Button, Typography } from "@mui/material";
import PDPExerciseSession from "./PDPExerciseSession";
import { useEffect } from "react";

export default function PDPTabDetail({
  post,
  calculateDuration,
  mapContainer,
  mapContainerStyle,
  handleEditPostClick,
  handleRemovePostClick,
}: any) {

  return (
    <>
      <Box className="post-content-section">
        <Typography className="post-content">{post.content}</Typography>

        {post.images?.length > 0 && (
          <Box className="post-images">
            {post.images.map((image: any) => (
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
          <Typography variant="body2">{post.stats.upvotes} Upvotes</Typography>
        </Box>
        <Box className="stat-box">
          <ChatBubbleOutline fontSize="small" />
          <Typography variant="body2">
            {post.stats.commentCount} Comments
          </Typography>
        </Box>
      </Box>

      {post.exerciseSession && (
        <PDPExerciseSession
          post={post}
          calculateDuration={calculateDuration}
          mapContainer={mapContainer}
          mapContainerStyle={mapContainerStyle}
        />
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
  );
}
