package com.jobportal.service;

import com.jobportal.dto.applicant.ApplicantReqDto;
import com.jobportal.dto.applicant.ApplicantResDto;
import com.jobportal.dto.application.ApplicationResDto;
import java.util.List;

public interface ApplicantService {
    void saveNewApplicant(ApplicantReqDto dto);
    void verifyAccountAndEmail(String token);
    ApplicantResDto getProfile(Long applicantId);
    List<ApplicationResDto> getMyApplications(Long applicantId);
}
