package com.nexfi.nexfi.dashboard;

import java.math.BigDecimal;
import java.time.LocalDate;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class OpeningBalanceService {

    private final OpeningBalanceRepository openingBalanceRepository;

    public OpeningBalanceService(OpeningBalanceRepository openingBalanceRepository) {
        this.openingBalanceRepository = openingBalanceRepository;
    }

    public OpeningBalance getCurrent() {
        return openingBalanceRepository.findFirstByOrderByIdAsc()
                .orElseGet(() -> new OpeningBalance(BigDecimal.ZERO, null));
    }

    @Transactional
    public OpeningBalance save(BigDecimal amount) {
        OpeningBalance openingBalance = openingBalanceRepository.findFirstByOrderByIdAsc()
                .orElseGet(() -> new OpeningBalance(BigDecimal.ZERO, LocalDate.now()));
        openingBalance.setAmount(amount);
        return openingBalanceRepository.save(openingBalance);
    }
}