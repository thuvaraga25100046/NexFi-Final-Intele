package com.nexfi.nexfi.transaction;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Locale;

public record TransactionResponse(
        Long id,
        String type,
        BigDecimal amount,
        String category,
        String description,
        LocalDate transactionDate) {

    public static TransactionResponse from(Transaction transaction) {
        return new TransactionResponse(
                transaction.getId(),
                transaction.getType().name().toLowerCase(Locale.ROOT),
                transaction.getAmount(),
                transaction.getCategory(),
                transaction.getDescription(),
                transaction.getTransactionDate());
    }
}