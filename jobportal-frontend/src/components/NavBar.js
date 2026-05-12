import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar, Nav, Container, NavDropdown, Image } from 'react-bootstrap';
import { BriefcaseFill, Speedometer2, PersonCircle, BoxArrowRight, PersonFill } from 'react-bootstrap-icons';

export default function NavBar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('User') || '{}');
  const isCompany = user?.userDetails?.role === 'COMPANY';
  const profilePic = user?.userDetails?.profilePic;

  const logout = () => {
    localStorage.removeItem('ACCESS_TOKEN');
    localStorage.removeItem('User');
    window.dispatchEvent(new Event('storage'));
    navigate('/auth');
  };

  return (
    <Navbar bg="white" expand="lg" className="sticky-top shadow-sm">
      <Container>
        <Navbar.Brand 
          onClick={() => navigate(isCompany ? '/company/dashboard' : '/dashboard')} 
          style={{cursor:'pointer'}}
          className="fw-bold d-flex align-items-center text-primary"
        >
          <BriefcaseFill className="me-2" size={24} />
          <span>JobPortal</span>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            {!isCompany && (
              <>
                <Nav.Link onClick={() => navigate('/dashboard')} className="d-flex align-items-center">
                  <Speedometer2 className="me-1" /> Dashboard
                </Nav.Link>
                <Nav.Link onClick={() => navigate('/jobs')} className="d-flex align-items-center">
                  <BriefcaseFill className="me-1" /> Browse Jobs
                </Nav.Link>
                <Nav.Link onClick={() => navigate('/my-applications')} className="d-flex align-items-center">
                  <PersonFill className="me-1" /> My Applications
                </Nav.Link>
              </>
            )}
            {isCompany && (
              <>
                <Nav.Link onClick={() => navigate('/company/dashboard')} className="d-flex align-items-center">
                   Dashboard
                </Nav.Link>
                <Nav.Link onClick={() => navigate('/company/post-job')} className="d-flex align-items-center">
                  Post Job
                </Nav.Link>
              </>
            )}
          </Nav>
          <Nav className="align-items-center">
            <NavDropdown 
              title={
                <div className="d-inline-flex align-items-center">
                  {profilePic ? (
                    <Image 
                      src={profilePic} 
                      roundedCircle 
                      style={{ width: '32px', height: '32px', objectFit: 'cover' }} 
                      className="me-2 border"
                    />
                  ) : (
                    <PersonCircle size={24} className="me-2 text-secondary" />
                  )}
                  <span className="fw-semibold text-dark d-none d-sm-inline">{user?.username}</span>
                </div>
              } 
              id="user-dropdown"
              align="end"
            >
              {!isCompany && (
                <NavDropdown.Item onClick={() => navigate('/profile')}>
                  <PersonCircle className="me-2" /> My Profile
                </NavDropdown.Item>
              )}
              <NavDropdown.Divider />
              <NavDropdown.Item onClick={logout} className="text-danger">
                <BoxArrowRight className="me-2" /> Logout
              </NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
