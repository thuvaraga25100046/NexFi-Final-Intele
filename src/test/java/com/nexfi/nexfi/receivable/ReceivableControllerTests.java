package com.nexfi.nexfi.receivable;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDate;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

@SpringBootTest
@AutoConfigureMockMvc
class ReceivableControllerTests {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void supportsReceivableCrud() throws Exception {
        MvcResult created = mockMvc.perform(post("/api/receivables")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"customerName\":\"Acme Ltd\",\"amount\":1250.50,\"dueDate\":\"2026-11-01\",\"status\":\"pending\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.status").value("pending"))
                .andReturn();
        String location = created.getResponse().getHeader("Location");
        String id = location.substring(location.lastIndexOf('/') + 1);

        mockMvc.perform(get("/api/receivables/{id}", id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.customerName").value("Acme Ltd"));

        mockMvc.perform(put("/api/receivables/{id}", id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"customerName\":\"Acme Ltd\",\"amount\":1300.00,\"dueDate\":\"2026-11-10\",\"status\":\"paid\",\"paymentDate\":\""
                                + LocalDate.now().minusDays(1) + "\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("paid"))
                .andExpect(jsonPath("$.data.paymentDate").value(LocalDate.now().minusDays(1).toString()));

        mockMvc.perform(put("/api/receivables/{id}", id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"customerName\":\"Acme Ltd\",\"amount\":1300.00,\"dueDate\":\"2026-11-10\",\"status\":\"paid\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.paymentDate").value(LocalDate.now().toString()));

        mockMvc.perform(put("/api/receivables/{id}", id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"customerName\":\"Acme Ltd\",\"amount\":1300.00,\"dueDate\":\"2026-11-10\",\"status\":\"pending\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.paymentDate").value(org.hamcrest.Matchers.nullValue()));

        mockMvc.perform(get("/api/receivables"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.length()").value(1));

        mockMvc.perform(delete("/api/receivables/{id}", id))
                .andExpect(status().isOk());
        mockMvc.perform(get("/api/receivables/{id}", id))
                .andExpect(status().isNotFound());
    }

    @Test
    void rejectsInvalidReceivableInput() throws Exception {
        mockMvc.perform(post("/api/receivables")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"customerName\":\" \",\"amount\":0,\"dueDate\":null,\"status\":\"cancelled\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }

        @Test
        void rejectsFuturePaymentDate() throws Exception {
                mockMvc.perform(post("/api/receivables")
                                                .contentType(MediaType.APPLICATION_JSON)
                                                .content("{\"customerName\":\"Acme Ltd\",\"amount\":100.00,\"dueDate\":\"2026-11-01\",\"status\":\"paid\",\"paymentDate\":\""
                                                                + LocalDate.now().plusDays(1) + "\"}"))
                                .andExpect(status().isBadRequest())
                                .andExpect(jsonPath("$.success").value(false));
        }
}