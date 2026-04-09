package com.happypotato.BookSwap.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;

import com.happypotato.BookSwap.repository.BookRepository;
import com.happypotato.BookSwap.repository.SwapRequestRepository;
import com.happypotato.BookSwap.repository.UserRepository;
import com.happypotato.BookSwap.exception.NotFoundException;
import com.happypotato.BookSwap.model.Book;
import com.happypotato.BookSwap.model.SwapRequest;
import com.happypotato.BookSwap.model.User;
import com.happypotato.BookSwap.security.JwtUtil;

import java.util.Optional;

@RestController
public class BookController {
    private final BookRepository repository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SwapRequestRepository swapRequestRepository;

    @Autowired
    private JwtUtil jwtUtil;

    BookController(BookRepository repository) {
        this.repository = repository;
    }

    @GetMapping("/books")
    List<Book> all() {
        return repository.findAll();
    }

    @PostMapping("/books")
    Book newBook(@RequestBody Book newBook,
            @RequestHeader("Authorization") String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        String username = jwtUtil.extractUsername(token);
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new NotFoundException(username));
        newBook.setUser(user);
        return repository.save(newBook);
    }

    @GetMapping("/books/{id}")
    Book one(@PathVariable long id) {

        return repository.findById(id)
                .orElseThrow(() -> new NotFoundException(String.valueOf(id)));
    }

    @PutMapping("/books/{id}")
    ResponseEntity<?> replaceBook(@RequestBody Book newBook, @PathVariable Long id,
                                  @RequestHeader("Authorization") String authHeader) {
        String username = jwtUtil.extractUsername(authHeader.replace("Bearer ", ""));
        return repository.findById(id)
                .map(book -> {
                    if (!book.getUser().getUsername().equals(username)) {
                        return ResponseEntity.status(403).body("You can only edit your own books.");
                    }
                    if (newBook.getTitulo() != null) book.setTitulo(newBook.getTitulo());
                    if (newBook.getAutor() != null) book.setAutor(newBook.getAutor());
                    if (newBook.getGenre() != null) book.setGenre(newBook.getGenre());
                    if (newBook.getBookCover() != null) book.setImageCapa(newBook.getBookCover());
                    return ResponseEntity.ok(repository.save(book));
                })
                .orElseThrow(() -> new NotFoundException(String.valueOf(id)));
    }

    @PutMapping("/books/{id}/borrow/{borrowerUsername}")
    ResponseEntity<?> borrowBook(@PathVariable Long id, @PathVariable String borrowerUsername) {
        Book book = repository.findById(id)
                .orElseThrow(() -> new NotFoundException(String.valueOf(id)));
        User borrower = userRepository.findByUsername(borrowerUsername)
                .orElseThrow(() -> new NotFoundException(borrowerUsername));
        book.setBorrowedBy(borrower);
        return ResponseEntity.ok(repository.save(book));
    }

    @PutMapping("/books/{id}/return")
    ResponseEntity<?> returnBook(@PathVariable Long id) {
        Book book = repository.findById(id)
                .orElseThrow(() -> new NotFoundException(String.valueOf(id)));
        book.setBorrowedBy(null);
        repository.save(book);

        swapRequestRepository.findByBookIdAndStatus(id, SwapRequest.Status.ACCEPTED)
                .ifPresent(req -> {
                    req.setStatus(SwapRequest.Status.COMPLETED);
                    swapRequestRepository.save(req);
                });

        return ResponseEntity.ok(repository.save(book));
    }

    @DeleteMapping("/books/{id}")
    ResponseEntity<?> deleteBook(@PathVariable Long id, @RequestHeader("Authorization") String authHeader) {
        String username = jwtUtil.extractUsername(authHeader.replace("Bearer ", ""));
        Book book = repository.findById(id).orElseThrow(() -> new NotFoundException(String.valueOf(id)));
        if (!book.getUser().getUsername().equals(username)) {
            return ResponseEntity.status(403).body("You can only delete your own books.");
        }
        if (book.getBorrowedBy() != null) {
            return ResponseEntity.badRequest().body("Cannot delete a book that is currently lent out.");
        }

        repository.deleteById(id);
        return ResponseEntity.ok("Book deleted.");
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
