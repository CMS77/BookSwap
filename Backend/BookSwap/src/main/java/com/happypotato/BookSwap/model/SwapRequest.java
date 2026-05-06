package com.happypotato.BookSwap.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "swap_request")
public class SwapRequest {

    public enum Status {
        PENDING, ACCEPTED, REJECTED, COMPLETED
    }

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private long id;

    @ManyToOne
    @JoinColumn(name = "book_id")
    private Book book;

    @ManyToOne
    @JoinColumn(name = "requester_id")
    private User requester;

    @Enumerated(EnumType.STRING)
    @Column(columnDefinition = "VARCHAR(20)")
    private Status status = Status.PENDING;

    private LocalDateTime createdAt = LocalDateTime.now();

    public SwapRequest() {
    }

    public long getId() {
        return id;
    }

    public Book getBook() {
        return book;
    }

    public void setBook(Book book) {
        this.book = book;
    }

    public User getRequester() {
        return requester;
    }

    public void setRequester(User requester) {
        this.requester = requester;
    }

    public Status getStatus() {
        return status;
    }

    public void setStatus(Status status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
