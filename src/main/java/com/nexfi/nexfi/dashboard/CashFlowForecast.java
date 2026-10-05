package com.nexfi.nexfi.dashboard;

import java.math.BigDecimal;
import java.util.List;

public record CashFlowForecast(
        BigDecimal openingBalance,
        BigDecimal expectedInflow,
        BigDecimal expectedOutflow,
        BigDecimal projectedBalance,
        List<CashFlowForecastDay> days) {
}