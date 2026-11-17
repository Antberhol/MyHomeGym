package com.myhomegym;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan
public class MyHomeGymApplication {

    public static void main(String[] args) {
        SpringApplication.run(MyHomeGymApplication.class, args);
    }
}
