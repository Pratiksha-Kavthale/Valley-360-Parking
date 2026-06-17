package com.app.service;

import java.util.List;

import com.app.dto.UserDTO;
import com.app.entities.User;
import com.app.enums.RoleEnum;

public interface UserService {

	User registerUser(UserDTO user);
	User updateUser(User user, String email);
	User getUserByEmail(String email);
	void deleteUser(String email);
	User login(String email, String password);
	List<UserDTO> findByRole(RoleEnum role);
	User getById(long id);
	long countAllOwners();
	long countAllCustomers();
	List<User> getAllOwners();
	List<User> getAllCustomers();
	String delete(Long id);
}
