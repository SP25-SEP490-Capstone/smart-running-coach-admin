import './DashboardPage.scss';
import { Card, CardContent, Typography, Grid, Avatar, Chip } from '@mui/material';
import { Line, Doughnut } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

Chart.register(...registerables);

export default function DashboardPage() {
  const navigate = useNavigate();

  const userGrowthData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      label: 'User Growth',
      data: [3000, 4500, 4000, 5000, 6000, 5500],
      borderColor: '#4A90E2',
      fill: false,
    }],
  };

  const categoryData = {
    labels: ['Fitness', 'Nutrition', 'Mental Health', 'Life Coach'],
    datasets: [{
      data: [30, 20, 25, 25],
      backgroundColor: ['#4A90E2', '#4CAF50', '#FFA726', '#9E9E9E'],
    }],
  };

  const [latestUsers] = useState([
    { id: 1, name: 'Sarah Wilson', email: 'sarah.w@example.com', status: 'Active' },
    { id: 2, name: 'Michael Chen', email: 'michael.c@example.com', status: 'Active' },
    { id: 3, name: 'Emma Davis', email: 'emma.d@example.com', status: 'Inactive' }
  ]);

  const [latestPosts] = useState([
    { id: 101, title: 'Getting Started with Mindfulness Meditation', author: 'Dr. Emily Johnson', time: '2h ago', views: '1.2k' },
    { id: 102, title: '10 Essential Nutrition Tips for Athletes', author: 'Mark Stevens', time: '4h ago', views: '856' },
    { id: 103, title: 'Understanding Mental Health in the Workplace', author: 'Dr. Sarah Chen', time: '6h ago', views: '2.1k' }
  ]);

  return (
    <div className="dashboard-page">
      <div className='title-container'>
        <h1>Dashboard</h1>
      </div>
      <Grid container spacing={3}>
        <Grid item xs={3}>
          <div className="stats-card">
            <div className="stats-card-title">Total Users</div>
            <div className="stats-card-value">24,850</div>
          </div>
        </Grid>
        <Grid item xs={3}>
          <div className="stats-card">
            <div className="stats-card-title">Active Experts</div>
            <div className="stats-card-value">1,250</div>
          </div>
        </Grid>
        <Grid item xs={3}>
          <div className="stats-card">
            <div className="stats-card-title">Total Posts</div>
            <div className="stats-card-value">12,430</div>
          </div>
        </Grid>
        <Grid item xs={3}>
          <div className="stats-card">
            <div className="stats-card-title">Open Tickets</div>
            <div className="stats-card-value">82</div>
          </div>
        </Grid>
      </Grid>

      <Grid container spacing={3} mt={3} className='chart'>
        <Grid item xs={8}>
          <Card>
            <CardContent>
              <p className="card-title">User Growth</p>
              <Line data={userGrowthData} />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={4}>
          <Card>
            <CardContent>
            <p className="card-title">Expert Categories</p>
              <Doughnut data={categoryData} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <div className="latest-container">
        <div className="latest-users">
          <p className="latest-title">Latest Users</p>
          <div className='latest-items'>
            {latestUsers.map(user => (
              <div key={user.id} className="user-item" onClick={() => navigate(`/users/${user.id}`)}>
                <div className="user-meta">
                  <Avatar>{user.name[0]}</Avatar>
                  <div>
                    <p className="user-name">{user.name}</p>
                    <p className="user-email">{user.email}</p>
                  </div>
                </div>
                <Chip className='user-status' label={user.status} color={user.status === 'Active' ? 'success' : 'default'} />
              </div>
            ))}
          </div>
          <div className='btn-view-all' onClick={() => navigate('/users')}>
            <p>View all</p>
          </div>
        </div>
        <div className="latest-posts">
          <p className="latest-title">Latest Posts</p>
          <div className='latest-items'>
            {latestPosts.map(post => (
              <div key={post.id} className="post-item" onClick={() => navigate(`/posts/${post.id}`)}>
                <p className="post-title">{post.title}</p>
                <p className="post-details">{post.author} • {post.time} • {post.views} views</p>
              </div>
            ))}
          </div>
          <div className='btn-view-all' onClick={() => navigate('/posts')}>
            <p>View all</p>
          </div>
        </div>
      </div>
    </div>
  );
}
