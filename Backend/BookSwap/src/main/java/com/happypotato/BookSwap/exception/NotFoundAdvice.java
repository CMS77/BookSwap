package com.happypotato.BookSwap.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

public class NotFoundAdvice {

    @RestControllerAdvice
    class notFoundAdvice {

        @ExceptionHandler(NotFoundException.class)
        @ResponseStatus(HttpStatus.NOT_FOUND)
        String NotFoundHandler(NotFoundException ex) {
            return ex.getMessage();
        }
    }

}