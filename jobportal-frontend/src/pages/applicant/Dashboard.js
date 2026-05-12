import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('User') || '{}');
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/applicant/my-applications`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('ACCESS_TOKEN')}` }
    }).then(res => { 
        if (res.data.success) setApplications(res.data.data || []); 
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center mt-5"><Spinner animation="border" /></div>;

  return (
    <Container className="mt-4">
      <div className="mb-5 animate__animated animate__fadeIn">
        <h2 className="fw-bold mb-1">Welcome back, {user?.username} 👋</h2>
        <p className="text-muted fs-5">{user?.userDetails?.university} · {user?.userDetails?.degree}</p>
      </div>

      <Row className="mb-5">
        {[
          { label: 'Total Applied',       value: applications.length, color: '#667eea' },
          { label: 'Shortlisted',          value: applications.filter(a => a.status === 'SHORTLISTED').length, color: '#0dcaf0' },
          { label: 'Interviews',           value: applications.filter(a => a.status === 'INTERVIEW_SCHEDULED').length, color: '#ffc107' },
          { label: 'Offers Received',     value: applications.filter(a => a.status === 'OFFERED').length, color: '#198754' },
        ].map((card, i) => (
          <Col key={i} xs={6} md={3} className="mb-4">
            <div className="card text-center shadow-sm border-0 h-100 py-3" style={{ borderBottom: `4px solid ${card.color}` }}>
              <div className="card-body">
                <h2 className="display-4 fw-bold" style={{ color: card.color }}>{card.value}</h2>
                <p className="text-muted mb-0 fw-bold small text-uppercase">{card.label}</p>
              </div>
            </div>
          </Col>
        ))}
      </Row>

      <Row className="justify-content-center">
        <Col md={5} className="mb-3">
          <button className="btn btn-dark w-100 py-3 shadow-sm fw-bold rounded-3 d-flex align-items-center justify-content-center" onClick={() => navigate('/jobs')}>
            Browse Available Jobs
          </button>
        </Col>
        <Col md={5} className="mb-3">
          <button className="btn btn-outline-dark w-100 py-3 shadow-sm fw-bold rounded-3 d-flex align-items-center justify-content-center" onClick={() => navigate('/my-applications')}>
            Track My Applications
          </button>
        </Col>
      </Row>
    </Container>
  );
}
