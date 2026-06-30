package com.app.service;

import com.app.dto.ContactRequestDTO;
import com.app.dto.ContactResponseDTO;

public interface ContactService {
    ContactResponseDTO sendMessage(ContactRequestDTO request);
}
