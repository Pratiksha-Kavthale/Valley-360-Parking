package com.app.service;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.app.dto.ParkingAreaDTO;
import com.app.dto.ParkingSlotDTO;
import com.app.entities.ParkingArea;
import com.app.entities.ParkingSlot;
import com.app.entities.User;
import com.app.enums.Status;
import com.app.exception.UserNotFoundException;
import com.app.repository.ParkingAreaRepository;
import com.app.repository.UserRepository;

@Service
@Transactional
public class ParkingAreaServiceImpl implements ParkingAreaService {

	@Autowired
	private ParkingAreaRepository parkingAreaRepository;
	
	@Autowired
	private ParkingSlotService parkingslotservice;
	
	@Autowired
	private UserRepository userRepository;
	
	@Autowired
	private ModelMapper mapper;
	
	private static final double EARTH_RADIUS = 6371; // Radius of the earth in km
	
	@Transactional
	@Override
	public ParkingArea addParkingArea(ParkingAreaDTO parking) {
		System.out.println("parking"+parking);
		User user = userRepository.findById(parking.getOwnerId())
				.orElseThrow(() -> new UserNotFoundException("Invalid id !!"));
		
		ParkingArea parkingArea = mapper.map(parking, ParkingArea.class);
		
		parkingArea.setUser(user);
			
		return parkingAreaRepository.save(parkingArea);
	}


//	@Override
//	public List<ParkingArea> getNearByParking(double lon, double lat) {
//		List<ParkingArea> list = parkingAreaRepository.findAll();
//		
//		List<ParkingArea> filteredList = list.stream().filter(l -> l.getLongitude() == lon && l.getLatitude() == lat)
//										.collect(Collectors.toList());
//		
//		return filteredList;
//	}


	@Override
	public List<ParkingAreaDTO> findNearbyParking(double currentLatitude, double currentLongitude, double radiusInKm) {
	    List<ParkingArea> allParkingAreas = parkingAreaRepository.findAll();

	    return allParkingAreas.stream()
	            .map(parkingArea -> {
	                double distance = calculateDistance(currentLatitude, currentLongitude,
	                        parkingArea.getLatitude(), parkingArea.getLongitude());
	                return new Object[] { parkingArea, distance };
	            })
	            .filter(obj -> (double) obj[1] <= radiusInKm)
	            .map(obj -> convertToDTOWithDetails((ParkingArea) obj[0], (double) obj[1]))
	            .collect(Collectors.toList());
	}

	private ParkingAreaDTO convertToDTOWithDetails(ParkingArea parkingArea, double distance) {
		ParkingAreaDTO dto = mapper.map(parkingArea, ParkingAreaDTO.class);
		
		// Set distance
		dto.setDistance(distance);
		
		// Calculate slots info
		Set<ParkingSlot> slots = parkingArea.getParkingSlots();
		if (slots != null && !slots.isEmpty()) {
			dto.setTotalSlots(slots.size());
			long availableCount = slots.stream()
				.filter(slot -> slot.getStatus() == Status.AVAILABLE)
				.count();
			dto.setAvailableSlots((int) availableCount);
			
			// Calculate price range
			double minPrice = slots.stream()
				.mapToDouble(ParkingSlot::getPrice)
				.min()
				.orElse(0);
			double maxPrice = slots.stream()
				.mapToDouble(ParkingSlot::getPrice)
				.max()
				.orElse(0);
			dto.setPriceMin(minPrice);
			dto.setPriceMax(maxPrice);
		} else {
			dto.setTotalSlots(0);
			dto.setAvailableSlots(0);
			dto.setPriceMin(0.0);
			dto.setPriceMax(0.0);
		}
		
		return dto;
	}

	private ParkingAreaDTO convertToDTO(ParkingArea parkingArea) {
//	    ParkingAreaDTO dto = new ParkingAreaDTO();
//	    dto.setId(parkingArea.getId());
//	    dto.setAddress(parkingArea.getAddress());
//	    dto.setLatitude(parkingArea.getLatitude());
//	    dto.setLongitude(parkingArea.getLongitude());
//	    dto.setStatus(parkingArea.getStatus());
//	    dto.setOwnerId(parkingArea.getUser().getId());
//	    return dto;
		
		return mapper.map(parkingArea, ParkingAreaDTO.class);

	}


    private double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);

        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return EARTH_RADIUS * c; // Distance in km
    }


	@Override
	public List<ParkingAreaDTO> findParkingAreaByStatus(Status status) {
		
		 List<ParkingArea> parkingAreas = parkingAreaRepository.findByStatus(status);
		 
		 return parkingAreas.stream()
	                .map(parkingArea -> mapper.map(parkingArea, ParkingAreaDTO.class))
	                .collect(Collectors.toList());
	}
	
	@Override
	public long countAllAreas() {
        return parkingAreaRepository.count();
    }


	@Override
	public List<ParkingAreaDTO> getParkingarea() {
		List<ParkingArea> parkingarea=parkingAreaRepository.findAll();
		
		return parkingarea.stream()
                .map(ParkingArea -> mapper.map(ParkingArea, ParkingAreaDTO.class))
                .collect(Collectors.toList());
	}
	
	@Override
	public List<ParkingArea> getParkingAreas(Long ownerId) {
		List<ParkingArea> area = parkingAreaRepository.findByUserId(ownerId);
		return area;
	}


	@Override
	public ParkingArea getByParkingId(Long id) {
		
		return parkingAreaRepository.findById(id).orElseThrow(() -> new RuntimeException("Parking Id not found !!"));
	}


	@Override
	public ParkingArea updateParkingArea(Long id, ParkingArea area) {
		ParkingArea parkArea = parkingAreaRepository.findById(id).orElseThrow(() -> new RuntimeException("Parking Id not found !!"));
		return parkArea;
	}


	@Transactional
	@Override
	public void deleteByOwnerid(Long ownerId) {
	    List<ParkingArea> areas = parkingAreaRepository.findByUserId(ownerId);

	    if (areas == null || areas.isEmpty()) {
	        System.out.println("No parking areas found for user ID: " + ownerId);
	        return;
	    }

	    System.out.println("In controller - Parking areas found for user ID: " + ownerId);

	    for (ParkingArea parkingArea : areas) {
	        Set<ParkingSlot> parkingSlots = parkingArea.getParkingSlots();

	        for (ParkingSlot parkingSlot : parkingSlots) {
	            try {
	                parkingslotservice.deleteByAreaID(parkingSlot.getId());
	            } catch (Exception e) {
	                System.err.println("Error deleting parking slot with ID: " + parkingSlot.getId() + ", Error: " + e.getMessage());
	            }
	        }
	    }

	    try {
	        parkingAreaRepository.deleteByUserId(ownerId);
	    } catch (Exception e) {
	        System.err.println("Error deleting parking areas with user ID: " + ownerId + ", Error: " + e.getMessage());
	    }
	}
}
