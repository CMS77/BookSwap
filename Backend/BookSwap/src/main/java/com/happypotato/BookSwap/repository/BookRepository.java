package com.happypotato.BookSwap.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.happypotato.BookSwap.model.Book;

public interface BookRepository extends JpaRepository<Book, Long> {

}
