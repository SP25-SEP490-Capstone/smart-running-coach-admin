import {
  Box,
  Button,
  TextField,
  Paper,
} from '@mui/material';

import './TicketsCreatePage.scss';
import CommonBreadcrumb from '@components/commons/CommonBreadcrumb';
import CommonTextEditor from '@components/commons/CommonTextEditor';

export default function TicketsCreatePage() {
  return (
    <div className="tickets-create-page">
      <CommonBreadcrumb
        items={[
          { name: 'Dashboard', link: '/dashboard' },
          { name: 'Tickets', link: '/tickets' },
          { name: 'Compose email manually' }
        ]}
      />
      <header className="page-header">
        <p className="page-title">
          Compose Email
        </p>
        <Button variant="contained" className="btn-template">
          Use Template
        </Button>
      </header>

      <Paper elevation={1} className="compose-form">
        <TextField
          label="To"
          variant="outlined"
          fullWidth
          className="form-field"
        />

        {/* "Subject" field */}
        <TextField
          label="Subject"
          variant="outlined"
          fullWidth
          className="form-field"
        />

       <CommonTextEditor />

        {/* Action buttons */}
        <div className="button-group">
          <Button variant="contained" color="primary">
            Send Email
          </Button>
          <Button variant="outlined" color="primary">
            Save Draft
          </Button>
          <Button color="inherit">Cancel</Button>
        </div>
      </Paper>
    </div>
  );
}
