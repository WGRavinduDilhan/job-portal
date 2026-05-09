package com.jobportal.dto.application;

import lombok.*;

@Getter @Setter
public class StatusUpdateReqDto {
    private String status;  // SHORTLISTED, INTERVIEW_SCHEDULED, OFFERED, REJECTED
}
