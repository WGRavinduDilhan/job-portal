package com.jobportal.service.impl;

import com.jobportal.dto.applicant.*;
import com.jobportal.dto.application.ApplicationResDto;
import com.jobportal.entity.*;
import com.jobportal.enums.*;
import com.jobportal.exception.dto.CustomServiceException;
import com.jobportal.repository.*;
import com.jobportal.service.ApplicantService;
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
public class ApplicantServiceImpl implements ApplicantService {

    private final ApplicantRepository applicantRepository;
    private final ApplicationRepository applicationRepository;
    private final ModelMapper modelMapper;
    private final EmailSender emailSender;
    private final PasswordEncoder passwordEncoder;
    private final EmailVerificationTokenGenerator emailVerificationTokenGenerator;

    @Value("${game.frontend.base.url}")
    private String frontendBaseUrl;

    @Override
    @Transactional(propagation = Propagation.REQUIRED)
    public void saveNewApplicant(ApplicantReqDto dto) {
        if (!EmailValidator.getInstance().isValid(dto.getEmail()))
            throw new CustomServiceException("Invalid email!");
        if (applicantRepository.findFirstByEmail(dto.getEmail()).isPresent())
            throw new CustomServiceException("Email already exists");
        if (applicantRepository.findFirstByUserName(dto.getUserName()).isPresent())
            throw new CustomServiceException("Username already exists");

        Applicant applicant = modelMapper.map(dto, Applicant.class);
        applicant.setCreated(new Date());
        applicant.setUpdated(new Date());
        applicant.setPassword(passwordEncoder.encode(dto.getPassword()));
        applicant.setStatus(ActiveStatus.PENDING);
        applicant.setEmail_verified(AccountVerifyStatus.NOT_VERIFY);
        Applicant saved = applicantRepository.save(applicant);
        sendVerificationEmail(saved);
    }

    @Override
    public void verifyAccountAndEmail(String token) {
        Jws<Claims> claims = emailVerificationTokenGenerator.verify(token);
        long userId = Long.parseLong(claims.getBody().getSubject());
        String email = (String) claims.getBody().get(EmailVerificationTokenGenerator.EMAIL_CLAIM);
        Applicant applicant = applicantRepository.findFirstByIdAndEmail(userId, email)
            .orElseThrow(() -> new CustomServiceException("User not found"));
        if (!java.util.Objects.equals(applicant.getCurrent_verify_token(), token))
            throw new CustomServiceException("Token has expired");
        if (applicant.getStatus() == ActiveStatus.ACTIVE)
            throw new CustomServiceException("Account already verified!");
        applicant.setStatus(ActiveStatus.ACTIVE);
        applicant.setEmail_verified(AccountVerifyStatus.VERIFY);
        applicantRepository.save(applicant);
    }

    @Override
    public ApplicantResDto getProfile(Long applicantId) {
        Applicant a = applicantRepository.findById(applicantId)
            .orElseThrow(() -> new CustomServiceException("User not found"));
        return modelMapper.map(a, ApplicantResDto.class);
    }

    @Override
    public List<ApplicationResDto> getMyApplications(Long applicantId) {
        return applicationRepository.findAllByApplicantId(applicantId).stream()
            .map(app -> {
                ApplicationResDto dto = new ApplicationResDto();
                dto.setId(app.getId());
                dto.setJobTitle(app.getJobListing().getTitle());
                dto.setCompanyName(app.getJobListing().getCompany().getCompanyName());
                dto.setStatus(app.getStatus().name());
                dto.setAppliedDate(app.getAppliedDate() != null ? app.getAppliedDate().toString() : "");
                return dto;
            }).collect(Collectors.toList());
    }

    private void sendVerificationEmail(Applicant applicant) {
        try {
            String token = emailVerificationTokenGenerator.generate(applicant.getId(), applicant.getEmail());
            String verifyUrl = frontendBaseUrl + "/register-complete?uid=" + token;
            String body = "<p>Hello " + applicant.getUserName() + ",</p><br/>"
                        + "<p>Click to verify your JobPortal account: <a href='" + verifyUrl + "'>Verify Email</a></p>";
            emailSender.sendSimpleEmail(applicant.getEmail(), "Verify your JobPortal email", body);
            applicant.setCurrent_verify_token(token);
            applicantRepository.save(applicant);
        } catch (MessagingException e) {
            throw new CustomServiceException(e.getMessage());
        }
    }
}
