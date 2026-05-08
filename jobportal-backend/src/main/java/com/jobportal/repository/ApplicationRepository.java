package com.jobportal.repository;

import com.jobportal.entity.Application;
import com.jobportal.enums.ApplicationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, Long> {
    List<Application> findAllByApplicantId(Long applicantId);
    List<Application> findAllByJobListingId(Long jobListingId);
    Optional<Application> findFirstByApplicantIdAndJobListingId(Long applicantId, Long jobListingId);
    long countByJobListingCompanyId(Long companyId);
    long countByJobListingCompanyIdAndStatus(Long companyId, ApplicationStatus status);
}
