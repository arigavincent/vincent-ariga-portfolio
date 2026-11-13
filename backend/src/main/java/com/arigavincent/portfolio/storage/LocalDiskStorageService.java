package com.arigavincent.portfolio.storage;

import com.arigavincent.portfolio.config.AppProperties;
import com.arigavincent.portfolio.exception.ResourceNotFoundException;
import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;
import java.util.UUID;
import java.util.regex.Pattern;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;

/** Stores uploads in one flat directory. Keys are generated here, never taken from the client. */
@Slf4j
@Service
public class LocalDiskStorageService implements StorageService {

    private static final Pattern KEY_PATTERN =
            Pattern.compile("^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\\.[a-z0-9]{2,5}$");

    private final Path root;

    public LocalDiskStorageService(AppProperties properties) {
        this.root = Path.of(properties.storage().localRoot()).toAbsolutePath().normalize();
        try {
            Files.createDirectories(root);
        } catch (IOException exception) {
            throw new UncheckedIOException("Could not create the upload directory " + root, exception);
        }
        log.info("Storing uploads in {}", root);
    }

    @Override
    public StoredFile store(byte[] content, FileType type) {
        String key = UUID.randomUUID() + "." + type.getExtension();
        try {
            Files.write(root.resolve(key), content, StandardOpenOption.CREATE_NEW);
        } catch (IOException exception) {
            throw new UncheckedIOException("Could not store the uploaded file", exception);
        }
        return new StoredFile(key, type, content.length);
    }

    @Override
    public Resource load(String key) {
        Path file = resolve(key);
        if (!Files.isRegularFile(file)) {
            throw new ResourceNotFoundException("File", key);
        }
        return new FileSystemResource(file);
    }

    @Override
    public void delete(String key) {
        try {
            Files.deleteIfExists(resolve(key));
        } catch (IOException exception) {
            log.warn("Could not delete stored file {}", key, exception);
        }
    }

    /** Only keys this service generated are accepted, which rules out path traversal. */
    private Path resolve(String key) {
        if (key == null || !KEY_PATTERN.matcher(key).matches()) {
            throw new ResourceNotFoundException("File", key);
        }
        return root.resolve(key);
    }
}
