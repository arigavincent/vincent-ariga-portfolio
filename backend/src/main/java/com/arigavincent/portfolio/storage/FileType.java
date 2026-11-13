package com.arigavincent.portfolio.storage;

import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.Optional;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

/**
 * The file types the API accepts. A type is recognised by its leading bytes, never by the file
 * name or the Content-Type the client claims. SVG is deliberately absent (it can carry scripts).
 */
@Getter
@RequiredArgsConstructor
public enum FileType {
    JPEG("jpg", "image/jpeg", true),
    PNG("png", "image/png", true),
    GIF("gif", "image/gif", true),
    WEBP("webp", "image/webp", true),
    AVIF("avif", "image/avif", true),
    PDF("pdf", "application/pdf", false);

    private static final byte[] PNG_SIGNATURE = {(byte) 0x89, 'P', 'N', 'G', '\r', '\n', 0x1A, '\n'};
    private static final byte[] JPEG_SIGNATURE = {(byte) 0xFF, (byte) 0xD8, (byte) 0xFF};

    private final String extension;
    private final String contentType;
    private final boolean image;

    public static Optional<FileType> detect(byte[] content) {
        if (startsWith(content, 0, PNG_SIGNATURE)) {
            return Optional.of(PNG);
        }
        if (startsWith(content, 0, JPEG_SIGNATURE)) {
            return Optional.of(JPEG);
        }
        if (startsWith(content, 0, ascii("GIF87a")) || startsWith(content, 0, ascii("GIF89a"))) {
            return Optional.of(GIF);
        }
        if (startsWith(content, 0, ascii("RIFF")) && startsWith(content, 8, ascii("WEBP"))) {
            return Optional.of(WEBP);
        }
        if (startsWith(content, 4, ascii("ftyp"))
                && (startsWith(content, 8, ascii("avif")) || startsWith(content, 8, ascii("avis")))) {
            return Optional.of(AVIF);
        }
        if (startsWith(content, 0, ascii("%PDF-"))) {
            return Optional.of(PDF);
        }
        return Optional.empty();
    }

    public static Optional<FileType> fromExtension(String extension) {
        return Arrays.stream(values())
                .filter(type -> type.extension.equals(extension))
                .findFirst();
    }

    private static boolean startsWith(byte[] content, int offset, byte[] signature) {
        if (content.length < offset + signature.length) {
            return false;
        }
        return Arrays.equals(content, offset, offset + signature.length, signature, 0, signature.length);
    }

    private static byte[] ascii(String text) {
        return text.getBytes(StandardCharsets.US_ASCII);
    }
}
