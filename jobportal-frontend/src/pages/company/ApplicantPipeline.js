import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Table, Badge, Spinner } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { ArrowLeftCircle } from 'react-bootstrap-icons';
import axios from 'axios';

const STATUSES = ['APPLIED', 'SHORTLISTED', 'INTERVIEW_SCHEDULED', 'OFFERED', 'REJECTED'];
const STATUS_COLOR = {
  APPLIED: 'secondary', SHORTLISTED: 'info',
  INTERVIEW_SCHEDULED: 'warning', OFFERED: 'success', REJECTED: 'danger'
};

export default function ApplicantPipeline() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/company/jobs/${jobId}/applicants`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('ACCESS_TOKEN')}` }
    }).then(res => { if (res.data.success) setApplicants(res.data.data || []); })
      .finally(() => setLoading(false));
  }, [jobId]);

  const updateStatus = (applicationId, newStatus) => {
    axios.patch(`${process.env.REACT_APP_API_URL}/company/applications/${applicationId}/status`,
      { status: newStatus },
      { headers: { Authorization: `Bearer ${localStorage.getItem('ACCESS_TOKEN')}` } }
    ).then(() => {
      setApplicants(prev => prev.map(a => a.id === applicationId ? {...a, status: newStatus} : a));
      toast.success(`Status updated to ${newStatus}`);
    }).catch(err => toast.error('Failed to update status'));
  };

  if (loading) return <div className="text-center mt-5"><Spinner animation="border" /></div>;

  return (
    <Container className="mt-4">
      <div className="d-flex align-items-center mb-4">
        <button className="btn btn-link p-0 me-3 text-dark" onClick={() => navigate(-1)}>
          <ArrowLeftCircle size={24} />
        </button>
        <h3 className="fw-bold mb-0">Applicant Pipeline</h3>
      </div>

      <div className="card shadow-sm border-0">
        <Table responsive hover className="mb-0">
          <thead className="table-dark">
            <tr>
              <th className="py-3 ps-4">Candidate Name</th>
              <th className="py-3">Email</th>
              <th className="py-3">Applied Date</th>
              <th className="py-3 text-center">Current Status</th>
              <th className="py-3 pe-4">Update Status</th>
            </tr>
          </thead>
          <tbody>
            {applicants.map(app => (
              <tr key={app.id}>
                <td className="py-3 ps-4 fw-bold">{app.applicantName}</td>
                <td className="py-3">{app.applicantEmail}</td>
                <td className="py-3">{app.appliedDate?.split('T')[0]}</td>
                <td className="py-3 text-center">
                  <Badge bg={STATUS_COLOR[app.status]} className="px-3 py-2">
                    {app.status?.replace('_', ' ')}
                  </Badge>
                </td>
                <td className="py-3 pe-4" style={{width: '200px'}}>
                  <select className="form-select form-select-sm border-0 bg-light"
                      value={app.status} onChange={e => updateStatus(app.id, e.target.value)}>
                    {STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                  </select>
                </td>
              </tr>
            ))}
            {applicants.length === 0 && (
              <tr><td colSpan={5} className="text-center py-5 text-muted">No applicants for this position yet.</td></tr>
            )}
          </tbody>
        </Table>
      </div>
    </Container>
  );
}
