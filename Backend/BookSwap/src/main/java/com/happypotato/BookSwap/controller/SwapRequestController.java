package com.happypotato.BookSwap.controller;

import com.happypotato.BookSwap.exception.NotFoundException;
import com.happypotato.BookSwap.model.Book;
import com.happypotato.BookSwap.model.SwapRequest;
import com.happypotato.BookSwap.model.User;
import com.happypotato.BookSwap.repository.BookRepository;
import com.happypotato.BookSwap.repository.SwapRequestRepository;
import com.happypotato.BookSwap.repository.UserRepository;
import com.happypotato.BookSwap.security.JwtUtil;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/requests")
@CrossOrigin(origins = "*")
public class SwapRequestController {

    @Autowired
    private SwapRequestRepository swapRequestRepository;
    @Autowired
    private BookRepository bookRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping
    ResponseEntity<?> createRequest(@RequestBody Map<String, Long> body,
            @RequestHeader("Authorization") String authHeader) {
        String username = jwtUtil.extractUsername(authHeader.replace("Bearer ", ""));
        Long bookId = body.get("bookId");

        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new NotFoundException(String.valueOf(bookId)));

        if (book.getUser().getUsername().equals(username)) {
            return ResponseEntity.badRequest().body("You cannot request your own book.");
        }
        if (book.getBorrowedBy() != null) {
            return ResponseEntity.badRequest().body("Book is not available.");
        }
        if (swapRequestRepository.existsByBookIdAndRequesterUsernameAndStatus(bookId, username,
                SwapRequest.Status.PENDING)) {
            return ResponseEntity.badRequest().body("You already have a pending request for this book.");
        }

        User requester = userRepository.findByUsername(username)
                .orElseThrow(() -> new NotFoundException(username));

        SwapRequest request = new SwapRequest();
        request.setBook(book);
        request.setRequester(requester);

        return ResponseEntity.ok(swapRequestRepository.save(request));
    }

    @GetMapping("/received")
    List<SwapRequest> received(@RequestHeader("Authorization") String authHeader) {
        String username = jwtUtil.extractUsername(authHeader.replace("Bearer ", ""));
        return swapRequestRepository.findByBookUserUsername(username);
    }

    @GetMapping("/sent")
    List<SwapRequest> sent(@RequestHeader("Authorization") String authHeader) {
        String username = jwtUtil.extractUsername(authHeader.replace("Bearer ", ""));
        return swapRequestRepository.findByRequesterUsername(username);
    }

    @PutMapping("/{id}/accept")
    ResponseEntity<?> accept(@PathVariable Long id,
            @RequestHeader("Authorization") String authHeader) {
        String username = jwtUtil.extractUsername(authHeader.replace("Bearer ", ""));
        SwapRequest req = swapRequestRepository.findById(id)
                .orElseThrow(() -> new NotFoundException(String.valueOf(id)));

        if (!req.getBook().getUser().getUsername().equals(username)) {
            return ResponseEntity.status(403).body("Only the book owner can accept requests.");
        }

        req.setStatus(SwapRequest.Status.ACCEPTED);
        req.getBook().setBorrowedBy(req.getRequester());
        bookRepository.save(req.getBook());

        // Rejeitar outros pedidos pendentes para o mesmo livro
        swapRequestRepository.findByBookUserUsername(username).stream()
                .filter(r -> r.getBook().getId() == req.getBook().getId()
                        && r.getStatus() == SwapRequest.Status.PENDING
                        && r.getId() != req.getId())
                .forEach(r -> {
                    r.setStatus(SwapRequest.Status.REJECTED);
                    swapRequestRepository.save(r);
                });

        return ResponseEntity.ok(swapRequestRepository.save(req));
    }

    @PutMapping("/{id}/reject")
    ResponseEntity<?> reject(@PathVariable Long id,
            @RequestHeader("Authorization") String authHeader) {
        String username = jwtUtil.extractUsername(authHeader.replace("Bearer ", ""));
        SwapRequest req = swapRequestRepository.findById(id)
                .orElseThrow(() -> new NotFoundException(String.valueOf(id)));

        if (!req.getBook().getUser().getUsername().equals(username)) {
            return ResponseEntity.status(403).body("Only the book owner can reject requests.");
        }

        req.setStatus(SwapRequest.Status.REJECTED);
        return ResponseEntity.ok(swapRequestRepository.save(req));
    }

    @GetMapping("/completed/as-owner")
    List<SwapRequest> completedAsOwner(@RequestHeader("Authorization") String authHeader) {
        String username = jwtUtil.extractUsername(authHeader.replace("Bearer ", ""));
        return swapRequestRepository.findByBookUserUsernameAndStatus(username, SwapRequest.Status.COMPLETED);
    }

    @GetMapping("/completed/as-borrower")
    List<SwapRequest> completedAsBorrower(@RequestHeader("Authorization") String authHeader) {
        String username = jwtUtil.extractUsername(authHeader.replace("Bearer ", ""));
        return swapRequestRepository.findByRequesterUsernameAndStatus(username, SwapRequest.Status.COMPLETED);
    }
}
