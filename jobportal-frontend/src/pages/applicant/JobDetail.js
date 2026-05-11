import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Badge, Spinner } from 'react-bootstrap';
import { ArrowLeftCircle } from 'react-bootstrap-icons';
import axios from 'axios';
import { toast } from 'react-toastify';

export default function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/jobs/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('ACCESS_TOKEN')}` }
    }).then(res => { if (res.data.success) setJob(res.data.data || []); });
  }, [id]);

  const applyNow = () => {
    setApplying(true);
    axios.post(`${process.env.REACT_APP_API_URL}/jobs/${id}/apply`, {}, {
      headers: { Authorization: `Bearer ${localStorage.getItem('ACCESS_TOKEN')}` }
    }).then(res => {
      if (res.data.success) {
        toast.success('Application submitted successfully!');
        navigate('/my-applications');
      }
    }).catch(err => toast.error(err?.response?.data?.message || 'Apply failed'))
      .finally(() => setApplying(false));
  };

  if (!job) return <div className="text-center mt-5"><Spinner animation="border" /></div>;

  return (
    <Container className="mt-4" style={{maxWidth:'700px'}}>
      <button className="btn btn-link p-0 mb-3 text-decoration-none d-flex align-items-center" onClick={() => navigate(-1)}>
        <ArrowLeftCircle size={22} className="me-2" /> Back to Listings
      </button>
      <div className="card shadow-sm border-0">
        <div className="card-body p-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h3 className="fw-bold mb-0">{job.title}</h3>
            <Badge bg="primary" className="px-3 py-2">{job.jobType}</Badge>
          </div>
          <p className="text-muted fs-5">{job.companyName} · {job.location}</p>
          <hr />
          <div className="mb-4">
            <h6 className="fw-bold text-uppercase text-muted small">Job Description</h6>
            <p className="text-secondary" style={{whiteSpace: 'pre-line'}}>{job.description}</p>
          </div>
          <div className="mb-4">
            <h6 className="fw-bold text-uppercase text-muted small">Requirements</h6>
            <p className="text-secondary" style={{whiteSpace: 'pre-line'}}>{job.requirements}</p>
          </div>
          <div className="d-flex justify-content-between align-items-center mt-5">
            <p className="text-muted small mb-0">Application deadline: <strong>{job.deadline?.split('T')[0]}</strong></p>
            <button className="btn btn-dark px-5 py-2 fw-bold" onClick={applyNow} disabled={applying}>
              {applying ? <><Spinner size="sm" className="me-2"/> Submitting...</> : 'Apply Now'}
            </button>
          </div>
        </div>
      </div>
    </Container>
  );
}
