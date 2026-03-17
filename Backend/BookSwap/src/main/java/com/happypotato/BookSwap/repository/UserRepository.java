package com.happypotato.BookSwap.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.happypotato.BookSwap.model.User;

public interface UserRepository extends JpaRepository<User, Long> {

}
