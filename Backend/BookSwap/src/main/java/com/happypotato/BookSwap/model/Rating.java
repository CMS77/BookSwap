package com.happypotato.BookSwap.model;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "rating")
public class Rating {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private long id;

    @ManyToOne
    @JoinColumn(name = "rater_id")
    private User rater;

    @ManyToOne
    @JoinColumn(name = "rated_id")
    private User rated;

    @JsonIgnore
    @ManyToOne
    @JoinColumn(name = "swap_request_id")
    private SwapRequest swapRequest;

    private int score;
    private String comment;
    private LocalDateTime createdAt = LocalDateTime.now();

    public Rating() {
    }

    public long getId() {
        return id;
    }

    public User getRater() {
        return rater;
    }

    public void setRater(User rater) {
        this.rater = rater;
    }

    public User getRated() {
        return rated;
    }

    public void setRated(User rated) {
        this.rated = rated;
    }

    public SwapRequest getSwapRequest() {
        return swapRequest;
    }

    public void setSwapRequest(SwapRequest swapRequest) {
        this.swapRequest = swapRequest;
    }

    public int getScore() {
        return score;
    }

    public void setScore(int score) {
        this.score = score;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
