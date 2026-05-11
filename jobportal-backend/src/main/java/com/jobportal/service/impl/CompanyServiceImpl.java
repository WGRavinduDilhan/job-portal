package com.jobportal.service.impl;

import com.jobportal.dto.company.*;
import com.jobportal.dto.job.JobResDto;
import com.jobportal.entity.*;
import com.jobportal.enums.*;
import com.jobportal.exception.dto.CustomServiceException;
import com.jobportal.repository.*;
import com.jobportal.service.CompanyService;
import com.jobportal.utilities.*;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.apache.commons.validator.routines.EmailValidator;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.*;
import javax.mail.MessagingException;
import java.util.*;
import java.util.stream.Collectors;

@Log4j2
@RequiredArgsConstructor
@Service
public class CompanyServiceImpl implements CompanyService {

    private final CompanyRepository companyRepository;
    private final ApplicationRepository applicationRepository;
    private final JobListingRepository jobListingRepository;
    private final ModelMapper modelMapper;
    private final EmailSender emailSender;
    private final PasswordEncoder passwordEncoder;
    private final EmailVerificationTokenGenerator emailVerificationTokenGenerator;

    @Value("${job.frontend.base.url}")
    private String frontendBaseUrl;

    @Override
    @Transactional(propagation = Propagation.REQUIRED)
    public void saveNewCompany(CompanyReqDto dto) {
        if (!EmailValidator.getInstance().isValid(dto.getEmail()))
            throw new CustomServiceException("Invalid email!");
        if (companyRepository.findFirstByEmail(dto.getEmail()).isPresent())
            throw new CustomServiceException("Email already exists");
        if (companyRepository.findFirstByUserName(dto.getUserName()).isPresent())
            throw new CustomServiceException("Username already exists");

        Company company = modelMapper.map(dto, Company.class);
        company.setCreated(new Date());
        company.setUpdated(new Date());
        company.setPassword(passwordEncoder.encode(dto.getPassword()));
        company.setStatus(ActiveStatus.PENDING);
        company.setEmail_verified(AccountVerifyStatus.NOT_VERIFY);
        Company saved = companyRepository.saveAndFlush(company);
        
        // Try sending email but don't fail the whole signup if it fails
        try {
            sendVerificationEmail(saved);
        } catch (Exception e) {
            log.error("Email failed but company was saved: {}", e.getMessage());
        }
    }

    @Override
    public void verifyAccountAndEmail(String token) {
        Jws<Claims> claims = emailVerificationTokenGenerator.verify(token);
        long userId = Long.parseLong(claims.getBody().getSubject());
        String email = (String) claims.getBody().get(EmailVerificationTokenGenerator.EMAIL_CLAIM);
        Company company = companyRepository.findFirstByIdAndEmail(userId, email)
            .orElseThrow(() -> new CustomServiceException("User not found"));
        if (!java.util.Objects.equals(company.getCurrent_verify_token(), token))
            throw new CustomServiceException("Token has expired");
        if (company.getStatus() == ActiveStatus.ACTIVE)
            throw new CustomServiceException("Account already verified!");
        company.setStatus(ActiveStatus.ACTIVE);
        company.setEmail_verified(AccountVerifyStatus.VERIFY);
        companyRepository.save(company);
    }

    @Override
    public CompanyResDto getProfile(Long companyId) {
        Company c = companyRepository.findById(companyId)
            .orElseThrow(() -> new CustomServiceException("Company not found"));
        return modelMapper.map(c, CompanyResDto.class);
    }

    @Override
    public Map<String, Object> getDashboard(Long companyId) {
        Map<String, Object> dashboard = new HashMap<>();
        dashboard.put("activeListings", jobListingRepository.countByCompanyId(companyId));
        dashboard.put("totalApplications", applicationRepository.countByJobListingCompanyId(companyId));
        dashboard.put("shortlisted", applicationRepository.countByJobListingCompanyIdAndStatus(companyId, ApplicationStatus.SHORTLISTED));
        dashboard.put("offered",      applicationRepository.countByJobListingCompanyIdAndStatus(companyId, ApplicationStatus.OFFERED));
        
        List<JobListing> recentJobs = jobListingRepository.findAllByCompanyId(companyId);
        List<JobResDto> jobDtos = recentJobs.stream()
            .map(job -> {
                JobResDto dto = modelMapper.map(job, JobResDto.class);
                dto.setCompanyName(job.getCompany().getCompanyName());
                dto.setCompanyId(job.getCompany().getId());
                dto.setApplicantCount(applicationRepository.countByJobListingId(job.getId()));
                return dto;
            }).collect(Collectors.toList());
        
        dashboard.put("recentJobs", jobDtos);
        
        return dashboard;
    }

    private void sendVerificationEmail(Company company) {
        String token = emailVerificationTokenGenerator.generate(company.getId(), company.getEmail());
        String verifyUrl = frontendBaseUrl + "/register-complete?uid=" + token;
        
        // Log for testing
        log.info("----------------------------------------------------------------");
        log.info("VERIFICATION LINK FOR {}: {}", company.getEmail(), verifyUrl);
        log.info("----------------------------------------------------------------");

        try {
            String body = "<p>Hello " + company.getUserName() + ",</p><br/>"
                        + "<p>Click to verify your JobPortal account: <a href='" + verifyUrl + "'>Verify Email</a></p>";
            emailSender.sendSimpleEmail(company.getEmail(), "Verify your JobPortal email", body);
        } catch (Exception e) {
            log.warn("SMTP Server not available. Company can still verify using the link in logs.");
        }
        
        company.setCurrent_verify_token(token);
        companyRepository.save(company);
    }
}
