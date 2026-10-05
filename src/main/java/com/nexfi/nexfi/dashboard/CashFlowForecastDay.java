package com.nexfi.nexfi.dashboard;

import java.math.BigDecimal;
import java.time.LocalDate;

public record CashFlowForecastDay(
        LocalDate date,
        BigDecimal incoming,
        BigDecimal outgoing,
        BigDecimal projectedBalance) {
}