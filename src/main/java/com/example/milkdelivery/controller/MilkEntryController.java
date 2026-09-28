package com.example.milkdelivery.controller;

import com.example.milkdelivery.dto.MilkEntryRequest;
import com.example.milkdelivery.dto.MilkEntryResponse;
import com.example.milkdelivery.service.MilkEntryService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/milk-entries")
@CrossOrigin(origins = "*")
public class MilkEntryController {
    private final MilkEntryService service;
    public MilkEntryController(MilkEntryService service) {
        this.service = service;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public MilkEntryResponse create(@Valid @RequestBody MilkEntryRequest request) {
        return service.create(request);
    }
}
