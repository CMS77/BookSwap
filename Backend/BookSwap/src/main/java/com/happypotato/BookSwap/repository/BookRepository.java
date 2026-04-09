package com.happypotato.BookSwap.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.happypotato.BookSwap.model.Book;

public interface BookRepository extends JpaRepository<Book, Long> {
    List<Book> findByUserUsername(String username);
    List<Book> findByUserUsernameAndBorrowedByIsNull(String username);
    List<Book> findByUserUsernameAndBorrowedByIsNotNull(String username);
    List<Book> findByBorrowedByUsername(String username);
}
