package com.arigavincent.portfolio.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

/** Profile and site-wide copy. A single row, always stored under {@link #SINGLETON_ID}. */
@Getter
@Setter
@Entity
@Table(name = "site_settings")
@EntityListeners(AuditingEntityListener.class)
public class SiteSettings {

    public static final long SINGLETON_ID = 1L;

    @Id
    private Long id = SINGLETON_ID;

    @Column(nullable = false, length = 120)
    private String displayName;

    @Column(nullable = false, length = 40)
    private String brandMark;

    @Column(nullable = false, length = 160)
    private String role;

    @Column(nullable = false, length = 240)
    private String headline;

    @Column(nullable = false, length = 160)
    private String tagline;

    @Column(nullable = false, length = 4000)
    private String bio;

    @Column(length = 400)
    private String heritageNote;

    @Column(nullable = false, length = 160)
    private String location;

    @Column(nullable = false, length = 300)
    private String availability;

    @Column(nullable = false, length = 200)
    private String email;

    @Column(nullable = false, length = 40)
    private String phoneDisplay;

    /** Digits only with country code, as used in wa.me links. */
    @Column(nullable = false, length = 20)
    private String whatsappNumber;

    @Column(nullable = false, length = 300)
    private String githubUrl;

    @Column(nullable = false, length = 200)
    private String footerLine;

    @Column(nullable = false, length = 200)
    private String seoTitle;

    @Column(nullable = false, length = 400)
    private String seoDescription;

    /** Storage key of the uploaded CV; when empty the bundled placeholder PDF is served. */
    @Column(length = 200)
    private String cvFileKey;

    @LastModifiedDate
    @Column(nullable = false)
    private Instant updatedAt;
}
