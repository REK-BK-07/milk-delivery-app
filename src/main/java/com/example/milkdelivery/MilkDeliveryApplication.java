package com.example.milkdelivery;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.transaction.annotation.EnableTransactionManagement;

@SpringBootApplication
public class MilkDeliveryApplication {
    public static void main(String[] args) {
        SpringApplication.run(MilkDeliveryApplication.class, args);
    }
}
