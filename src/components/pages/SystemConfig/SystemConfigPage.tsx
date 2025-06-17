import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  LinearProgress,
  IconButton,
  Tooltip,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import "./SystemConfigPage.scss";
import {
  sendSuccessToast,
  sendErrorToast,
} from "@components/utils/util_toastify";
import { aget } from "@components/utils/util_axios";

interface SystemStats {
  cpu: {
    manufacturer: string;
    brand: string;
    speed: number;
    cores: number;
    physicalCores: number;
    processors: number;
    load: string;
    temperature: number | null;
    currentLoad: number;
  };
  memory: {
    total: string;
    used: string;
    free: string;
    usage: string;
    type: string;
  };
  storage: {
    size: string;
    used: string;
    free: string;
    usage: string;
    type: string;
  };
  network: {
    interface: string;
    speed: number;
    ip4: string;
    ip6: string;
    mac: string;
  };
  os: {
    platform: string;
    distro: string;
    release: string;
    kernel: string;
    arch: string;
    hostname: string;
    uptime: string;
    bootTime: string;
  };
  systemHealth: {
    status: string;
    lastCheck: string;
  };
}

export default function SystemConfigPage() {
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSystemStats = async () => {
    try {
      const response = await aget("/system-stats");
      setSystemStats(response.data);
      sendSuccessToast("System stats updated");
    } catch (error) {
      console.error("Error fetching system stats:", error);
      sendErrorToast("Failed to fetch system stats");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSystemStats();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchSystemStats();
  };

  const formatSpeed = (speed: number) => {
    if (speed >= 1000) return `${(speed / 1000).toFixed(1)} Gbps`;
    return `${speed} Mbps`;
  };

  const getHealthStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "optimal":
        return "#00CEC9";
      case "warning":
        return "#FFB900";
      case "critical":
        return "#FF6B6B";
      default:
        return "#00CEC9";
    }
  };

  return (
    <Box className="system-config-page">
      <div className="title-container">
        <h1 className="title">System Logs</h1>
        <Tooltip title="Refresh stats">
          <IconButton
            className="btn-refresh"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshIcon className={refreshing ? "spin" : ""} />
          </IconButton>
        </Tooltip>
      </div>

      <Grid container spacing={3} className="info-cards">
        {/* CPU Card */}
        <Grid item xs={12} sm={6} md={3}>
          <Card className="info-card cpu">
            <CardContent>
              <Typography variant="h6" className="card-title">
                {loading ? <Skeleton width={100} /> : "CPU"}
              </Typography>
              {loading ? (
                <Skeleton count={4} />
              ) : (
                <>
                  <Typography variant="body2" className="card-subtitle">
                    {systemStats?.cpu.manufacturer} {systemStats?.cpu.brand}
                  </Typography>
                  <div className="info-detail">
                    <span>Load</span>
                    <span>{systemStats?.cpu.currentLoad.toFixed(1)}%</span>
                  </div>
                  <div className="info-detail">
                    <span>Speed</span>
                    <span>{systemStats?.cpu.speed} GHz</span>
                  </div>
                  <div className="info-detail">
                    <span>Cores</span>
                    <span>
                      {systemStats?.cpu.physicalCores}/{systemStats?.cpu.cores}
                    </span>
                  </div>
                  <div className="info-detail">
                    <span>Temp</span>
                    <span>
                      {systemStats?.cpu.temperature
                        ? `${systemStats.cpu.temperature}°C`
                        : "N/A"}
                    </span>
                  </div>
                  <div className="progress-bar">
                    <LinearProgress
                      variant="determinate"
                      value={systemStats?.cpu.currentLoad}
                      className={
                        systemStats?.cpu.currentLoad > 80 ? "warning" : ""
                      }
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Memory Card */}
        <Grid item xs={12} sm={6} md={3}>
          <Card className="info-card memory">
            <CardContent>
              <Typography variant="h6" className="card-title">
                {loading ? <Skeleton width={100} /> : "Memory"}
              </Typography>
              {loading ? (
                <Skeleton count={4} />
              ) : (
                <>
                  <Typography variant="body2" className="card-subtitle">
                    {systemStats?.memory.used} GB / {systemStats?.memory.total}{" "}
                    GB
                  </Typography>
                  <div className="info-detail">
                    <span>Type</span>
                    <span>{systemStats?.memory.type}</span>
                  </div>
                  <div className="info-detail">
                    <span>Free</span>
                    <span>{systemStats?.memory.free} GB</span>
                  </div>
                  <div className="info-detail">
                    <span>Usage</span>
                    <span>{systemStats?.memory.usage}%</span>
                  </div>
                  <div className="progress-bar">
                    <LinearProgress
                      variant="determinate"
                      value={parseFloat(systemStats?.memory.usage || "0")}
                      className={
                        parseFloat(systemStats?.memory.usage || "0") > 85
                          ? "warning"
                          : ""
                      }
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Storage Card */}
        <Grid item xs={12} sm={6} md={3}>
          <Card className="info-card storage">
            <CardContent>
              <Typography variant="h6" className="card-title">
                {loading ? <Skeleton width={100} /> : "Storage"}
              </Typography>
              {loading ? (
                <Skeleton count={4} />
              ) : (
                <>
                  <Typography variant="body2" className="card-subtitle">
                    {systemStats?.storage.type}
                  </Typography>
                  <div className="info-detail">
                    <span>Usage</span>
                    <span>
                      {systemStats?.storage.used} GB /{" "}
                      {systemStats?.storage.size} GB
                    </span>
                  </div>
                  <div className="info-detail">
                    <span>Free</span>
                    <span>{systemStats?.storage.free} GB</span>
                  </div>
                  <div className="info-detail">
                    <span>Usage</span>
                    <span>{systemStats?.storage.usage}%</span>
                  </div>
                  <div className="progress-bar">
                    <LinearProgress
                      variant="determinate"
                      value={parseFloat(systemStats?.storage.usage || "0")}
                      className={
                        parseFloat(systemStats?.storage.usage || "0") > 85
                          ? "warning"
                          : ""
                      }
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Network Card */}
        <Grid item xs={12} sm={6} md={3}>
          <Card className="info-card network">
            <CardContent>
              <Typography variant="h6" className="card-title">
                {loading ? <Skeleton width={100} /> : "Network"}
              </Typography>
              {loading ? (
                <Skeleton count={4} />
              ) : (
                <>
                  <Typography variant="body2" className="card-subtitle">
                    {systemStats?.network.interface}
                  </Typography>
                  <div className="info-detail">
                    <span>Speed</span>
                    <span>{formatSpeed(systemStats?.network.speed || 0)}</span>
                  </div>
                  <div className="info-detail">
                    <span>IPv4</span>
                    <span className="truncate">{systemStats?.network.ip4}</span>
                  </div>
                  <div className="info-detail">
                    <span>MAC</span>
                    <span>{systemStats?.network.mac}</span>
                  </div>
                  <div className="info-detail">
                    <span>Status</span>
                    <span className="status-text optimal">Connected</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* System Info and System Health */}
      <Grid container spacing={3} className="system-stats">
        <Grid item xs={12} md={6}>
          <Card className="info-card system-info">
            <CardContent>
              <Typography variant="h6" className="stats-title">
                {loading ? <Skeleton width={150} /> : "System Information"}
              </Typography>
              {loading ? (
                <Skeleton
                  count={5}
                  height={20}
                  style={{ marginBottom: "0.5rem" }}
                />
              ) : (
                <>
                  <div className="info-detail">
                    <span>OS</span>
                    <span>{systemStats?.os.distro}</span>
                  </div>
                  <div className="info-detail">
                    <span>Kernel</span>
                    <span>{systemStats?.os.kernel}</span>
                  </div>
                  <div className="info-detail">
                    <span>Architecture</span>
                    <span>{systemStats?.os.arch}</span>
                  </div>
                  <div className="info-detail">
                    <span>Hostname</span>
                    <span>{systemStats?.os.hostname}</span>
                  </div>
                  <div className="info-detail">
                    <span>Uptime</span>
                    <span>{systemStats?.os.uptime}</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card className="info-card system-health">
            <CardContent>
              <Typography variant="h6" className="stats-title">
                {loading ? <Skeleton width={150} /> : "System Health"}
              </Typography>
              {loading ? (
                <Skeleton
                  count={5}
                  height={20}
                  style={{ marginBottom: "0.5rem" }}
                />
              ) : (
                <>
                  <div className="info-detail">
                    <span>Overall Status</span>
                    <span
                      className="status-text"
                      style={{
                        color: getHealthStatusColor(
                          systemStats?.systemHealth.status || "optimal"
                        ),
                      }}
                    >
                      {systemStats?.systemHealth.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="info-detail">
                    <span>CPU Health</span>
                    <span
                      className={
                        systemStats?.cpu.currentLoad > 80
                          ? "status-text warning"
                          : "status-text optimal"
                      }
                    >
                      {systemStats?.cpu.currentLoad > 80
                        ? "High Load"
                        : "Normal"}
                    </span>
                  </div>
                  <div className="info-detail">
                    <span>Memory Health</span>
                    <span
                      className={
                        parseFloat(systemStats?.memory.usage || "0") > 85
                          ? "status-text warning"
                          : "status-text optimal"
                      }
                    >
                      {parseFloat(systemStats?.memory.usage || "0") > 85
                        ? "High Usage"
                        : "Normal"}
                    </span>
                  </div>
                  <div className="info-detail">
                    <span>Storage Health</span>
                    <span
                      className={
                        parseFloat(systemStats?.storage.usage || "0") > 85
                          ? "status-text warning"
                          : "status-text optimal"
                      }
                    >
                      {parseFloat(systemStats?.storage.usage || "0") > 85
                        ? "High Usage"
                        : "Normal"}
                    </span>
                  </div>
                  <div className="info-detail">
                    <span>Last Check</span>
                    <span>
                      {new Date(
                        systemStats?.systemHealth.lastCheck || ""
                      ).toLocaleString()}
                    </span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
