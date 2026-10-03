package com.nexfi.nexfi.receivable;

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
        Receivable receivable = new Receivable(
                request.customerName().trim(),
                request.amount(),
                request.dueDate(),
                parseStatus(request.status()));
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
        receivable.setStatus(parseStatus(request.status()));
        return receivableRepository.save(receivable);
    }

    public void delete(Long id) {
        receivableRepository.delete(findById(id));
    }

    private ReceivableStatus parseStatus(String status) {
        return ReceivableStatus.valueOf(status.toUpperCase(Locale.ROOT));
    }
}