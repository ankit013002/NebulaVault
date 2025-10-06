package com.nebulavault.gateway.routes.auth;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RegistrationRoute {
    @Bean
    public RouteLocator registrationRouteLocator(RouteLocatorBuilder builder, @Value("${routes.auth.uri}") String authUri) {
        return builder.routes()
                .route("auth-oidc-start",r -> r
                        .path("/auth/oidc/start/**")
                        .filters(f -> f
                                .prefixPath("/api")
                                .addResponseHeader("Nebula-Gateway","Nebula Vault")
                        ).uri(authUri)
                )
                .route("auth-oidc-callback",r -> r
                        .path("/auth/oidc/callback/**")
                        .filters(f -> f
                                .prefixPath("/api")
                                .addResponseHeader("Nebula-Gateway","Nebula Vault")
                        ).uri(authUri)
                )
                .route("auth-logout", r -> r
                        .path("/auth/logout/**")
                        .filters(f -> f
                                .prefixPath("/api")
                                .addResponseHeader("Nebula-Gateway", "Nebula Vault")
                        ).uri(authUri)
                )
                .build();
    }
}
