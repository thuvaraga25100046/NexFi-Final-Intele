package com.nexfi.nexfi.receivable;

import java.time.LocalDate;
import java.util.List;
import java.util.Locale;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@Transactional
public class ReceivableService {

    private final ReceivableRepository receivableRepository;

    public ReceivableService(ReceivableRepository receivableRepository) {
        this.receivableRepository = receivableRepository;
    }

    public Receivable create(ReceivableRequest request) {
        ReceivableStatus status = parseStatus(request.status());
        Receivable receivable = new Receivable(
                request.customerName().trim(),
                request.amount(),
                request.dueDate(),
            status,
            resolvePaymentDate(status, request.paymentDate()));
        return receivableRepository.save(receivable);
    }

    @Transactional(readOnly = true)
    public List<Receivable> findAll() {
        return receivableRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Receivable findById(Long id) {
        return receivableRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Receivable not found"));
    }

    public Receivable update(Long id, ReceivableRequest request) {
        Receivable receivable = findById(id);
        receivable.setCustomerName(request.customerName().trim());
        receivable.setAmount(request.amount());
        receivable.setDueDate(request.dueDate());
        ReceivableStatus status = parseStatus(request.status());
        receivable.setStatus(status);
        receivable.setPaymentDate(resolvePaymentDate(status, request.paymentDate()));
        return receivableRepository.save(receivable);
    }

    public void delete(Long id) {
        receivableRepository.delete(findById(id));
    }

    private ReceivableStatus parseStatus(String status) {
        return ReceivableStatus.valueOf(status.toUpperCase(Locale.ROOT));
    }

    private LocalDate resolvePaymentDate(ReceivableStatus status, LocalDate paymentDate) {
        if (status != ReceivableStatus.PAID) return null;
        return paymentDate != null ? paymentDate : LocalDate.now();
    }
}