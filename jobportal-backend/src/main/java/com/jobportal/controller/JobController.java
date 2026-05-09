package com.jobportal.controller;

import com.jobportal.config.security.SecurityConstants;
import com.jobportal.config.security.custom.CustomUserAuthenticator;
import com.jobportal.dto.common.CommonResponse;
import com.jobportal.service.JobService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/jobs")
@RequiredArgsConstructor
public class JobController {

    private final JobService jobService;

    @GetMapping
    public ResponseEntity<?> getAllJobs(
            @RequestHeader(SecurityConstants.HEADER_AUTH) String token) {
        return ResponseEntity.ok(new CommonResponse<>(true, "Jobs retrieved", jobService.getAllActiveJobs()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getJob(
            @RequestHeader(SecurityConstants.HEADER_AUTH) String token,
            @PathVariable Long id) {
        return ResponseEntity.ok(new CommonResponse<>(true, "Job details retrieved", jobService.getJobById(id)));
    }

    @PostMapping("/{jobId}/apply")
    public ResponseEntity<?> apply(
            @RequestHeader(SecurityConstants.HEADER_AUTH) String token,
            @PathVariable Long jobId) {
        Long applicantId = CustomUserAuthenticator.getUserIdFromToken(token);
        jobService.applyForJob(applicantId, jobId);
        return ResponseEntity.ok(new CommonResponse<>(true, "Application submitted!"));
    }
}
