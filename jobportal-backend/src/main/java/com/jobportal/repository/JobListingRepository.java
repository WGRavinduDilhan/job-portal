package com.jobportal.repository;

import com.jobportal.entity.JobListing;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface JobListingRepository extends JpaRepository<JobListing, Long> {
    List<JobListing> findAllByIsActiveTrue();
    List<JobListing> findAllByCompanyId(Long companyId);
    long countByCompanyId(Long companyId);
}
