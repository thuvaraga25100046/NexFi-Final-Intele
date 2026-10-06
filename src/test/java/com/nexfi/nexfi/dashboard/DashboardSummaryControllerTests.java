package com.nexfi.nexfi.dashboard;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDate;

import com.nexfi.nexfi.payable.PayableRepository;
import com.nexfi.nexfi.receivable.ReceivableRepository;
import com.nexfi.nexfi.transaction.TransactionRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
class DashboardSummaryControllerTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private ReceivableRepository receivableRepository;

    @Autowired
    private PayableRepository payableRepository;

    @Autowired
    private OpeningBalanceRepository openingBalanceRepository;

    @BeforeEach
    @SuppressWarnings("unused")
    void clearFinancialRecords() {
        deleteFinancialRecords();
    }

    @AfterEach
    @SuppressWarnings("unused")
    void removeFinancialRecords() {
        deleteFinancialRecords();
    }

    private void deleteFinancialRecords() {
        payableRepository.deleteAll();
        receivableRepository.deleteAll();
        transactionRepository.deleteAll();
        openingBalanceRepository.deleteAll();
    }

    @Test
    void returnsFinancialTotalsAndCalculatedCashBalance() throws Exception {
        createTransaction("income", "1000.00");
        createTransaction("expense", "200.00");
        createReceivable("300.00", "pending");
        createReceivable("50.00", "paid");
        createPayable("100.00", "overdue");
        createPayable("25.00", "paid");

        mockMvc.perform(get("/api/dashboard/summary"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.openingBalance").value(0))
                .andExpect(jsonPath("$.data.currentCashBalance").value(1000.00))
                .andExpect(jsonPath("$.data.totalIncome").value(1000.00))
                .andExpect(jsonPath("$.data.totalExpenses").value(200.00))
                .andExpect(jsonPath("$.data.totalReceivables").value(300.00))
                .andExpect(jsonPath("$.data.totalPayables").value(100.00));
    }

    @Test
    void returnsZeroTotalsWhenThereAreNoFinancialRecords() throws Exception {
        mockMvc.perform(get("/api/dashboard/summary"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.currentCashBalance").value(0))
                .andExpect(jsonPath("$.data.totalIncome").value(0))
                .andExpect(jsonPath("$.data.totalExpenses").value(0))
                .andExpect(jsonPath("$.data.totalReceivables").value(0))
                .andExpect(jsonPath("$.data.totalPayables").value(0));
    }

    @Test
    void forecastsThroughMonthEndForTransactionsAndUnpaidItems() throws Exception {
        LocalDate today = LocalDate.now();
        int forecastDays = today.lengthOfMonth() - today.getDayOfMonth();
        createTransaction("income", "1000.00", today);
        createTransaction("expense", "200.00", today);
        createTransaction("income", "125.00", today.plusDays(3));
        createTransaction("expense", "25.00", today.plusDays(10));
        createReceivable("300.00", "pending", today);
        createReceivable("40.00", "overdue", today.minusDays(1));
        createReceivable("500.00", "pending", today.plusDays(31));
        createReceivable("50.00", "paid", today.plusDays(2));
        createPayable("100.00", "pending", today.plusDays(5));
        createPayable("50.00", "overdue", today.minusDays(1));
        createPayable("25.00", "paid", today.plusDays(2));

        var forecast = mockMvc.perform(get("/api/dashboard/forecast"))
                .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.days.length()" ).value(forecastDays))
                .andExpect(jsonPath("$.data.openingBalance").value(800.00))
                .andExpect(jsonPath("$.data.expectedInflow").value(465.00))
                .andExpect(jsonPath("$.data.expectedOutflow").value(175.00))
                .andExpect(jsonPath("$.data.projectedBalance").value(1090.00))
            .andExpect(jsonPath("$.data.shortageAlert").value(org.hamcrest.Matchers.nullValue()));

        if (forecastDays > 0) {
            forecast.andExpect(jsonPath("$.data.days[0].date").value(today.plusDays(1).toString()))
                .andExpect(jsonPath("$.data.days[0].incoming").value(340.00))
                .andExpect(jsonPath("$.data.days[0].outgoing").value(50.00))
                .andExpect(jsonPath("$.data.days[2].projectedBalance").value(1215.00))
                .andExpect(jsonPath("$.data.days[" + (forecastDays - 1) + "].projectedBalance").value(1090.00));
        }
    }

    @Test
    void warnsWhenProjectedCashFallsShortBeforeMonthEnd() throws Exception {
        LocalDate today = LocalDate.now();
        int daysToMonthEnd = today.lengthOfMonth() - today.getDayOfMonth();
        int shortageOffset = Math.min(7, daysToMonthEnd);
        LocalDate shortageDate = today.plusDays(shortageOffset);
        createTransaction("income", "1000.00", today);

        if (shortageOffset == 0) {
            createTransaction("expense", "1500.00", today);
        } else {
            createPayable("1500.00", "pending", shortageDate);
        }

        mockMvc.perform(get("/api/dashboard/forecast"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.shortageAlert.shortageAmount").value(500.00))
                .andExpect(jsonPath("$.data.shortageAlert.shortageDate").value(shortageDate.toString()))
                .andExpect(jsonPath("$.data.shortageAlert.daysRemaining").value(shortageOffset))
                .andExpect(jsonPath("$.data.shortageAlert.severity").value(shortageOffset <= 3 ? "CRITICAL" : "HIGH"));
    }

    private void createTransaction(String type, String amount) throws Exception {
        createTransaction(type, amount, LocalDate.parse("2026-10-01"));
    }

    private void createTransaction(String type, String amount, LocalDate date) throws Exception {
        mockMvc.perform(post("/api/transactions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"type\":\"" + type + "\",\"amount\":" + amount
                                + ",\"category\":\"Test\",\"transactionDate\":\"" + date + "\"}"))
                .andExpect(status().isCreated());
    }

    private void createReceivable(String amount, String status) throws Exception {
        createReceivable(amount, status, LocalDate.parse("2026-10-15"));
    }

    private void createReceivable(String amount, String status, LocalDate dueDate) throws Exception {
        String paymentDate = "paid".equalsIgnoreCase(status)
            ? ",\"paymentDate\":\"" + LocalDate.now() + "\""
            : "";
        mockMvc.perform(post("/api/receivables")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"customerName\":\"Test Customer\",\"amount\":" + amount
                    + ",\"dueDate\":\"" + dueDate + "\",\"status\":\"" + status + "\""
                    + paymentDate + "}"))
                .andExpect(status().isCreated());
    }

    private void createPayable(String amount, String status) throws Exception {
        createPayable(amount, status, LocalDate.parse("2026-10-15"));
    }

    private void createPayable(String amount, String status, LocalDate dueDate) throws Exception {
        String paymentDate = "paid".equalsIgnoreCase(status)
            ? ",\"paymentDate\":\"" + LocalDate.now() + "\""
            : "";
        mockMvc.perform(post("/api/payables")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"vendorName\":\"Test Vendor\",\"amount\":" + amount
                    + ",\"dueDate\":\"" + dueDate + "\",\"status\":\"" + status + "\""
                    + paymentDate + "}"))
                .andExpect(status().isCreated());
    }
}