package com.nebulavault.gateway.routes;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;


@Configuration
public class FileRoutes {
    @Bean
    public RouteLocator customRouteLocator(RouteLocatorBuilder builder, @Value("${routes.files.uri}") String filesUri) {
        return builder.routes()
                .route("files-route",r -> r
                        .path("/files/**", "/folders/**")
                            .filters(f -> f
                                    .prefixPath("/api")
                                    .addResponseHeader("Nebula-Gateway","Nebula Vault")
                            ).uri(filesUri)
                )
                .build();
    }
}
