package com.nexfi.nexfi.payable;

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
class PayableControllerTests {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void supportsPayableCrud() throws Exception {
        MvcResult created = mockMvc.perform(post("/api/payables")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"vendorName\":\"Office Supply Co\",\"amount\":125.50,\"dueDate\":\"2026-10-15\",\"status\":\"pending\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.vendorName").value("Office Supply Co"))
                .andReturn();
        String location = created.getResponse().getHeader("Location");
        String id = location.substring(location.lastIndexOf('/') + 1);

        mockMvc.perform(get("/api/payables/{id}", id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("pending"));

        mockMvc.perform(put("/api/payables/{id}", id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"vendorName\":\"Office Supply Co\",\"amount\":100.00,\"dueDate\":\"2026-10-20\",\"status\":\"paid\",\"paymentDate\":\""
                                + LocalDate.now().minusDays(1) + "\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("paid"))
                .andExpect(jsonPath("$.data.paymentDate").value(LocalDate.now().minusDays(1).toString()));

        mockMvc.perform(put("/api/payables/{id}", id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"vendorName\":\"Office Supply Co\",\"amount\":100.00,\"dueDate\":\"2026-10-20\",\"status\":\"paid\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.paymentDate").value(LocalDate.now().toString()));

        mockMvc.perform(put("/api/payables/{id}", id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"vendorName\":\"Office Supply Co\",\"amount\":100.00,\"dueDate\":\"2026-10-20\",\"status\":\"pending\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.paymentDate").value(org.hamcrest.Matchers.nullValue()));

        mockMvc.perform(get("/api/payables"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.length()").value(1));

        mockMvc.perform(delete("/api/payables/{id}", id))
                .andExpect(status().isOk());
        mockMvc.perform(get("/api/payables/{id}", id))
                .andExpect(status().isNotFound());
    }

    @Test
    void rejectsInvalidPayableInput() throws Exception {
        mockMvc.perform(post("/api/payables")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"vendorName\":\"\",\"amount\":0,\"dueDate\":null,\"status\":\"unknown\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }

        @Test
        void rejectsFuturePaymentDate() throws Exception {
                mockMvc.perform(post("/api/payables")
                                                .contentType(MediaType.APPLICATION_JSON)
                                                .content("{\"vendorName\":\"Office Supply Co\",\"amount\":100.00,\"dueDate\":\"2026-10-20\",\"status\":\"paid\",\"paymentDate\":\""
                                                                + LocalDate.now().plusDays(1) + "\"}"))
                                .andExpect(status().isBadRequest())
                                .andExpect(jsonPath("$.success").value(false));
        }
}