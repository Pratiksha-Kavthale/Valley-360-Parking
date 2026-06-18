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
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.app.security.JWTRequestFilter;

@EnableWebSecurity
@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    @Autowired
    private JWTRequestFilter filter;

    @Value("${app.cors.allowed-origins:http://localhost:5173}")
    private String allowedOrigins;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        http
            .cors()
            .and()
            .csrf().disable()

            // handle unauthorized errors properly
            .exceptionHandling()
            .authenticationEntryPoint((request, response, ex) -> 
                response.sendError(HttpServletResponse.SC_UNAUTHORIZED, ex.getMessage())
            )

            .and()
            .sessionManagement()
            .sessionCreationPolicy(SessionCreationPolicy.STATELESS)

            .and()
            .authorizeHttpRequests()
            .antMatchers(
                "/Admin/Login",
                "/Admin/Register",
                "/User/Login",
                "/User/Register",
                "/Login",
                "/SignUp",
                "/api/auth/**",
                "/swagger*/**",
                "/v*/api-docs/**"
            ).permitAll()

            .antMatchers(HttpMethod.OPTIONS, "/**").permitAll()
            .antMatchers(HttpMethod.GET, "/reviews/**").permitAll()

            // =========================
            // ROLE BASED ACCESS
            // =========================
            .antMatchers("/Admin/**").hasRole("ADMIN")
            .antMatchers("/owner/**").hasRole("OWNER")

            .antMatchers("/User/**").hasAnyRole("ADMIN", "OWNER", "CUSTOMER")
            .antMatchers("/booking/**").hasAnyRole("ADMIN", "OWNER", "CUSTOMER")
            .antMatchers("/parkingSlots/**").hasAnyRole("ADMIN", "OWNER", "CUSTOMER")
            .antMatchers("/parkingArea/**").hasAnyRole("ADMIN", "OWNER", "CUSTOMER")

            .antMatchers(HttpMethod.POST, "/reviews/**")
                .hasAnyRole("ADMIN", "OWNER", "CUSTOMER")

            // =========================
            // EVERYTHING ELSE
            // =========================
            .anyRequest().authenticated()

            .and()
            .addFilterBefore(filter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration config = new CorsConfiguration();

        config.setAllowedOrigins(Arrays.asList(allowedOrigins.split(",")));
        config.setAllowedMethods(Arrays.asList("GET","POST","PUT","DELETE","PATCH","OPTIONS"));
        config.setAllowedHeaders(Arrays.asList("Authorization","Content-Type","X-Requested-With","Accept","Origin"));
        config.setExposedHeaders(Arrays.asList("Authorization"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);

        return source;
    }
}