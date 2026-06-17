package com.app.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.app.dto.ParkingSlotDTO;
import com.app.service.ParkingSlotService;

@RestController
@RequestMapping("/parkingSlots")
@CrossOrigin(origins = "${app.cors.allowed-origins:http://localhost:5173}")
public class ParkingSlotController {

	private final ParkingSlotService parkingSlotService;

	public ParkingSlotController(ParkingSlotService parkingSlotService) {
		this.parkingSlotService = parkingSlotService;
	}
	
	@PostMapping("/Add")
	public ResponseEntity<String> addParkingSlot(@RequestBody ParkingSlotDTO parkingSlot){
		System.out.println("in parkingslot");
		parkingSlotService.addNewParkingSlot(parkingSlot);
		return ResponseEntity.status(HttpStatus.OK).body("Parking slot added !!");
	}
	
	@GetMapping("/{parkingAreaId}")
    public ResponseEntity<List<ParkingSlotDTO>> getParkingSlotsByParkingArea(@PathVariable Long parkingAreaId) {
        List<ParkingSlotDTO> parkingSlots = parkingSlotService.getParkingSlotsByParkingArea(parkingAreaId);
        return ResponseEntity.ok(parkingSlots);
    }
	
	@GetMapping("/GetAllParkingSlots")
	public ResponseEntity<List<ParkingSlotDTO>> getAllParkingSlots(){
		List<ParkingSlotDTO> slots = parkingSlotService.getParkingSlots();
		return ResponseEntity.ok(slots);
	}
	
	@GetMapping("/sortBy")
	public ResponseEntity<List<ParkingSlotDTO>> getAllParkingSlots(@RequestParam(defaultValue = "city") String sortBy) {
	    List<ParkingSlotDTO> parkingSlots = parkingSlotService.getAllParkingSlotsSorted(sortBy);
	    return ResponseEntity.ok(parkingSlots);
	}
}
