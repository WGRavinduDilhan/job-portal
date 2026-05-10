import React, { useEffect, useState } from 'react';
import { Container, Table, Badge, Spinner } from 'react-bootstrap';
import axios from 'axios';

const STATUS_COLOR = {
  APPLIED: 'secondary', SHORTLISTED: 'info',
  INTERVIEW_SCHEDULED: 'warning', OFFERED: 'success', REJECTED: 'danger'
};

export default function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/applicant/my-applications`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('ACCESS_TOKEN')}` }
    }).then(res => { if (res.data.success) setApplications(res.data.body || []); })
      .finally(() => setLoading(false));
  }, []);

  return (
    <Container className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="fw-bold mb-0">My Applications</h3>
        <Badge bg="dark" className="px-3 py-2">{applications.length} Total</Badge>
      </div>
      
      {loading ? <div className="text-center mt-5"><Spinner animation="border" /></div> :
        <div className="card shadow-sm border-0">
          <Table responsive hover className="mb-0">
            <thead className="table-dark">
              <tr>
                <th className="py-3 ps-4">Job Title</th>
                <th className="py-3">Company</th>
                <th className="py-3">Applied Date</th>
                <th className="py-3 pe-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {applications.map(app => (
                <tr key={app.id}>
                  <td className="py-3 ps-4 fw-bold">{app.jobTitle}</td>
                  <td className="py-3">{app.companyName}</td>
                  <td className="py-3">{app.appliedDate?.split('T')[0]}</td>
                  <td className="py-3 pe-4 text-center">
                    <Badge bg={STATUS_COLOR[app.status] || 'secondary'} className="px-3 py-2">
                      {app.status?.replace('_', ' ')}
                    </Badge>
                  </td>
                </tr>
              ))}
              {applications.length === 0 && (
                <tr><td colSpan={4} className="text-center py-5 text-muted fs-5">No applications yet. Start your journey today!</td></tr>
              )}
            </tbody>
          </Table>
        </div>
      }
    </Container>
  );
}
