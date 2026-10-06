package com.nexfi.nexfi.dashboard;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;

public record OpeningBalanceRequest(
        @NotNull(message = "amount is required")
        @DecimalMin(value = "0.00", message = "amount cannot be negative")
        @Digits(integer = 17, fraction = 2, message = "amount must have at most 17 integer digits and 2 decimals")
        BigDecimal amount) {
}