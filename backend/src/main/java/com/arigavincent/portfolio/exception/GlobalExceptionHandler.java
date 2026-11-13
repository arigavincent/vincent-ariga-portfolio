package com.arigavincent.portfolio.exception;

import com.arigavincent.portfolio.dto.ApiError;
import com.arigavincent.portfolio.dto.ApiError.FieldViolation;
import java.util.List;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.Nullable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.ServletWebRequest;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

/** Turns every failure, ours or Spring MVC's, into the same {@link ApiError} JSON. */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler extends ResponseEntityExceptionHandler {

    @ExceptionHandler(ApiException.class)
    public ResponseEntity<Object> handleApiException(ApiException exception, WebRequest request) {
        HttpHeaders headers = new HttpHeaders();
        if (exception instanceof RateLimitExceededException rateLimit) {
            headers.set(
                    HttpHeaders.RETRY_AFTER,
                    String.valueOf(Math.max(1, rateLimit.getRetryAfter().toSeconds())));
        }
        return respond(exception.getStatus(), exception.getMessage(), List.of(), headers, request);
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<Object> handleTypeMismatch(
            MethodArgumentTypeMismatchException exception, WebRequest request) {
        String message = "'%s' is not a valid value for '%s'".formatted(exception.getValue(), exception.getName());
        return respond(HttpStatus.BAD_REQUEST, message, List.of(), new HttpHeaders(), request);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Object> handleDataIntegrity(DataIntegrityViolationException exception, WebRequest request) {
        log.warn(
                "Rejected a write that broke a database constraint: {}",
                exception.getMostSpecificCause().getMessage());
        return respond(
                HttpStatus.CONFLICT,
                "That conflicts with something that already exists.",
                List.of(),
                new HttpHeaders(),
                request);
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<Object> handleAuthentication(AuthenticationException exception, WebRequest request) {
        return respond(HttpStatus.UNAUTHORIZED, "Authentication is required.", List.of(), new HttpHeaders(), request);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Object> handleAccessDenied(AccessDeniedException exception, WebRequest request) {
        return respond(HttpStatus.FORBIDDEN, "You do not have access to this.", List.of(), new HttpHeaders(), request);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Object> handleUnexpected(Exception exception, WebRequest request) {
        log.error("Unhandled exception for {}", path(request), exception);
        return respond(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "Something went wrong on our side. Please try again.",
                List.of(),
                new HttpHeaders(),
                request);
    }

    @Override
    protected ResponseEntity<Object> handleMethodArgumentNotValid(
            MethodArgumentNotValidException exception, HttpHeaders headers, HttpStatusCode status, WebRequest request) {
        List<FieldViolation> violations = exception.getBindingResult().getFieldErrors().stream()
                .map(error -> new FieldViolation(error.getField(), error.getDefaultMessage()))
                .toList();
        return respond(status, "Some fields need another look.", violations, headers, request);
    }

    @Override
    protected ResponseEntity<Object> handleExceptionInternal(
            Exception exception,
            @Nullable Object body,
            HttpHeaders headers,
            HttpStatusCode status,
            WebRequest request) {
        String message = body instanceof ProblemDetail problem && problem.getDetail() != null
                ? problem.getDetail()
                : exception.getMessage();
        return respond(status, message, List.of(), headers, request);
    }

    private ResponseEntity<Object> respond(
            HttpStatusCode status,
            String message,
            List<FieldViolation> violations,
            HttpHeaders headers,
            WebRequest request) {
        return ResponseEntity.status(status)
                .headers(headers)
                .body(ApiError.of(status, message, path(request), violations));
    }

    private static String path(WebRequest request) {
        return request instanceof ServletWebRequest servlet
                ? servlet.getRequest().getRequestURI()
                : "";
    }
}
