package com.happypotato.BookSwap.repository;

import com.happypotato.BookSwap.model.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {
    List<Message> findBySwapRequestIdOrderBySentAtAsc(Long swapRequestId);
    List<Message> findBySwapRequestIdAndIdGreaterThanOrderBySentAtAsc(Long swapRequestId, Long sinceId);
    java.util.Optional<Message> findTopBySwapRequestIdOrderBySentAtDesc(Long swapRequestId);
}
