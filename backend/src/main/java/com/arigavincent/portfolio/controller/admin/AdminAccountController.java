package com.arigavincent.portfolio.controller.admin;

import com.arigavincent.portfolio.dto.AdminUserResponse;
import com.arigavincent.portfolio.security.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Admin: Account")
@RestController
@RequestMapping("/api/admin/me")
@RequiredArgsConstructor
public class AdminAccountController {

    private final AuthService authService;

    @Operation(summary = "Who am I signed in as?")
    @GetMapping
    public AdminUserResponse me(@AuthenticationPrincipal Jwt jwt) {
        return authService.currentUser(jwt.getSubject());
    }
}
