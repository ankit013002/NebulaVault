package com.nebulavault.gateway;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class NebulaGatewayApplication {

	public static void main(String[] args) {
		SpringApplication.run(NebulaGatewayApplication.class, args);
	}


    @Bean
    public RouteLocator customRouteLocator(RouteLocatorBuilder builder) {
        return builder.routes()
                .route(r -> r.path("/files/**")
                        .filters(f -> f
                                .prefixPath("/api")
                                .addResponseHeader("Nebula-Gateway","Nebula Vault")
                        ).uri("http://192.168.0.215:5000")
                ).build();
    }

}
