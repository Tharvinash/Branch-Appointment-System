package com.branch.appointment.backend.service;

import com.branch.appointment.backend.dto.BayNameDto;
import com.branch.appointment.backend.dto.ReasonDto;
import com.branch.appointment.backend.dto.TechnicianDto;
import com.branch.appointment.backend.entity.BayNameEntity;
import com.branch.appointment.backend.entity.ReasonEntity;
import com.branch.appointment.backend.entity.TechnicianEntity;
import com.branch.appointment.backend.enums.TechnicianStatusEnum;
import com.branch.appointment.backend.repository.BayNameRepository;
import com.branch.appointment.backend.repository.ReasonRepository;
import com.branch.appointment.backend.repository.TechnicianRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class TechnicianService {

  private final TechnicianRepository technicianRepository;
  private final ReasonRepository reasonRepository;
  private final BayNameRepository bayNameRepository;

  public List<TechnicianDto> getTechnicians() {
    return technicianRepository.findAll()
        .stream()
        .map(this::toDto)
        .toList();
  }

  public TechnicianDto getTechnician(Long id) {
    TechnicianEntity entity = technicianRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("Technician not found"));
    return toDto(entity);
  }

  @Transactional
  public TechnicianDto createTechnician(TechnicianDto dto) {
    TechnicianEntity entity = new TechnicianEntity();
    entity.setName(dto.getName());
    entity.setStatus(dto.getStatus());
    
    // Set reason only if status is ON_LEAVE and reason is provided
    if (dto.getStatus() == TechnicianStatusEnum.ON_LEAVE && dto.getReason() != null && dto.getReason().getId() != null) {
      ReasonEntity reason = reasonRepository.findById(dto.getReason().getId())
          .orElseThrow(() -> new RuntimeException("Reason not found with id: " + dto.getReason().getId()));
      entity.setReason(reason);
    } else {
      entity.setReason(null);
    }
    
    // Set job skills
    if (dto.getJobSkills() != null && !dto.getJobSkills().isEmpty()) {
      Set<BayNameEntity> jobSkills = dto.getJobSkills().stream()
          .map(bayNameDto -> bayNameRepository.findById(bayNameDto.getId())
              .orElseThrow(() -> new RuntimeException("BayName not found with id: " + bayNameDto.getId())))
          .collect(Collectors.toSet());
      entity.setJobSkills(jobSkills);
    } else {
      entity.setJobSkills(new HashSet<>());
    }
    
    TechnicianEntity saved = technicianRepository.save(entity);
    return toDto(saved);
  }

  @Transactional
  public TechnicianDto updateTechnician(Long id, TechnicianDto dto) {
    TechnicianEntity entity = technicianRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("Technician not found"));
    entity.setName(dto.getName());
    entity.setStatus(dto.getStatus());
    
    // If status is AVAILABLE, set reason to null
    if (dto.getStatus() == TechnicianStatusEnum.AVAILABLE) {
      entity.setReason(null);
    } 
    // If status is ON_LEAVE and reason is provided, set the reason
    else if (dto.getStatus() == TechnicianStatusEnum.ON_LEAVE && dto.getReason() != null && dto.getReason().getId() != null) {
      ReasonEntity reason = reasonRepository.findById(dto.getReason().getId())
          .orElseThrow(() -> new RuntimeException("Reason not found with id: " + dto.getReason().getId()));
      entity.setReason(reason);
    }
    // If status is ON_LEAVE but no reason provided, keep existing reason (or set to null if updating from AVAILABLE)
    else if (dto.getStatus() == TechnicianStatusEnum.ON_LEAVE && (dto.getReason() == null || dto.getReason().getId() == null)) {
      // Keep existing reason if it exists, otherwise null
      // This allows updating name/status without changing reason
    }
    
    // Update job skills
    if (dto.getJobSkills() != null) {
      Set<BayNameEntity> jobSkills = dto.getJobSkills().stream()
          .map(bayNameDto -> bayNameRepository.findById(bayNameDto.getId())
              .orElseThrow(() -> new RuntimeException("BayName not found with id: " + bayNameDto.getId())))
          .collect(Collectors.toSet());
      entity.setJobSkills(jobSkills);
    }
    // If jobSkills is null in DTO, keep existing skills (don't clear them)
    
    TechnicianEntity updated = technicianRepository.save(entity);
    return toDto(updated);
  }

  public void deleteTechnician(Long id) {
    technicianRepository.deleteById(id);
  }

  private TechnicianDto toDto(TechnicianEntity entity) {
    ReasonDto reasonDto = null;
    if (entity.getReason() != null) {
      reasonDto = ReasonDto.builder()
          .id(entity.getReason().getId())
          .reason(entity.getReason().getReason())
          .build();
    }
    
    // Map job skills
    List<BayNameDto> jobSkills = null;
    if (entity.getJobSkills() != null && !entity.getJobSkills().isEmpty()) {
      jobSkills = entity.getJobSkills().stream()
          .map(bayName -> BayNameDto.builder()
              .id(bayName.getId())
              .name(bayName.getBayName())
              .build())
          .collect(Collectors.toList());
    }
    
    return TechnicianDto.builder()
        .id(entity.getId())
        .name(entity.getName())
        .status(entity.getStatus())
        .reason(reasonDto)
        .jobSkills(jobSkills)
        .build();
  }
}

