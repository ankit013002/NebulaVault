package com.nebulavault.gateway;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;

import java.util.List;

@SpringBootApplication
public class NebulaGatewayApplication {

	public static void main(String[] args) {
		SpringApplication.run(NebulaGatewayApplication.class, args);
	}



}
