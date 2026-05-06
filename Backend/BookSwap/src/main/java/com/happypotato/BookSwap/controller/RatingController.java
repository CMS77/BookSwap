package com.happypotato.BookSwap.controller;

import com.happypotato.BookSwap.exception.NotFoundException;
import com.happypotato.BookSwap.model.Rating;
import com.happypotato.BookSwap.model.SwapRequest;
import com.happypotato.BookSwap.model.User;
import com.happypotato.BookSwap.repository.RatingRepository;
import com.happypotato.BookSwap.repository.SwapRequestRepository;
import com.happypotato.BookSwap.repository.UserRepository;
import com.happypotato.BookSwap.security.JwtUtil;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/ratings")
@CrossOrigin(origins = "*")
public class RatingController {

    @Autowired private RatingRepository ratingRepository;
    @Autowired private SwapRequestRepository swapRequestRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private JwtUtil jwtUtil;

    @GetMapping("/my-rated-swaps")
    List<Long> getMyRatedSwaps(@RequestHeader("Authorization") String authHeader) {
        String username = jwtUtil.extractUsername(authHeader.replace("Bearer ", ""));
        User rater = userRepository.findByUsername(username)
                .orElseThrow(() -> new NotFoundException(username));
        return ratingRepository.findSwapRequestIdsByRaterId(rater.getId());
    }

    @PostMapping
    ResponseEntity<?> submitRating(@RequestBody Map<String, Object> body,
                                   @RequestHeader("Authorization") String authHeader) {
        String raterUsername = jwtUtil.extractUsername(authHeader.replace("Bearer ", ""));
        long swapRequestId = ((Number) body.get("swapRequestId")).longValue();
        int score = ((Number) body.get("score")).intValue();
        String comment = (String) body.getOrDefault("comment", null);

        if (score < 1 || score > 5) {
            return ResponseEntity.badRequest().body("Score must be between 1 and 5.");
        }

        SwapRequest swap = swapRequestRepository.findById(swapRequestId)
                .orElseThrow(() -> new NotFoundException(String.valueOf(swapRequestId)));

        if (swap.getStatus() != SwapRequest.Status.COMPLETED) {
            return ResponseEntity.badRequest().body("Can only rate completed swaps.");
        }

        User rater = userRepository.findByUsername(raterUsername)
                .orElseThrow(() -> new NotFoundException(raterUsername));

        if (!swap.getBook().getUser().getUsername().equals(raterUsername)) {
            return ResponseEntity.status(403).body("Only the book owner can submit a rating.");
        }

        if (ratingRepository.existsBySwapRequestIdAndRaterId(swapRequestId, rater.getId())) {
            return ResponseEntity.badRequest().body("You have already rated this swap.");
        }

        User rated = swap.getRequester();

        Rating rating = new Rating();
        rating.setRater(rater);
        rating.setRated(rated);
        rating.setSwapRequest(swap);
        rating.setScore(score);
        rating.setComment(comment);
        ratingRepository.save(rating);

        Double avg = ratingRepository.findAverageScoreByRatedId(rated.getId());
        rated.setRating(avg != null ? Math.round(avg * 10.0) / 10.0 : 0.0);
        userRepository.save(rated);

        return ResponseEntity.ok("Rating submitted.");
    }
}
