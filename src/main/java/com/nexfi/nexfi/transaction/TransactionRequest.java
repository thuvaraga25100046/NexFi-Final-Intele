package com.nexfi.nexfi.transaction;

import java.math.BigDecimal;
import java.time.LocalDate;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record TransactionRequest(
        @NotBlank(message = "type is required")
        @Pattern(regexp = "(?i)^(income|expense)$", message = "type must be income or expense")
        String type,

        @NotNull(message = "amount is required")
        @DecimalMin(value = "0.01", message = "amount must be greater than zero")
        @Digits(integer = 17, fraction = 2, message = "amount must have at most 17 integer digits and 2 decimals")
        BigDecimal amount,

        @NotBlank(message = "category is required")
        @Size(max = 100, message = "category must be at most 100 characters")
        String category,

        @Size(max = 500, message = "description must be at most 500 characters")
        String description,

        @NotNull(message = "transactionDate is required")
        LocalDate transactionDate) {
}