package com.nexfi.nexfi.dashboard;

import com.nexfi.nexfi.api.ApiResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardSummaryController {

    private final DashboardSummaryService dashboardSummaryService;
    private final CashFlowForecastService cashFlowForecastService;

    public DashboardSummaryController(
            DashboardSummaryService dashboardSummaryService,
            CashFlowForecastService cashFlowForecastService) {
        this.dashboardSummaryService = dashboardSummaryService;
        this.cashFlowForecastService = cashFlowForecastService;
    }

    @GetMapping("/summary")
    public ApiResponse<DashboardSummary> getSummary() {
        return ApiResponse.success("Dashboard summary retrieved", dashboardSummaryService.getSummary());
    }

    @GetMapping("/forecast")
    public ApiResponse<CashFlowForecast> getForecast() {
        return ApiResponse.success("Cash flow forecast retrieved", cashFlowForecastService.getForecast());
    }
}