package com.jobportal.service;

import com.jobportal.dto.application.ApplicationResDto;
import com.jobportal.dto.application.StatusUpdateReqDto;
import com.jobportal.dto.job.JobReqDto;
import com.jobportal.dto.job.JobResDto;
import java.util.List;

public interface JobService {
    List<JobResDto> getAllActiveJobs();
    JobResDto getJobById(Long id);
    JobResDto createJob(Long companyId, JobReqDto req);
    void applyForJob(Long applicantId, Long jobId);
    void updateApplicationStatus(Long applicationId, StatusUpdateReqDto dto);
    List<ApplicationResDto> getApplicantsForJob(Long jobId);
}
