package com.arigavincent.portfolio.storage;

public record StoredFile(String key, FileType type, long size) {}
