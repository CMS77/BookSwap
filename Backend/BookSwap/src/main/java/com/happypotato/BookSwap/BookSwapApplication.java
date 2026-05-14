package com.happypotato.BookSwap;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class BookSwapApplication {

	public static void main(String[] args) {
		SpringApplication.run(BookSwapApplication.class, args);
	}

}

//docker compose -f  /Users/happypotatos/Documents/GitHub/BookSwap/Backend/BookSwap/compose.yaml up   -d