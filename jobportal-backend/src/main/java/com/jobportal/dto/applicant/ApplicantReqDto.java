package com.jobportal.dto.applicant;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class ApplicantReqDto {
    private String userName;
    private String email;
    private String password;
    private String university;
    private String degree;
    private String phone;
}
