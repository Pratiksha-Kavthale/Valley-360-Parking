package com.app.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.app.entities.Role;
import com.app.enums.RoleEnum;

public interface RoleRepository extends JpaRepository<Role, Long> {
	Optional<Role> findByRoleName(RoleEnum roleName);
}
