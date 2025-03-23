import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  TextField,
  Checkbox,
  FormControlLabel,
  Button,
  Select,
  MenuItem,
  Avatar,
  CircularProgress,
} from '@mui/material';
import './NewsDetailEditPage.scss';
import CommonBreadcrumb from '@components/commons/CommonBreadcrumb';
import CommonTextEditor from '@components/commons/CommonTextEditor';
import CommonDialog from '@components/commons/CommonDialog';
import { aget, apost, aput } from '@components/utils/util_axios';
import loading_icon from '@assets/loading_icon.gif';
import { sendErrorToast, sendSuccessToast } from '@components/utils/util_toastify';

const templateContents = [
  { name: 'Template 1', content: 'Template 1 Content' },
  { name: 'Template 2', content: 'Template 2 Content' },
  { name: 'Template 3', content: 'Template 3 Content' },
];

interface NewsType {
  id: string;
  type_name: string;
  description: string;
}

export default function NewsDetailEditPage() {
  const { id } = useParams(); // Get the news article ID from the route parameters
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [tags, setTags] = useState<NewsType | null>(null); // Use NewsType for tags
  const [content, setContent] = useState('');
  const [useTemplate, setUseTemplate] = useState(false);
  const [notes, setNotes] = useState({
    newsArticles: false,
    tickets: true,
    systemConfig: true,
  });
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [loading, setLoading] = useState(true); // Add loading state
  const [newsTypes, setNewsTypes] = useState<NewsType[]>([]); // State to store news types

  useEffect(() => {
    // Fetch news types from /news/types
    aget('/news/types')
      .then(response => {
        setNewsTypes(response.data.data);
      })
      .catch(error => {
        console.error('Failed to fetch news types:', error);
      });

    // Fetch the news article data when the component mounts
    aget(`/news/${id}`)
      .then(response => {
        const newsData = response.data.data;
        setTitle(newsData.title);
        setContent(newsData.content);

        // Set the default tag based on the news_type_id
        aget('/news/types') // Fetch news types again to ensure they are available
          .then(response => {
            const newsTypes = response.data.data;
            const selectedType = newsTypes.find(type => type.id === newsData.news_type_id);
            setTags(selectedType || null);
            setLoading(false); // Set loading to false after data is fetched
          })
          .catch(error => {
            console.error('Failed to fetch news types:', error);
            setLoading(false); // Set loading to false even if there's an error
          });
      })
      .catch(error => {
        console.error('Failed to fetch news article:', error);
        setLoading(false); // Set loading to false even if there's an error
      });
  }, [id]);

  const handleSubmit = (isDraft) => {
    if (!tags) {
      console.error('No tag selected');
      return;
    }

    const requestBody = {
      newsTypeId: tags.id,
      title,
      content,
      isDraft,
      archive: false,
    };

    aput(`/news/${id}`, requestBody)
      .then(response => {
        if (response.status !== 200) {
          sendErrorToast('Failed to update news');
          return;
        }
        sendSuccessToast('News updated successfully!');
        navigate('/news');
      })
      .catch(error => {
        console.error('Failed to update news:', error);
      });
  };

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setContent(template.content);
    setTemplateDialogOpen(false);
  };

  // Function to capitalize the first letter of a string
  const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <img src={loading_icon} className="loading-icon" alt="Loading..." />
      </Box>
    );
  }

  return (
    <Box className="news-detail-edit-page">
      <CommonBreadcrumb
        items={[
          { name: 'News', link: '/news' },
          { name: 'News Editing' },
          { name: title || 'Article 01' },
        ]}
      />
      <Box className="news-container">
        {/* Title and Tags in one row */}
        <Box className="form-group form-group-meta">
          <Box className="form-field">
            <label>Tags</label>
            <Select
              className='form-field-tag'
              fullWidth
              value={tags?.id || ''}
              onChange={(e) => {
                const selectedType = newsTypes.find(type => type.id === e.target.value);
                setTags(selectedType || null);
              }}
              margin="normal"
            >
              {newsTypes.map((type) => (
                <MenuItem key={type.id} value={type.id}>
                  {capitalizeFirstLetter(type.type_name)} {/* Capitalize the first letter */}
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
            />
          </Box>
        </Box>

        {/* Content Editor */}
        <Box className="form-group">
          <div className='content-label'>
            <label>Content</label>
            <Button
              className='btn-template'
              variant="contained"
              color="primary"
              onClick={() => setTemplateDialogOpen(true)}
            >
              Use Template
            </Button>
          </div>

          <CommonTextEditor defaultValue={content} maxLimit={2000} onChange={setContent} />
        </Box>

        {/* Template Selection Dialog */}
        <CommonDialog
          open={templateDialogOpen}
          onClose={() => setTemplateDialogOpen(false)}
          title="Select a Template"
          content={
            <Box>
              {templateContents.map((template) => (
                <Button
                  key={template.name}
                  fullWidth
                  onClick={() => handleTemplateSelect(template)}
                  disabled={selectedTemplate === template}
                >
                  {template.name}
                </Button>
              ))}
            </Box>
          }
          actions={
            <Button onClick={() => setTemplateDialogOpen(false)}>Cancel</Button>
          }
        />

        <Box className='container-foooter'>
          <Box className='meta-info'>
            <Avatar alt="Author Name" src="/path/to/avatar.jpg" />
            <p className='author-name'>Author name</p>
          </Box>
          <Box className='btn-container'>
            <Button
              variant="contained"
              color="primary"
              onClick={() => handleSubmit(true)}
              className="btn-draft"
            >
              Save as draft
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={() => handleSubmit(false)}
              className="btn-submit"
            >
              Edit News
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}