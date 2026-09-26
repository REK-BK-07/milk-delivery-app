package com.example.milkdelivery.repository;

import com.example.milkdelivery.entity.MilkEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;

public interface MilkEntryRepository extends JpaRepository<MilkEntry, Long> {
    List<MilkEntry> findByCustomerIdAndDateGreaterThanEqualAndDateLessThan(Long customerId, LocalDate from, LocalDate toExclusive);
}
