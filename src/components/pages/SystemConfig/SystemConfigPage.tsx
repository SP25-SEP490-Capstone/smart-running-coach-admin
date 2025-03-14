import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  LinearProgress,
  FormControlLabel,
  Switch,
  TextField,
  Button
} from '@mui/material';
import './SystemConfigPage.scss';
import { sendSuccessToast } from '@components/utils/util_toastify';

export default function SystemConfigPage() {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [backupMessage, setBackupMessage] = useState('');

  const handleMaintenanceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMaintenanceMode(event.target.checked);
  };

  const handleBackupMessageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setBackupMessage(event.target.value);
  };

  const handleSaveMaintenance = () => {
    sendSuccessToast('Maintenance settings saved!');
  };

  return (
    <Box className="system-config-page">
      <div className="title-container">
        <h1>System Configuration</h1>
      </div>

      <Grid container spacing={2} className="info-cards">
        {/* CPU Card */}
        <Grid item xs={12} sm={6} md={3}>
          <Card className="info-card">
            <CardContent>
              <Typography variant="h6" className="card-title">CPU</Typography>
              <Typography variant="body2" className="card-subtitle">Intel Core i9-12900K</Typography>
              
              <div className="info-detail">
                <span>Current Load</span>
                <span>25%</span>
              </div>
              <div className="info-detail">
                <span>Temperature</span>
                <span>65°C</span>
              </div>
              <div className="info-detail">
                <span>Cores</span>
                <span>16</span>
              </div>
              <div className="info-detail">
                <span>Threads</span>
                <span>24</span>
              </div>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card className="info-card">
            <CardContent>
              <Typography variant="h6" className="card-title">Memory</Typography>
              <Typography variant="body2" className="card-subtitle">Usage: 32 GB / 64 GB</Typography>
              
              <div className="info-detail">
                <span>Type</span>
                <span>DDR5-4800</span>
              </div>
              <div className="info-detail">
                <span>Channels</span>
                <span>Dual Channel</span>
              </div>
              <div className="progress-bar">
                <LinearProgress variant="determinate" value={50} />
              </div>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card className="info-card">
            <CardContent>
              <Typography variant="h6" className="card-title">Storage</Typography>
              <Typography variant="body2" className="card-subtitle">NVMe SSD</Typography>
              
              <div className="info-detail">
                <span>Usage</span>
                <span>250 GB / 1 TB</span>
              </div>
              <div className="info-detail">
                <span>Read/Write</span>
                <span>2800 MB/s</span>
              </div>
              <div className="progress-bar">
                <LinearProgress variant="determinate" value={25} />
              </div>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card className="info-card">
            <CardContent>
              <Typography variant="h6" className="card-title">Network</Typography>
              <Typography variant="body2" className="card-subtitle">Ethernet</Typography>
              
              <div className="info-detail">
                <span>Speed</span>
                <span>1 Gbps</span>
              </div>
              <div className="info-detail">
                <span>Packets</span>
                <span>123k/s</span>
              </div>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* System Info and System Health */}
      <Grid container spacing={2} className="system-stats">
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" className="stats-title">System Information</Typography>
              <div className="info-detail">
                <span>Operating System</span>
                <span>Linux Ubuntu 22.04 LTS</span>
              </div>
              <div className="info-detail">
                <span>Kernel Version</span>
                <span>5.15.0-56-generic</span>
              </div>
              <div className="info-detail">
                <span>System Uptime</span>
                <span>129 days</span>
              </div>
              <div className="info-detail">
                <span>Last Boot</span>
                <span>2021-01-05 08:00:00 UTC</span>
              </div>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" className="stats-title">System Health</Typography>
              <div className="info-detail">
                <span>System Performance</span>
                <span className="status-text optimal">Optimal</span>
              </div>
              <div className="info-detail">
                <span>Disk Space Warning</span>
                <span className="status-text warning">42% Used</span>
              </div>
              <div className="info-detail">
                <span>Security Scan</span>
                <span>Passed 2 hours ago</span>
              </div>
              <div className="info-detail">
                <span>Disk Health Check</span>
                <span>2 hours ago</span>
              </div>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Maintenance Section */}
      <Grid container spacing={2} className="maintenance-section">
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" className="stats-title">Maintenance</Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={maintenanceMode}
                    onChange={handleMaintenanceChange}
                    color="primary"
                  />
                }
                label="Activate Maintenance Mode"
              />
              <TextField
                label="Backup Message"
                variant="outlined"
                fullWidth
                margin="normal"
                value={backupMessage}
                onChange={handleBackupMessageChange}
              />
              <Button
                variant="contained"
                color="primary"
                onClick={handleSaveMaintenance}
              >
                Save
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
