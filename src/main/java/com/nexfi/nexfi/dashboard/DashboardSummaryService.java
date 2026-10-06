package com.nexfi.nexfi.dashboard;

import java.math.BigDecimal;
import java.time.LocalDate;
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

    public DashboardSummaryService(
            TransactionRepository transactionRepository,
            ReceivableRepository receivableRepository,
            PayableRepository payableRepository) {
        this.transactionRepository = transactionRepository;
        this.receivableRepository = receivableRepository;
        this.payableRepository = payableRepository;
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
        LocalDate today = LocalDate.now();
        BigDecimal currentCashBalance = transactions.stream()
                .filter(transaction -> !transaction.getTransactionDate().isAfter(today))
                .map(transaction -> transaction.getType() == TransactionType.INCOME
                        ? transaction.getAmount()
                        : transaction.getAmount().negate())
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new DashboardSummary(
                currentCashBalance,
                totalIncome,
                totalExpenses,
                totalReceivables,
                totalPayables);
    }
}