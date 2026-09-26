package com.example.milkdelivery.repository;

import com.example.milkdelivery.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CustomerRepository extends JpaRepository<Customer, Long> { }
