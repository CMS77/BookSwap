package com.happypotato.BookSwap.repository;

import com.happypotato.BookSwap.model.SwapRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SwapRequestRepository extends JpaRepository<SwapRequest, Long> {
    List<SwapRequest> findByBookUserUsername(String username);
    List<SwapRequest> findByRequesterUsername(String username);
    boolean existsByBookIdAndRequesterUsernameAndStatus(long bookId, String username, SwapRequest.Status status);
    java.util.List<SwapRequest> findAllByBookIdAndStatus(long bookId, SwapRequest.Status status);
    java.util.List<SwapRequest> findByBookUserUsernameAndStatus(String username, SwapRequest.Status status);
    java.util.List<SwapRequest> findByRequesterUsernameAndStatus(String username, SwapRequest.Status status);
}
