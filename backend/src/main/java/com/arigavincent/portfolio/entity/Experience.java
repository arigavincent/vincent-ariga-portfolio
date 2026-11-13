package com.arigavincent.portfolio.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.time.LocalDate;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "experiences")
public class Experience extends OrderedEntity {

    @Column(nullable = false, length = 160)
    private String title;

    @Column(nullable = false, length = 160)
    private String organization;

    @Column(length = 160)
    private String location;

    private LocalDate startDate;

    private LocalDate endDate;

    @Column(nullable = false)
    private boolean current;

    @Column(nullable = false, length = 4000)
    private String description;
}
