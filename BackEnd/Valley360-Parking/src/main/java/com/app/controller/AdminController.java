package com.app.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.app.dto.UserDTO;
import com.app.dto.AdminOwnerRiskResponse;
import com.app.dto.BookingDTO;
import com.app.entities.User;
import com.app.enums.RoleEnum;
import com.app.security.JWTUtils;
import com.app.service.BookingPaymentService;
import com.app.service.AdminService;
import com.app.service.OwnerScoreService;
import com.app.service.ParkingAreaService;
import com.app.service.ParkingSlotService;
import com.app.service.UserService;

@RestController
@RequestMapping("/Admin")
@CrossOrigin(origins = "${app.cors.allowed-origins:http://localhost:5173}")
@SuppressWarnings("java:S107")
public class AdminController {

	private final UserService userService;
	private final AdminService admin;
	private final ParkingSlotService parkingSlotService;
	private final ParkingAreaService parkingAreaService;
	private final AuthenticationManager authManager;
	private final JWTUtils jwtUtils;
	private final OwnerScoreService ownerScoreService;
	private final BookingPaymentService bookingPaymentService;

	public AdminController(UserService userService, AdminService admin, ParkingSlotService parkingSlotService,
			ParkingAreaService parkingAreaService, AuthenticationManager authManager, JWTUtils jwtUtils,
			OwnerScoreService ownerScoreService, BookingPaymentService bookingPaymentService) {
		this.userService = userService;
		this.admin = admin;
		this.parkingSlotService = parkingSlotService;
		this.parkingAreaService = parkingAreaService;
		this.authManager = authManager;
		this.jwtUtils = jwtUtils;
		this.ownerScoreService = ownerScoreService;
		this.bookingPaymentService = bookingPaymentService;
	}

	@GetMapping("/findByRole")
	public ResponseEntity<List<UserDTO>> findByRole(@RequestParam String role) {
		List<UserDTO> users = userService.findByRole(RoleEnum.valueOf(role));
		return ResponseEntity.status(HttpStatus.OK).body(users);
	}

	@GetMapping("/dashboard")
	public ResponseEntity<Map<String, Long>> getDashboardData() {

		Map<String, Long> data = new HashMap<>();
		data.put("parkingSlots", parkingSlotService.countAllSlots());
		data.put("parkingAreas", parkingAreaService.countAllAreas());
		data.put("owners", userService.countAllOwners());
		data.put("customers", userService.countAllCustomers());
		return ResponseEntity.ok(data);
	}

	@PostMapping("/Login")
	public ResponseEntity<Map<String, Object>> login(@RequestParam String email, @RequestParam String password) {
		User adminUser = admin.login(email, password);

		UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(email, password);
		Authentication authenticationDetails = authManager.authenticate(authToken);

		Set<String> roleList = authenticationDetails.getAuthorities().stream()
				.map(GrantedAuthority::getAuthority)
				.collect(Collectors.toSet());

		Map<String, Object> userPayload = new HashMap<>();
		userPayload.put("id", adminUser.getId());
		userPayload.put("email", adminUser.getEmail());
		userPayload.put("firstName", adminUser.getFirstName());
		userPayload.put("lastName", adminUser.getLastName());
		userPayload.put("userRoles", roleList);

		Map<String, Object> response = new HashMap<>();
		response.put("token", jwtUtils.generateJwtToken(authenticationDetails));
		response.put("user", userPayload);

		return ResponseEntity.ok(response);
	}

	@PostMapping("/Register")
	public ResponseEntity<Map<String, Object>> registerAdmin(
			@RequestBody UserDTO userDTO,
			@RequestParam String employeeId) {
		// Employee ID is verified but NOT stored
		admin.registerAdmin(userDTO, employeeId);
		
		Map<String, Object> response = new HashMap<>();
		response.put("message", "Admin registered successfully");
		response.put("email", userDTO.getEmail());
		
		return ResponseEntity.status(HttpStatus.CREATED).body(response);
	}

	@GetMapping("/owners-risk")
	@PreAuthorize("hasRole('ADMIN')")
	public ResponseEntity<List<AdminOwnerRiskResponse>> getOwnersRisk() {
		List<AdminOwnerRiskResponse> response = ownerScoreService.getAdminOwnerRiskSummaries();
		return ResponseEntity.ok(response);
	}

	@GetMapping("/payment-review-queue")
	@PreAuthorize("hasRole('ADMIN')")
	public ResponseEntity<List<BookingDTO>> getPaymentReviewQueue() {
		return ResponseEntity.ok(bookingPaymentService.getAdminPaymentQueue());
	}
}
