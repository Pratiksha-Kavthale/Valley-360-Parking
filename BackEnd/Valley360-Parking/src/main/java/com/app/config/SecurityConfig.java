package com.app.config;

import java.util.Arrays;

import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.app.security.JWTRequestFilter;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    @Autowired
    private JWTRequestFilter filter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        http
            // ✅ IMPORTANT: attach CORS properly
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())

            // ✅ handle unauthorized
            .exceptionHandling(ex -> ex.authenticationEntryPoint(
                (request, response, authException) ->
                    response.sendError(HttpServletResponse.SC_UNAUTHORIZED, authException.getMessage())
            ))

            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )

            .authorizeHttpRequests(auth -> auth

                // ✅ PUBLIC APIs
                .antMatchers(
                    
                    "/Admin/**",
                    "/Admin/Register",
                    "/User/Login",
                    "/User/Register",
                    "/Login",
                    "/SignUp",
                    "/api/auth/**",
                    "/swagger*/**",
                    "/v*/api-docs/**",
                    "/contact/**"
                ).permitAll()

                .antMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .antMatchers(HttpMethod.GET, "/reviews/**").permitAll()

                // ✅ ROLE BASED
                .antMatchers("/Admin/**").hasRole("ADMIN")
                .antMatchers("/owner/**").hasRole("OWNER")
                .antMatchers("/User/**").hasAnyRole("ADMIN", "OWNER", "CUSTOMER")
                .antMatchers("/booking/**").hasAnyRole("ADMIN", "OWNER", "CUSTOMER")
                .antMatchers("/parkingSlots/**").hasAnyRole("ADMIN", "OWNER", "CUSTOMER")
                .antMatchers("/parkingArea/**").hasAnyRole("ADMIN", "OWNER", "CUSTOMER")

                .antMatchers("/reviews/**")
                    .hasAnyRole("ADMIN", "OWNER", "CUSTOMER")

                // everything else
                .anyRequest().authenticated()
            )

            // ✅ JWT filter
            .addFilterBefore(filter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    // =========================
    // AUTH MANAGER
    // =========================
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    // =========================
    // CORS CONFIG
    // =========================
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration config = new CorsConfiguration();

        config.setAllowedOrigins(Arrays.asList(
            "http://localhost:5173",
            "https://valley-360-parking-7zi9-ript5gl4k.vercel.app"
        ));

        config.setAllowedMethods(Arrays.asList("GET","POST","PUT","DELETE","PATCH","OPTIONS"));

        config.setAllowedHeaders(Arrays.asList("*"));

        config.setExposedHeaders(Arrays.asList("Authorization"));

        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);

        return source;
    }
}