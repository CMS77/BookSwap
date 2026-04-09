package com.happypotato.BookSwap.controller;

import java.util.List;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.happypotato.BookSwap.repository.BookRepository;
import com.happypotato.BookSwap.exception.NotFoundException;
import com.happypotato.BookSwap.model.Book;

@RestController
public class BookController {
    private final BookRepository repository;

    BookController(BookRepository repository) {
        this.repository = repository;
    }

    @GetMapping("/books")
    List<Book> all() {
        return repository.findAll();
    }

    @PostMapping("/books")
    Book newBook(@RequestBody Book newBook) {
        return repository.save(newBook);
    }

    @GetMapping("/books/{id}")
    Book one(@PathVariable long id) {

        return repository.findById(id)
                .orElseThrow(() -> new NotFoundException(String.valueOf(id)));
    }

    @PutMapping("/books/{id}")
    Book replaceBook(@RequestBody Book newBook, @PathVariable Long id) {

        return repository.findById(id)
                .map(book -> {
                    book.setImageCapa(newBook.getBookCover());
                    book.setDisponibilidade(newBook.getDisponibilidade());
                    return repository.save(book);
                })
                .orElseGet(() -> {
                    return repository.save(newBook);
                });
    }

    @DeleteMapping("/books/{id}")
    String deleteBook(@PathVariable Long id) {
        Book book = repository.findById(id)
                .orElseThrow(() -> new NotFoundException(String.valueOf(id)));
        repository.deleteById(id);

        return "book " + book.getTitulo() + " deleted";
    }

    @GetMapping("/books/{id}/cover")
    ResponseEntity<byte[]> getCover(@PathVariable Long id) {
        Book book = repository.findById(id)
                .orElseThrow(() -> new NotFoundException(String.valueOf(id)));

        byte[] cover = book.getBookCover();
        if (cover == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok()
                .contentType(MediaType.IMAGE_JPEG)
                .body(cover);
    }
}
