package com.example.milkdelivery.service;

import com.example.milkdelivery.dto.*;
import com.example.milkdelivery.entity.Customer;
import com.example.milkdelivery.entity.MilkEntry;
import com.example.milkdelivery.exception.ResourceNotFoundException;
import com.example.milkdelivery.repository.CustomerRepository;
import com.example.milkdelivery.repository.MilkEntryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class MilkEntryService {
    private final MilkEntryRepository entries;
    private final CustomerRepository customers;

    public MilkEntryService(MilkEntryRepository entries, CustomerRepository customers) {
        this.entries = entries;
        this.customers = customers;
    }

    @Transactional
    public MilkEntryResponse create(MilkEntryRequest request) {
        Customer customer = customers.findById(request.customerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer", request.customerId()));
        MilkEntry entry = new MilkEntry();
        entry.setCustomer(customer);
        entry.setDate(request.date());
        entry.setLiters(request.liters());
        return toResponse(entries.save(entry));
    }

    public MonthlyBillResponse monthlyBill(Long customerId, int year, int month) {
        Customer customer = customers.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer", customerId));
        LocalDate start = LocalDate.of(year, month, 1);
        LocalDate endExclusive = start.plusMonths(1);
        List<MilkEntry> monthEntries = entries.findByCustomerIdAndDateGreaterThanEqualAndDateLessThan(customerId, start, endExclusive);
        double totalLiters = monthEntries.stream().mapToDouble(MilkEntry::getLiters).sum();
        double rate = customer.getMilkRatePerLiter();
        BigDecimal bill = BigDecimal.valueOf(totalLiters).multiply(BigDecimal.valueOf(rate)).setScale(2, java.math.RoundingMode.HALF_UP);
        return new MonthlyBillResponse(customerId, year, month, totalLiters, rate, bill);
    }

    private static MilkEntryResponse toResponse(MilkEntry entry) {
        return new MilkEntryResponse(entry.getId(), entry.getCustomer().getId(), entry.getDate(), entry.getLiters());
    }
}
