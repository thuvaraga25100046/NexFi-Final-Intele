package com.nexfi.nexfi.receivable;

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
@RequestMapping("/api/receivables")
public class ReceivableController {

    private final ReceivableService receivableService;

    public ReceivableController(ReceivableService receivableService) {
        this.receivableService = receivableService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ReceivableResponse>> create(@Valid @RequestBody ReceivableRequest request) {
        ReceivableResponse receivable = ReceivableResponse.from(receivableService.create(request));
        URI location = URI.create("/api/receivables/" + receivable.id());
        return ResponseEntity.created(location).body(ApiResponse.success("Receivable created", receivable));
    }

    @GetMapping
    public ApiResponse<List<ReceivableResponse>> findAll() {
        List<ReceivableResponse> receivables = receivableService.findAll().stream()
                .map(ReceivableResponse::from)
                .toList();
        return ApiResponse.success("Receivables retrieved", receivables);
    }

    @GetMapping("/{id}")
    public ApiResponse<ReceivableResponse> findById(@PathVariable Long id) {
        return ApiResponse.success("Receivable retrieved",
                ReceivableResponse.from(receivableService.findById(id)));
    }

    @PutMapping("/{id}")
    public ApiResponse<ReceivableResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody ReceivableRequest request) {
        return ApiResponse.success("Receivable updated",
                ReceivableResponse.from(receivableService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        receivableService.delete(id);
        return ApiResponse.success("Receivable deleted", null);
    }
}