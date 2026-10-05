package com.nexfi.nexfi.payable;

import java.util.List;
import java.util.Locale;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@Transactional
public class PayableService {

    private final PayableRepository payableRepository;

    public PayableService(PayableRepository payableRepository) {
        this.payableRepository = payableRepository;
    }

    public Payable create(PayableRequest request) {
        Payable payable = new Payable(
                request.vendorName().trim(),
                request.amount(),
                request.dueDate(),
                parseStatus(request.status()));
        return payableRepository.save(payable);
    }

    @Transactional(readOnly = true)
    public List<Payable> findAll() {
        return payableRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Payable findById(Long id) {
        return payableRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Payable not found"));
    }

    public Payable update(Long id, PayableRequest request) {
        Payable payable = findById(id);
        payable.setVendorName(request.vendorName().trim());
        payable.setAmount(request.amount());
        payable.setDueDate(request.dueDate());
        payable.setStatus(parseStatus(request.status()));
        return payableRepository.save(payable);
    }

    public void delete(Long id) {
        payableRepository.delete(findById(id));
    }

    private PayableStatus parseStatus(String status) {
        return PayableStatus.valueOf(status.toUpperCase(Locale.ROOT));
    }
}