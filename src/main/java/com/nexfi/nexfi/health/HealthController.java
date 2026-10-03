package com.nexfi.nexfi.health;

import com.nexfi.nexfi.api.ApiResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/health")
public class HealthController {

    @GetMapping
    public ApiResponse<HealthStatus> getHealth() {
        return ApiResponse.success("Service is healthy", new HealthStatus("UP"));
    }

    public record HealthStatus(String status) {
    }
}