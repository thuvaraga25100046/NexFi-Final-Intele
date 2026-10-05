package com.nexfi.nexfi.payable;

import java.net.URI;
import java.util.List;

import com.nexfi.nexfi.api.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/payables")
public class PayableController {

    private final PayableService payableService;

    public PayableController(PayableService payableService) {
        this.payableService = payableService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<PayableResponse>> create(@Valid @RequestBody PayableRequest request) {
        PayableResponse payable = PayableResponse.from(payableService.create(request));
        URI location = URI.create("/api/payables/" + payable.id());
        return ResponseEntity.created(location).body(ApiResponse.success("Payable created", payable));
    }

    @GetMapping
    public ApiResponse<List<PayableResponse>> findAll() {
        List<PayableResponse> payables = payableService.findAll().stream()
                .map(PayableResponse::from)
                .toList();
        return ApiResponse.success("Payables retrieved", payables);
    }

    @GetMapping("/{id}")
    public ApiResponse<PayableResponse> findById(@PathVariable Long id) {
        return ApiResponse.success("Payable retrieved", PayableResponse.from(payableService.findById(id)));
    }

    @PutMapping("/{id}")
    public ApiResponse<PayableResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody PayableRequest request) {
        return ApiResponse.success("Payable updated", PayableResponse.from(payableService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        payableService.delete(id);
        return ApiResponse.success("Payable deleted", null);
    }
}