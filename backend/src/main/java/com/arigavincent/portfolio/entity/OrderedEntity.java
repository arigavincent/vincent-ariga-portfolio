package com.arigavincent.portfolio.entity;

import jakarta.persistence.Column;
import jakarta.persistence.MappedSuperclass;
import lombok.Getter;
import lombok.Setter;

/** Content that the site owner arranges by hand: lower {@code sortOrder} shows first. */
@Getter
@Setter
@MappedSuperclass
public abstract class OrderedEntity extends BaseEntity {

    @Column(nullable = false)
    private int sortOrder;
}
