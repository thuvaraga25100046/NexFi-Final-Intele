package com.nexfi.nexfi.dashboard;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.math.BigDecimal;
import java.time.LocalDate;

import com.nexfi.nexfi.payable.Payable;
import com.nexfi.nexfi.payable.PayableRepository;
import com.nexfi.nexfi.payable.PayableStatus;
import com.nexfi.nexfi.receivable.Receivable;
import com.nexfi.nexfi.receivable.ReceivableRepository;
import com.nexfi.nexfi.receivable.ReceivableStatus;
import com.nexfi.nexfi.transaction.Transaction;
import com.nexfi.nexfi.transaction.TransactionRepository;
import com.nexfi.nexfi.transaction.TransactionType;
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
class OpeningBalanceControllerTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private OpeningBalanceRepository openingBalanceRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private ReceivableRepository receivableRepository;

    @Autowired
    private PayableRepository payableRepository;

    @BeforeEach
    @SuppressWarnings("unused")
    void clearFinancialRecords() {
        clearRecords();
    }

    @AfterEach
    @SuppressWarnings("unused")
    void removeFinancialRecords() {
        clearRecords();
    }

    private void clearRecords() {
        payableRepository.deleteAll();
        receivableRepository.deleteAll();
        transactionRepository.deleteAll();
        openingBalanceRepository.deleteAll();
    }

    @Test
    void savesAndUpdatesOpeningBalanceAndIncludesItInDashboardSummary() throws Exception {
        LocalDate today = LocalDate.now();
        transactionRepository.save(new Transaction(
                TransactionType.INCOME, new BigDecimal("1000.00"), "Income", null, today));
        transactionRepository.save(new Transaction(
                TransactionType.EXPENSE, new BigDecimal("200.00"), "Expense", null, today));
        receivableRepository.save(new Receivable(
                "Customer", new BigDecimal("300.00"), today, ReceivableStatus.PENDING, null));
        payableRepository.save(new Payable(
                "Vendor", new BigDecimal("100.00"), today, PayableStatus.PENDING, null));

        mockMvc.perform(get("/api/opening-balance"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.amount").value(0));

        mockMvc.perform(put("/api/opening-balance")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"amount\":2500.00}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.amount").value(2500.00))
                .andExpect(jsonPath("$.data.createdDate").value(today.toString()));

        mockMvc.perform(get("/api/dashboard/summary"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.openingBalance").value(2500.00))
                .andExpect(jsonPath("$.data.currentCashBalance").value(3500.00));

        mockMvc.perform(put("/api/opening-balance")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"amount\":3000.00}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.amount").value(3000.00))
                .andExpect(jsonPath("$.data.createdDate").value(today.toString()));

        mockMvc.perform(get("/api/opening-balance"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.amount").value(3000.00));
    }

    @Test
    void rejectsNegativeOpeningBalance() throws Exception {
        mockMvc.perform(put("/api/opening-balance")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"amount\":-0.01}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }
}
