package com.app.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.app.entities.ContactMessage;

public interface ContactRepository extends JpaRepository<ContactMessage, Long> {
}
