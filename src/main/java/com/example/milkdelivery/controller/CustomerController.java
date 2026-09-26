package com.example.milkdelivery.controller;

import com.example.milkdelivery.dto.*;
import com.example.milkdelivery.service.CustomerService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/customers")
@CrossOrigin(origins = "*")
public class CustomerController {
    private final CustomerService service;
    public CustomerController(CustomerService service) { this.service = service; }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CustomerResponse create(@Valid @RequestBody CustomerRequest request) { return service.create(request); }

    @GetMapping
    public List<CustomerResponse> findAll() { return service.findAll(); }
}
