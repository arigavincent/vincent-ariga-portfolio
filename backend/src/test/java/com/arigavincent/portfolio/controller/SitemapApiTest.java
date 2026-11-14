package com.arigavincent.portfolio.controller;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.not;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.xpath;

import com.arigavincent.portfolio.support.IntegrationTest;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

@IntegrationTest
@TestPropertySource(properties = "app.site-url=https://vincent.example/")
class SitemapApiTest {

    private static final Map<String, String> NS = Map.of("s", "http://www.sitemaps.org/schemas/sitemap/0.9");

    @Autowired
    private MockMvc mockMvc;

    @Test
    void listsTheFixedPagesAndEveryPublishedProjectWithAbsoluteUrls() throws Exception {
        mockMvc.perform(get("/api/sitemap.xml"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_XML))
                .andExpect(header().string(HttpHeaders.CACHE_CONTROL, containsString("max-age=3600")))
                .andExpect(xpath("/s:urlset/s:url[1]/s:loc", NS).string("https://vincent.example/"))
                .andExpect(xpath("/s:urlset/s:url[2]/s:loc", NS).string("https://vincent.example/projects"))
                .andExpect(xpath("count(/s:urlset/s:url)", NS).number(8.0))
                .andExpect(xpath("/s:urlset/s:url[s:loc='https://vincent.example/projects/aj-stream']/s:lastmod", NS)
                        .exists())
                .andExpect(content().string(not(containsString("/admin"))))
                .andExpect(content().string(not(containsString("/blog"))));
    }
}
