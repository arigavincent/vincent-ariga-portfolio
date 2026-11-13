package com.arigavincent.portfolio.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

/** A service Vincent offers. Named ServiceOffering to stay clear of Spring's {@code @Service}. */
@Getter
@Setter
@Entity
@Table(name = "services")
public class ServiceOffering extends OrderedEntity {

    @Column(nullable = false, length = 160)
    private String title;

    @Column(nullable = false, length = 2000)
    private String description;

    /** Key the frontend uses to pick an icon. */
    @Column(length = 60)
    private String iconKey;
}
