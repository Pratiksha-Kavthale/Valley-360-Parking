package com.app.service;

import com.app.dto.UserDTO;
import com.app.entities.User;

public interface AdminService {

	User login(String email, String password);
	
	User registerAdmin(UserDTO userDTO, String employeeId);
}
