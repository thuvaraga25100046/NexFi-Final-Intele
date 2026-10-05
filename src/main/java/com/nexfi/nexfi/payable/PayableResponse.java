package com.nexfi.nexfi.payable;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Locale;

public record PayableResponse(Long id, String vendorName, BigDecimal amount, LocalDate dueDate, String status) {

    public static PayableResponse from(Payable payable) {
        return new PayableResponse(
                payable.getId(),
                payable.getVendorName(),
                payable.getAmount(),
                payable.getDueDate(),
                payable.getStatus().name().toLowerCase(Locale.ROOT));
    }
}