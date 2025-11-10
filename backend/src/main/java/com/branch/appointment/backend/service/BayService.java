package com.branch.appointment.backend.service;

import com.branch.appointment.backend.dto.BayDto;
import com.branch.appointment.backend.dto.BayNameDto;
import com.branch.appointment.backend.entity.BayEntity;
import com.branch.appointment.backend.entity.BayNameEntity;
import com.branch.appointment.backend.entity.TechnicianEntity;
import com.branch.appointment.backend.mapper.BayMapper;
import com.branch.appointment.backend.repository.BayNameRepository;
import com.branch.appointment.backend.repository.BayRepository;
import com.branch.appointment.backend.repository.TechnicianRepository;
import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@AllArgsConstructor
public class BayService {

  private final BayRepository bayRepository;
  private final BayMapper bayMapper;
  private final BayNameRepository bayNameRepository;
  private final TechnicianRepository technicianRepository;

  public List<BayDto> getBays() {
    return bayRepository.findAll()
        .stream()
        .map(bayMapper::toDto)
        .toList();
  }

  @Transactional
  public BayDto createBay(BayDto bayDto) {
    BayNameEntity bayName = bayNameRepository.findById(bayDto.getName().getId())
        .orElseThrow(() -> new RuntimeException("BayName not found with id: " + bayDto.getName().getId()));

    TechnicianEntity technician = technicianRepository.findById(bayDto.getTechnician().getId())
        .orElseThrow(() -> new RuntimeException("Technician not found with id: " + bayDto.getTechnician().getId()));

    // Validate that technician has the required skill (bay name) for this bay
    if (technician.getJobSkills() == null || 
        !technician.getJobSkills().stream()
            .anyMatch(skill -> skill.getId().equals(bayName.getId()))) {
      throw new RuntimeException(
          "Technician '" + technician.getName() + "' does not have the required skill '" + 
          bayName.getBayName() + "' to be assigned to this bay. Please assign the skill to the technician first."
      );
    }

    BayEntity bay = bayMapper.toEntity(bayDto, bayName, technician);
    BayEntity savedBay = bayRepository.save(bay);

    return bayMapper.toDto(savedBay);
  }



  public BayDto getBayById(Long id) {
    BayEntity bay = bayRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("Bay not found with id: " + id));
    return bayMapper.toDto(bay);
  }

  @Transactional
  public BayDto updateBay(Long id, BayDto bayDto) {
    BayEntity existingBay = bayRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("Bay not found with id: " + id));

    // ✅ Update BayName
    BayNameEntity newBayName;
    if (bayDto.getName() != null && bayDto.getName().getId() != null) {
      newBayName = bayNameRepository.findById(bayDto.getName().getId())
          .orElseThrow(() -> new RuntimeException("BayName not found with id: " + bayDto.getName().getId()));
      existingBay.setBayName(newBayName);
    } else {
      newBayName = existingBay.getBayName();
    }

    // ✅ Update Technician
    TechnicianEntity technicianToAssign;
    if (bayDto.getTechnician() != null && bayDto.getTechnician().getId() != null) {
      technicianToAssign = technicianRepository.findById(bayDto.getTechnician().getId())
          .orElseThrow(() -> new RuntimeException("Technician not found with id: " + bayDto.getTechnician().getId()));
    } else if (existingBay.getTechnician() != null) {
      // If no technician in DTO but bay already has one, keep the existing technician
      technicianToAssign = existingBay.getTechnician();
    } else {
      technicianToAssign = null;
    }
    
    // Validate that assigned technician has the required skill (bay name) for this bay
    if (technicianToAssign != null && newBayName != null) {
      final BayNameEntity finalBayName = newBayName; // Make effectively final for lambda
      if (technicianToAssign.getJobSkills() == null || 
          !technicianToAssign.getJobSkills().stream()
              .anyMatch(skill -> skill.getId().equals(finalBayName.getId()))) {
        throw new RuntimeException(
            "Technician '" + technicianToAssign.getName() + "' does not have the required skill '" + 
            newBayName.getBayName() + "' to be assigned to this bay. Please assign the skill to the technician first."
        );
      }
      
      // Only update technician if it was provided in DTO
      if (bayDto.getTechnician() != null && bayDto.getTechnician().getId() != null) {
        existingBay.setTechnician(technicianToAssign);
      }
    }

    // ✅ Update other fields
    existingBay.setBayNumber(bayDto.getNumber());
    existingBay.setStatus(bayDto.getStatus());

    BayEntity updatedBay = bayRepository.save(existingBay);
    return bayMapper.toDto(updatedBay);
  }

  public void deleteBay(Long id) {
    if (!bayRepository.existsById(id)) {
      throw new RuntimeException("Bay not found with id: " + id);
    }
    bayRepository.deleteById(id);
  }

  public List<BayNameDto> getBayNames() {
    return bayNameRepository.findAll()
        .stream()
        .map(b -> new BayNameDto(b.getId(), b.getBayName()))
        .toList();
  }
}

