package com.jobportal.dto.application;

import lombok.*;

@Getter @Setter
public class StatusUpdateReqDto {
    private String status;          // SHORTLISTED, INTERVIEW_SCHEDULED, OFFERED, REJECTED
    private String interviewDate;   // e.g. "2024-08-15" — only for INTERVIEW_SCHEDULED
    private String interviewTime;   // e.g. "10:00 AM"  — only for INTERVIEW_SCHEDULED
    private String interviewType;   // "ONLINE" or "IN_PERSON" — only for INTERVIEW_SCHEDULED
    private String message;         // Custom message — for INTERVIEW_SCHEDULED and OFFERED
}
