package com.nexfi.nexfi.dashboard;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

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
public class CashFlowForecastService {

    private static final int FORECAST_DAYS = 30;

    private final TransactionRepository transactionRepository;
    private final ReceivableRepository receivableRepository;
    private final PayableRepository payableRepository;

    public CashFlowForecastService(
            TransactionRepository transactionRepository,
            ReceivableRepository receivableRepository,
            PayableRepository payableRepository) {
        this.transactionRepository = transactionRepository;
        this.receivableRepository = receivableRepository;
        this.payableRepository = payableRepository;
    }

    public CashFlowForecast getForecast() {
        LocalDate today = LocalDate.now();
        LocalDate firstDay = today.plusDays(1);
        LocalDate lastDay = today.plusDays(FORECAST_DAYS);
        Map<LocalDate, BigDecimal> incomingByDate = new HashMap<>();
        Map<LocalDate, BigDecimal> outgoingByDate = new HashMap<>();
        BigDecimal openingBalance = BigDecimal.ZERO;

        for (Transaction transaction : transactionRepository.findAll()) {
            if (!transaction.getTransactionDate().isAfter(today)) {
                openingBalance = transaction.getType() == TransactionType.INCOME
                        ? openingBalance.add(transaction.getAmount())
                        : openingBalance.subtract(transaction.getAmount());
            } else if (!transaction.getTransactionDate().isAfter(lastDay)) {
                Map<LocalDate, BigDecimal> flows = transaction.getType() == TransactionType.INCOME
                        ? incomingByDate
                        : outgoingByDate;
                addFlow(flows, transaction.getTransactionDate(), transaction.getAmount());
            }
        }

        for (Receivable receivable : receivableRepository.findAll()) {
            if (receivable.getStatus() != ReceivableStatus.PAID && !receivable.getDueDate().isAfter(lastDay)) {
                addFlow(incomingByDate, forecastDate(receivable.getDueDate(), firstDay), receivable.getAmount());
            }
        }

        for (Payable payable : payableRepository.findAll()) {
            if (payable.getStatus() != PayableStatus.PAID && !payable.getDueDate().isAfter(lastDay)) {
                addFlow(outgoingByDate, forecastDate(payable.getDueDate(), firstDay), payable.getAmount());
            }
        }

        BigDecimal projectedBalance = openingBalance;
        BigDecimal expectedInflow = BigDecimal.ZERO;
        BigDecimal expectedOutflow = BigDecimal.ZERO;
        List<CashFlowForecastDay> days = new ArrayList<>(FORECAST_DAYS);

        for (int offset = 1; offset <= FORECAST_DAYS; offset++) {
            LocalDate date = today.plusDays(offset);
            BigDecimal incoming = incomingByDate.getOrDefault(date, BigDecimal.ZERO);
            BigDecimal outgoing = outgoingByDate.getOrDefault(date, BigDecimal.ZERO);
            expectedInflow = expectedInflow.add(incoming);
            expectedOutflow = expectedOutflow.add(outgoing);
            projectedBalance = projectedBalance.add(incoming).subtract(outgoing);
            days.add(new CashFlowForecastDay(date, incoming, outgoing, projectedBalance));
        }

        return new CashFlowForecast(openingBalance, expectedInflow, expectedOutflow, projectedBalance, days);
    }

    private LocalDate forecastDate(LocalDate dueDate, LocalDate firstDay) {
        return dueDate.isBefore(firstDay) ? firstDay : dueDate;
    }

    private void addFlow(Map<LocalDate, BigDecimal> flows, LocalDate date, BigDecimal amount) {
        flows.merge(date, amount, BigDecimal::add);
    }
}