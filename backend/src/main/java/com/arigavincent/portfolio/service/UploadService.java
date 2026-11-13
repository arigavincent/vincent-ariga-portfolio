package com.arigavincent.portfolio.service;

import com.arigavincent.portfolio.config.AppProperties;
import com.arigavincent.portfolio.dto.UploadResponse;
import com.arigavincent.portfolio.exception.InvalidFileException;
import com.arigavincent.portfolio.storage.FileType;
import com.arigavincent.portfolio.storage.StorageService;
import com.arigavincent.portfolio.storage.StoredFile;
import java.io.IOException;
import java.io.UncheckedIOException;
import java.util.function.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.util.unit.DataSize;
import org.springframework.web.multipart.MultipartFile;

/** Validates uploads (size and real file type) before handing them to storage. */
@Service
@RequiredArgsConstructor
public class UploadService {

    public static final String FILES_PATH = "/api/files/";

    private final StorageService storage;
    private final AppProperties properties;

    public UploadResponse storeImage(MultipartFile file) {
        StoredFile stored = store(
                file,
                properties.storage().maxImageSize(),
                FileType::isImage,
                "Only JPEG, PNG, WebP, GIF or AVIF images are accepted");
        return toResponse(stored);
    }

    public StoredFile storePdf(MultipartFile file) {
        return store(
                file,
                properties.storage().maxDocumentSize(),
                type -> type == FileType.PDF,
                "Only PDF files are accepted");
    }

    public static UploadResponse toResponse(StoredFile stored) {
        return new UploadResponse(
                stored.key(), FILES_PATH + stored.key(), stored.type().getContentType(), stored.size());
    }

    private StoredFile store(MultipartFile file, DataSize maxSize, Predicate<FileType> accepted, String rejection) {
        if (file == null || file.isEmpty()) {
            throw new InvalidFileException(HttpStatus.BAD_REQUEST, "Choose a file to upload");
        }
        if (file.getSize() > maxSize.toBytes()) {
            throw new InvalidFileException(
                    HttpStatus.PAYLOAD_TOO_LARGE,
                    "That file is too large. The limit is %d MB".formatted(maxSize.toMegabytes()));
        }
        byte[] content = read(file);
        FileType type = FileType.detect(content)
                .filter(accepted)
                .orElseThrow(() -> new InvalidFileException(HttpStatus.UNSUPPORTED_MEDIA_TYPE, rejection));
        return storage.store(content, type);
    }

    private static byte[] read(MultipartFile file) {
        try {
            return file.getBytes();
        } catch (IOException exception) {
            throw new UncheckedIOException("Could not read the uploaded file", exception);
        }
    }
}
