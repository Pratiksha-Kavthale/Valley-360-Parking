package com.app.service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.modelmapper.ModelMapper;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.extern.slf4j.Slf4j;
import com.app.dto.UserDTO;
import com.app.entities.Role;
import com.app.entities.User;
import com.app.enums.RoleEnum;
import com.app.exception.InvalidIdFoundException;
import com.app.exception.UserAlreadyExistsException;
import com.app.exception.UserNotFoundException;
import com.app.repository.RoleRepository;
import com.app.repository.UserRepository;
import com.app.security.CustomUserDetails;

@Slf4j
@Service
@Transactional
public class UserServiceImpl implements UserService, UserDetailsService {

	private final UserRepository userRepository;
	private final RoleRepository roleRepository;
	private final ParkingAreaService parkingAreaService;
	private final PasswordEncoder passwordEncoder;
	private final ModelMapper mapper;

	public UserServiceImpl(UserRepository userRepository, RoleRepository roleRepository,
			ParkingAreaService parkingAreaService, PasswordEncoder passwordEncoder, ModelMapper mapper) {
		this.userRepository = userRepository;
		this.roleRepository = roleRepository;
		this.parkingAreaService = parkingAreaService;
		this.passwordEncoder = passwordEncoder;
		this.mapper = mapper;
	}
	
	@Override
	public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
		User user = userRepository.findByEmail(email).orElseThrow(() -> new UsernameNotFoundException("Invalid Email ID !!"));
		return new CustomUserDetails(user);
	}

	@Override
	public User registerUser(UserDTO userDTO) {
        // Check if the role exists
		System.out.println("Registering user with roleId={}"+ userDTO.getRoleId());
        Role role = roleRepository.findById(userDTO.getRoleId())
            .orElseThrow(() -> new InvalidIdFoundException("Invalid role ID !!"));

        // Check if the user already exists
        if (userAlreadyExists(userDTO.getEmail())) {
            throw new UserAlreadyExistsException(userDTO.getEmail() + " already exists !");
        }

        // Map UserDTO to User entity
        User newUser = mapper.map(userDTO, User.class);
              
        // Set the role to the user
        newUser.setRole(role);
        var persistRole =  roleRepository.findById(userDTO.getRoleId()).orElseThrow();
		Set<Role> roles = new HashSet<>();
        roles.add(persistRole);
        newUser.setUserRoles(roles);
        //Encode the user's password
        newUser.setPassword(passwordEncoder.encode(userDTO.getPassword()));

        // Save and return the new user
        return userRepository.save(newUser);
    }

	private boolean userAlreadyExists(String email) {
		
		return userRepository.findByEmail(email).isPresent();
	}

	@Override
	public User updateUser(User user, String email) {
		
		return userRepository.findByEmail(email).map(u -> {
			u.setFirstName(user.getFirstName());
			u.setLastName(user.getLastName());
			u.setContact(user.getContact());
			u.setAddress(user.getAddress());
			return userRepository.save(u);
		}).orElseThrow(() -> new UserNotFoundException("User could not be found !"));
	}

	@Override
	public User getUserByEmail(String email) {
		return userRepository.findByEmail(email).orElseThrow(() -> new UserNotFoundException("No user found with the email :"+email));
	}

	@Override
	public void deleteUser(String email) {
		throw new UnsupportedOperationException("deleteUser by email is not supported. Use delete(Long id) instead.");
	}

	@Override
	public User login(String email, String password) {
		User user = userRepository.findByEmail(email).orElseThrow(() -> new InvalidIdFoundException("Invalid id !!"));
		if(user != null && (password.equals(user.getPassword()))) {
			return user;
			
		}
		throw new InvalidIdFoundException("Invalid email or password");
	}

	@Override
	public List<UserDTO> findByRole(RoleEnum role) {
		List<User> users = userRepository.findByRole(role);
		return users.stream()
                .map(user -> mapper.map(user, UserDTO.class))
                .collect(Collectors.toList());
	}

	@Override
	public User getById(long id) {
		log.debug("Fetching user by id={}", id);
		return userRepository.findById(id).orElseThrow(()->new InvalidIdFoundException("Id not found"));
	}

	@Override
	public long countAllOwners() {
		return userRepository.countUsersByRoleName(RoleEnum.ROLE_OWNER);
	}

	@Override
	public long countAllCustomers() {
		return userRepository.countUsersByRoleName1(RoleEnum.ROLE_CUSTOMER);
	}

	@Override
	public List<User> getAllOwners() {
		return userRepository.GetAllOwners(RoleEnum.ROLE_OWNER);
	}
	@Override
	public List<User> getAllCustomers() {
		return userRepository.GetAllCustomers(RoleEnum.ROLE_CUSTOMER);
	}

	@Transactional
	@Override
	public String delete(Long id) {
		log.debug("Deleting user id={}", id);
		parkingAreaService.deleteByOwnerid(id);
		userRepository.findById(id).orElseThrow(()-> new InvalidIdFoundException("Invalid id"));
		
		userRepository.deleteById(id);
		return "Deleted";
	}
		
}