package com.nebulavault.gateway.routes;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AuthRoutes {
    @Bean
    public RouteLocator authRouteLocator(RouteLocatorBuilder builder, @Value("${routes.auth.uri}") String filesUri) {
        return builder.routes()
                .route("login-route",r -> r
                        .path("/login/**")
                        .filters(f -> f
                                .prefixPath("/api")
                                .addResponseHeader("Nebula-Gateway","Nebula Vault")
                        ).uri(filesUri)
                )
                .build();
    }
}
