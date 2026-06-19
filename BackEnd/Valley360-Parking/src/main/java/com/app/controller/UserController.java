package com.app.controller;

import java.util.List;
import java.util.stream.Collectors;

import org.modelmapper.ModelMapper;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.app.dto.AuthResponse;
import com.app.dto.UserDTO;
import com.app.entities.User;
import com.app.enums.RoleEnum;
import com.app.security.CustomUserDetails;
import com.app.security.JWTUtils;
import com.app.service.UserService;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/User")
//@CrossOrigin(origins = "${app.cors.allowed-origins:http://localhost:5173}")
@CrossOrigin(origins = {
	    "http://localhost:5173",
	    "https://valley-360-parking-7zi9-ript5gl4k.vercel.app"
	})
public class UserController {

	private final UserService userService;
	private final AuthenticationManager authManager;
	private final JWTUtils utils;
	private final ModelMapper mapper;

	public UserController(UserService userService, AuthenticationManager authManager, JWTUtils utils,
			ModelMapper mapper) {
		this.userService = userService;
		this.authManager = authManager;
		this.utils = utils;
		this.mapper = mapper;
	}

	@PostMapping("/Register")
	public ResponseEntity<String> registerUser(@RequestBody UserDTO user) {
		System.out.println("user dto"+user);
		userService.registerUser(user);
		return ResponseEntity.status(HttpStatus.OK).body("User is created");
	}

	@GetMapping("/getByEmail/{email}")
	public ResponseEntity<User> getUserByEmail(@PathVariable String email) {
		return new ResponseEntity<>(userService.getUserByEmail(email), HttpStatus.FOUND);
	}

	@PutMapping("/updateUser/{email}")
	public User updateUser(@RequestBody UserDTO user, @PathVariable String email) {
		User updatedUser = mapper.map(user, User.class);
		return userService.updateUser(updatedUser, email);
	}

	@PostMapping("/Login")
	public ResponseEntity<AuthResponse> login(@RequestParam String email, @RequestParam String password) {

		UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(email,
				password);
		Authentication authenticationDetails = authManager.authenticate(authToken);
		CustomUserDetails customUserDetails = (CustomUserDetails) authenticationDetails.getPrincipal();
		User user = customUserDetails.getUser();
		var roleList = authenticationDetails.getAuthorities().stream().map(GrantedAuthority::getAuthority)
				.collect(Collectors.toSet());
		AuthResponse authResponse = new AuthResponse();
		roleList.forEach(role -> authResponse.getUserRoles().add(RoleEnum.valueOf(role)));
		String jwtToken = utils.generateJwtToken(authenticationDetails);
		authResponse.setJwtToken(jwtToken);
		authResponse.setToken(jwtToken);
		authResponse.setMessage("Authentication Successfull !!");
		mapper.map(user, authResponse);

		return ResponseEntity.status(HttpStatus.OK).body(authResponse);
	}

	@GetMapping("/{id}")
	public User getById(@PathVariable long id) {
		System.out.println("Fetching user by id={}"+ id);
		return userService.getById(id);
	}

	@GetMapping("/GetAllOwners")
	public List<User> getAllOwners() {
		return userService.getAllOwners();
	}

	@GetMapping("/GetAllCustomers")
	public List<User> getAllCustomers() {
		return userService.getAllCustomers();
	}

	@DeleteMapping("Delete/{id}")
	public ResponseEntity<String> deleteUser(@PathVariable Long id) {

		userService.delete(id);
		return ResponseEntity.ok("UserDeleted");
	}

}
