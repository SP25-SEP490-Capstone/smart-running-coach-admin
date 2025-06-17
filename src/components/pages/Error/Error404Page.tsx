import React from 'react';
import { Button, Container, Typography } from '@mui/material';
import ErrorIcon from '@mui/icons-material/Error';
import { useNavigate } from 'react-router-dom';
import './Error404Page.scss';

const Error404Page: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Container className="error-404-container">
      <div className="error-content">
        <ErrorIcon className="error-icon" />
        <Typography variant="h1" className="error-title">
          404
        </Typography>
        <Typography variant="h5" className="error-message">
          Oops! Page Not Found
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate('/dashboard')}
          className="back-button"
        >
          Back to Dashboard
        </Button>
      </div>
    </Container>
  );
};

export default Error404Page;