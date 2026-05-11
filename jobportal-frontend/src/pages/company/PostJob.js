import React, { useState } from 'react';
import { Container, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';

export default function PostJob() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', location: '',
    jobType: 'Full-time', requirements: '', deadline: ''
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submitJob = (e) => {
    e.preventDefault();
    const { title, description, location, deadline } = form;
    if (!title || !description || !location || !deadline) {
      toast.warn('Please fill all required fields'); return;
    }
    
    setLoading(true);
    axios.post(`${process.env.REACT_APP_API_URL}/company/jobs`, form, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('ACCESS_TOKEN')}`,
        'Content-Type': 'application/json'
      }
    }).then(res => {
      console.log('Job Post Response:', res.data);
      if (res.data.success) {
        toast.success('Job posted successfully!');
        navigate('/company/dashboard');
      } else {
        toast.error(res.data.message || 'Failed to post job');
      }
    }).catch(err => {
      console.error('Job Post Error:', err.response || err);
      toast.error(err?.response?.data?.message || 'Failed to post job');
    })
      .finally(() => setLoading(false));
  };

  return (
    <Container className="mt-4 pb-5" style={{maxWidth:'700px'}}>
      <h3 className="fw-bold mb-4">Post a New Position</h3>
      <div className="card shadow-sm border-0">
        <div className="card-body p-4">
          <form onSubmit={submitJob}>
            <div className="row">
              <div className="col-md-12 mb-3">
                <label className="form-label fw-bold small text-muted">Job Title *</label>
                <input name="title" type="text" className="form-control" placeholder="e.g. Senior Software Engineer"
                  value={form.title} onChange={handleChange} required />
              </div>
              
              <div className="col-md-6 mb-3">
                <label className="form-label fw-bold small text-muted">Location *</label>
                <input name="location" type="text" className="form-control" placeholder="e.g. Remote, New York"
                  value={form.location} onChange={handleChange} required />
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label fw-bold small text-muted">Application Deadline *</label>
                <input name="deadline" type="date" className="form-control"
                  value={form.deadline} onChange={handleChange} required />
              </div>

              <div className="col-md-12 mb-3">
                <label className="form-label fw-bold small text-muted">Job Type</label>
                <select name="jobType" className="form-select"
                    value={form.jobType} onChange={handleChange}>
                  <option>Full-time</option>
                  <option>Part-time</option>
                  <option>Internship</option>
                  <option>Contract</option>
                  <option>Remote</option>
                </select>
              </div>

              <div className="col-md-12 mb-3">
                <label className="form-label fw-bold small text-muted">Job Description *</label>
                <textarea name="description" className="form-control" rows={5} placeholder="Describe the role, responsibilities, and team..."
                  value={form.description} onChange={handleChange} required />
              </div>

              <div className="col-md-12 mb-4">
                <label className="form-label fw-bold small text-muted">Requirements</label>
                <textarea name="requirements" className="form-control" rows={3} placeholder="Skills, experience, or certifications needed..."
                  value={form.requirements} onChange={handleChange} />
              </div>
            </div>

            <button type="submit" className="btn btn-dark w-100 py-3 fw-bold rounded-3 shadow-sm" disabled={loading}>
              {loading ? <><Spinner size="sm" className="me-2"/> Posting Job...</> : 'Publish Job Listing'}
            </button>
          </form>
        </div>
      </div>
    </Container>
  );
}
