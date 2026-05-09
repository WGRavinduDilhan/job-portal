package com.jobportal.dto.job;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class JobReqDto {
    private String title;
    private String description;
    private String location;
    private String jobType;
    private String requirements;
    private String deadline;  // "yyyy-MM-dd"
}
