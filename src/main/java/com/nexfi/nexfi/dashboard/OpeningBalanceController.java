package com.nexfi.nexfi.dashboard;

import com.nexfi.nexfi.api.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/opening-balance")
public class OpeningBalanceController {

    private final OpeningBalanceService openingBalanceService;

    public OpeningBalanceController(OpeningBalanceService openingBalanceService) {
        this.openingBalanceService = openingBalanceService;
    }

    @GetMapping
    public ApiResponse<OpeningBalance> getOpeningBalance() {
        return ApiResponse.success("Opening balance retrieved", openingBalanceService.getCurrent());
    }

    @PutMapping
    public ApiResponse<OpeningBalance> saveOpeningBalance(@Valid @RequestBody OpeningBalanceRequest request) {
        return ApiResponse.success("Opening balance saved", openingBalanceService.save(request.amount()));
    }
}