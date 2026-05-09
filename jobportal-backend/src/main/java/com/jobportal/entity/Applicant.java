package com.jobportal.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.jobportal.enums.*;
import com.jobportal.dto.auth.CommonUserAuth;
import lombok.*;
import javax.persistence.*;
import java.util.*;

@Builder @Getter @Setter @NoArgsConstructor @AllArgsConstructor
@Entity
public class Applicant implements CommonUserAuth {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String userName;
    private String password;

    @Column(unique = true, nullable = false)
    private String email;
    private String university;
    private String degree;
    private String phone;

    @Enumerated(EnumType.STRING)
    private AccountVerifyStatus email_verified;
    @Enumerated(EnumType.STRING)
    private ActiveStatus status;

    @Lob
    private String current_verify_token;

    @JsonFormat(pattern = "dd-MM-yyyy HH:mm:ss")
    @Temporal(TemporalType.TIMESTAMP)
    private Date created;

    @JsonFormat(pattern = "dd-MM-yyyy HH:mm:ss")
    @Temporal(TemporalType.TIMESTAMP)
    private Date updated;

    @Builder.Default
    @OneToMany(mappedBy = "applicant", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Application> applications = new ArrayList<>();
}
