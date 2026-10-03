package com.nexfi.nexfi.transaction;

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
@RequestMapping("/api/transactions")
public class TransactionController {

    private final TransactionService transactionService;

    public TransactionController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<TransactionResponse>> create(@Valid @RequestBody TransactionRequest request) {
        TransactionResponse transaction = TransactionResponse.from(transactionService.create(request));
        URI location = URI.create("/api/transactions/" + transaction.id());
        return ResponseEntity.created(location)
                .body(ApiResponse.success("Transaction created", transaction));
    }

    @GetMapping
    public ApiResponse<List<TransactionResponse>> findAll() {
        List<TransactionResponse> transactions = transactionService.findAll().stream()
                .map(TransactionResponse::from)
                .toList();
        return ApiResponse.success("Transactions retrieved", transactions);
    }

    @GetMapping("/{id}")
    public ApiResponse<TransactionResponse> findById(@PathVariable Long id) {
        return ApiResponse.success("Transaction retrieved",
                TransactionResponse.from(transactionService.findById(id)));
    }

    @PutMapping("/{id}")
    public ApiResponse<TransactionResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody TransactionRequest request) {
        return ApiResponse.success("Transaction updated",
                TransactionResponse.from(transactionService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        transactionService.delete(id);
        return ApiResponse.success("Transaction deleted", null);
    }
}