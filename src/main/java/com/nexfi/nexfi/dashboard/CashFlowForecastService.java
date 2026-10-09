package com.nexfi.nexfi.dashboard;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

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

    private final TransactionRepository transactionRepository;
    private final ReceivableRepository receivableRepository;
    private final PayableRepository payableRepository;
    private final OpeningBalanceService openingBalanceService;

    public CashFlowForecastService(
            TransactionRepository transactionRepository,
            ReceivableRepository receivableRepository,
            PayableRepository payableRepository,
            OpeningBalanceService openingBalanceService) {
        this.transactionRepository = transactionRepository;
        this.receivableRepository = receivableRepository;
        this.payableRepository = payableRepository;
        this.openingBalanceService = openingBalanceService;
    }

    public CashFlowForecast getForecast(Integer horizonDays) {
        if (horizonDays != null && !Set.of(30, 60, 90).contains(horizonDays)) {
            throw new IllegalArgumentException("Forecast horizon must be 30, 60, or 90 days.");
        }

        LocalDate today = LocalDate.now();
        LocalDate firstDay = today.plusDays(1);
        LocalDate lastDay = horizonDays == null
                ? today.withDayOfMonth(today.lengthOfMonth())
                : today.plusDays(horizonDays);
        int forecastDays = horizonDays == null
                ? Math.toIntExact(ChronoUnit.DAYS.between(today, lastDay))
                : horizonDays;
        Map<LocalDate, BigDecimal> incomingByDate = new HashMap<>();
        Map<LocalDate, BigDecimal> outgoingByDate = new HashMap<>();
        BigDecimal openingBalance = openingBalanceService.getCurrent().getAmount();

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
        List<CashFlowForecastDay> days = new ArrayList<>(forecastDays);

        for (int offset = 1; offset <= forecastDays; offset++) {
            LocalDate date = today.plusDays(offset);
            BigDecimal incoming = incomingByDate.getOrDefault(date, BigDecimal.ZERO);
            BigDecimal outgoing = outgoingByDate.getOrDefault(date, BigDecimal.ZERO);
            expectedInflow = expectedInflow.add(incoming);
            expectedOutflow = expectedOutflow.add(outgoing);
            projectedBalance = projectedBalance.add(incoming).subtract(outgoing);
            days.add(new CashFlowForecastDay(date, incoming, outgoing, projectedBalance));
        }

        CashShortageAlert shortageAlert = openingBalance.signum() < 0
                ? createShortageAlert(today, today, openingBalance)
                : days.stream()
                    .filter(day -> day.projectedBalance().signum() < 0)
                    .findFirst()
                    .map(day -> createShortageAlert(today, day.date(), day.projectedBalance()))
                    .orElse(null);

        return new CashFlowForecast(
                openingBalance,
                expectedInflow,
                expectedOutflow,
                projectedBalance,
                days,
                shortageAlert);
    }

    private CashShortageAlert createShortageAlert(
            LocalDate today,
            LocalDate shortageDate,
            BigDecimal projectedBalance) {
        long daysRemaining = ChronoUnit.DAYS.between(today, shortageDate);
        String severity = daysRemaining <= 3 ? "CRITICAL" : daysRemaining <= 7 ? "HIGH" : "MEDIUM";
        return new CashShortageAlert(projectedBalance.abs(), shortageDate, daysRemaining, severity);
    }

    private LocalDate forecastDate(LocalDate dueDate, LocalDate firstDay) {
        return dueDate.isBefore(firstDay) ? firstDay : dueDate;
    }

    private void addFlow(Map<LocalDate, BigDecimal> flows, LocalDate date, BigDecimal amount) {
        flows.merge(date, amount, BigDecimal::add);
    }
}