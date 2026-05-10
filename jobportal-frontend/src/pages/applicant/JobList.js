import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Badge, Spinner } from 'react-bootstrap';
import { GeoAltFill, ClockFill } from 'react-bootstrap-icons';
import axios from 'axios';

export default function JobList() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/jobs`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('ACCESS_TOKEN')}` }
    }).then(res => {
      if (res.data.success) setJobs(res.data.body || []);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center mt-5"><Spinner animation="border" /></div>;

  return (
    <Container className="mt-4">
      <h2 className="mb-4">Available Positions</h2>
      <Row>
        {jobs.map(job => (
          <Col key={job.id} xs={12} md={6} lg={4} className="mb-4">
            <div className="card h-100 shadow-sm" style={{cursor:'pointer'}}
                 onClick={() => navigate(`/jobs/${job.id}`)}>
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <h5 className="card-title mb-0">{job.title}</h5>
                  <Badge bg="primary">{job.jobType}</Badge>
                </div>
                <p className="text-muted mb-2"><strong>{job.companyName}</strong></p>
                <p className="text-muted small mb-1">
                  <GeoAltFill size={12} /> {job.location}
                </p>
                <p className="text-muted small">
                  <ClockFill size={12} /> Deadline: {job.deadline?.split('T')[0]}
                </p>
                <p className="card-text mt-2">{job.description?.substring(0, 100)}...</p>
              </div>
              <div className="card-footer bg-white border-top-0">
                <button className="btn btn-outline-dark btn-sm w-100">View & Apply</button>
              </div>
            </div>
          </Col>
        ))}
        {jobs.length === 0 && <Col><p className="text-center text-muted w-100">No jobs posted yet.</p></Col>}
      </Row>
    </Container>
  );
}
