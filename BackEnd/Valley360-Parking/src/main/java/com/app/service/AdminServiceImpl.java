package com.app.service;

import java.util.HashSet;
import java.util.Set;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.app.dto.UserDTO;
import com.app.entities.Role;
import com.app.entities.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.app.enums.RoleEnum;
import com.app.exception.UserAlreadyExistsException;
import com.app.repository.RoleRepository;
import com.app.repository.UserRepository;

@Service
@Transactional
public class AdminServiceImpl implements AdminService {

	private static final String ADMIN_EMPLOYEE_ID = "12345";

	@Autowired
	private UserRepository userRepository;

	@Autowired
	private RoleRepository roleRepository;

	@Autowired
	private PasswordEncoder passwordEncoder;

	@Override
	public User login(String email, String password) {
		User adminUser = userRepository.findByEmail(email)
				.orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));
		
		// Check both the single role field AND the userRoles ManyToMany collection
		boolean hasAdminRole = (adminUser.getRole() != null && adminUser.getRole().getRoleName() == RoleEnum.ROLE_ADMIN);
		System.out.println("hasAdminRole"+hasAdminRole);
		boolean hasAdminInUserRoles = adminUser.getUserRoles().stream()
				.anyMatch(role -> role.getRoleName() == RoleEnum.ROLE_ADMIN);
		System.out.println("hasAdminInUserRoles"+hasAdminInUserRoles);
		if (!hasAdminRole && !hasAdminInUserRoles) {
			System.out.println(hasAdminRole +"and"+ hasAdminInUserRoles  );
			throw new AccessDeniedException("Unauthorized: admin access required");
		}

		if (!passwordEncoder.matches(password, adminUser.getPassword())) {
			System.out.println(adminUser.getPassword());
			System.out.println(hasAdminRole +"and"+ passwordEncoder.matches(password, adminUser.getPassword())  );
			throw new BadCredentialsException("Invalid email or password");
		}

		return adminUser;
	}

	@Override
	public User registerAdmin(UserDTO userDTO, String employeeId) {
		// Verify the secret employee ID - NOT stored in database
		if (employeeId == null || !ADMIN_EMPLOYEE_ID.equals(employeeId)) {
			throw new AccessDeniedException("Invalid employee ID. Admin registration denied.");
		}

		// Check if user already exists
		if (userRepository.findByEmail(userDTO.getEmail()).isPresent()) {
			throw new UserAlreadyExistsException(userDTO.getEmail() + " already exists!");
		}

		// Get admin role
		Role adminRole = roleRepository.findByRoleName(RoleEnum.ROLE_ADMIN)
				.orElseThrow(() -> new RuntimeException("Admin role not found in database"));

		// Create new admin user
		User newAdmin = new User();
		newAdmin.setEmail(userDTO.getEmail());
		newAdmin.setPassword(passwordEncoder.encode(userDTO.getPassword()));
		newAdmin.setFirstName(userDTO.getFirstName());
		newAdmin.setLastName(userDTO.getLastName());
		newAdmin.setContact(userDTO.getContact());
		newAdmin.setAddress(userDTO.getAddress());
		newAdmin.setGender(userDTO.getGender());
		newAdmin.setRole(adminRole);

		// Set userRoles collection as well
		Set<Role> roles = new HashSet<>();
		roles.add(adminRole);
		newAdmin.setUserRoles(roles);

		return userRepository.save(newAdmin);
	}
}
