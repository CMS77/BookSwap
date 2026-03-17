package com.happypotato.BookSwap.model;

import java.util.Set;

import com.fasterxml.jackson.annotation.JsonIgnore;

import java.util.HashSet;

import jakarta.persistence.Table;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;

@Entity
@Table(name = "user")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "user_id")
    private long id;
    private String name;
    private String username;
    private byte[] password;
    private byte[] fotoUser;
    private String localizacao;
    private String bio;
    private double rating;
    @OneToMany(mappedBy = "user")
    private Set<Book> books = new HashSet<>();
    

    public User() {

    }

    public User(String name, String username, byte[] password, byte[] fotoUser, String localizacao, String bio,
            double rating) {
        this.name = name;
        this.username = username;
        this.password = password;
        this.fotoUser = fotoUser;
        this.localizacao = localizacao;
        this.bio = bio;
        this.rating = rating;
    }

    public long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getUsername() {
        return username;
    }
    @JsonIgnore
    public byte[] getPassword() {
        return password;
    }

    public byte[] getFotoUser() {
        return fotoUser;
    }

    public String getLocalizacao() {
        return localizacao;
    }

    public String getBio() {
        return bio;
    }

    public double getRating() {
        return rating;
    }

    public void setId(long id) {
        this.id = id;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public void setPassword(byte[] password) {
        this.password = password;
    }

    public void setFotoUser(byte[] fotoUser) {
        this.fotoUser = fotoUser;
    }

    public void setLocalizacao(String localizacao) {
        this.localizacao = localizacao;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

    public void setRating(double rating) {
        this.rating = rating;
    }
    

}
