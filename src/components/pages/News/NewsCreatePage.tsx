import React, { useState, useEffect } from 'react';
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
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import './NewsCreatePage.scss';
import CommonBreadcrumb from '@components/commons/CommonBreadcrumb';
import CommonTextEditor from '@components/commons/CommonTextEditor';
import CommonDialog from '@components/commons/CommonDialog';
import { aget, apost } from '@components/utils/util_axios';
import { sendErrorToast, sendSuccessToast } from '@components/utils/util_toastify';

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

export default function NewsCreatePage() {
  const [title, setTitle] = useState('');
  const [selectedType, setSelectedType] = useState<NewsType | null>(null);
  const [content, setContent] = useState('');
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [newsTypes, setNewsTypes] = useState<NewsType[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  // Hardcoded templates
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
    },
    {
      id: '4',
      name: 'New Feature Release',
      description: 'Template for announcing new product features',
      content: `## New Release: [Feature Name]\n\nWe're excited to introduce [feature name] to our [product/service]!\n\n### Key Benefits:\n- Benefit 1\n- Benefit 2\n- Benefit 3\n\n### How to Access:\n[Instructions on how to use the feature]\n\n### Timeline:\n- Available starting: [date]\n- Training sessions: [details if applicable]\n\nFor support, contact [support team details].`
    }
  ];

  useEffect(() => {
    const fetchNewsTypes = async () => {
      try {
        const response = await aget('/news/types');
        setNewsTypes(response.data.data);
        setSelectedType(response.data.data[0]); // Set default type
      } catch (error) {
        console.error('Failed to fetch news types:', error);
        sendErrorToast('Failed to load news types');
      } finally {
        setLoading(false);
      }
    };

    fetchNewsTypes();
  }, []);

  const handleSubmit = async (isDraft: boolean) => {
    if (!selectedType) {
      sendErrorToast('Please select a news type');
      return;
    }

    if (!title.trim()) {
      sendErrorToast('Title is required');
      return;
    }

    if (!content.trim()) {
      sendErrorToast('Content is required');
      return;
    }

    setSubmitting(true);

    try {
      const response = await apost('/news/admin', {
        newsTypeId: selectedType.id,
        title,
        content,
        isDraft,
        archive: false
      });

      if (response.status === 201) {
        sendSuccessToast(`News ${isDraft ? 'saved as draft' : 'published'} successfully!`);
        navigate('/news');
      } else {
        throw new Error(response.data?.message || 'Failed to create news');
      }
    } catch (error) {
      console.error('Failed to create news:', error);
      sendErrorToast(error.response?.data?.message || 'Failed to create news');
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

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box className="news-create-page">
      <CommonBreadcrumb
        items={[
          { name: 'News', link: '/news' },
          { name: 'Create News' },
        ]}
      />
      
      <Box className="news-container">
        <Box className="form-group form-group-meta">
          <Box className="form-field">
            <label>News Type</label>
            <Select
              className='form-field-tag'
              fullWidth
              value={selectedType?.id || ''}
              onChange={(e) => {
                const type = newsTypes.find(t => t.id === e.target.value);
                setSelectedType(type || null);
              }}
              margin="normal"
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
              helperText={!title.trim() ? 'Title is required' : ''}
            />
          </Box>
        </Box>

        <Box className="form-group">
          <div className='content-label'>
            <label>Content</label>
            <Button
              className='btn-template'
              variant="outlined"
              color="primary"
              onClick={() => setTemplateDialogOpen(true)}
              startIcon={<span>📋</span>}
            >
              Insert Template
            </Button>
          </div>

          <CommonTextEditor 
            value={content}  // Changed from defaultValue to value
            onChange={(newContent) => setContent(newContent)}
            maxLimit={2000}
            error={!content.trim()}
            helperText={!content.trim() ? 'Content is required' : ''}
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

        <Box className='container-foooter'>
          <Box className='btn-container'>
            <Button
              variant="outlined"
              color="primary"
              onClick={() => handleSubmit(true)}
              className="btn-draft"
              disabled={submitting}
              sx={{ mr: 2 }}
            >
              {submitting ? <CircularProgress size={24} /> : 'Save as Draft'}
            </Button>
            
            <Button
              variant="contained"
              color="primary"
              onClick={() => handleSubmit(false)}
              className="btn-submit"
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