package com.happypotato.BookSwap.controller;

import java.util.List;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.happypotato.BookSwap.model.User;
import com.happypotato.BookSwap.exception.NotFoundException;
import com.happypotato.BookSwap.repository.UserRepository;

@RestController
public class UserController {

    private final UserRepository repository;

    UserController(UserRepository repository) {
        this.repository = repository;
    }

    @GetMapping("/users")
    List<User> all() {
        return repository.findAll();
    }

    @PostMapping("/users")
    User newUser(@RequestBody User newUser) {
        return repository.save(newUser);
    }

    @GetMapping("/users/{id}")
    User one(@PathVariable long id) {

        return repository.findById(id)
                .orElseThrow(() -> new NotFoundException(id));
    }

    @PutMapping("/users/{id}")
    User replaceUser(@RequestBody User newUser, @PathVariable Long id) {

        return repository.findById(id)
                .map(user -> {
                    user.setName(newUser.getName());
                    user.setFotoUser(newUser.getFotoUser());
                    user.setBio(newUser.getBio());
                    user.setLocalizacao(newUser.getLocalizacao());
                    return repository.save(user);
                })
                .orElseGet(() -> {
                    return repository.save(newUser);
                });
    }

    @DeleteMapping("/users/{id}")
    String deleteUser(@PathVariable Long id) {
        User user =repository.findById(id)
                .orElseThrow(() -> new NotFoundException(id));
        repository.deleteById(id);
        return "User " + user.getName() + " deleted.";
    }

}
