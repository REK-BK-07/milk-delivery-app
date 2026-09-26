package com.example.milkdelivery.controller;

import com.example.milkdelivery.dto.MonthlyBillResponse;
import com.example.milkdelivery.service.MilkEntryService;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Max;

@RestController
@RequestMapping("/api/billing")
@CrossOrigin(origins = "*")
@Validated
public class BillingController {
    private final MilkEntryService service;
    public BillingController(MilkEntryService service) { this.service = service; }

    @GetMapping("/monthly")
    public MonthlyBillResponse monthlyBill(@RequestParam @Min(1) Long customerId,
                                           @RequestParam @Min(1) @Max(9999) int year,
                                           @RequestParam @Min(1) @Max(12) int month) {
        return service.monthlyBill(customerId, year, month);
    }
}
