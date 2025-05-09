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
import "./NewsDetailEditPage.scss";
import CommonBreadcrumb from "@components/commons/CommonBreadcrumb";
import CommonTextEditor from "@components/commons/CommonTextEditor";
import CommonDialog from "@components/commons/CommonDialog";
import { aget, aput } from "@components/utils/util_axios";
import { sendErrorToast, sendSuccessToast } from "@components/utils/util_toastify";

type NewsType = 'OFFICIAL' | 'EVENT' | 'WARNING' | 'MISCELLANEOUS';

interface Template {
  id: string;
  name: string;
  content: string;
  description?: string;
}

const NEWS_TYPES = [
  { id: 'OFFICIAL', label: 'Official Announcement' },
  { id: 'EVENT', label: 'Event' },
  { id: 'WARNING', label: 'Warning' },
  { id: 'MISCELLANEOUS', label: 'Miscellaneous' }
];

const TEMPLATES: Template[] = [
  {
    id: '1',
    name: 'Announcement Template',
    description: 'Standard format for company announcements',
    content: `## [Announcement Title]\n\nWe are pleased to announce that [details]. Effective from [date].\n\nKey points:\n- Point 1\n- Point 2\n\nContact: [email/phone]`
  },
  {
    id: '2',
    name: 'Event Invitation',
    description: 'Template for inviting to events',
    content: `## You're Invited: [Event Name]\n\n**Date:** [Date]\n**Time:** [Time]\n**Location:** [Venue]\n\nJoin us for [description].\n\nRSVP by [date] to [contact].`
  },
  {
    id: '3',
    name: 'Policy Update',
    description: 'Template for policy changes',
    content: `## Policy Update: [Policy Name]\n\nEffective [date]:\n\n### Changes:\n1. Change 1\n2. Change 2\n\n### Reason:\n[Explanation]\n\nContact: [HR/contact]`
  }
];

export default function NewsDetailEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [newsType, setNewsType] = useState<NewsType>('OFFICIAL');
  const [content, setContent] = useState("");
  const [showTemplates, setShowTemplates] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await aget(`/news/admin/${id}`);
        const article = response.data.data;
        
        setTitle(article.title);
        setContent(article.content);
        setNewsType(article.news_type);
      } catch (err) {
        console.error("Failed to fetch article:", err);
        setError("Failed to load article. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [id]);

  const handleSubmit = async (isDraft: boolean) => {
    if (!title.trim()) return sendErrorToast("Title is required");
    if (!content.trim()) return sendErrorToast("Content is required");

    setSubmitting(true);

    try {
      const response = await aput(`/news/admin/${id}`, {
        title,
        content,
        newsType,
        isDraft,
        archive: false,
      });

      if (response.status === 200) {
        sendSuccessToast(`News ${isDraft ? "draft saved" : "updated"} successfully!`);
        navigate("/news");
      }
    } catch (err) {
      console.error("Failed to update news:", err);
      sendErrorToast(err.response?.data?.message || "Failed to update news");
    } finally {
      setSubmitting(false);
    }
  };

  const insertTemplate = (template: Template) => {
    setContent(prev => prev ? `${prev}\n\n${template.content}` : template.content);
    setShowTemplates(false);
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
        <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
          <Box textAlign="center">
            <Typography variant="h6" color="error" gutterBottom>
              {error}
            </Typography>
            <Button variant="contained" onClick={() => window.location.reload()} sx={{ mt: 2 }}>
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
              <Typography variant="body2" component="div">
                <Box width={80} height={24} bgcolor="action.disabledBackground" mb={1} />
                <Box width="100%" height={56} bgcolor="action.disabledBackground" />
              </Typography>
            </Box>
            <Box className="form-field">
              <Typography variant="body2" component="div">
                <Box width={80} height={24} bgcolor="action.disabledBackground" mb={1} />
                <Box width="100%" height={56} bgcolor="action.disabledBackground" />
              </Typography>
            </Box>
          </Box>

          <Box className="form-group">
            <Box display="flex" justifyContent="space-between" mb={2}>
              <Box width={80} height={24} bgcolor="action.disabledBackground" />
              <Box width={120} height={36} bgcolor="action.disabledBackground" />
            </Box>
            <Box width="100%" height={300} bgcolor="action.disabledBackground" />
          </Box>

          <Box className="container-foooter">
            <Box className="btn-container">
              <Box width={120} height={36} bgcolor="action.disabledBackground" sx={{ mr: 2 }} />
              <Box width={120} height={36} bgcolor="action.disabledBackground" />
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
              fullWidth
              value={newsType}
              onChange={(e) => setNewsType(e.target.value as NewsType)}
              margin="normal"
            >
              {NEWS_TYPES.map((type) => (
                <MenuItem key={type.id} value={type.id}>
                  {type.label}
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
              placeholder="News title"
              margin="normal"
              error={!title.trim()}
              helperText={!title.trim() && "Title is required"}
            />
          </Box>
        </Box>

        <Box className="form-group">
          <div className="content-label">
            <label>Content</label>
            <Button
              variant="outlined"
              color="primary"
              onClick={() => setShowTemplates(true)}
              startIcon={<span>📋</span>}
            >
              Insert Template
            </Button>
          </div>

          <CommonTextEditor
            content={content}
            onChange={setContent}
            maxLimit={2000}
            error={!content.trim()}
            helperText={!content.trim() && "Content is required"}
            height="400px"
          />
        </Box>

        <CommonDialog
          open={showTemplates}
          onClose={() => setShowTemplates(false)}
          title="Select a Template"
          maxWidth="md"
          fullWidth
          children={
            <Box sx={{ minHeight: '300px' }}>
              <List>
                {TEMPLATES.map((template) => (
                  <ListItem 
                    key={template.id}
                    button
                    onClick={() => insertTemplate(template)}
                    sx={{
                      '&:hover': { backgroundColor: 'action.hover' },
                      mb: 1,
                      borderRadius: 1
                    }}
                  >
                    <ListItemText
                      primary={template.name}
                      secondary={template.description}
                      primaryTypographyProps={{ fontWeight: 'medium' }}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          }
          footer={
            <Button onClick={() => setShowTemplates(false)} variant="outlined">
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
              onClick={() => handleSubmit(true)}
              disabled={submitting}
              sx={{ mr: 2 }}
            >
              {submitting ? <CircularProgress size={24} /> : "Save as Draft"}
            </Button>

            <Button
              variant="contained"
              onClick={() => handleSubmit(false)}
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