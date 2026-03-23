package com.happypotato.BookSwap.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.happypotato.BookSwap.model.User;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    boolean existsByUsername(String username);

}
