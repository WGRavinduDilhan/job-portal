package com.jobportal.dto.application;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class ApplicationResDto {
    private Long id;
    private String jobTitle;
    private String companyName;
    private String status;
    private String appliedDate;
    private String applicantName;
    private String applicantEmail;
    private Long   applicantId;
    private String applicantBio;
    private String applicantSkills;
    private String applicantResume;
    private String applicantResumeFileName;
    private String university;
    private String degree;
    private String applicantProfilePic;
}

