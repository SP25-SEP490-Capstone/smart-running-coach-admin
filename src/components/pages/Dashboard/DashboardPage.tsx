import './DashboardPage.scss';
import { Card, CardContent, Grid, Avatar, Chip, Button } from '@mui/material';
import { Line, Doughnut } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { aget } from '@components/utils/util_axios';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

Chart.register(...registerables);

interface DashboardData {
  total_users: number;
  total_runners: number;
  total_experts: number;
  total_posts: number;
  total_tickets: number;
  user_growth: {
    day: string;
    count: number;
    cumulative_count: number;
  }[];
  latest_users: {
    id: string;
    name: string;
    username: string;
    email: string;
    created_at: string;
    image: string | null;
  }[];
  latest_posts: {
    id: string;
    title: string;
    content: string;
    created_at: string;
    User: {
      id: string;
      name: string;
      username: string;
    };
  }[];
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const currentMonthYear = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

  const getUserGrowthData = (userGrowth: DashboardData['user_growth']) => {
    if (!userGrowth || userGrowth.length === 0) return {
      labels: [],
      datasets: [{
        label: 'User Growth',
        data: [],
        borderColor: '#4A90E2',
        fill: false,
      }]
    };

    return {
      labels: userGrowth.map(item => item.day),
      datasets: [{
        label: 'User Growth',
        data: userGrowth.map(item => item.count),
        borderColor: '#4A90E2',
        fill: false,
        tension: 0.1,
      }]
    };
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(false);
      const response = await aget('/admins/dashboard/summary');
      if (response.status === 200) {
        setDashboardData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const renderErrorState = () => (
    <div className="error-state">
      <p>Cannot load data. Please try again</p>
      <Button variant="contained" color="primary" onClick={fetchData}>
        Refresh
      </Button>
    </div>
  );

  return (
    <div className="dashboard-page">
      <div className='title-container'>
        <h1>Dashboard</h1>
      </div>
      
      {error ? (
        renderErrorState()
      ) : (
        <>
          <Grid container spacing={3}>
            <Grid item xs={3}>
              <div className="stats-card">
                <div className="stats-card-title">Total Users</div>
                {loading ? (
                  <Skeleton width={100} height={30} />
                ) : (
                  <div className="stats-card-value">{dashboardData?.total_users}</div>
                )}
              </div>
            </Grid>
            <Grid item xs={3}>
              <div className="stats-card">
                <div className="stats-card-title">Active Experts</div>
                {loading ? (
                  <Skeleton width={100} height={30} />
                ) : (
                  <div className="stats-card-value">
                    {dashboardData?.total_experts}
                  </div>
                )}
              </div>
            </Grid>
            <Grid item xs={3}>
              <div className="stats-card">
                <div className="stats-card-title">Total Posts</div>
                {loading ? (
                  <Skeleton width={100} height={30} />
                ) : (
                  <div className="stats-card-value">{dashboardData?.total_posts}</div>
                )}
              </div>
            </Grid>
            <Grid item xs={3}>
              <div className="stats-card">
                <div className="stats-card-title">Open Tickets</div>
                {loading ? (
                  <Skeleton width={100} height={30} />
                ) : (
                  <div className="stats-card-value">{dashboardData?.total_tickets}</div>
                )}
              </div>
            </Grid>
          </Grid>

          <Grid container spacing={3} mt={3} className='chart'>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <p className="card-title">User Growth ({currentMonthYear})</p>
                  {loading ? (
                    <Skeleton height={300} />
                  ) : error ? (
                    renderErrorState()
                  ) : (
                    <Line 
                      height="60px"
                      data={getUserGrowthData(dashboardData?.user_growth || [])} 
                      options={{
                        responsive: true,
                        plugins: {
                          legend: {
                            position: 'top',
                          },
                          tooltip: {
                            callbacks: {
                              label: function(context) {
                                return `Total users: ${context.raw}`;
                              }
                            }
                          }
                        },
                        scales: {
                          y: {
                            beginAtZero: true,
                            ticks: {
                              precision: 0
                            }
                          }
                        }
                      }}
                    />
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <div className="latest-container">
            <div className="latest-users">
              <p className="latest-title">Latest Users</p>
              <div className='latest-items'>
                {loading ? (
                  Array(3).fill(0).map((_, index) => (
                    <div key={index} className="user-item">
                      <div className="user-meta">
                        <Skeleton circle width={40} height={40} />
                        <div style={{ width: '100%', marginLeft: '10px' }}>
                          <Skeleton width={120} />
                          <Skeleton width={180} />
                        </div>
                      </div>
                      <Skeleton width={60} height={24} />
                    </div>
                  ))
                ) : error ? (
                  renderErrorState()
                ) : (
                  dashboardData?.latest_users.map(user => (
                    <div key={user.id} className="user-item" onClick={() => navigate(`/users/${user.id}`)}>
                      <div className="user-meta">
                        <Avatar>{user.username[0]}</Avatar>
                        <div>
                          <p className="user-name">{user.username}</p>
                          <p className="user-email">{user.email}</p>
                        </div>
                      </div>
                      <Chip 
                        className='user-status' 
                        label="Active" 
                        color="success" 
                      />
                    </div>
                  ))
                )}
              </div>
              <div className='btn-view-all' onClick={() => navigate('/users')}>
                <p>View all</p>
              </div>
            </div>
            <div className="latest-posts">
              <p className="latest-title">Latest Posts</p>
              <div className='latest-items'>
                {loading ? (
                  Array(3).fill(0).map((_, index) => (
                    <div key={index} className="post-item">
                      <Skeleton width={250} />
                      <Skeleton width={200} />
                    </div>
                  ))
                ) : error ? (
                  renderErrorState()
                ) : (
                  dashboardData?.latest_posts.map(post => (
                    <div key={post.id} className="post-item" onClick={() => navigate(`/posts/${post.id}`)}>
                      <p className="post-title">{post.title}</p>
                      <p className="post-details">
                        {post.User?.username} • {formatDate(post.created_at)}
                      </p>
                    </div>
                  ))
                )}
              </div>
              <div className='btn-view-all' onClick={() => navigate('/posts')}>
                <p>View all</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}