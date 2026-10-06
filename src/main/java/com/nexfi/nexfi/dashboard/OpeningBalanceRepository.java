package com.nexfi.nexfi.dashboard;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface OpeningBalanceRepository extends JpaRepository<OpeningBalance, Long> {

    Optional<OpeningBalance> findFirstByOrderByIdAsc();
}