package com.nexfi.nexfi.dashboard;

import com.nexfi.nexfi.api.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

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
    public ApiResponse<CashFlowForecast> getForecast(@RequestParam(required = false) Integer days) {
        if (days != null && days != 30 && days != 60 && days != 90) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Forecast horizon must be 30, 60, or 90 days.");
        }
        return ApiResponse.success("Cash flow forecast retrieved", cashFlowForecastService.getForecast(days));
    }
}