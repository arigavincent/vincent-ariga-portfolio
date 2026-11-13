package com.arigavincent.portfolio.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "education")
public class Education extends OrderedEntity {

    @Column(nullable = false, length = 200)
    private String institution;

    @Column(nullable = false, length = 200)
    private String qualification;

    @Column(length = 120)
    private String grade;

    private Integer startYear;

    private Integer endYear;

    @Column(length = 2000)
    private String description;
}
