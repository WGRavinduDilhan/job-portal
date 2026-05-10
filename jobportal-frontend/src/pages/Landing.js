import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Button, Navbar, Nav } from 'react-bootstrap';
import { BriefcaseFill, PeopleFill, CheckCircleFill, ArrowRight } from 'react-bootstrap-icons';
import 'animate.css';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="landing-page bg-white min-vh-100 overflow-hidden">
      {/* Mini Nav */}
      <Navbar bg="transparent" expand="lg" className="py-3">
        <Container>
          <Navbar.Brand className="fw-bold fs-3 text-dark">JobPortal</Navbar.Brand>
          <Nav className="ms-auto">
            <Button variant="outline-dark" className="rounded-pill px-4 me-2" onClick={() => navigate('/auth')}>Login</Button>
            <Button variant="dark" className="rounded-pill px-4" onClick={() => navigate('/auth')}>Sign Up</Button>
          </Nav>
        </Container>
      </Navbar>

      {/* Hero Section */}
      <Container className="py-5 mt-5">
        <Row className="align-items-center">
          <Col lg={6} className="animate__animated animate__fadeInLeft">
            <Badge variant="primary" text="#1 Job Platform for Graduates" />
            <h1 className="display-3 fw-bold mb-4 mt-3" style={{ lineHeight: '1.1' }}>
              Find your <span className="text-primary">dream career</span> in minutes.
            </h1>
            <p className="lead text-muted mb-5 pe-lg-5">
              Connecting the world's most innovative companies with the next generation of talented graduates. Start your journey today.
            </p>
            <div className="d-flex gap-3">
              <Button size="lg" variant="dark" className="rounded-pill px-5 py-3 fw-bold d-flex align-items-center" onClick={() => navigate('/auth')}>
                Get Started <ArrowRight className="ms-2" />
              </Button>
              <Button size="lg" variant="outline-dark" className="rounded-pill px-5 py-3 fw-bold" onClick={() => navigate('/auth')}>
                Post a Job
              </Button>
            </div>
            
            <Row className="mt-5 pt-3">
              <Col xs={4}>
                <h3 className="fw-bold mb-0">10k+</h3>
                <small className="text-muted text-uppercase fw-bold">Active Jobs</small>
              </Col>
              <Col xs={4}>
                <h3 className="fw-bold mb-0">5k+</h3>
                <small className="text-muted text-uppercase fw-bold">Companies</small>
              </Col>
              <Col xs={4}>
                <h3 className="fw-bold mb-0">20k+</h3>
                <small className="text-muted text-uppercase fw-bold">Applicants</small>
              </Col>
            </Row>
          </Col>
          
          <Col lg={6} className="d-none d-lg-block animate__animated animate__fadeInRight animate__delay-1s">
            <div className="position-relative">
              <div className="bg-primary rounded-circle position-absolute" style={{ width: '500px', height: '500px', opacity: '0.1', top: '-50px', right: '-50px' }}></div>
              <div className="card border-0 shadow-lg p-4 rounded-4 position-relative" style={{ background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)' }}>
                <div className="d-flex align-items-center mb-4">
                  <div className="bg-dark text-white p-3 rounded-3 me-3"><BriefcaseFill size={24}/></div>
                  <div>
                    <h5 className="mb-0 fw-bold">Software Engineer</h5>
                    <small className="text-muted">TechCorp Inc. • $120k - $150k</small>
                  </div>
                </div>
                <div className="d-flex gap-2 mb-4">
                  <span className="badge bg-light text-dark border px-3 py-2">Full-time</span>
                  <span className="badge bg-light text-dark border px-3 py-2">Remote</span>
                  <span className="badge bg-light text-dark border px-3 py-2">React</span>
                </div>
                <div className="p-3 bg-light rounded-3 mb-4">
                  <div className="d-flex justify-content-between small mb-1">
                    <span>Application Progress</span>
                    <span className="fw-bold">Shortlisted</span>
                  </div>
                  <div className="progress" style={{ height: '8px' }}>
                    <div className="progress-bar bg-success" style={{ width: '75%' }}></div>
                  </div>
                </div>
                <Button variant="primary" className="w-100 rounded-pill py-3 fw-bold">Apply Now</Button>
              </div>
            </div>
          </Col>
        </Row>
      </Container>

      {/* Features */}
      <Container className="py-5 mt-5">
        <Row className="text-center g-4">
          <Col md={4}>
            <div className="p-4 rounded-4 hover-lift">
              <CheckCircleFill size={40} className="text-primary mb-3" />
              <h5 className="fw-bold">Verified Companies</h5>
              <p className="text-muted">Only legitimate recruiters with a track record of hiring.</p>
            </div>
          </Col>
          <Col md={4}>
            <div className="p-4 rounded-4 hover-lift">
              <PeopleFill size={40} className="text-primary mb-3" />
              <h5 className="fw-bold">Talent Pipeline</h5>
              <p className="text-muted">Advanced matching algorithm for your skill set.</p>
            </div>
          </Col>
          <Col md={4}>
            <div className="p-4 rounded-4 hover-lift">
              <BriefcaseFill size={40} className="text-primary mb-3" />
              <h5 className="fw-bold">Career Coaching</h5>
              <p className="text-muted">Expert advice to help you land your first role.</p>
            </div>
          </Col>
        </Row>
      </Container>

      <style>{`
        .text-primary { color: #667eea !important; }
        .bg-primary { background-color: #667eea !important; }
        .btn-primary { background-color: #667eea; border-color: #667eea; }
        .hover-lift { transition: transform 0.3s ease; cursor: pointer; }
        .hover-lift:hover { transform: translateY(-10px); }
      `}</style>
    </div>
  );
}

const Badge = ({ text }) => (
  <span className="badge rounded-pill bg-light text-primary border px-3 py-2 fw-bold text-uppercase small" style={{ letterSpacing: '1px' }}>
    {text}
  </span>
);
