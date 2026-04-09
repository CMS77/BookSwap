package com.happypotato.BookSwap.model;

import jakarta.persistence.Table;

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

}
