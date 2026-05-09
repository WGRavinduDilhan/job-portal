package com.jobportal.dto.auth;

import com.jobportal.dto.company.CompanyResDto;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Getter @Setter @NoArgsConstructor
@SuperBuilder
public class CompanyAuthDto extends CompanyResDto implements CommonUserAuth {}
