package com.app.controller;

import javax.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.app.dto.ContactRequestDTO;
import com.app.dto.ContactResponseDTO;
import com.app.service.ContactService;

@RestController
@RequestMapping("/contact")
@CrossOrigin(origins = {
    "http://localhost:5173",
    "https://valley-360-parking-7zi9-ript5gl4k.vercel.app"
})
public class ContactController {

    private final ContactService contactService;

    public ContactController(ContactService contactService) {
        this.contactService = contactService;
    }

    @PostMapping("/send")
    public ResponseEntity<ContactResponseDTO> sendMessage(@Valid @RequestBody ContactRequestDTO request) {
        ContactResponseDTO response = contactService.sendMessage(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
