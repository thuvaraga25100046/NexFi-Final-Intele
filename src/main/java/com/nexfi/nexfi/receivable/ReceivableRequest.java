package com.nexfi.nexfi.receivable;

import java.math.BigDecimal;
import java.time.LocalDate;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record ReceivableRequest(
        @NotBlank(message = "customerName is required")
        @Size(max = 150, message = "customerName must be at most 150 characters")
        String customerName,

        @NotNull(message = "amount is required")
        @DecimalMin(value = "0.01", message = "amount must be greater than zero")
        @Digits(integer = 17, fraction = 2, message = "amount must have at most 17 integer digits and 2 decimals")
        BigDecimal amount,

        @NotNull(message = "dueDate is required")
        LocalDate dueDate,

        @NotBlank(message = "status is required")
        @Pattern(regexp = "(?i)^(pending|paid|overdue)$", message = "status must be pending, paid, or overdue")
        String status) {
}