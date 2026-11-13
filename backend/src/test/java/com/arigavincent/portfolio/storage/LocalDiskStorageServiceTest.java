package com.arigavincent.portfolio.storage;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.arigavincent.portfolio.exception.ResourceNotFoundException;
import com.arigavincent.portfolio.support.TestProperties;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

class LocalDiskStorageServiceTest {

    @TempDir
    private Path root;

    private LocalDiskStorageService storage;

    @BeforeEach
    void setUp() {
        storage = new LocalDiskStorageService(
                TestProperties.withStorageRoot(root.resolve("uploads").toString()));
    }

    @Test
    void storesLoadsAndDeletesAFile() throws Exception {
        byte[] content = "%PDF-1.4 test".getBytes(StandardCharsets.US_ASCII);

        StoredFile stored = storage.store(content, FileType.PDF);

        assertThat(stored.key()).matches("[0-9a-f-]{36}\\.pdf");
        assertThat(stored.size()).isEqualTo(content.length);
        assertThat(storage.load(stored.key()).getContentAsByteArray()).isEqualTo(content);

        storage.delete(stored.key());
        assertThatThrownBy(() -> storage.load(stored.key())).isInstanceOf(ResourceNotFoundException.class);
        assertThatCode(() -> storage.delete(stored.key())).doesNotThrowAnyException();
    }

    @Test
    void givesEveryFileItsOwnKey() {
        byte[] content = {1, 2, 3};
        assertThat(storage.store(content, FileType.PNG).key())
                .isNotEqualTo(storage.store(content, FileType.PNG).key());
    }

    @ParameterizedTest
    @ValueSource(strings = {"../secret.txt", "..%2Fsecret.txt", "/etc/passwd", "secret.txt", "", "a/b.png"})
    void refusesKeysItDidNotGenerate(String key) throws Exception {
        Files.writeString(root.resolve("secret.txt"), "do not serve");

        assertThatThrownBy(() -> storage.load(key)).isInstanceOf(ResourceNotFoundException.class);
        assertThatThrownBy(() -> storage.delete(key)).isInstanceOf(ResourceNotFoundException.class);
        assertThat(root.resolve("secret.txt")).exists();
    }
}
