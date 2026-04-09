package com.happypotato.BookSwap.model;

import jakarta.persistence.Table;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.Transient;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;

@Entity
@Table(name = "book")
public class Book {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "book_id")
    private long id;
    private String titulo;
    private String autor;
    @Lob
    @Column(name = "book_cover", columnDefinition = "LONGBLOB")
    private byte[] bookCover;
    private boolean disponibilidade;
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "borrowed_by_id")
    private User borrowedBy;

    private String genre;

    public Book() {

    }

    public Book(String titulo, String autor, byte[] bookCover, boolean disponibilidade) {
        this.titulo = titulo;
        this.autor = autor;
        this.bookCover = bookCover;
        this.disponibilidade = disponibilidade;

    }

    public long getId() {
        return id;
    }

    public String getTitulo() {
        return titulo;
    }

    public String getAutor() {
        return autor;
    }

    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    public byte[] getBookCover() {
        return bookCover;
    }

    @Transient
    @JsonProperty("bookCoverUrl")
    public String getBookCoverUrl() {
        if (bookCover != null) {
            return "/books/" + id + "/cover";
        }
        return null;
    }

    @JsonIgnore
    public boolean getDisponibilidade() {
        return disponibilidade;
    }

    public String getGenre() {
        return genre;
    }

    public void setTitulo(String titulo) {
        this.titulo = titulo;
    }

    public void setAutor(String autor) {
        this.autor = autor;
    }

    public void setImageCapa(byte[] bookCover) {
        this.bookCover = bookCover;
    }

    public void setDisponibilidade(boolean disponibilidade) {
        this.disponibilidade = disponibilidade;
    }

    public void setGenre(String genre) {
        this.genre = genre;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public User getBorrowedBy() {
        return borrowedBy;
    }

    public void setBorrowedBy(User borrowedBy) {
        this.borrowedBy = borrowedBy;
        this.disponibilidade = (borrowedBy == null);
    }

}
