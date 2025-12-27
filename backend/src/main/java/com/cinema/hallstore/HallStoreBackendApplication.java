package com.cinema.hallstore;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.boot.autoconfigure.domain.EntityScan;

@SpringBootApplication
@ComponentScan(basePackages = {"com.cinema.hallstore", "com.cinema.scenariopackage", "com.cinema.common", "com.cinema.config", "com.cinema.reservation", "com.cinema.unitconversion", "com.cinema.inventory", "com.cinema.sku", "com.cinema.order"})
@EnableJpaRepositories(basePackages = {"com.cinema.hallstore", "com.cinema.scenariopackage", "com.cinema.common", "com.cinema.reservation", "com.cinema.unitconversion", "com.cinema.inventory", "com.cinema.sku", "com.cinema.order"})
@EntityScan(basePackages = {"com.cinema.hallstore", "com.cinema.scenariopackage", "com.cinema.common", "com.cinema.reservation", "com.cinema.unitconversion", "com.cinema.inventory", "com.cinema.sku", "com.cinema.order"})
public class HallStoreBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(HallStoreBackendApplication.class, args);
    }
}


