package com.cinema.hallstore;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.boot.autoconfigure.domain.EntityScan;

@SpringBootApplication(exclude = {
    org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration.class,
    org.springframework.boot.autoconfigure.orm.jpa.HibernateJpaAutoConfiguration.class
})
@ComponentScan(basePackages = {"com.cinema.hallstore", "com.cinema.scenariopackage", "com.cinema.common"})
public class HallStoreBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(HallStoreBackendApplication.class, args);
    }
}


