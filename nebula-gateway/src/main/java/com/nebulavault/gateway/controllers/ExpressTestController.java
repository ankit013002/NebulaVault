package com.nebulavault.gateway.controllers;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.Map;

@RestController
public class ExpressTestController {

    private final WebClient webClient = WebClient.create("http://localhost:4000");

    @GetMapping("/ping-express-login")
    public Mono<String> pingExpressLogin() {
        return webClient.post()
                .uri("/api/login")
                .bodyValue("{\"email\":\"test@example.com\",\"password\":\"secret\"}")
                .retrieve()
                .bodyToMono(String.class);
    }

    @GetMapping("/ping-express-registration")
    public Mono<String> pingExpressRegistration() {
        return webClient.get()
                .uri("/api/auth/oidc/start/**")
                .retrieve()
                .bodyToMono(String.class);
    }
}
