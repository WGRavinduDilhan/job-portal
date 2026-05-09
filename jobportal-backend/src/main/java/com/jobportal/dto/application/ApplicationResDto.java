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
}
