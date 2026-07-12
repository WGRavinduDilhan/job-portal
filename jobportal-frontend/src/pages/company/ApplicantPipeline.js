import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Table, Badge, Spinner, Modal, Button, Card, Image, Row, Col, Form } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { ArrowLeftCircle, Eye, Download, FileEarmarkPdf, PersonCircle, CalendarEvent, Gift, XCircle } from 'react-bootstrap-icons';
import axios from 'axios';

const STATUSES = ['APPLIED', 'SHORTLISTED', 'INTERVIEW_SCHEDULED', 'OFFERED', 'REJECTED'];
const STATUS_COLOR = {
  APPLIED: 'secondary', SHORTLISTED: 'info',
  INTERVIEW_SCHEDULED: 'warning', OFFERED: 'success', REJECTED: 'danger'
};

const API = process.env.REACT_APP_API_URL;
const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem('ACCESS_TOKEN')}` });

// S7044 / S8476 — Validate IDs before using them in URLs (prevents path traversal / SSRF)
const sanitizeApplicationId = (id) => {
  const parsed = parseInt(id, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
};

// S2004 — Named helper to avoid deep nesting inside .then() callback
const buildStatusUpdater = (applicationId, newStatus) => (prev) =>
  prev.map(a => (a.id === applicationId ? { ...a, status: newStatus } : a));

export default function ApplicantPipeline() {
  const { jobId } = useParams();
  const navigate = useNavigate();

  const [applicants, setApplicants]           = useState([]);
  const [loading, setLoading]                 = useState(true);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [showProfileModal, setShowProfileModal]   = useState(false);

  // ── Interview Scheduled modal state ──
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [pendingInterview, setPendingInterview]     = useState(null); // { applicationId }
  const [interviewDate, setInterviewDate]           = useState('');
  const [interviewTime, setInterviewTime]           = useState('');
  const [interviewType, setInterviewType]           = useState('ONLINE');
  const [interviewMsg, setInterviewMsg]             = useState('');

  // ── Offer modal state ──
  const [showOfferModal, setShowOfferModal]   = useState(false);
  const [pendingOffer, setPendingOffer]       = useState(null);
  const [offerMsg, setOfferMsg]               = useState('');

  // ── Reject confirmation state ──
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [pendingReject, setPendingReject]     = useState(null);

  // ── Submitting flag ──
  const [submitting, setSubmitting]           = useState(false);

  useEffect(() => {
    axios.get(`${API}/company/jobs/${jobId}/applicants`, { headers: authHeader() })
      .then(res => { if (res.data.success) setApplicants(res.data.data || []); })
      .finally(() => setLoading(false));
  }, [jobId]);

  // ─────────────────────────────────────────────────────────────
  // Core status update — called after modals are confirmed
  // ─────────────────────────────────────────────────────────────
  const submitStatusUpdate = (applicationId, payload) => {
    // S7044 / S8476: validate ID is a safe positive integer before using in URL
    const safeId = sanitizeApplicationId(applicationId);
    if (!safeId) {
      toast.error('Invalid application reference.');
      return;
    }
    setSubmitting(true);
    axios.patch(`${API}/company/applications/${safeId}/status`, payload, { headers: authHeader() })
      .then(() => {
        // S2004: use named helper instead of deeply nested inline arrow function
        setApplicants(buildStatusUpdater(applicationId, payload.status));
        toast.success(`Status updated to ${payload.status.replace('_', ' ')}`);
      })
      .catch(() => toast.error('Failed to update status'))
      .finally(() => setSubmitting(false));
  };

  // ─────────────────────────────────────────────────────────────
  // Dropdown change handler — intercepts modals where needed
  // ─────────────────────────────────────────────────────────────
  const handleStatusChange = (applicationId, newStatus) => {
    if (newStatus === 'INTERVIEW_SCHEDULED') {
      setPendingInterview({ applicationId });
      setInterviewDate(''); setInterviewTime(''); setInterviewType('ONLINE'); setInterviewMsg('');
      setShowInterviewModal(true);
    } else if (newStatus === 'OFFERED') {
      setPendingOffer({ applicationId });
      setOfferMsg('');
      setShowOfferModal(true);
    } else if (newStatus === 'REJECTED') {
      setPendingReject({ applicationId });
      setShowRejectModal(true);
    } else {
      // APPLIED or SHORTLISTED — update immediately
      submitStatusUpdate(applicationId, { status: newStatus });
    }
  };

  // ─────────────────────────────────────────────────────────────
  // Modal confirm handlers
  // ─────────────────────────────────────────────────────────────
  const confirmInterview = () => {
    if (!interviewDate || !interviewTime) {
      toast.warn('Please fill in the date and time.');
      return;
    }
    submitStatusUpdate(pendingInterview.applicationId, {
      status: 'INTERVIEW_SCHEDULED',
      interviewDate,
      interviewTime,
      interviewType,
      message: interviewMsg,
    });
    setShowInterviewModal(false);
  };

  const confirmOffer = () => {
    submitStatusUpdate(pendingOffer.applicationId, {
      status: 'OFFERED',
      message: offerMsg,
    });
    setShowOfferModal(false);
  };

  const confirmReject = () => {
    submitStatusUpdate(pendingReject.applicationId, { status: 'REJECTED' });
    setShowRejectModal(false);
  };

  const handleViewProfile = (app) => { setSelectedApplicant(app); setShowProfileModal(true); };

  const downloadResume = () => {
    if (!selectedApplicant?.applicantResume) return;
    const link = document.createElement('a');
    link.href = selectedApplicant.applicantResume;
    link.download = selectedApplicant.applicantResumeFileName || 'resume.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <div className="text-center mt-5"><Spinner animation="border" variant="primary" /></div>;

  return (
    <Container className="mt-5 pb-5">
      <div className="d-flex align-items-center mb-4">
        <button className="btn btn-link p-0 me-3 text-primary shadow-none" onClick={() => navigate(-1)}>
          <ArrowLeftCircle size={32} />
        </button>
        <div>
          <h2 className="fw-bold mb-0">Applicant Pipeline</h2>
          <p className="text-muted mb-0">Managing candidates for Job ID: #{jobId}</p>
        </div>
      </div>

      <Card className="shadow-sm border-0 overflow-hidden">
        <Table responsive hover className="mb-0 align-middle">
          <thead className="bg-light border-bottom">
            <tr>
              <th className="py-3 ps-4">Candidate</th>
              <th className="py-3">Education</th>
              <th className="py-3 text-center">Status</th>
              <th className="py-3 text-center">Actions</th>
              <th className="py-3 pe-4 text-end">Update Status</th>
            </tr>
          </thead>
          <tbody>
            {applicants.map(app => (
              <tr key={app.id}>
                <td className="py-3 ps-4">
                  <div className="d-flex align-items-center">
                    {app.applicantProfilePic ? (
                      <Image src={app.applicantProfilePic} roundedCircle className="me-3 border"
                        style={{ width: '45px', height: '45px', objectFit: 'cover' }} />
                    ) : (
                      <div className="bg-light rounded-circle d-flex align-items-center justify-content-center me-3 border"
                        style={{ width: '45px', height: '45px' }}>
                        <PersonCircle size={24} className="text-secondary" />
                      </div>
                    )}
                    <div>
                      <div className="fw-bold text-dark">{app.applicantName}</div>
                      <div className="small text-muted">{app.applicantEmail}</div>
                    </div>
                  </div>
                </td>
                <td className="py-3">
                  <div className="small fw-semibold">{app.university || 'N/A'}</div>
                  <div className="small text-muted">{app.degree || 'N/A'}</div>
                </td>
                <td className="py-3 text-center">
                  <Badge bg={STATUS_COLOR[app.status]} className="px-3 py-2 rounded-pill fw-medium">
                    {app.status?.replace('_', ' ')}
                  </Badge>
                </td>
                <td className="py-3 text-center">
                  <Button variant="outline-primary" size="sm" className="rounded-pill px-3"
                    onClick={() => handleViewProfile(app)}>
                    <Eye className="me-1" /> Profile
                  </Button>
                </td>
                <td className="py-3 pe-4 text-end">
                  <select className="form-select form-select-sm border bg-light d-inline-block"
                    style={{ width: 'auto' }}
                    value={app.status}
                    onChange={e => handleStatusChange(app.id, e.target.value)}>
                    {STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                  </select>
                </td>
              </tr>
            ))}
            {applicants.length === 0 && (
              <tr><td colSpan={5} className="text-center py-5">
                <div className="text-muted">No candidates have applied for this position yet.</div>
              </td></tr>
            )}
          </tbody>
        </Table>
      </Card>

      {/* ── Interview Scheduled Modal ── */}
      <Modal show={showInterviewModal} onHide={() => setShowInterviewModal(false)} centered size="md">
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold d-flex align-items-center gap-2">
            <CalendarEvent className="text-warning" size={22} /> Schedule Interview
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="px-4 py-3">
          <p className="text-muted small mb-3">Fill in the interview details. An email will be sent to the applicant automatically.</p>
          <Form>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Label className="fw-semibold small">Date <span className="text-danger">*</span></Form.Label>
                <Form.Control type="date" value={interviewDate} onChange={e => setInterviewDate(e.target.value)} />
              </Col>
              <Col md={6}>
                <Form.Label className="fw-semibold small">Time <span className="text-danger">*</span></Form.Label>
                <Form.Control type="time" value={interviewTime} onChange={e => setInterviewTime(e.target.value)} />
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold small">Interview Type</Form.Label>
              <div className="d-flex gap-4 mt-1">
                {['ONLINE', 'IN_PERSON'].map(t => (
                  <Form.Check key={t} type="radio" id={`type-${t}`} name="interviewType"
                    label={t === 'ONLINE' ? '💻 Online' : '🏢 In Person'}
                    value={t} checked={interviewType === t}
                    onChange={() => setInterviewType(t)} />
                ))}
              </div>
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label className="fw-semibold small">Message to Applicant <span className="text-muted">(optional)</span></Form.Label>
              <Form.Control as="textarea" rows={3} placeholder="e.g. Please join via Zoom link: https://..."
                value={interviewMsg} onChange={e => setInterviewMsg(e.target.value)} />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
          <Button variant="light" className="rounded-pill px-4 border" onClick={() => setShowInterviewModal(false)}>Cancel</Button>
          <Button variant="warning" className="rounded-pill px-4 text-white" onClick={confirmInterview} disabled={submitting}>
            <CalendarEvent className="me-2" />Send & Schedule
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ── Offer Modal ── */}
      <Modal show={showOfferModal} onHide={() => setShowOfferModal(false)} centered size="md">
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold d-flex align-items-center gap-2">
            <Gift className="text-success" size={22} /> Send Job Offer
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="px-4 py-3">
          <p className="text-muted small mb-3">An offer email will be sent to the applicant. Add a personal message below.</p>
          <Form.Group>
            <Form.Label className="fw-semibold small">Offer Message <span className="text-muted">(optional)</span></Form.Label>
            <Form.Control as="textarea" rows={4}
              placeholder="e.g. We are pleased to offer you the position with a starting salary of..."
              value={offerMsg} onChange={e => setOfferMsg(e.target.value)} />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
          <Button variant="light" className="rounded-pill px-4 border" onClick={() => setShowOfferModal(false)}>Cancel</Button>
          <Button variant="success" className="rounded-pill px-4" onClick={confirmOffer} disabled={submitting}>
            <Gift className="me-2" />Send Offer
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ── Reject Confirmation Modal ── */}
      <Modal show={showRejectModal} onHide={() => setShowRejectModal(false)} centered size="sm">
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold d-flex align-items-center gap-2">
            <XCircle className="text-danger" size={22} /> Confirm Rejection
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="px-4 text-center py-3">
          <p className="mb-1">Are you sure you want to reject this applicant?</p>
          <p className="text-muted small">A notification email will be sent to the applicant.</p>
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0 justify-content-center">
          <Button variant="light" className="rounded-pill px-4 border" onClick={() => setShowRejectModal(false)}>Cancel</Button>
          <Button variant="danger" className="rounded-pill px-4" onClick={confirmReject} disabled={submitting}>
            Reject & Notify
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ── Applicant Profile Modal ── */}
      <Modal show={showProfileModal} onHide={() => setShowProfileModal(false)} size="lg" centered>
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold">Candidate Profile</Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-2">
          {selectedApplicant && (
            <div className="p-2">
              <Row className="mb-4 align-items-center">
                <Col xs="auto">
                  {selectedApplicant.applicantProfilePic ? (
                    <Image src={selectedApplicant.applicantProfilePic} roundedCircle className="border"
                      style={{ width: '100px', height: '100px', objectFit: 'cover' }} />
                  ) : (
                    <div className="bg-light rounded-circle d-flex align-items-center justify-content-center border"
                      style={{ width: '100px', height: '100px' }}>
                      <PersonCircle size={50} className="text-secondary" />
                    </div>
                  )}
                </Col>
                <Col>
                  <h3 className="fw-bold mb-1">{selectedApplicant.applicantName}</h3>
                  <div className="text-muted d-flex align-items-center mb-2">
                    <span className="me-3">{selectedApplicant.applicantEmail}</span>
                  </div>
                  <Badge bg={STATUS_COLOR[selectedApplicant.status]} className="px-3 py-2 rounded-pill">
                    Status: {selectedApplicant.status?.replace('_', ' ')}
                  </Badge>
                </Col>
              </Row>
              <hr className="my-4 opacity-50" />
              <Row>
                <Col md={7}>
                  <div className="mb-4">
                    <h6 className="fw-bold text-uppercase text-muted small mb-3">About Candidate</h6>
                    <p className="text-dark" style={{ whiteSpace: 'pre-line', fontSize: '0.95rem', lineHeight: '1.6' }}>
                      {selectedApplicant.applicantBio || 'No professional bio provided.'}
                    </p>
                  </div>
                  <div className="mb-4">
                    <h6 className="fw-bold text-uppercase text-muted small mb-3">Technical Skills</h6>
                    <div className="d-flex flex-wrap">
                      {selectedApplicant.applicantSkills ?
                        selectedApplicant.applicantSkills.split(',').map((skill, i) => (
                          <Badge key={i} bg="white" text="primary" className="border border-primary me-2 mb-2 px-3 py-2 fw-medium">
                            {skill.trim()}
                          </Badge>
                        )) : <span className="text-muted italic small">No skills listed.</span>
                      }
                    </div>
                  </div>
                </Col>
                <Col md={5}>
                  <Card className="bg-light border-0 mb-4 p-3">
                    <h6 className="fw-bold text-uppercase text-muted small mb-3">Education</h6>
                    <div className="mb-2">
                      <div className="fw-bold">{selectedApplicant.university || 'N/A'}</div>
                      <div className="text-secondary small">{selectedApplicant.degree || 'N/A'}</div>
                    </div>
                  </Card>
                  <Card className="border-0 shadow-sm p-3">
                    <h6 className="fw-bold text-uppercase text-muted small mb-3">Documents</h6>
                    <div className="d-flex align-items-center mb-3">
                      <FileEarmarkPdf size={32} className="text-danger me-2" />
                      <div className="overflow-hidden">
                        <div className="text-truncate fw-bold small" title={selectedApplicant.applicantResumeFileName}>
                          {selectedApplicant.applicantResumeFileName || 'Resume.pdf'}
                        </div>
                        <div className="text-muted smallest">Applicant CV</div>
                      </div>
                    </div>
                    {selectedApplicant.applicantResume ? (
                      <Button variant="primary" size="sm" className="w-100 rounded-pill mt-2" onClick={downloadResume}>
                        <Download className="me-2" /> Download CV
                      </Button>
                    ) : (
                      <Button variant="outline-secondary" size="sm" className="w-100 rounded-pill mt-2" disabled>
                        No CV Uploaded
                      </Button>
                    )}
                  </Card>
                </Col>
              </Row>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="border-0 justify-content-center pb-4">
          <Button variant="light" className="px-5 rounded-pill border" onClick={() => setShowProfileModal(false)}>Close View</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}
