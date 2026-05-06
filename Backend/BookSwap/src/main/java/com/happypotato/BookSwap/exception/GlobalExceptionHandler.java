package com.happypotato.BookSwap.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<String> handleMessageNotReadable(HttpMessageNotReadableException ex) {
        String cause = ex.getMostSpecificCause().getMessage();
        System.err.println("[GlobalExceptionHandler] HttpMessageNotReadableException: " + cause);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("JSON parse error: " + cause);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<String> handleGeneral(Exception ex) {
        System.err.println("[GlobalExceptionHandler] 500: " + ex.getClass().getSimpleName() + ": " + ex.getMessage());
        ex.printStackTrace();
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ex.getClass().getSimpleName() + ": " + ex.getMessage());
    }
}
