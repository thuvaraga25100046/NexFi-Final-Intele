package com.nexfi.nexfi.dashboard;

import java.math.BigDecimal;
import java.time.LocalDate;

public record CashShortageAlert(
        BigDecimal shortageAmount,
        LocalDate shortageDate,
        long daysRemaining,
        String severity) {
}