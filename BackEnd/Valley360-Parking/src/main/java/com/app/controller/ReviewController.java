package com.app.controller;

import java.util.List;

import javax.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.app.dto.ParkingReviewSummaryDTO;
import com.app.dto.ReviewRequestDTO;
import com.app.dto.ReviewResponseDTO;
import com.app.service.ReviewService;

@RestController
@RequestMapping("/reviews")
//@CrossOrigin(origins = "${app.cors.allowed-origins:http://localhost:5173}")
@CrossOrigin(origins = "https://spirited-essence-production.up.railway.app/")
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @PostMapping
    public ResponseEntity<ReviewResponseDTO> createReview(@Valid @RequestBody ReviewRequestDTO request) {
        ReviewResponseDTO response = reviewService.createReview(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/parking/{parkingId}")
    public ResponseEntity<List<ReviewResponseDTO>> getReviewsByParking(@PathVariable Long parkingId) {
        return ResponseEntity.ok(reviewService.getReviewsForParkingArea(parkingId));
    }

    @GetMapping("/average/{parkingId}")
    public ResponseEntity<ParkingReviewSummaryDTO> getReviewAverage(@PathVariable Long parkingId) {
        return ResponseEntity.ok(reviewService.getParkingReviewSummary(parkingId));
    }
}
