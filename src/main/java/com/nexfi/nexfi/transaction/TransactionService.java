package com.nexfi.nexfi.transaction;

import java.util.List;
import java.util.Locale;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@Transactional
public class TransactionService {

    private final TransactionRepository transactionRepository;

    public TransactionService(TransactionRepository transactionRepository) {
        this.transactionRepository = transactionRepository;
    }

    public Transaction create(TransactionRequest request) {
        Transaction transaction = new Transaction(
                parseType(request.type()),
                request.amount(),
                request.category().trim(),
                request.description(),
                request.transactionDate());
        return transactionRepository.save(transaction);
    }

    @Transactional(readOnly = true)
    public List<Transaction> findAll() {
        return transactionRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Transaction findById(Long id) {
        return transactionRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Transaction not found"));
    }

    public Transaction update(Long id, TransactionRequest request) {
        Transaction transaction = findById(id);
        transaction.setType(parseType(request.type()));
        transaction.setAmount(request.amount());
        transaction.setCategory(request.category().trim());
        transaction.setDescription(request.description());
        transaction.setTransactionDate(request.transactionDate());
        return transactionRepository.save(transaction);
    }

    public void delete(Long id) {
        Transaction transaction = findById(id);
        transactionRepository.delete(transaction);
    }

    private TransactionType parseType(String type) {
        return TransactionType.valueOf(type.toUpperCase(Locale.ROOT));
    }
}