package com.jobportal.service.impl;

import com.jobportal.dto.application.ApplicationResDto;
import com.jobportal.dto.application.StatusUpdateReqDto;
import com.jobportal.dto.job.*;
import com.jobportal.entity.*;
import com.jobportal.enums.*;
import com.jobportal.exception.dto.CustomServiceException;
import com.jobportal.repository.*;
import com.jobportal.service.JobService;
import com.jobportal.utilities.EmailSender;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.stream.Collectors;

@Log4j2
@RequiredArgsConstructor
@Service
@org.springframework.transaction.annotation.Transactional
public class JobServiceImpl implements JobService {

    private final JobListingRepository jobListingRepository;
    private final CompanyRepository companyRepository;
    private final ApplicantRepository applicantRepository;
    private final ApplicationRepository applicationRepository;
    private final ModelMapper modelMapper;
    private final EmailSender emailSender;

    @Override
    public List<JobResDto> getAllActiveJobs() {
        log.info("Fetching all active jobs for browse page...");
        List<JobListing> jobs = jobListingRepository.findAll(); // Get all first for debugging
        log.info("Total jobs in DB: {}", jobs.size());
        
        return jobs.stream()
            .filter(JobListing::isActive)
            .map(job -> {
                JobResDto dto = modelMapper.map(job, JobResDto.class);
                dto.setCompanyName(job.getCompany().getCompanyName());
                dto.setCompanyId(job.getCompany().getId());
                dto.setActive(job.isActive());
                return dto;
            }).collect(Collectors.toList());
    }

    @Override
    public JobResDto getJobById(Long id) {
        JobListing job = jobListingRepository.findById(id)
            .orElseThrow(() -> new CustomServiceException("Job not found"));
        JobResDto dto = modelMapper.map(job, JobResDto.class);
        dto.setCompanyName(job.getCompany().getCompanyName());
        dto.setCompanyId(job.getCompany().getId());
        return dto;
    }

    @Override
    public JobResDto createJob(Long companyId, JobReqDto req) {
        log.info("Creating job: {} for companyId: {}", req.getTitle(), companyId);
        Company company = companyRepository.findById(companyId)
            .orElseThrow(() -> new CustomServiceException("Company not found"));
        
        Date deadline = null;
        if (req.getDeadline() != null && !req.getDeadline().isEmpty()) {
            try {
                deadline = new SimpleDateFormat("yyyy-MM-dd").parse(req.getDeadline());
            } catch (ParseException e) {
                log.error("Date parse error: {}", e.getMessage());
                throw new CustomServiceException("Invalid deadline format. Use yyyy-MM-dd");
            }
        }

        JobListing job = JobListing.builder()
            .title(req.getTitle())
            .description(req.getDescription())
            .location(req.getLocation())
            .jobType(req.getJobType())
            .requirements(req.getRequirements())
            .deadline(deadline)
            .company(company)
            .isActive(true)
            .status(com.jobportal.enums.ActiveStatus.ACTIVE)
            .createdAt(new Date())
            .build();
        
        JobListing saved = jobListingRepository.saveAndFlush(job);
        
        // Manual mapping to be safe
        JobResDto res = new JobResDto();
        res.setId(saved.getId());
        res.setTitle(saved.getTitle());
        res.setDescription(saved.getDescription());
        res.setLocation(saved.getLocation());
        res.setJobType(saved.getJobType());
        res.setRequirements(saved.getRequirements());
        res.setDeadline(saved.getDeadline() != null ? saved.getDeadline().toString() : "");
        res.setCompanyName(company.getCompanyName());
        res.setCompanyId(company.getId());
        
        log.info("Job created successfully with ID: {}", saved.getId());
        return res;
    }

    @Override
    public void applyForJob(Long applicantId, Long jobId) {
        if (applicationRepository.findFirstByApplicantIdAndJobListingId(applicantId, jobId).isPresent())
            throw new CustomServiceException("You have already applied for this job");
        
        Applicant applicant = applicantRepository.findById(applicantId)
            .orElseThrow(() -> new CustomServiceException("Applicant not found"));
        
        JobListing job = jobListingRepository.findById(jobId)
            .orElseThrow(() -> new CustomServiceException("Job not found"));
        
        Application app = Application.builder()
            .applicant(applicant)
            .jobListing(job)
            .status(ApplicationStatus.APPLIED)
            .appliedDate(new Date())
            .build();
        
        applicationRepository.save(app);
    }

    @Override
    public void updateApplicationStatus(Long applicationId, StatusUpdateReqDto dto) {
        Application app = applicationRepository.findById(applicationId)
            .orElseThrow(() -> new CustomServiceException("Application not found"));

        ApplicationStatus newStatus;
        try {
            newStatus = ApplicationStatus.valueOf(dto.getStatus());
        } catch (IllegalArgumentException e) {
            throw new CustomServiceException("Invalid application status: " + dto.getStatus());
        }

        // ── Eagerly read lazy associations BEFORE save() flushes the session ──
        // This prevents LazyInitializationException if the proxy is accessed later
        String applicantEmail = app.getApplicant().getEmail();
        String applicantName  = app.getApplicant().getUserName();
        String jobTitle       = app.getJobListing().getTitle();
        String companyName    = app.getJobListing().getCompany().getCompanyName();

        // Save status and interview details
        app.setStatus(newStatus);
        app.setUpdatedDate(new Date());

        if (newStatus == ApplicationStatus.INTERVIEW_SCHEDULED) {
            app.setInterviewDate(dto.getInterviewDate());
            app.setInterviewTime(dto.getInterviewTime());
            app.setInterviewType(dto.getInterviewType());
            app.setCompanyMessage(dto.getMessage());
        } else if (newStatus == ApplicationStatus.OFFERED) {
            app.setCompanyMessage(dto.getMessage());
        }

        applicationRepository.save(app);

        // Send email notification (async — won't block the API response)
        try {
            sendStatusNotificationEmail(applicantEmail, applicantName, jobTitle, companyName, newStatus, dto);
        } catch (Exception e) {
            log.error("Email notification failed for applicationId={}, status={}: {}", applicationId, newStatus, e.getMessage(), e);
        }
    }

    // ──────────────────────────────────────────────────────────
    // Email Notification Logic
    // ──────────────────────────────────────────────────────────

    private void sendStatusNotificationEmail(
            String applicantEmail, String applicantName,
            String jobTitle, String companyName,
            ApplicationStatus status, StatusUpdateReqDto dto) throws Exception {

        log.info("Sending {} notification email to {}", status, applicantEmail);

        switch (status) {
            case SHORTLISTED:
                emailSender.sendSimpleEmail(
                    applicantEmail,
                    "🎉 You've been Shortlisted — " + jobTitle + " at " + companyName,
                    buildShortlistedEmail(applicantName, jobTitle, companyName)
                );
                break;

            case INTERVIEW_SCHEDULED:
                emailSender.sendSimpleEmail(
                    applicantEmail,
                    "📅 Interview Scheduled — " + jobTitle + " at " + companyName,
                    buildInterviewEmail(applicantName, jobTitle, companyName, dto)
                );
                break;

            case OFFERED:
                emailSender.sendSimpleEmail(
                    applicantEmail,
                    "🎊 Job Offer — " + jobTitle + " at " + companyName,
                    buildOfferedEmail(applicantName, jobTitle, companyName, dto.getMessage())
                );
                break;

            case REJECTED:
                emailSender.sendSimpleEmail(
                    applicantEmail,
                    "Application Update — " + jobTitle + " at " + companyName,
                    buildRejectedEmail(applicantName, jobTitle, companyName)
                );
                break;

            default:
                log.info("No email triggered for status: {}", status);
        }
    }


    private String buildShortlistedEmail(String name, String jobTitle, String company) {
        return "<div style='font-family:Arial,sans-serif;max-width:600px;margin:auto;border:1px solid #e0e0e0;border-radius:8px;overflow:hidden'>"
            + "<div style='background:#0d6efd;padding:24px;text-align:center'>"
            + "<h2 style='color:#fff;margin:0'>🎉 You've been Shortlisted!</h2></div>"
            + "<div style='padding:32px'>"
            + "<p style='font-size:16px'>Hi <strong>" + name + "</strong>,</p>"
            + "<p>Great news! You have been <strong>shortlisted</strong> for the <strong>" + jobTitle + "</strong> position at <strong>" + company + "</strong>.</p>"
            + "<p>Our team will be in touch soon with the next steps in the process.</p>"
            + "<p style='color:#555'>Keep an eye on your inbox!</p>"
            + "</div>"
            + "<div style='background:#f8f9fa;padding:16px;text-align:center;color:#888;font-size:13px'>JobPortal — Connecting talent with opportunity</div>"
            + "</div>";
    }

    private String buildInterviewEmail(String name, String jobTitle, String company, StatusUpdateReqDto dto) {
        String type = dto.getInterviewType() != null ? dto.getInterviewType().replace("_", " ") : "TBD";
        String date = dto.getInterviewDate() != null ? dto.getInterviewDate() : "TBD";
        String time = dto.getInterviewTime() != null ? dto.getInterviewTime() : "TBD";
        String message = (dto.getMessage() != null && !dto.getMessage().isBlank()) ? dto.getMessage() : "";

        return "<div style='font-family:Arial,sans-serif;max-width:600px;margin:auto;border:1px solid #e0e0e0;border-radius:8px;overflow:hidden'>"
            + "<div style='background:#fd7e14;padding:24px;text-align:center'>"
            + "<h2 style='color:#fff;margin:0'>📅 Interview Scheduled</h2></div>"
            + "<div style='padding:32px'>"
            + "<p style='font-size:16px'>Hi <strong>" + name + "</strong>,</p>"
            + "<p>Your interview for <strong>" + jobTitle + "</strong> at <strong>" + company + "</strong> has been scheduled!</p>"
            + "<table style='width:100%;border-collapse:collapse;margin:20px 0'>"
            + "<tr><td style='padding:10px;background:#f8f9fa;font-weight:bold;border:1px solid #dee2e6;width:35%'>📅 Date</td>"
            + "<td style='padding:10px;border:1px solid #dee2e6'>" + date + "</td></tr>"
            + "<tr><td style='padding:10px;background:#f8f9fa;font-weight:bold;border:1px solid #dee2e6'>🕐 Time</td>"
            + "<td style='padding:10px;border:1px solid #dee2e6'>" + time + "</td></tr>"
            + "<tr><td style='padding:10px;background:#f8f9fa;font-weight:bold;border:1px solid #dee2e6'>💻 Type</td>"
            + "<td style='padding:10px;border:1px solid #dee2e6'>" + type + "</td></tr>"
            + "</table>"
            + (message.isEmpty() ? "" : "<div style='background:#fff3cd;border-left:4px solid #fd7e14;padding:16px;margin-top:16px;border-radius:4px'>"
                + "<p style='margin:0;font-style:italic;color:#555'><strong>Message from " + company + ":</strong><br/>" + message + "</p></div>")
            + "<p style='margin-top:24px'>Good luck! 🍀</p>"
            + "</div>"
            + "<div style='background:#f8f9fa;padding:16px;text-align:center;color:#888;font-size:13px'>JobPortal — Connecting talent with opportunity</div>"
            + "</div>";
    }

    private String buildOfferedEmail(String name, String jobTitle, String company, String message) {
        String msgBlock = (message != null && !message.isBlank())
            ? "<div style='background:#d1e7dd;border-left:4px solid #198754;padding:16px;margin-top:16px;border-radius:4px'>"
                + "<p style='margin:0;color:#0f5132'>" + message + "</p></div>"
            : "";
        return "<div style='font-family:Arial,sans-serif;max-width:600px;margin:auto;border:1px solid #e0e0e0;border-radius:8px;overflow:hidden'>"
            + "<div style='background:#198754;padding:24px;text-align:center'>"
            + "<h2 style='color:#fff;margin:0'>🎊 Congratulations! You've received a Job Offer</h2></div>"
            + "<div style='padding:32px'>"
            + "<p style='font-size:16px'>Hi <strong>" + name + "</strong>,</p>"
            + "<p>We are delighted to inform you that <strong>" + company + "</strong> is offering you the <strong>" + jobTitle + "</strong> position!</p>"
            + msgBlock
            + "<p style='margin-top:24px'>Please get in touch with the company to discuss the next steps.</p>"
            + "</div>"
            + "<div style='background:#f8f9fa;padding:16px;text-align:center;color:#888;font-size:13px'>JobPortal — Connecting talent with opportunity</div>"
            + "</div>";
    }

    private String buildRejectedEmail(String name, String jobTitle, String company) {
        return "<div style='font-family:Arial,sans-serif;max-width:600px;margin:auto;border:1px solid #e0e0e0;border-radius:8px;overflow:hidden'>"
            + "<div style='background:#6c757d;padding:24px;text-align:center'>"
            + "<h2 style='color:#fff;margin:0'>Application Update</h2></div>"
            + "<div style='padding:32px'>"
            + "<p style='font-size:16px'>Hi <strong>" + name + "</strong>,</p>"
            + "<p>Thank you for your interest in the <strong>" + jobTitle + "</strong> position at <strong>" + company + "</strong>.</p>"
            + "<p>After careful consideration, we will not be moving forward with your application at this time.</p>"
            + "<p>We truly appreciate the time you invested and encourage you to apply for future openings that match your profile.</p>"
            + "<p style='color:#555'>Wishing you all the best in your job search! 💪</p>"
            + "</div>"
            + "<div style='background:#f8f9fa;padding:16px;text-align:center;color:#888;font-size:13px'>JobPortal — Connecting talent with opportunity</div>"
            + "</div>";
    }



    @Override
    public List<ApplicationResDto> getApplicantsForJob(Long jobId) {
        return applicationRepository.findAllByJobListingId(jobId).stream()
            .map(app -> {
                ApplicationResDto dto = new ApplicationResDto();
                dto.setId(app.getId());
                dto.setJobTitle(app.getJobListing().getTitle());
                dto.setCompanyName(app.getJobListing().getCompany().getCompanyName());
                dto.setStatus(app.getStatus().name());
                dto.setAppliedDate(app.getAppliedDate() != null ? app.getAppliedDate().toString() : "");
                dto.setApplicantName(app.getApplicant().getUserName());
                dto.setApplicantEmail(app.getApplicant().getEmail());
                dto.setApplicantId(app.getApplicant().getId());
                dto.setApplicantBio(app.getApplicant().getBio());
                dto.setApplicantSkills(app.getApplicant().getSkills());
                dto.setApplicantResume(app.getApplicant().getResume());
                dto.setApplicantResumeFileName(app.getApplicant().getResumeFileName());
                dto.setUniversity(app.getApplicant().getUniversity());
                dto.setDegree(app.getApplicant().getDegree());
                dto.setApplicantProfilePic(app.getApplicant().getProfilePic());
                return dto;
            }).collect(Collectors.toList());
    }
}
