package com.example.milkdelivery.dto;

import java.time.LocalDate;

public record MilkEntryResponse(Long id, Long customerId, LocalDate date, Double liters) { }
