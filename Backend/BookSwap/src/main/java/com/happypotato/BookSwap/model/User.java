package com.happypotato.BookSwap.model;

import java.util.Set;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.Transient;

import java.util.HashSet;

import jakarta.persistence.Table;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Lob;
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

    @Column(unique = true, nullable = false)
    private String username;

    private String password;
    @Lob
    @Column(name = "foto_user", columnDefinition = "LONGBLOB")
    private byte[] profilePhoto;
    @Column(name = "localizacao")
    private String location;
    private String bio;
    private Double rating = 0.0;
    
    @OneToMany(mappedBy = "user")
    private Set<Book> books = new HashSet<>();

    public User() {

    }

    public User(String name, String username, String password, byte[] profilePhoto, String location, String bio,
            Double rating) {
        this.name = name;
        this.username = username;
        this.password = password;
        this.profilePhoto = profilePhoto;
        this.location = location;
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
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    public String getPassword() {
        return password;
    }

    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    public byte[] getProfilePhoto() {
        return profilePhoto;
    }

    @Transient
    @JsonProperty("profilePhotoUrl")
    public String getProfilePhotoUrl() {
        if (profilePhoto != null) {
            return "/users/" + username + "/photo";
        }
        return null;
    }

    public String getLocation() {
        return location;
    }

    public String getBio() {
        return bio;
    }

    public Double getRating() {
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

    public void setPassword(String password) {
        this.password = password;
    }

    public void setProfilePhoto(byte[] profilePhoto) {
        this.profilePhoto = profilePhoto;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

    public void setRating(Double rating) {
        this.rating = rating;
    }

}
