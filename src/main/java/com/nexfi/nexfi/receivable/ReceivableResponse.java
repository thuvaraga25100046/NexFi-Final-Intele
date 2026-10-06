package com.nexfi.nexfi.receivable;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Locale;

public record ReceivableResponse(
    Long id,
    String customerName,
    BigDecimal amount,
    LocalDate dueDate,
    String status,
    LocalDate paymentDate) {

    public static ReceivableResponse from(Receivable receivable) {
        return new ReceivableResponse(
                receivable.getId(),
                receivable.getCustomerName(),
                receivable.getAmount(),
                receivable.getDueDate(),
                receivable.getStatus().name().toLowerCase(Locale.ROOT),
                receivable.getPaymentDate());
    }
}