package com.nexfi.nexfi.dashboard;

import com.nexfi.nexfi.api.ApiResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardSummaryController {

    private final DashboardSummaryService dashboardSummaryService;

    public DashboardSummaryController(DashboardSummaryService dashboardSummaryService) {
        this.dashboardSummaryService = dashboardSummaryService;
    }

    @GetMapping("/summary")
    public ApiResponse<DashboardSummary> getSummary() {
        return ApiResponse.success("Dashboard summary retrieved", dashboardSummaryService.getSummary());
    }
}