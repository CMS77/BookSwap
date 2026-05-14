package com.happypotato.BookSwap.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.happypotato.BookSwap.model.Message;
import com.happypotato.BookSwap.model.SwapRequest;
import com.happypotato.BookSwap.repository.MessageRepository;
import com.happypotato.BookSwap.repository.SwapRequestRepository;
import com.happypotato.BookSwap.security.JwtUtil;
import com.happypotato.BookSwap.service.ChatService;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/messages")
@CrossOrigin(origins = "*")
public class MessageController {

    @Autowired private MessageRepository messageRepository;
    @Autowired private SwapRequestRepository swapRequestRepository;
    @Autowired private JwtUtil jwtUtil;
    @Autowired private ChatService chatService;

    private final ObjectMapper mapper = new ObjectMapper();

    @GetMapping(value = "/stream/{swapRequestId}", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter stream(@PathVariable Long swapRequestId,
                              @RequestParam String token,
                              HttpServletResponse response) throws IOException {
        if (!jwtUtil.validateToken(token)) {
            response.sendError(401);
            return null;
        }
        String username = jwtUtil.extractUsername(token);
        SwapRequest request = swapRequestRepository.findById(swapRequestId).orElse(null);
        if (request == null) { response.sendError(404); return null; }
        if (!isParticipant(request, username)) { response.sendError(403); return null; }

        return chatService.subscribe(swapRequestId);
    }

    @PostMapping("/{swapRequestId}")
    public ResponseEntity<?> sendMessage(@PathVariable Long swapRequestId,
                                          @RequestBody Map<String, String> body,
                                          @RequestHeader("Authorization") String authHeader) throws Exception {
        String username = jwtUtil.extractUsername(authHeader.replace("Bearer ", ""));
        String content = body.get("content");

        if (content == null || content.trim().isEmpty())
            return ResponseEntity.badRequest().body("Content is required");

        SwapRequest request = swapRequestRepository.findById(swapRequestId).orElse(null);
        if (request == null) return ResponseEntity.notFound().build();
        if (!isParticipant(request, username)) return ResponseEntity.status(403).body("Not authorized");

        Message message = new Message();
        message.setSwapRequestId(swapRequestId);
        message.setSenderUsername(username);
        message.setContent(content.trim());
        message.setSentAt(LocalDateTime.now());
        messageRepository.save(message);

        Map<String, Object> payload = buildPayload(message);
        chatService.broadcast(swapRequestId, mapper.writeValueAsString(payload));

        return ResponseEntity.ok(payload);
    }

    @GetMapping("/active-chats")
    public ResponseEntity<?> getActiveChats(@RequestHeader("Authorization") String authHeader) {
        String username = jwtUtil.extractUsername(authHeader.replace("Bearer ", ""));

        List<SwapRequest> requests = new ArrayList<>();
        requests.addAll(swapRequestRepository.findByBookUserUsernameAndStatus(username, SwapRequest.Status.PENDING));
        requests.addAll(swapRequestRepository.findByBookUserUsernameAndStatus(username, SwapRequest.Status.ACCEPTED));
        requests.addAll(swapRequestRepository.findByRequesterUsernameAndStatus(username, SwapRequest.Status.PENDING));
        requests.addAll(swapRequestRepository.findByRequesterUsernameAndStatus(username, SwapRequest.Status.ACCEPTED));

        List<Map<String, Object>> result = new ArrayList<>();
        for (SwapRequest req : requests) {
            Optional<Message> lastMsg = messageRepository.findTopBySwapRequestIdOrderBySentAtDesc(req.getId());

            String otherUser = username.equals(req.getBook().getUser().getUsername())
                ? req.getRequester().getUsername()
                : req.getBook().getUser().getUsername();

            Map<String, Object> item = new LinkedHashMap<>();
            item.put("requestId", req.getId());
            item.put("bookTitle", req.getBook().getTitulo());
            item.put("otherUser", otherUser);
            item.put("status", req.getStatus().toString());
            item.put("createdAt", req.getCreatedAt().toString());

            if (lastMsg.isPresent()) {
                Message msg = lastMsg.get();
                item.put("lastMessageId", msg.getId());
                item.put("lastSenderUsername", msg.getSenderUsername());
                item.put("lastContent", msg.getContent());
                item.put("lastSentAt", msg.getSentAt().toString());
            } else {
                item.put("lastMessageId", 0);
                item.put("lastSenderUsername", null);
                item.put("lastContent", null);
                item.put("lastSentAt", null);
            }

            result.add(item);
        }

        return ResponseEntity.ok(result);
    }

    @GetMapping("/{swapRequestId}")
    public ResponseEntity<?> getHistory(@PathVariable Long swapRequestId,
                                         @RequestParam(defaultValue = "0") Long since,
                                         @RequestHeader("Authorization") String authHeader) {
        String username = jwtUtil.extractUsername(authHeader.replace("Bearer ", ""));
        SwapRequest request = swapRequestRepository.findById(swapRequestId).orElse(null);
        if (request == null) return ResponseEntity.notFound().build();
        if (!isParticipant(request, username)) return ResponseEntity.status(403).body("Not authorized");

        List<Message> messages = since > 0
            ? messageRepository.findBySwapRequestIdAndIdGreaterThanOrderBySentAtAsc(swapRequestId, since)
            : messageRepository.findBySwapRequestIdOrderBySentAtAsc(swapRequestId);

        List<Map<String, Object>> result = new ArrayList<>();
        for (Message m : messages) result.add(buildPayload(m));

        return ResponseEntity.ok(result);
    }

    private boolean isParticipant(SwapRequest request, String username) {
        return username.equals(request.getBook().getUser().getUsername())
            || username.equals(request.getRequester().getUsername());
    }

    private Map<String, Object> buildPayload(Message m) {
        Map<String, Object> item = new LinkedHashMap<>();
        item.put("id", m.getId());
        item.put("senderUsername", m.getSenderUsername());
        item.put("content", m.getContent());
        item.put("sentAt", m.getSentAt().toString());
        return item;
    }
}
