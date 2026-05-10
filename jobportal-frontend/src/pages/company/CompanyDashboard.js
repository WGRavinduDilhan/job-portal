import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Table, Badge, Spinner, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, People, Briefcase, Eye } from 'react-bootstrap-icons';
import axios from 'axios';

export default function CompanyDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('User') || '{}');
  const [dashboardData, setDashboardData] = useState({
    totalJobs: 0,
    totalApplicants: 0,
    activeListings: 0,
    recentJobs: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers = { Authorization: `Bearer ${localStorage.getItem('ACCESS_TOKEN')}` };
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/company/dashboard`, { headers });
        if (res.data.success) {
          setDashboardData(res.data.body);
        }
      } catch (err) {
        console.error('Failed to fetch dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="text-center mt-5"><Spinner animation="border" /></div>;

  return (
    <Container className="mt-4 pb-5">
      <div className="d-flex justify-content-between align-items-center mb-5 animate__animated animate__fadeIn">
        <div>
          <h2 className="fw-bold mb-1">Company Console</h2>
          <p className="text-muted fs-5">{user?.username} · {user?.userDetails?.industry || 'Recruitment'}</p>
        </div>
        <Button variant="dark" className="rounded-pill px-4 py-2 fw-bold shadow-sm d-flex align-items-center" onClick={() => navigate('/company/post-job')}>
          <PlusCircle className="me-2" /> Post New Job
        </Button>
      </div>

      <Row className="mb-5">
        {[
          { label: 'Live Listings', value: dashboardData.activeListings, icon: <Briefcase />, color: '#667eea' },
          { label: 'Total Applicants', value: dashboardData.totalApplicants, icon: <People />, color: '#0dcaf0' },
          { label: 'Hiring Pipeline', value: dashboardData.totalJobs, icon: <PlusCircle />, color: '#198754' },
        ].map((card, i) => (
          <Col key={i} xs={12} md={4} className="mb-4">
            <Card className="text-center shadow-sm border-0 h-100">
              <Card.Body className="py-4">
                <div className="mb-2 fs-1" style={{ color: card.color }}>{card.icon}</div>
                <h2 className="display-4 fw-bold mb-0">{card.value}</h2>
                <p className="text-muted mb-0 fw-bold small text-uppercase">{card.label}</p>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <h4 className="fw-bold mb-4">Your Job Listings</h4>
      <div className="card shadow-sm border-0 overflow-hidden">
        <Table responsive hover className="mb-0">
          <thead className="table-dark">
            <tr>
              <th className="py-3 ps-4">Job Title</th>
              <th className="py-3">Posted Date</th>
              <th className="py-3 text-center">Status</th>
              <th className="py-3 text-center">Applicants</th>
              <th className="py-3 pe-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {dashboardData.recentJobs?.map(job => (
              <tr key={job.id}>
                <td className="py-3 ps-4 fw-bold">{job.title}</td>
                <td className="py-3">{job.postedDate?.split('T')[0]}</td>
                <td className="py-3 text-center">
                  <Badge bg={job.active ? "success" : "secondary"} className="px-3 py-2">
                    {job.active ? "ACTIVE" : "CLOSED"}
                  </Badge>
                </td>
                <td className="py-3 text-center">
                  <span className="badge rounded-pill bg-light text-dark border px-3 py-2 fs-6">
                    {job.applicantCount || 0}
                  </span>
                </td>
                <td className="py-3 pe-4 text-center">
                  <Button variant="outline-primary" size="sm" className="rounded-pill px-3" onClick={() => navigate(`/company/pipeline/${job.id}`)}>
                    <Eye className="me-1" /> View Pipeline
                  </Button>
                </td>
              </tr>
            ))}
            {(!dashboardData.recentJobs || dashboardData.recentJobs.length === 0) && (
              <tr><td colSpan={5} className="text-center py-5 text-muted">You haven't posted any jobs yet.</td></tr>
            )}
          </tbody>
        </Table>
      </div>
    </Container>
  );
}
