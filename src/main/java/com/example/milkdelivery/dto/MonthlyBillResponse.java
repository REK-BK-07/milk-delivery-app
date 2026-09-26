package com.example.milkdelivery.dto;

import java.math.BigDecimal;

public record MonthlyBillResponse(Long customerId, int year, int month, double totalLiters, double ratePerLiter, BigDecimal totalBillAmount) { }
