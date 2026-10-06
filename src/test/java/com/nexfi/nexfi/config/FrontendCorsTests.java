package com.nexfi.nexfi.config;

import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.HttpHeaders;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
class FrontendCorsTests {

    private static final String[] FRONTEND_ORIGINS = {
        "http://localhost:5173",
        "http://localhost:5174"
    };
    private static final String[] API_PATHS = {
        "/api/health",
        "/api/transactions",
        "/api/receivables",
        "/api/payables"
    };
    private static final String[] API_METHODS = {
        "GET",
        "POST",
        "PUT",
        "DELETE",
        "OPTIONS"
    };

    @Autowired
    private MockMvc mockMvc;

    @Test
    void allowsPreflightRequestsFromConfiguredFrontendsForAllApis() throws Exception {
        for (String origin : FRONTEND_ORIGINS) {
            for (String path : API_PATHS) {
            for (String method : API_METHODS) {
                mockMvc.perform(options(path)
                        .header(HttpHeaders.ORIGIN, origin)
                        .header(HttpHeaders.ACCESS_CONTROL_REQUEST_METHOD, method)
                        .header(HttpHeaders.ACCESS_CONTROL_REQUEST_HEADERS,
                            "content-type,authorization,x-correlation-id"))
                    .andExpect(status().isOk())
                    .andExpect(header().string(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, origin))
                    .andExpect(header().string(HttpHeaders.ACCESS_CONTROL_ALLOW_METHODS,
                        containsString(method)))
                    .andExpect(header().string(HttpHeaders.ACCESS_CONTROL_ALLOW_HEADERS,
                        containsString("x-correlation-id")));
            }
            }
        }
    }
}
