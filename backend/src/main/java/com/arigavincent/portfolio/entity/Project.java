package com.arigavincent.portfolio.entity;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OrderColumn;
import jakarta.persistence.Table;
import java.util.ArrayList;
import java.util.List;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "projects")
public class Project extends OrderedEntity {

    @Column(nullable = false, unique = true, length = 120)
    private String slug;

    @Column(nullable = false, length = 160)
    private String title;

    @Column(nullable = false, length = 400)
    private String summary;

    @Column(nullable = false, length = 8000)
    private String description;

    @Column(nullable = false, length = 80)
    private String category;

    @ElementCollection
    @CollectionTable(name = "project_tech_stack", joinColumns = @JoinColumn(name = "project_id"))
    @OrderColumn(name = "position")
    @Column(name = "name", nullable = false, length = 80)
    private List<String> techStack = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "project_highlights", joinColumns = @JoinColumn(name = "project_id"))
    @OrderColumn(name = "position")
    @Column(name = "text", nullable = false, length = 300)
    private List<String> highlights = new ArrayList<>();

    @Column(length = 500)
    private String coverImageUrl;

    @Column(length = 500)
    private String repoUrl;

    @Column(length = 500)
    private String liveUrl;

    @Column(nullable = false)
    private boolean featured;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PublicationStatus status = PublicationStatus.DRAFT;
}
