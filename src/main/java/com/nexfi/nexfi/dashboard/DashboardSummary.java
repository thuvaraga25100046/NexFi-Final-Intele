package com.nexfi.nexfi.dashboard;

import java.math.BigDecimal;

public record DashboardSummary(
        BigDecimal openingBalance,
        BigDecimal currentCashBalance,
        BigDecimal totalIncome,
        BigDecimal totalExpenses,
        BigDecimal totalReceivables,
        BigDecimal totalPayables) {
}