package com.app.service;

import com.app.dto.OwnerPaymentConfigDTO;
import com.app.dto.OwnerPaymentConfigRequestDTO;

public interface OwnerPaymentConfigService {

    OwnerPaymentConfigDTO getMyPaymentConfig();

    OwnerPaymentConfigDTO updateMyPaymentConfig(OwnerPaymentConfigRequestDTO request);
}
