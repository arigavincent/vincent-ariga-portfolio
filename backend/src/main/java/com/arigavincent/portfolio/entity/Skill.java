package com.arigavincent.portfolio.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "skills")
public class Skill extends OrderedEntity {

    @Column(nullable = false, unique = true, length = 80)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private SkillCategory category;

    /** Frameworks or flavours within the skill, for example "Gin · Fiber" under Go. */
    @Column(length = 200)
    private String detail;

    /** Key the frontend uses to pick an icon. */
    @Column(length = 60)
    private String iconKey;
}
