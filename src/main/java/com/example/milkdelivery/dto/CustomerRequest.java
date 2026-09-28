package com.example.milkdelivery.dto;

import jakarta.validation.constraints.*;

public record CustomerRequest(
        @NotBlank @Size(max = 120)
        String name,
        @NotBlank @Pattern(regexp = "^[+0-9() .-]{7,30}$", message = "must be a valid phone number")
        String phone,
        @NotBlank @Size(max = 500)
        String address,
        @NotNull @Positive Double
        milkRatePerLiter
) { }
