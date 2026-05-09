package com.jobportal.service.impl;

import com.jobportal.dto.job.*;
import com.jobportal.entity.*;
import com.jobportal.enums.*;
import com.jobportal.exception.dto.CustomServiceException;
import com.jobportal.repository.*;
import com.jobportal.service.JobService;
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
public class JobServiceImpl implements JobService {

    private final JobListingRepository jobListingRepository;
    private final CompanyRepository companyRepository;
    private final ApplicantRepository applicantRepository;
    private final ApplicationRepository applicationRepository;
    private final ModelMapper modelMapper;

    @Override
    public List<JobResDto> getAllActiveJobs() {
        return jobListingRepository.findAllByIsActiveTrue().stream()
            .map(job -> {
                JobResDto dto = modelMapper.map(job, JobResDto.class);
                dto.setCompanyName(job.getCompany().getCompanyName());
                dto.setCompanyId(job.getCompany().getId());
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
        Company company = companyRepository.findById(companyId)
            .orElseThrow(() -> new CustomServiceException("Company not found"));
        
        Date deadline = null;
        if (req.getDeadline() != null && !req.getDeadline().isEmpty()) {
            try {
                deadline = new SimpleDateFormat("yyyy-MM-dd").parse(req.getDeadline());
            } catch (ParseException e) {
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
            .createdAt(new Date())
            .build();
        
        JobListing saved = jobListingRepository.save(job);
        JobResDto res = modelMapper.map(saved, JobResDto.class);
        res.setCompanyName(company.getCompanyName());
        res.setCompanyId(company.getId());
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
    public void updateApplicationStatus(Long applicationId, String status) {
        Application app = applicationRepository.findById(applicationId)
            .orElseThrow(() -> new CustomServiceException("Application not found"));
        
        try {
            app.setStatus(ApplicationStatus.valueOf(status));
        } catch (IllegalArgumentException e) {
            throw new CustomServiceException("Invalid application status: " + status);
        }
        
        app.setUpdatedDate(new Date());
        applicationRepository.save(app);
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
                return dto;
            }).collect(Collectors.toList());
    }
}
