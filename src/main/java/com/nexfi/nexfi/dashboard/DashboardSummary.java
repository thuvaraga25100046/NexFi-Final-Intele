package com.nexfi.nexfi.dashboard;

import java.math.BigDecimal;

public record DashboardSummary(
        BigDecimal currentCashBalance,
        BigDecimal totalIncome,
        BigDecimal totalExpenses,
        BigDecimal totalReceivables,
        BigDecimal totalPayables) {
}