package com.jobportal.dto.auth;

import com.jobportal.dto.applicant.ApplicantResDto;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Getter @Setter @NoArgsConstructor
@SuperBuilder
public class ApplicantAuthDto extends ApplicantResDto implements CommonUserAuth {}
