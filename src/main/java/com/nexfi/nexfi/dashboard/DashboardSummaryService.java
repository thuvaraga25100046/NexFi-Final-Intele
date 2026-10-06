package com.nexfi.nexfi.dashboard;

import java.math.BigDecimal;
import java.util.List;

import com.nexfi.nexfi.payable.Payable;
import com.nexfi.nexfi.payable.PayableRepository;
import com.nexfi.nexfi.payable.PayableStatus;
import com.nexfi.nexfi.receivable.Receivable;
import com.nexfi.nexfi.receivable.ReceivableRepository;
import com.nexfi.nexfi.receivable.ReceivableStatus;
import com.nexfi.nexfi.transaction.Transaction;
import com.nexfi.nexfi.transaction.TransactionRepository;
import com.nexfi.nexfi.transaction.TransactionType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class DashboardSummaryService {

    private final TransactionRepository transactionRepository;
    private final ReceivableRepository receivableRepository;
    private final PayableRepository payableRepository;
        private final OpeningBalanceService openingBalanceService;

    public DashboardSummaryService(
            TransactionRepository transactionRepository,
            ReceivableRepository receivableRepository,
                        PayableRepository payableRepository,
                        OpeningBalanceService openingBalanceService) {
        this.transactionRepository = transactionRepository;
        this.receivableRepository = receivableRepository;
        this.payableRepository = payableRepository;
                this.openingBalanceService = openingBalanceService;
    }

    public DashboardSummary getSummary() {
        List<Transaction> transactions = transactionRepository.findAll();
        List<Receivable> receivables = receivableRepository.findAll();
        List<Payable> payables = payableRepository.findAll();

        BigDecimal totalIncome = transactions.stream()
                .filter(transaction -> transaction.getType() == TransactionType.INCOME)
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalExpenses = transactions.stream()
                .filter(transaction -> transaction.getType() == TransactionType.EXPENSE)
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalReceivables = receivables.stream()
                .filter(receivable -> receivable.getStatus() != ReceivableStatus.PAID)
                .map(Receivable::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalPayables = payables.stream()
                .filter(payable -> payable.getStatus() != PayableStatus.PAID)
                .map(Payable::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal openingBalance = openingBalanceService.getCurrent().getAmount();
        BigDecimal currentCashBalance = openingBalance
                .add(totalIncome)
                .subtract(totalExpenses)
                .add(totalReceivables)
                .subtract(totalPayables);

        return new DashboardSummary(
                openingBalance,
                currentCashBalance,
                totalIncome,
                totalExpenses,
                totalReceivables,
                totalPayables);
    }
}