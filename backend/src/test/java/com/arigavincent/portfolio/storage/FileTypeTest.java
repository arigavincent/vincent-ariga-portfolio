package com.arigavincent.portfolio.storage;

import static org.assertj.core.api.Assertions.assertThat;

import java.nio.charset.StandardCharsets;
import org.junit.jupiter.api.Test;

class FileTypeTest {

    @Test
    void recognisesEachSupportedTypeByItsLeadingBytes() {
        assertThat(FileType.detect(new byte[] {(byte) 0x89, 'P', 'N', 'G', '\r', '\n', 0x1A, '\n', 0}))
                .contains(FileType.PNG);
        assertThat(FileType.detect(new byte[] {(byte) 0xFF, (byte) 0xD8, (byte) 0xFF, (byte) 0xE0}))
                .contains(FileType.JPEG);
        assertThat(FileType.detect(ascii("GIF89a...."))).contains(FileType.GIF);
        assertThat(FileType.detect(ascii("RIFF1234WEBPVP8 "))).contains(FileType.WEBP);
        assertThat(FileType.detect(ascii("\0\0\0 ftypavif\0\0\0\0"))).contains(FileType.AVIF);
        assertThat(FileType.detect(ascii("%PDF-1.7\n"))).contains(FileType.PDF);
    }

    @Test
    void rejectsEverythingElse() {
        assertThat(FileType.detect(ascii("<svg xmlns=\"http://www.w3.org/2000/svg\"/>")))
                .isEmpty();
        assertThat(FileType.detect(ascii("RIFF1234WAVEfmt "))).isEmpty();
        assertThat(FileType.detect(ascii("plain text"))).isEmpty();
        assertThat(FileType.detect(new byte[0])).isEmpty();
        assertThat(FileType.detect(new byte[] {(byte) 0x89, 'P'})).isEmpty();
    }

    @Test
    void mapsExtensionsBackToTypes() {
        assertThat(FileType.fromExtension("jpg")).contains(FileType.JPEG);
        assertThat(FileType.fromExtension("pdf")).contains(FileType.PDF);
        assertThat(FileType.fromExtension("svg")).isEmpty();
        assertThat(FileType.fromExtension(null)).isEmpty();
        assertThat(FileType.PDF.isImage()).isFalse();
        assertThat(FileType.WEBP.isImage()).isTrue();
    }

    private static byte[] ascii(String text) {
        return text.getBytes(StandardCharsets.US_ASCII);
    }
}
