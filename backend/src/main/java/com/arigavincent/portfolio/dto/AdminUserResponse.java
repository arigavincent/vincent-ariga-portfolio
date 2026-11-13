package com.arigavincent.portfolio.dto;

import com.arigavincent.portfolio.entity.Role;

public record AdminUserResponse(String username, Role role) {}
