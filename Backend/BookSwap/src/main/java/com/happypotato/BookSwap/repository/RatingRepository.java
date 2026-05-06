package com.happypotato.BookSwap.repository;

import com.happypotato.BookSwap.model.Rating;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface RatingRepository extends JpaRepository<Rating, Long> {
    boolean existsBySwapRequestIdAndRaterId(long swapRequestId, long raterId);

    java.util.List<Rating> findByRatedUsernameOrderByCreatedAtDesc(String username);

    @Query("SELECT AVG(r.score) FROM Rating r WHERE r.rated.id = :userId")
    Double findAverageScoreByRatedId(@Param("userId") long userId);

    @Query("SELECT r.swapRequest.id FROM Rating r WHERE r.rater.id = :raterId")
    java.util.List<Long> findSwapRequestIdsByRaterId(@Param("raterId") long raterId);
}
