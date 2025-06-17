import CommonBreadcrumb from "@components/commons/CommonBreadcrumb";
import "./TicketsDetailPage.scss";
import { Box, Card, CardContent, Typography, Chip, TextField, Button, Avatar } from "@mui/material";
import { useState, useEffect } from "react";
import CommonTextEditor from "@components/commons/CommonTextEditor";
import MarkAsUnreadIcon from '@mui/icons-material/MarkAsUnread';
import FolderOffIcon from '@mui/icons-material/FolderOff';
import SendIcon from '@mui/icons-material/Send';

export default function TicketsDetailPage() {
  const [reply, setReply] = useState("");
  const [messages, setMessages] = useState([
    {
      id: 1,
      name: "Sarah Johnson",
      email: "example@gmail.com",
      text: "Hi, I'm having issues with integrating the API. The documentation mentions using a specific endpoint, but I'm getting a 404 error. Could you please help?",
      timestamp: "Jan 15, 10:30 AM",
      isResponse: false,
    },
    {
      id: 2,
      name: "John Smith",
      email: "example@gmail.com",
      text: "Hello Sarah, Thank you for reaching out. I can see the issue from the screenshot. You're using the deprecated v1 endpoint. Could you please update your integration to use the v2 endpoint as shown in our latest documentation?",
      timestamp: "Jan 15, 10:45 AM",
      isResponse: true,
    },
    {
      id: 3,
      name: "Sarah Johnson",
      email: "example@gmail.com",
      text: "Hi, I'm having issues with integrating the API. The documentation mentions using a specific endpoint, but I'm getting a 404 error. Could you please help?",
      timestamp: "Jan 15, 10:30 AM",
      isResponse: false,
    },
  ]);

  useEffect(() => {
    const messageSection = document.querySelector(".messages-section");
    if (messageSection) {
      messageSection.scrollTop = messageSection.scrollHeight;
    }
  }, []);

  return (
    <Box className="tickets-detail-page">
      <CommonBreadcrumb items={[{ name: "Tickets", link: "/tickets" }, { name: "Ticket #123" }]} />
      <Box className='ticket-meta'>
        <p className='ticket-title'>Ticket Mail Log - #123</p>
        <Box className='ticket-meta-info'>
          <Box className='field'>
            <p>
              Created: <span>2024-01-15 09:30 AM</span>
            </p>
            <p>
              Updated: <span>2024-01-15 10:15 AM</span>
            </p>
          </Box>
          <Box className='field'>
            <p>
              Category: <span>Technical Support</span>
            </p>
            <p>
              Assigned to: <span>John Smith</span>
            </p>
            <p>
              Email: <span>sarah.wilson@example.com</span>
            </p>
          </Box>
          <Box>
            <Box className='ticket-meta-status'>
              <p>Status: <Chip label="Open" color="primary" /></p>
              <p>Priority: <Chip label="High" color="error" /></p>
            </Box>
          </Box>
        </Box>
      </Box>

      <Box className="messages-section" mt={2}>
        {messages.map((msg) => (
          <Card key={msg.id} className={`message-card ${msg.isResponse ? "response" : ""}`} sx={{ ml: msg.isResponse ? "auto" : 0 }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar>{msg.name.charAt(0)}</Avatar>
                <Typography fontWeight="bold">{msg.name}</Typography>
                <p className="email">{msg.email}</p>
              </Box>
              <Typography mt={1}>{msg.text}</Typography>
              {msg.isResponse && (
                <Typography color="primary" sx={{ textDecoration: "underline", cursor: "pointer" }}>
                  API Documentation v2
                </Typography>
              )}
              <Typography variant="caption" color="text.secondary">
                {msg.timestamp}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

      <Box className="reply-section" mt={3}>
        <CommonTextEditor sx={{ height: "30px" }} ref={null} defaultValue={reply} maxLimit={2000} onChange={(value) => setReply(value)} />
        <Box className="reply-actions">
          <Button variant="contained" className="btn-mark-unread" startIcon={<MarkAsUnreadIcon />}>
            Mark unread
          </Button>
          <Button variant="contained" color="error" className="btn-close-ticket" startIcon={<FolderOffIcon />}>
            Close ticket
          </Button>
          <Button variant="contained" color="primary" className="btn-send-reply" startIcon={<SendIcon />}>
            Send Reply
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

