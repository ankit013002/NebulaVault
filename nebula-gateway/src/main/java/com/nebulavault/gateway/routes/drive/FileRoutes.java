package com.nebulavault.gateway.routes.drive;

import com.nebulavault.gateway.filters.SessionToHeadersFilter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;


@Configuration
public class FileRoutes {
    @Bean
    public RouteLocator customRouteLocator(RouteLocatorBuilder builder, @Value("${routes.files.uri}") String filesUri, SessionToHeadersFilter sessionFilter) {
        return builder.routes()
                .route("drive-write", r -> r
                        .path("/drive-nodes/**")
                        .filters(f -> f
                                .filter(sessionFilter)
                                .addResponseHeader("Nebula-Gateway", "Nebula Vault"))
                        .uri(filesUri)
                )
                .route("files-read", r -> r
                        .path("/files/**", "/folders/**")
                        .filters(f -> f
                                .filter(sessionFilter)
                                .addResponseHeader("Nebula-Gateway", "Nebula Vault"))
                        .uri(filesUri)
                )
                .build();
    }
}
