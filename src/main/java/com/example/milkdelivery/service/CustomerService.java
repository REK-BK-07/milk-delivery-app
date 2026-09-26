package com.example.milkdelivery.service;

import com.example.milkdelivery.dto.*;
import com.example.milkdelivery.entity.Customer;
import com.example.milkdelivery.repository.CustomerRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class CustomerService {
    private final CustomerRepository customers;

    public CustomerService(CustomerRepository customers) { this.customers = customers; }

    @Transactional
    public CustomerResponse create(CustomerRequest request) {
        Customer customer = new Customer();
        customer.setName(request.name().trim());
        customer.setPhone(request.phone().trim());
        customer.setAddress(request.address().trim());
        customer.setMilkRatePerLiter(request.milkRatePerLiter());
        return toResponse(customers.save(customer));
    }

    public List<CustomerResponse> findAll() {
        return customers.findAll().stream().map(CustomerService::toResponse).toList();
    }

    public static CustomerResponse toResponse(Customer customer) {
        return new CustomerResponse(customer.getId(), customer.getName(), customer.getPhone(), customer.getAddress(), customer.getMilkRatePerLiter());
    }
}
