import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Spinner, Image } from 'react-bootstrap';
import axios from 'axios';
import { toast } from 'react-toastify';
import { CloudArrowUpFill, FileEarmarkPdfFill, CameraFill, PencilSquare } from 'react-bootstrap-icons';

export default function Profile() {
  const [profile, setProfile] = useState({
    university: '', degree: '', bio: '', skills: '', resume: '', resumeFileName: '', profilePic: ''
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = () => {
    axios.get(`${process.env.REACT_APP_API_URL}/applicant/profile`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('ACCESS_TOKEN')}` }
    }).then(res => {
      if (res.data.success) setProfile(res.data.data);
    }).finally(() => setLoading(false));
  };

  const handleFileUpload = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      if (type === 'resume') {
        setProfile({ ...profile, resume: event.target.result, resumeFileName: file.name });
      } else if (type === 'profilePic') {
        setProfile({ ...profile, profilePic: event.target.result });
      }
    };
    reader.readAsDataURL(file);
  };

  const updateProfile = (e) => {
    e.preventDefault();
    setUpdating(true);
    axios.put(`${process.env.REACT_APP_API_URL}/applicant/profile`, profile, {
      headers: { Authorization: `Bearer ${localStorage.getItem('ACCESS_TOKEN')}` }
    }).then(res => {
      if (res.data.success) {
        toast.success('Profile updated successfully!');
        const user = JSON.parse(localStorage.getItem('User') || '{}');
        user.userDetails = { ...user.userDetails, ...profile };
        localStorage.setItem('User', JSON.stringify(user));
        // Force navbar update
        window.dispatchEvent(new Event('storage'));
      }
    }).catch(err => toast.error('Update failed'))
      .finally(() => setUpdating(false));
  };

  if (loading) return <div className="text-center mt-5"><Spinner animation="border" variant="primary" /></div>;

  return (
    <Container className="mt-5 pb-5">
      <Row className="justify-content-center">
        <Col lg={10}>
          <Form onSubmit={updateProfile}>
            <Row className="g-4">
              {/* Left Column - Profile Summary */}
              <Col md={4}>
                <Card className="text-center p-4 border-0 shadow-sm sticky-top" style={{ top: '100px' }}>
                  <div className="profile-pic-container mb-3">
                    <Image 
                      src={profile.profilePic || 'https://via.placeholder.com/150?text=Avatar'} 
                      className="profile-pic-preview" 
                    />
                    <label htmlFor="profile-pic-upload" className="profile-pic-upload-btn">
                      <CameraFill />
                    </label>
                    <input 
                      id="profile-pic-upload" 
                      type="file" 
                      hidden 
                      accept="image/*" 
                      onChange={(e) => handleFileUpload(e, 'profilePic')} 
                    />
                  </div>
                  <h4 className="fw-bold mb-1">{JSON.parse(localStorage.getItem('User'))?.username}</h4>
                  <p className="text-muted small mb-3">{profile.degree || 'Degree'} @ {profile.university || 'University'}</p>
                  <hr />
                  <div className="text-start">
                    <h6 className="fw-bold small text-uppercase text-muted mb-2">Account Info</h6>
                    <p className="small mb-1"><strong>Email:</strong> {JSON.parse(localStorage.getItem('User'))?.userDetails?.email}</p>
                  </div>
                </Card>
              </Col>

              {/* Right Column - Editable Details */}
              <Col md={8}>
                <Card className="border-0 shadow-sm p-4">
                  <div className="d-flex align-items-center mb-4">
                    <PencilSquare className="text-primary me-2" size={24} />
                    <h3 className="fw-bold m-0">Edit Profile</h3>
                  </div>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-bold small text-uppercase text-muted">University</Form.Label>
                        <Form.Control type="text" value={profile.university} onChange={e => setProfile({...profile, university: e.target.value})} placeholder="Enter university name" />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-bold small text-uppercase text-muted">Degree</Form.Label>
                        <Form.Control type="text" value={profile.degree} onChange={e => setProfile({...profile, degree: e.target.value})} placeholder="Enter degree/major" />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold small text-uppercase text-muted">Bio / About You</Form.Label>
                    <Form.Control as="textarea" rows={4} value={profile.bio} onChange={e => setProfile({...profile, bio: e.target.value})} placeholder="Tell companies about your professional background and goals..." />
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label className="fw-bold small text-uppercase text-muted">Skills</Form.Label>
                    <Form.Control type="text" value={profile.skills} onChange={e => setProfile({...profile, skills: e.target.value})} placeholder="e.g. Java, React, SQL, AWS" />
                    <Form.Text className="text-muted">Separate skills with commas.</Form.Text>
                  </Form.Group>

                  <Card className="bg-light border-0 mb-4 p-3">
                    <h6 className="fw-bold mb-3 d-flex align-items-center">
                      <FileEarmarkPdfFill className="text-danger me-2" /> Resume / CV
                    </h6>
                    <div className="d-flex align-items-center">
                      <div className="flex-grow-1">
                        <p className="mb-2 fw-bold text-dark">{profile.resumeFileName || 'No file uploaded'}</p>
                        <Form.Control type="file" size="sm" onChange={(e) => handleFileUpload(e, 'resume')} accept=".pdf,.doc,.docx" />
                        <Form.Text className="text-muted">Upload your latest professional CV.</Form.Text>
                      </div>
                    </div>
                  </Card>

                  <div className="d-flex justify-content-end">
                    <Button variant="primary" size="lg" type="submit" disabled={updating} className="px-5">
                      {updating ? <><Spinner size="sm" className="me-2"/> Saving...</> : 'Save Changes'}
                    </Button>
                  </div>
                </Card>
              </Col>
            </Row>
          </Form>
        </Col>
      </Row>
    </Container>
  );
}
