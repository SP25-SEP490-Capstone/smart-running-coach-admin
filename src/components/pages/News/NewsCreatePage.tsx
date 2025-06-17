import React, { useState } from 'react';
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
  Typography
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import './NewsCreatePage.scss';
import CommonBreadcrumb from '@components/commons/CommonBreadcrumb';
import CommonTextEditor from '@components/commons/CommonTextEditor';
import CommonDialog from '@components/commons/CommonDialog';
import { apost } from '@components/utils/util_axios';
import { sendErrorToast, sendSuccessToast } from '@components/utils/util_toastify';

interface Template {
  id: string;
  name: string;
  content: string;
  description?: string;
}

type NewsType = 'OFFICIAL' | 'EVENT' | 'WARNING' | 'MISCELLANEOUS';

const NEWS_TYPES: { id: NewsType; label: string }[] = [
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
    content: `## [Announcement Title]\n\nWe are pleased to announce that [details]. Effective from [date].\n\nKey points:\n- Point 1\n- Point 2\n- Point 3\n\nContact: [email/phone]`
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
  },
  {
    id: '4',
    name: 'New Feature Release',
    description: 'Template for product features',
    content: `## New Release: [Feature Name]\n\n### Benefits:\n- Benefit 1\n- Benefit 2\n\n### How to Access:\n[Instructions]\n\nSupport: [contact]`
  }
];

export default function NewsCreatePage() {
  const [title, setTitle] = useState('');
  const [newsType, setNewsType] = useState<NewsType>('OFFICIAL');
  const [content, setContent] = useState('');
  const [showTemplates, setShowTemplates] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (isDraft: boolean) => {
    if (!title.trim()) return sendErrorToast('Title is required');
    if (!content.trim()) return sendErrorToast('Content is required');

    setSubmitting(true);

    try {
      const { status } = await apost('/news/admin', {
        title,
        content,
        newsType,
        isDraft,
        archive: false
      });

      if (status === 201) {
        sendSuccessToast(`News ${isDraft ? 'saved as draft' : 'published'}!`);
        navigate('/news');
      }
    } catch (error) {
      sendErrorToast(error.response?.data?.message || 'Failed to create news');
    } finally {
      setSubmitting(false);
    }
  };

  const insertTemplate = (template: Template) => {
    setContent(prev => prev ? `${prev}\n\n${template.content}` : template.content);
    setShowTemplates(false);
  };

  return (
    <Box className="news-create-page">
      <CommonBreadcrumb
        items={[
          { name: 'News', link: '/news' },
          { name: 'Create News' }
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
              helperText={!title.trim() && 'Title is required'}
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
            value={content}
            onChange={setContent}
            maxLimit={2000}
            error={!content.trim()}
            helperText={!content.trim() && 'Content is required'}
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
          <Box className="btn-container">
            <Button
              variant="outlined"
              onClick={() => handleSubmit(true)}
              disabled={submitting}
              sx={{ mr: 2 }}
            >
              {submitting ? <CircularProgress size={24} /> : 'Save as Draft'}
            </Button>
            
            <Button
              variant="contained"
              onClick={() => handleSubmit(false)}
              disabled={submitting}
            >
              {submitting ? <CircularProgress size={24} /> : 'Publish News'}
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}