package com.happypotato.BookSwap.model;

import jakarta.persistence.Table;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
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
    private byte[] imagemCapa;
    private boolean disponibilidade;
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    public Book() {

    }

    public Book(String titulo, String autor, byte[] imagemCapa, boolean disponibilidade) {
        this.titulo = titulo;
        this.autor = autor;
        this.imagemCapa = imagemCapa;
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

    public byte[] getImageCapa() {
        return imagemCapa;
    }

    public boolean getDisponibilidade() {
        return disponibilidade;
    }

    public void setTitulo(String titulo) {
        this.titulo = titulo;
    }

    public void setAutor(String autor) {
        this.autor = autor;
    }

    public void setImageCapa(byte[] imagemCapa) {
        this.imagemCapa = imagemCapa;
    }

    public void setDisponibilidade(boolean disponibilidade) {
        this.disponibilidade = disponibilidade;
    }

}
