package com.arigavincent.portfolio.storage;

import org.springframework.core.io.Resource;

/**
 * Where uploaded files live. The app only talks to this interface, so the local disk
 * implementation can be swapped for S3 or Cloudflare R2 without touching callers.
 */
public interface StorageService {

    /** Stores the content under a new, unguessable key and returns it. */
    StoredFile store(byte[] content, FileType type);

    /** Loads a stored file, or throws ResourceNotFoundException when the key is unknown. */
    Resource load(String key);

    /** Removes a stored file. Unknown keys are ignored. */
    void delete(String key);
}
