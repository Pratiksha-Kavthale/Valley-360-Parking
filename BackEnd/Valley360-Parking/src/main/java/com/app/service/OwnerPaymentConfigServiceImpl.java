package com.app.service;

import java.util.Locale;
import java.util.regex.Pattern;

import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.app.dto.OwnerPaymentConfigDTO;
import com.app.dto.OwnerPaymentConfigRequestDTO;
import com.app.entities.OwnerPaymentConfig;
import com.app.entities.User;
import com.app.enums.RoleEnum;
import com.app.exception.UserNotFoundException;
import com.app.repository.OwnerPaymentConfigRepository;
import com.app.repository.UserRepository;

@Slf4j
@Service
@Transactional
public class OwnerPaymentConfigServiceImpl implements OwnerPaymentConfigService {

    // Valid UPI ID format: {username}@{bank} (e.g., merchant@okhdfcbank)
    private static final Pattern VALID_UPI_ID_PATTERN = Pattern.compile("^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$");

    @Autowired
    private OwnerPaymentConfigRepository ownerPaymentConfigRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ModelMapper mapper;

    @Override
    public OwnerPaymentConfigDTO getMyPaymentConfig() {
        User owner = getAuthenticatedOwner();
        OwnerPaymentConfig config = ownerPaymentConfigRepository.findByOwnerId(owner.getId())
                .orElseGet(() -> createDefaultConfig(owner));
        return mapToDto(config);
    }

    @Override
    public OwnerPaymentConfigDTO updateMyPaymentConfig(OwnerPaymentConfigRequestDTO request) {
        User owner = getAuthenticatedOwner();
        OwnerPaymentConfig config = ownerPaymentConfigRepository.findByOwnerId(owner.getId())
                .orElseGet(() -> createDefaultConfig(owner));

        // Validate and set UPI ID
        String upiId = normalize(request.getUpiId());
        validateUpiId(upiId);
        config.setUpiId(upiId);

        // Validate and set display name
        String displayName = normalize(request.getUpiDisplayName());
        if (displayName == null || displayName.isEmpty()) {
            throw new IllegalArgumentException("Display name cannot be empty");
        }
        if (displayName.length() > 60) {
            throw new IllegalArgumentException("Display name must not exceed 60 characters");
        }
        config.setUpiDisplayName(displayName);

        config.setPaymentEnabled(request.isPaymentEnabled());
        config.setOwner(owner);

        log.info("Updated payment config for owner: {}, UPI ID: {}", owner.getId(), upiId);
        return mapToDto(ownerPaymentConfigRepository.save(config));
    }

    /**
     * Validate UPI ID format
     * Expected format: username@bank (e.g., merchant@okhdfcbank)
     */
    private void validateUpiId(String upiId) {
        if (upiId == null || upiId.isEmpty()) {
            throw new IllegalArgumentException("UPI ID cannot be empty");
        }

        if (!VALID_UPI_ID_PATTERN.matcher(upiId).matches()) {
            log.error("Invalid UPI ID format provided: {}", upiId);
            throw new IllegalArgumentException(
                    "Invalid UPI ID format. Expected: username@bank (e.g., merchant@okhdfcbank or user@ybl)");
        }

        log.debug("Valid UPI ID format: {}", upiId);
    }

    private OwnerPaymentConfig createDefaultConfig(User owner) {
        OwnerPaymentConfig config = new OwnerPaymentConfig();
        config.setOwner(owner);
        config.setUpiId("");
        config.setUpiDisplayName("");
        config.setPaymentEnabled(false);
        return config;
    }

    private OwnerPaymentConfigDTO mapToDto(OwnerPaymentConfig config) {
        OwnerPaymentConfigDTO dto = mapper.map(config, OwnerPaymentConfigDTO.class);
        dto.setOwnerId(config.getOwner() != null ? config.getOwner().getId() : null);
        return dto;
    }

    private User getAuthenticatedOwner() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null) {
            throw new SecurityException("Authentication required.");
        }

        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new UserNotFoundException("Authenticated user not found."));
        boolean ownerRole = user.getUserRoles() != null
                && user.getUserRoles().stream().anyMatch(role -> RoleEnum.ROLE_OWNER.equals(role.getRoleName()));
        if (!ownerRole) {
            throw new SecurityException("Owner access required.");
        }

        return user;
    }

    private String normalize(String value) {
        return value == null ? null : value.trim();
    }
}
