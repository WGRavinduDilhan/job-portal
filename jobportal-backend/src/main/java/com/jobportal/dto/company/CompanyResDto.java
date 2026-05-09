package com.jobportal.dto.company;

import lombok.*;
import lombok.experimental.SuperBuilder;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @SuperBuilder
public class CompanyResDto {
    private Long id;
    private String userName;
    private String email;
    private String companyName;
    private String industry;
    @Builder.Default
    private String role = "COMPANY";
}
