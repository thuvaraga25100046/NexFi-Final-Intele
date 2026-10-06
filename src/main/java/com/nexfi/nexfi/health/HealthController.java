package com.nexfi.nexfi.health;

import com.nexfi.nexfi.api.ApiResponse;
import java.sql.Connection;
import java.sql.SQLException;
import javax.sql.DataSource;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/health")
public class HealthController {

    private final DataSource dataSource;

    public HealthController(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @GetMapping
    public ApiResponse<HealthStatus> getHealth() {
        try (Connection connection = dataSource.getConnection()) {
            if (!connection.isValid(2)) {
                return ApiResponse.success("Service is not ready", new HealthStatus("DOWN"));
            }
            return ApiResponse.success("Service is healthy", new HealthStatus("UP"));
        } catch (SQLException exception) {
            return ApiResponse.success("Service is not ready", new HealthStatus("DOWN"));
        }
    }

    public record HealthStatus(String status) {
    }
}