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
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "blog_posts")
public class BlogPost extends BaseEntity {

    @Column(nullable = false, unique = true, length = 160)
    private String slug;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false, length = 600)
    private String excerpt;

    /** Markdown body. */
    @Column(nullable = false, length = 200000)
    private String content;

    @Column(length = 500)
    private String coverImageUrl;

    @ElementCollection
    @CollectionTable(name = "blog_post_tags", joinColumns = @JoinColumn(name = "blog_post_id"))
    @OrderColumn(name = "position")
    @Column(name = "name", nullable = false, length = 60)
    private List<String> tags = new ArrayList<>();

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PublicationStatus status = PublicationStatus.DRAFT;

    private Instant publishedAt;
}
