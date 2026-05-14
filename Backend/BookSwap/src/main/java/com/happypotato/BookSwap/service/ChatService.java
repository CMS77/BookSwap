package com.happypotato.BookSwap.service;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

@Service
public class ChatService {

    private final Map<Long, List<SseEmitter>> emitters = new ConcurrentHashMap<>();

    public SseEmitter subscribe(Long swapRequestId) {
        SseEmitter emitter = new SseEmitter(Long.MAX_VALUE);
        emitters.computeIfAbsent(swapRequestId, k -> new CopyOnWriteArrayList<>()).add(emitter);

        emitter.onCompletion(() -> remove(swapRequestId, emitter));
        emitter.onTimeout(() -> remove(swapRequestId, emitter));
        emitter.onError(e -> remove(swapRequestId, emitter));

        try {
            emitter.send(SseEmitter.event().comment("connected"));
        } catch (IOException e) {
            remove(swapRequestId, emitter);
        }

        return emitter;
    }

    public void broadcast(Long swapRequestId, String json) {
        List<SseEmitter> room = emitters.getOrDefault(swapRequestId, List.of());
        List<SseEmitter> dead = new ArrayList<>();

        for (SseEmitter emitter : room) {
            try {
                emitter.send(SseEmitter.event().data(json));
            } catch (IOException e) {
                dead.add(emitter);
            }
        }
        dead.forEach(e -> remove(swapRequestId, e));
    }

    @Scheduled(fixedDelay = 20000)
    public void heartbeat() {
        emitters.forEach((id, room) -> {
            List<SseEmitter> dead = new ArrayList<>();
            for (SseEmitter emitter : room) {
                try {
                    emitter.send(SseEmitter.event().comment("ping"));
                } catch (IOException e) {
                    dead.add(emitter);
                }
            }
            dead.forEach(e -> remove(id, e));
        });
    }

    private void remove(Long swapRequestId, SseEmitter emitter) {
        List<SseEmitter> list = emitters.get(swapRequestId);
        if (list != null) list.remove(emitter);
    }
}
