import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  TextField,
  Button,
  Select,
  MenuItem,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Typography,
  Avatar,
} from "@mui/material";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import "./NewsDetailEditPage.scss";
import CommonBreadcrumb from "@components/commons/CommonBreadcrumb";
import CommonTextEditor from "@components/commons/CommonTextEditor";
import CommonDialog from "@components/commons/CommonDialog";
import { aget, aput } from "@components/utils/util_axios";
import { sendErrorToast, sendSuccessToast } from "@components/utils/util_toastify";

interface NewsType {
  id: string;
  type_name: string;
  description: string;
}

interface Template {
  id: string;
  name: string;
  content: string;
  description?: string;
}

export default function NewsDetailEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [selectedType, setSelectedType] = useState<NewsType | null>(null);
  const [content, setContent] = useState("");
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newsTypes, setNewsTypes] = useState<NewsType[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Enhanced templates with descriptions
  const templates: Template[] = [
    {
      id: '1',
      name: 'Announcement Template',
      description: 'Standard format for company announcements',
      content: `## [Announcement Title]\n\nWe are pleased to announce that [details of announcement]. This change will be effective from [date].\n\nKey points:\n- Point 1\n- Point 2\n- Point 3\n\nFor more information, please contact [contact person] at [email/phone].`
    },
    {
      id: '2',
      name: 'Event Invitation',
      description: 'Template for inviting employees to company events',
      content: `## You're Invited: [Event Name]\n\n**Date:** [Date]\n**Time:** [Time]\n**Location:** [Venue]\n\nJoin us for [description of event]. This will be a great opportunity to [benefits of attending].\n\nRSVP by [date] to [contact person].\n\nWe look forward to seeing you there!`
    },
    {
      id: '3',
      name: 'Policy Update',
      description: 'Template for communicating policy changes',
      content: `## Policy Update: [Policy Name]\n\nEffective [date], we are implementing the following changes to our [policy name] policy:\n\n### Changes:\n1. Change 1\n2. Change 2\n3. Change 3\n\n### Reason for Changes:\n[Explanation of why changes were made]\n\n### Impact:\n[How this affects employees/departments]\n\nFor questions, please reach out to [HR/contact person].`
    }
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch news types and article data in parallel
        const [typesResponse, articleResponse] = await Promise.all([
          aget("/news/types"),
          aget(`/news/${id}`),
        ]);

        console.log(articleResponse)

        setNewsTypes(typesResponse.data.data);

        const articleData = articleResponse.data.data;
        setTitle(articleData.title);
        setContent(articleData.content);

        // Find and set the news type
        const type = typesResponse.data.data.find(
          (t) => t.id === articleData.news_type_id
        );
        setSelectedType(type || null);
      } catch (err) {
        console.error("Failed to fetch data:", err);
        setError("Failed to load article data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleSubmit = async (isDraft: boolean) => {
    if (!selectedType) {
      sendErrorToast("Please select a news type");
      return;
    }

    if (!title.trim()) {
      sendErrorToast("Title is required");
      return;
    }

    if (!content.trim()) {
      sendErrorToast("Content is required");
      return;
    }

    setSubmitting(true);

    try {
      const response = await aput(`/news/admin/${id}`, {
        newsTypeId: selectedType.id,
        title,
        content,
        isDraft,
        archive: false,
      });

      if (response.status === 200) {
        sendSuccessToast(
          `News ${isDraft ? "draft saved" : "updated"} successfully!`
        );
        navigate("/news");
      } else {
        throw new Error(response.data?.message || "Failed to update news");
      }
    } catch (err) {
      console.error("Failed to update news:", err);
      sendErrorToast(err.response?.data?.message || "Failed to update news");
    } finally {
      setSubmitting(false);
    }
  };

  const handleTemplateSelect = (template: Template) => {
    setContent(prev => {
      if (prev) {
        return `${prev}\n\n${template.content}`;
      }
      return template.content;
    });
    setTemplateDialogOpen(false);
  };

  const capitalizeFirstLetter = (string: string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  if (error) {
    return (
      <Box className="news-detail-edit-page">
        <CommonBreadcrumb
          items={[
            { name: "News", link: "/news" },
            { name: "Edit News" }
          ]}
        />
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="50vh"
        >
          <Box textAlign="center">
            <Typography variant="h6" color="error" gutterBottom>
              {error}
            </Typography>
            <Button
              variant="contained"
              onClick={() => window.location.reload()}
              sx={{ mt: 2 }}
            >
              Retry
            </Button>
          </Box>
        </Box>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box className="news-detail-edit-page">
        <CommonBreadcrumb
          items={[
            { name: "News", link: "/news" },
            { name: "Edit News" }
          ]}
        />
        <Box className="news-container">
          <Box className="form-group form-group-meta">
            <Box className="form-field">
              <Skeleton width={80} height={24} />
              <Skeleton height={56} />
            </Box>
            <Box className="form-field">
              <Skeleton width={80} height={24} />
              <Skeleton height={56} />
            </Box>
          </Box>

          <Box className="form-group">
            <Box display="flex" justifyContent="space-between" mb={2}>
              <Skeleton width={80} height={24} />
              <Skeleton width={120} height={36} />
            </Box>
            <Skeleton height={300} />
          </Box>

          <Box className="container-foooter">
            <Box className="btn-container">
              <Skeleton width={120} height={36} sx={{ mr: 2 }} />
              <Skeleton width={120} height={36} />
            </Box>
          </Box>
        </Box>
      </Box>
    );
  }

  return (
    <Box className="news-detail-edit-page">
      <CommonBreadcrumb
        items={[
          { name: "News", link: "/news" },
          { name: "Edit News" },
          { name: title || "Untitled Article" },
        ]}
      />

      <Box className="news-container">
        <Box className="form-group form-group-meta">
          <Box className="form-field">
            <label>News Type</label>
            <Select
              className="form-field-tag"
              fullWidth
              value={selectedType?.id || ""}
              onChange={(e) => {
                const type = newsTypes.find((t) => t.id === e.target.value);
                setSelectedType(type || null);
              }}
              margin="normal"
              error={!selectedType}
            >
              {newsTypes.map((type) => (
                <MenuItem key={type.id} value={type.id}>
                  {capitalizeFirstLetter(type.type_name)}
                </MenuItem>
              ))}
            </Select>
          </Box>

          <Box className="form-field">
            <label>Title</label>
            <TextField
              fullWidth
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="News title here"
              margin="normal"
              error={!title.trim()}
              helperText={!title.trim() ? "Title is required" : ""}
            />
          </Box>
        </Box>

        <Box className="form-group">
          <div className="content-label">
            <label>Content</label>
            <Button
              className="btn-template"
              variant="outlined"
              color="primary"
              onClick={() => setTemplateDialogOpen(true)}
              startIcon={<span>📋</span>}
            >
              Insert Template
            </Button>
          </div>

          <CommonTextEditor
            defaultValue={content}
            maxLimit={2000}
            onChange={(newContent) => setContent(newContent)}
            error={!content.trim()}
            helperText={!content.trim() ? "Content is required" : ""}
            height="400px"
          />
        </Box>

        <CommonDialog
          open={templateDialogOpen}
          onClose={() => setTemplateDialogOpen(false)}
          title="Select a Template to Insert"
          maxWidth="md"
          fullWidth
          children={
            <Box sx={{ minHeight: '300px' }}>
              {templates.length === 0 ? (
                <Typography variant="body1" textAlign="center" py={4}>
                  No templates available
                </Typography>
              ) : (
                <List>
                  {templates.map((template) => (
                    <ListItem 
                      key={template.id}
                      button
                      onClick={() => handleTemplateSelect(template)}
                      sx={{
                        '&:hover': {
                          backgroundColor: 'action.hover',
                        },
                        mb: 1,
                        borderRadius: 1
                      }}
                    >
                      <ListItemText
                        primary={template.name}
                        secondary={template.description || 'No description'}
                        primaryTypographyProps={{ fontWeight: 'medium' }}
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </Box>
          }
          footer={
            <Button 
              onClick={() => setTemplateDialogOpen(false)}
              variant="outlined"
            >
              Cancel
            </Button>
          }
        />

        <Box className="container-foooter">
          <Box className="meta-info">
            <Avatar alt="Author" src="/path/to/avatar.jpg" />
            <p className="author-name">Author</p>
          </Box>

          <Box className="btn-container">
            <Button
              variant="outlined"
              color="primary"
              onClick={() => handleSubmit(true)}
              className="btn-draft"
              disabled={submitting}
              sx={{ mr: 2 }}
            >
              {submitting ? <CircularProgress size={24} /> : "Save as Draft"}
            </Button>

            <Button
              variant="contained"
              color="primary"
              onClick={() => handleSubmit(false)}
              className="btn-submit"
              disabled={submitting}
            >
              {submitting ? <CircularProgress size={24} /> : "Update News"}
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}