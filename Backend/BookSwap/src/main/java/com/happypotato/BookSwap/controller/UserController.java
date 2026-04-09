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
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;

import com.happypotato.BookSwap.model.Book;
import com.happypotato.BookSwap.model.User;
import com.happypotato.BookSwap.exception.NotFoundException;
import com.happypotato.BookSwap.repository.BookRepository;
import com.happypotato.BookSwap.repository.UserRepository;

@RestController
@RequestMapping("/users")
@CrossOrigin(origins = "*")
public class UserController {

    private final UserRepository repository;
    private final BookRepository bookRepository;

    UserController(@Autowired UserRepository repository, @Autowired BookRepository bookRepository) {
        this.repository = repository;
        this.bookRepository = bookRepository;
    }

    @GetMapping
    List<User> all() {
        List<User> all = repository.findAll();
        return all;
    }

    @PostMapping
    User newUser(@RequestBody User newUser) {
        return repository.save(newUser);
    }

    @PutMapping("/{username}")
    User replaceUser(@RequestBody User newUser, @PathVariable String username) {

        return repository.findByUsername(username)
                .map(user -> {
                    if (newUser.getName() != null) user.setName(newUser.getName());
                    if (newUser.getProfilePhoto() != null) user.setProfilePhoto(newUser.getProfilePhoto());
                    if (newUser.getBio() != null) user.setBio(newUser.getBio());
                    if (newUser.getLocation() != null) user.setLocation(newUser.getLocation());
                    return repository.save(user);
                })
                .orElseThrow(() -> new NotFoundException(username));
    }

    @DeleteMapping("/{id}")
    String deleteUser(@PathVariable Long id) {
        User user =repository.findById(id)
                .orElseThrow(() -> new NotFoundException(String.valueOf(id)));
        repository.deleteById(id);
        return "User " + user.getName() + " deleted.";
    }

    @GetMapping("/{username}")
    User one(@PathVariable String username) {

        return repository.findByUsername(username)
                .orElseThrow(() -> new NotFoundException(username));
    }

    @GetMapping("/{username}/books")
    List<Book> getUserBooks(@PathVariable String username) {
        return bookRepository.findByUserUsernameAndBorrowedByIsNull(username);
    }

    @GetMapping("/{username}/books/lent")
    List<Book> getLentBooks(@PathVariable String username) {
        return bookRepository.findByUserUsernameAndBorrowedByIsNotNull(username);
    }

    @GetMapping("/{username}/books/borrowed")
    List<Book> getBorrowedBooks(@PathVariable String username) {
        return bookRepository.findByBorrowedByUsername(username);
    }

    @GetMapping("/{username}/photo")
    ResponseEntity<byte[]> getPhoto(@PathVariable String username) {
        User user = repository.findByUsername(username)
                .orElseThrow(() -> new NotFoundException(username));

        byte[] photo = user.getProfilePhoto();
        if (photo == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok()
                .contentType(MediaType.IMAGE_JPEG)
                .body(photo);
    }
}