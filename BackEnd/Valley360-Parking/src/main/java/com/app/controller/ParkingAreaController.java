package com.app.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.app.dto.ParkingAreaDTO;
import com.app.entities.ParkingArea;
import com.app.enums.Status;
import com.app.service.ParkingAreaService;

@RestController
@RequestMapping("/parkingArea")
@CrossOrigin(origins = "${app.cors.allowed-origins:http://localhost:5173}")
public class ParkingAreaController {

	private final ParkingAreaService parkingAreaService;

	public ParkingAreaController(ParkingAreaService parkingAreaService) {
		this.parkingAreaService = parkingAreaService;
	}
	
	@PostMapping("/add")
	public ResponseEntity<ParkingArea> addParkingArea(@RequestBody ParkingAreaDTO parking){
		
		ParkingArea area = parkingAreaService.addParkingArea(parking);
		return ResponseEntity.status(HttpStatus.OK).body(area);
	}
	
	@GetMapping("/nearby")
    public ResponseEntity<List<ParkingAreaDTO>> findNearbyParking(@RequestParam double latitude,@RequestParam double longitude) {
        
        List<ParkingAreaDTO> nearbyParkingAreas = parkingAreaService.findNearbyParking(latitude, longitude, 3.0);
        return ResponseEntity.ok(nearbyParkingAreas);
    }
	
	
	
	@GetMapping("/GetAllParkingArea")
	public ResponseEntity<List<ParkingAreaDTO>> getAllParkingArea(){
		
		List<ParkingAreaDTO> area=parkingAreaService.getParkingarea();
		return ResponseEntity.ok(area);
	}
	
	@PutMapping("/update/{id}")
	public ResponseEntity<ParkingArea> updateParkingArea(@PathVariable Long id, @RequestBody ParkingAreaDTO areaDto){
		ParkingArea area = new ParkingArea();
		area.setArea(areaDto.getArea());
		area.setCity(areaDto.getCity());
		area.setPincode(areaDto.getPincode());
		area.setLatitude(areaDto.getLatitude());
		area.setLongitude(areaDto.getLongitude());
		area.setStatus(areaDto.getStatus());
		ParkingArea parkArea = parkingAreaService.updateParkingArea(id, area);
		return ResponseEntity.ok(parkArea);
	}
	
	@GetMapping("/{id}")
	public ResponseEntity<ParkingArea> getByParkingId(@PathVariable Long id){
		ParkingArea area = parkingAreaService.getByParkingId(id);
		return ResponseEntity.ok(area);
	}
	
	@GetMapping("/getByOwnerId/{ownerId}")
	public ResponseEntity<List<ParkingArea>> getParkingByOwner(@PathVariable Long ownerId){
		List<ParkingArea> parkingAreas = parkingAreaService.getParkingAreas(ownerId);
		return ResponseEntity.ok(parkingAreas);
	}
	
	@GetMapping("/byStatus")
    public ResponseEntity<List<ParkingAreaDTO>> getParkingAreasByStatus(@RequestParam String status) {
        List<ParkingAreaDTO> parkingAreas = parkingAreaService.findParkingAreaByStatus(Status.valueOf(status));
        return ResponseEntity.ok(parkingAreas);
    }
	
	
}
