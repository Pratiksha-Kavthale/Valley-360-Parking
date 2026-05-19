package com.app.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.app.entities.OwnerPaymentConfig;

public interface OwnerPaymentConfigRepository extends JpaRepository<OwnerPaymentConfig, Long> {

    Optional<OwnerPaymentConfig> findByOwnerId(Long ownerId);
}