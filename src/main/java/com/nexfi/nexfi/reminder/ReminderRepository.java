package com.nexfi.nexfi.reminder;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface ReminderRepository
        extends JpaRepository<Reminder, Long> {

    @Query("""
        SELECT r FROM Reminder r
        WHERE r.sentAt IS NULL
          AND r.dueDate > :today
          AND r.dueDate <= :reminderCutoff
        ORDER BY r.dueDate ASC
        """)
    List<Reminder> findPendingReminders(
            @Param("today") LocalDate today,
            @Param("reminderCutoff") LocalDate reminderCutoff
    );
}