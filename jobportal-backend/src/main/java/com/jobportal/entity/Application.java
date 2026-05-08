package com.jobportal.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.jobportal.enums.ApplicationStatus;
import lombok.*;
import javax.persistence.*;
import java.util.Date;

@Builder @Getter @Setter @NoArgsConstructor @AllArgsConstructor
@Entity
public class Application {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    private ApplicationStatus status;

    private String resumeFileName;
    @Lob
    private String resumeFilePath;

    @JsonFormat(pattern = "dd-MM-yyyy HH:mm:ss")
    @Temporal(TemporalType.TIMESTAMP)
    private Date appliedDate;

    @JsonFormat(pattern = "dd-MM-yyyy HH:mm:ss")
    @Temporal(TemporalType.TIMESTAMP)
    private Date updatedDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(nullable = false)
    private Applicant applicant;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(nullable = false)
    private JobListing jobListing;
}
