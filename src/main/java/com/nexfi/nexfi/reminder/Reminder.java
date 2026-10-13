package com.nexfi.nexfi.reminder;

import jakarta.persistence.*;
        import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "payment_reminders")
public class Reminder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private double amount;
    private String phoneNumber;
    private LocalDate dueDate;
    private LocalDateTime sentAt;

    protected Reminder() {
    }

    public Reminder(
            String title,
            double amount,
            String phoneNumber,
            LocalDate dueDate) {
        this.title = title;
        this.amount = amount;
        this.phoneNumber = phoneNumber;
        this.dueDate = dueDate;
    }

    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public double getAmount() {
        return amount;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public LocalDate getDueDate() {
        return dueDate;
    }

    public LocalDateTime getSentAt() {
        return sentAt;
    }

    public void setSentAt(LocalDateTime sentAt) {
        this.sentAt = sentAt;
    }
}