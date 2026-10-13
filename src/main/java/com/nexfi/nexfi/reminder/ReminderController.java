package com.nexfi.nexfi.reminder;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reminders")
public class ReminderController {

    private final ReminderRepository repository;

    public ReminderController(ReminderRepository repository) {
        this.repository = repository;
    }

    public record CreateReminderRequest(
            String title,
            Double amount,
            String phoneNumber,
            LocalDate dueDate
    ) {}

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Reminder createReminder(
            @RequestBody CreateReminderRequest request) {

        if (request.title() == null
                || request.title().isBlank()
                || request.title().length() > 120) {
            throw new IllegalArgumentException(
                    "Enter a valid payment title."
            );
        }

        if (request.amount() == null
                || !Double.isFinite(request.amount())
                || request.amount() <= 0) {
            throw new IllegalArgumentException(
                    "Amount must be greater than zero."
            );
        }

        if (request.phoneNumber() == null
                || !request.phoneNumber()
                .matches("^\\+[1-9]\\d{7,14}$")) {
            throw new IllegalArgumentException(
                    "Use international format, e.g. +94771234567."
            );
        }

        if (request.dueDate() == null
                || !request.dueDate().isAfter(LocalDate.now(
                java.time.ZoneId.of("Asia/Colombo")))) {
            throw new IllegalArgumentException(
                    "Due date must be in the future."
            );
        }

        Reminder reminder = new Reminder(
                request.title().trim(),
                request.amount(),
                request.phoneNumber(),
                request.dueDate()
        );

        return repository.save(reminder);
    }

    @GetMapping
    public List<Reminder> getReminders() {
        return repository.findAll();
    }
}