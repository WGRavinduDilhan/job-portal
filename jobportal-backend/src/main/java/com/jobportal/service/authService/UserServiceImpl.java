package com.jobportal.service.authService;

import com.jobportal.config.security.SecurityConstants;
import com.jobportal.config.security.custom.CustomOauthException;
import com.jobportal.dto.auth.*;
import com.jobportal.entity.*;
import com.jobportal.enums.*;
import com.jobportal.exception.dto.CustomServiceException;
import com.jobportal.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.modelmapper.ModelMapper;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;
import java.util.*;

@Service @RequiredArgsConstructor @Log4j2
public class UserServiceImpl implements UserService {

    private final ApplicantRepository applicantRepository;
    private final CompanyRepository companyRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        log.info("Login attempt for: {}", username);

        UsernamePasswordAuthenticationToken auth =
            (UsernamePasswordAuthenticationToken) SecurityContextHolder.getContext().getAuthentication();
        org.springframework.security.core.userdetails.User user =
            (org.springframework.security.core.userdetails.User) auth.getPrincipal();
        String clientId = user.getUsername();

        switch (clientId) {
            case SecurityConstants.APPLICANT_ID:
                Applicant applicant = applicantRepository.findFirstByUserName(username)
                    .orElseThrow(() -> new CustomServiceException("Invalid username!"));
                if (applicant.getEmail_verified() == AccountVerifyStatus.NOT_VERIFY)
                    throw new CustomServiceException("Account not verified. Check your email!");
                
                ApplicantAuthDto appAuth = ApplicantAuthDto.builder()
                    .id(applicant.getId())
                    .userName(applicant.getUserName())
                    .email(applicant.getEmail())
                    .university(applicant.getUniversity())
                    .degree(applicant.getDegree())
                    .role("APPLICANT")
                    .build();
                
                return new UserAuthDto(applicant.getId(), username, applicant.getPassword(),
                    getRole(), appAuth);

            case SecurityConstants.COMPANY_ID:
                Company company = companyRepository.findFirstByUserName(username)
                    .orElseThrow(() -> new CustomServiceException("Invalid username!"));
                if (company.getEmail_verified() == AccountVerifyStatus.NOT_VERIFY)
                    throw new CustomServiceException("Account not verified. Check your email!");
                
                CompanyAuthDto compAuth = CompanyAuthDto.builder()
                    .id(company.getId())
                    .userName(company.getUserName())
                    .email(company.getEmail())
                    .companyName(company.getCompanyName())
                    .industry(company.getIndustry())
                    .role("COMPANY")
                    .build();
                
                return new UserAuthDto(company.getId(), username, company.getPassword(),
                    getRole(), compAuth);

            default:
                throw new CustomOauthException("Invalid client id");
        }
    }

    private List<SimpleGrantedAuthority> getRole() {
        return Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER"));
    }
}
