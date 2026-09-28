package com.example.milkdelivery.dto;

public record CustomerResponse(Long id, String name, String phone, String address, Double milkRatePerLiter) {

}
