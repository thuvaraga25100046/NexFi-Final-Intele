package com.nexfi.nexfi.dashboard;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

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

    private void createTransaction(String type, String amount) throws Exception {
        mockMvc.perform(post("/api/transactions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"type\":\"" + type + "\",\"amount\":" + amount
                                + ",\"category\":\"Test\",\"transactionDate\":\"2026-10-01\"}"))
                .andExpect(status().isCreated());
    }

    private void createReceivable(String amount, String status) throws Exception {
        mockMvc.perform(post("/api/receivables")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"customerName\":\"Test Customer\",\"amount\":" + amount
                                + ",\"dueDate\":\"2026-10-15\",\"status\":\"" + status + "\"}"))
                .andExpect(status().isCreated());
    }

    private void createPayable(String amount, String status) throws Exception {
        mockMvc.perform(post("/api/payables")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"vendorName\":\"Test Vendor\",\"amount\":" + amount
                                + ",\"dueDate\":\"2026-10-15\",\"status\":\"" + status + "\"}"))
                .andExpect(status().isCreated());
    }
}