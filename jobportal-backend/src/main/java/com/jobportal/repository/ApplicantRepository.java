package com.jobportal.repository;

import com.jobportal.entity.Applicant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface ApplicantRepository extends JpaRepository<Applicant, Long> {
    Optional<Applicant> findFirstByUserName(String userName);
    Optional<Applicant> findFirstByEmail(String email);
    Optional<Applicant> findFirstByIdAndEmail(Long id, String email);
}
