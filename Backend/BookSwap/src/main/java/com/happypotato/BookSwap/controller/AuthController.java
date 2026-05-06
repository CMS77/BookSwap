package com.happypotato.BookSwap.controller;

import com.happypotato.BookSwap.model.User;
import com.happypotato.BookSwap.repository.UserRepository;
import com.happypotato.BookSwap.security.JwtUtil;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        if (userRepository.existsByUsername(user.getUsername())) {
            return ResponseEntity.badRequest().body("Username already taken");
        }
        user.setPassword(encoder.encode(user.getPassword()));
        userRepository.save(user);
        return ResponseEntity.ok("User registered successfully");
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        String username = body.get("username");
        String password = body.get("password");

        Optional<User> userOpt = userRepository.findByUsername(username);
        //User user = userRepository.getById(userOpt.get().getId());
        if (userOpt.isEmpty() || !encoder.matches(password, userOpt.get().getPassword())) {
            return ResponseEntity.status(401).body("Invalid Credentials");
        }
        String dbUsername = userOpt.get().getUsername();
        String token = jwtUtil.generateToken(dbUsername);
        return ResponseEntity.ok(Map.of("token", token, "username", dbUsername));
    }

}
