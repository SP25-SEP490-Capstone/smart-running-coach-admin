import React, { useState } from 'react';
import {
  Box,
  TextField,
  Checkbox,
  FormControlLabel,
  Button,
  Select,
  MenuItem,
  Avatar,
} from '@mui/material';
import './NewsDetailEditPage.scss';
import CommonBreadcrumb from '@components/commons/CommonBreadcrumb';
import CommonTextEditor from '@components/commons/CommonTextEditor';
import CommonDialog from '@components/commons/CommonDialog';

const templateContents = [
  { name: 'Template 1', content: 'Template 1 Content' },
  { name: 'Template 2', content: 'Template 2 Content' },
  { name: 'Template 3', content: 'Template 3 Content' },
];

export default function NewsDetailEditPage() {
  const [title, setTitle] = useState('');
  const [tags, setTags] = useState('Official'); // Default tag
  const [content, setContent] = useState('');
  const [useTemplate, setUseTemplate] = useState(false);
  const [notes, setNotes] = useState({
    newsArticles: false,
    tickets: true,
    systemConfig: true,
  });
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const handleSubmit = () => {
    // Handle submission logic
    console.log({ title, tags, content, useTemplate, notes });
  };

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setContent(template.content); // Set the selected template content to content
    setTemplateDialogOpen(false); // Close the dialog
  };

  return (
    <Box className="news-detail-edit-page">
      <CommonBreadcrumb
        items={[
          { name: 'News', link: '/news' },
          { name: 'News Editing' },
          { name: 'Article 01' },
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
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              margin="normal"
            >
              <MenuItem value="Official">Official</MenuItem>
              <MenuItem value="Important">Important</MenuItem>
              <MenuItem value="Event">Event</MenuItem>
              <MenuItem value="Miscellaneous">Miscellaneous</MenuItem>
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

          <CommonTextEditor defaultValue={content} maxLimit={2000} />
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
              onClick={handleSubmit}
              className="btn-draft"
            >
              Save as draft
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
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

