package com.cinema.hallstore;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableJpaAuditing
@EnableScheduling
@ComponentScan(basePackages = "com.cinema")
@EnableJpaRepositories(basePackages = "com.cinema")
@EntityScan(basePackages = "com.cinema")
public class HallStoreBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(HallStoreBackendApplication.class, args);
    }
}


