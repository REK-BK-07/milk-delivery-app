package com.example.milkdelivery.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.time.LocalDate;

public record MilkEntryRequest(@NotNull Long customerId, @NotNull LocalDate date, @NotNull @Positive Double liters) { }
