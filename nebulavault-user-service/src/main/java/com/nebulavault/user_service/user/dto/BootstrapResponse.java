package com.nebulavault.user_service.user.dto;

import java.util.UUID;

public record BootstrapResponse(
        boolean ok,
        UUID userId,
        String plan,
        long quotaBytes,
        long usedBytes
) {}
