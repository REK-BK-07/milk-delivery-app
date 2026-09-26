package com.example.milkdelivery.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "milk_entries", indexes = @Index(name = "idx_milk_entry_customer_date", columnList = "customer_id, delivery_date"))
@Getter @Setter @NoArgsConstructor
public class MilkEntry {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @Column(name = "delivery_date", nullable = false)
    private LocalDate date;

    @Column(nullable = false)
    private Double liters;
}
