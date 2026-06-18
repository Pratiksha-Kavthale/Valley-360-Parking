package com.app.config;

import java.util.Arrays;

import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.app.security.JWTRequestFilter;

@EnableWebSecurity // mandatory
@Configuration // mandatory
@EnableGlobalMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

	@Autowired
	private JWTRequestFilter filter;

	@Value("${app.cors.allowed-origins:http://localhost:5173}")
	private String allowedOrigins;

	@Bean
	public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
		http.cors().and().csrf().disable().exceptionHandling().authenticationEntryPoint((request, response, ex) -> {
			response.sendError(HttpServletResponse.SC_UNAUTHORIZED, ex.getMessage());
		}).and().authorizeRequests()
				// Specific public endpoints first (more specific rules before general ones)
				.antMatchers("/Admin/Login", "/Admin/Register", "/User/Register", "Login","/SignUp", "/User/Login", "/api/auth/**",
						"/swagger*/**", "/v*/api-docs/**")
				.permitAll()
				.antMatchers(HttpMethod.GET, "/reviews/**").permitAll()
				// Admin endpoints require ADMIN role (after specific permitAll rules)
				.antMatchers("/Admin/**", "/admin/**").hasRole("ADMIN")
				.antMatchers("/owner/**").hasRole("OWNER")
				.antMatchers(HttpMethod.POST, "/reviews/**").hasAnyRole("OWNER", "CUSTOMER", "ADMIN")
				.antMatchers("/User/**").hasAnyRole("OWNER", "CUSTOMER", "ADMIN")
				// .antMatchers("/booking/today/**").hasAnyRole("OWNER", "CUSTOMER", "ADMIN")
				.antMatchers("/booking/**").hasAnyRole("OWNER", "CUSTOMER", "ADMIN")
				.antMatchers("/parkingSlots/**").hasAnyRole("ADMIN", "CUSTOMER", "OWNER")
				.antMatchers("/parkingArea/**").hasAnyRole("ADMIN", "CUSTOMER", "OWNER")
				.antMatchers(HttpMethod.OPTIONS).permitAll().anyRequest().authenticated().and().sessionManagement()
				.sessionCreationPolicy(SessionCreationPolicy.STATELESS).and()
				.addFilterBefore(filter, UsernamePasswordAuthenticationFilter.class);

		return http.build();
	}

	// configure auth mgr bean : to be used in Authentication REST controller
	@Bean
	public AuthenticationManager authenticatonMgr(AuthenticationConfiguration config) throws Exception {
		return config.getAuthenticationManager();
	}

	@Bean
	public CorsConfigurationSource corsConfigurationSource() {
		CorsConfiguration configuration = new CorsConfiguration();
		configuration.setAllowedOrigins(Arrays.asList(allowedOrigins.split(",")));
		configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
		configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "X-Requested-With", "Accept", "Origin"));
		configuration.setExposedHeaders(Arrays.asList("Authorization"));
		configuration.setAllowCredentials(true);
		configuration.setMaxAge(3600L);
		
		UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
		source.registerCorsConfiguration("/**", configuration);
		return source;
	}

}