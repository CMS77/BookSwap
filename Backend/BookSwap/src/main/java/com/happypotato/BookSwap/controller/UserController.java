package com.happypotato.BookSwap.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;

import com.happypotato.BookSwap.model.User;
import com.happypotato.BookSwap.exception.NotFoundException;
import com.happypotato.BookSwap.repository.UserRepository;

@RestController
@RequestMapping("/users")
@CrossOrigin(origins = "*")
public class UserController {

    private final UserRepository repository;

    UserController(@Autowired UserRepository repository) {
        this.repository = repository;
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

    @PutMapping("/{id}")
    User replaceUser(@RequestBody User newUser, @PathVariable Long id) {

        return repository.findById(id)
                .map(user -> {
                    user.setName(newUser.getName());
                    user.setProfilePhoto(newUser.getProfilePhoto());
                    user.setBio(newUser.getBio());
                    user.setLocation(newUser.getLocation());
                    return repository.save(user);
                })
                .orElseGet(() -> {
                    return repository.save(newUser);
                });
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
}