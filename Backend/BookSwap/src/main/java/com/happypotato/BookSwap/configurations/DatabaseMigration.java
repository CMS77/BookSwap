package com.happypotato.BookSwap.configurations;

import javax.sql.DataSource;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DatabaseMigration {

    @Bean
    CommandLineRunner fixEnumColumns(DataSource dataSource) {
        return args -> {
            try (var conn = dataSource.getConnection();
                 var stmt = conn.createStatement()) {
                stmt.execute("ALTER TABLE swap_request MODIFY COLUMN status VARCHAR(20)");
                System.out.println("[DatabaseMigration] swap_request.status migrated to VARCHAR(20)");
            } catch (Exception e) {
                System.out.println("[DatabaseMigration] swap_request.status already correct, skipping: " + e.getMessage());
            }
        };
    }
}
