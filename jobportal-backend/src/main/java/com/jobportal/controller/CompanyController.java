package com.jobportal.controller;

import com.jobportal.config.security.SecurityConstants;
import com.jobportal.config.security.custom.CustomUserAuthenticator;
import com.jobportal.config.throttling_config.Throttling;
import com.jobportal.dto.common.CommonResponse;
import com.jobportal.dto.company.CompanyReqDto;
import com.jobportal.dto.job.JobReqDto;
import com.jobportal.dto.application.StatusUpdateReqDto;
import com.jobportal.service.CompanyService;
import com.jobportal.service.JobService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/company")
@RequiredArgsConstructor
public class CompanyController {

    private final CompanyService companyService;
    private final JobService jobService;

    @Throttling(timeFrameInSeconds = 60, calls = 5)
    @PostMapping("/signup")
    public ResponseEntity<?> signUp(@RequestBody CompanyReqDto dto) {
        companyService.saveNewCompany(dto);
        return ResponseEntity.ok(new CommonResponse<>(true, "Sign up successful!"));
    }

    @PatchMapping("/account/verify")
    public ResponseEntity<?> verifyAccount(@RequestParam("token") String token) {
        companyService.verifyAccountAndEmail(token);
        return ResponseEntity.ok(new CommonResponse<>(true, "Account activated successfully!"));
    }

    @PostMapping("/jobs")
    public ResponseEntity<?> postJob(
            @RequestHeader(SecurityConstants.HEADER_AUTH) String token,
            @RequestBody JobReqDto dto) {
        Long companyId = CustomUserAuthenticator.getUserIdFromToken(token);
        return ResponseEntity.ok(new CommonResponse<>(true, "Job posted successfully", jobService.createJob(companyId, dto)));
    }

    @GetMapping("/jobs/{jobId}/applicants")
    public ResponseEntity<?> getApplicants(
            @RequestHeader(SecurityConstants.HEADER_AUTH) String token,
            @PathVariable Long jobId) {
        return ResponseEntity.ok(new CommonResponse<>(true, "Applicants retrieved", jobService.getApplicantsForJob(jobId)));
    }

    @PatchMapping("/applications/{applicationId}/status")
    public ResponseEntity<?> updateStatus(
            @RequestHeader(SecurityConstants.HEADER_AUTH) String token,
            @PathVariable Long applicationId,
            @RequestBody StatusUpdateReqDto dto) {
        jobService.updateApplicationStatus(applicationId, dto.getStatus());
        return ResponseEntity.ok(new CommonResponse<>(true, "Status updated"));
    }

    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboard(
            @RequestHeader(SecurityConstants.HEADER_AUTH) String token) {
        Long companyId = CustomUserAuthenticator.getUserIdFromToken(token);
        return ResponseEntity.ok(new CommonResponse<>(true, "Dashboard data retrieved", companyService.getDashboard(companyId)));
    }
}
