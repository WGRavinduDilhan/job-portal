package com.jobportal.dto.applicant;

import lombok.*;
import lombok.experimental.SuperBuilder;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @SuperBuilder
public class ApplicantResDto {
    private Long id;
    private String userName;
    private String email;
    private String university;
    private String degree;
    private String bio;
    private String skills;
    private String resume;
    private String resumeFileName;
    private String profilePic;

    @Builder.Default
    private String role = "APPLICANT";
}
