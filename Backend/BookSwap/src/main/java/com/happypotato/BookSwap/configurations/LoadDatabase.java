/*package com.happypotato.BookSwap.configurations;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.happypotato.BookSwap.model.User;
import com.happypotato.BookSwap.repository.UserRepository;

@Configuration
class LoadDatabase {

    private static final Logger log = LoggerFactory.getLogger(LoadDatabase.class);

    @Bean
    CommandLineRunner initDatabase(UserRepository repository) {

        return args -> {
            MessageDigest digest = java.security.MessageDigest.getInstance("MD5");
            digest.update("senha".getBytes(StandardCharsets.UTF_8));
            byte[] senha = digest.digest();
            log.info("Preloading "
                    + repository.save(new User("Carol", "happyPotato", senha, null, "Linda-a-velha", "bio", 4)));
            log.info("Preloading " + repository.save(new User("Icaro", "Manolo", senha, null, "Lisboa", "bio", 5)));
        };
    }
}
*/