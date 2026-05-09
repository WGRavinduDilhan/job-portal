package com.jobportal.service;

import com.jobportal.dto.company.CompanyReqDto;
import com.jobportal.dto.company.CompanyResDto;
import java.util.Map;

public interface CompanyService {
    void saveNewCompany(CompanyReqDto dto);
    void verifyAccountAndEmail(String token);
    CompanyResDto getProfile(Long companyId);
    Map<String, Object> getDashboard(Long companyId);
}
