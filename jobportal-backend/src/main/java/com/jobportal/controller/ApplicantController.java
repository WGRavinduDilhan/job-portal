package com.jobportal.controller;

import com.jobportal.config.security.SecurityConstants;
import com.jobportal.config.security.custom.CustomUserAuthenticator;
import com.jobportal.config.throttling_config.Throttling;
import com.jobportal.dto.applicant.ApplicantReqDto;
import com.jobportal.dto.common.CommonResponse;
import com.jobportal.service.ApplicantService;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

@Log4j2
@RestController
@RequestMapping("/applicant")
@RequiredArgsConstructor
public class ApplicantController {

    private final ApplicantService applicantService;

    @Throttling(timeFrameInSeconds = 60, calls = 5)
    @PostMapping("/signup")
    public ResponseEntity<?> signUp(@RequestBody ApplicantReqDto dto) {
        applicantService.saveNewApplicant(dto);
        return ResponseEntity.ok(new CommonResponse<>(true, "Sign up successful!"));
    }

    @Throttling(timeFrameInSeconds = 60, calls = 10)
    @PatchMapping("/account/verify")
    public ResponseEntity<?> verifyAccount(@RequestParam("token") String token) {
        applicantService.verifyAccountAndEmail(token);
        return ResponseEntity.ok(new CommonResponse<>(true, "Account activated successfully!"));
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(
            @RequestHeader(SecurityConstants.HEADER_AUTH) String token) {
        Long id = CustomUserAuthenticator.getUserIdFromToken(token);
        return ResponseEntity.ok(new CommonResponse<>(true, "Profile retrieved", applicantService.getProfile(id)));
    }

    @GetMapping("/my-applications")
    public ResponseEntity<?> getMyApplications(
            @RequestHeader(SecurityConstants.HEADER_AUTH) String token) {
        Long id = CustomUserAuthenticator.getUserIdFromToken(token);
        return ResponseEntity.ok(new CommonResponse<>(true, "Applications retrieved", applicantService.getMyApplications(id)));
    }
}
