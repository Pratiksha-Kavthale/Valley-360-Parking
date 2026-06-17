package com.app.security;

import java.util.HashMap;
import java.util.Map;
import java.util.Date;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;

@Component
public class JWTUtils {
	@Value("${JWT_SECRET_KEY}")
	private String jwtSecretKey;
	@Value("${JWT_EXP_TIMEOUT}")
	private String jwtExpTimeout;

	public String generateJwtToken(Authentication authentication) {
		CustomUserDetails userPrincipal = (CustomUserDetails) authentication.getPrincipal();
		try {
			Map<String, Object> claims = new HashMap<>();
			String role = null;
			if (userPrincipal.getUser() != null && userPrincipal.getUser().getRole() != null
					&& userPrincipal.getUser().getRole().getRoleName() != null) {
				role = userPrincipal.getUser().getRole().getRoleName().name();
			} else if (authentication.getAuthorities() != null && !authentication.getAuthorities().isEmpty()) {
				role = authentication.getAuthorities().iterator().next().getAuthority();
			}
			if (role != null) {
				claims.put("role", role);
			}

			String jwtToken = Jwts.builder()
					.setClaims(claims)
					.setSubject(userPrincipal.getUsername())
					.setIssuedAt(new Date())
					.setExpiration(new Date((new Date()).getTime() + Integer.parseInt(jwtExpTimeout)))
					.signWith(SignatureAlgorithm.HS512, jwtSecretKey)
					.compact();
			return jwtToken;
		} catch (Throwable ex) {
			ex.printStackTrace();
		}
		return "";
	}

	public boolean validateJwtToken(String jwtToken) {
		try {
			Jwts.parser().setSigningKey(jwtSecretKey).parseClaimsJws(jwtToken);
			return true;
		} catch (Exception ex) {
			// Log Error on console
		}
		return false;
	}

	public String getUserNameFromJwtToken(String jwtToken) {
		var username = Jwts.parser().setSigningKey(jwtSecretKey).parseClaimsJws(jwtToken).getBody().getSubject();
		return username;
	}

	public String getRoleFromJwtToken(String jwtToken) {
		Object role = Jwts.parser().setSigningKey(jwtSecretKey).parseClaimsJws(jwtToken).getBody().get("role");
		return role != null ? role.toString() : null;
	}

}