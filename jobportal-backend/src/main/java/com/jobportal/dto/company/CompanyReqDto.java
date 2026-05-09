package com.jobportal.dto.company;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class CompanyReqDto {
    private String userName;
    private String email;
    private String password;
    private String companyName;
    private String industry;
    private String website;
}
