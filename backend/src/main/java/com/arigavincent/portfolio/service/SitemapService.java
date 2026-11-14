package com.arigavincent.portfolio.service;

import com.arigavincent.portfolio.config.AppProperties;
import com.arigavincent.portfolio.entity.PublicationStatus;
import com.arigavincent.portfolio.repository.BlogPostRepository;
import com.arigavincent.portfolio.repository.ProjectRepository;
import java.time.Instant;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.util.HtmlUtils;

/** Builds sitemap.xml from the fixed pages plus every published project and blog post. */
@Service
@RequiredArgsConstructor
public class SitemapService {

    private static final DateTimeFormatter DAY = DateTimeFormatter.ISO_LOCAL_DATE.withZone(ZoneOffset.UTC);

    private final ProjectRepository projects;
    private final BlogPostRepository blogPosts;
    private final AppProperties properties;

    private record Entry(String path, @Nullable Instant lastModified) {}

    @Transactional(readOnly = true)
    public String render() {
        List<Entry> entries = new ArrayList<>();
        entries.add(new Entry("/", null));
        entries.add(new Entry("/projects", null));
        projects.findAllByStatusOrderBySortOrderAscIdAsc(PublicationStatus.PUBLISHED)
                .forEach(project -> entries.add(new Entry("/projects/" + project.getSlug(), project.getUpdatedAt())));
        var posts = blogPosts.findAllByStatusOrderByPublishedAtDescIdDesc(PublicationStatus.PUBLISHED);
        if (!posts.isEmpty()) {
            entries.add(new Entry("/blog", null));
            posts.forEach(post -> entries.add(new Entry("/blog/" + post.getSlug(), post.getUpdatedAt())));
        }

        String base = properties.siteUrl().replaceAll("/+$", "");
        StringBuilder xml = new StringBuilder("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n")
                .append("<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n");
        for (Entry entry : entries) {
            xml.append("  <url>\n    <loc>")
                    .append(HtmlUtils.htmlEscape(base + entry.path()))
                    .append("</loc>\n");
            if (entry.lastModified() != null) {
                xml.append("    <lastmod>")
                        .append(DAY.format(entry.lastModified()))
                        .append("</lastmod>\n");
            }
            xml.append("  </url>\n");
        }
        return xml.append("</urlset>\n").toString();
    }
}
