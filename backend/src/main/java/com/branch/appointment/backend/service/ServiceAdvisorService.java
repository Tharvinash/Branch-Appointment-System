package com.branch.appointment.backend.service;

import com.branch.appointment.backend.dto.ReasonDto;
import com.branch.appointment.backend.dto.ServiceAdvisorDto;
import com.branch.appointment.backend.entity.ReasonEntity;
import com.branch.appointment.backend.entity.ServiceAdvisorEntity;
import com.branch.appointment.backend.enums.ServiceAdvisorStatusEnum;
import com.branch.appointment.backend.repository.ReasonRepository;
import com.branch.appointment.backend.repository.ServiceAdvisorRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@AllArgsConstructor
public class ServiceAdvisorService {

  private final ServiceAdvisorRepository repository;
  private final ReasonRepository reasonRepository;

  public List<ServiceAdvisorDto> getAll() {
    return repository.findAll()
        .stream()
        .map(this::toDto)
        .toList();
  }

  public ServiceAdvisorDto getById(Long id) {
    ServiceAdvisorEntity entity = repository.findById(id)
        .orElseThrow(() -> new RuntimeException("Service Advisor not found"));
    return toDto(entity);
  }

  public ServiceAdvisorDto create(ServiceAdvisorDto dto) {
    ServiceAdvisorEntity entity = new ServiceAdvisorEntity();
    entity.setName(dto.getName());
    entity.setStatus(dto.getStatus());
    
    // Set reason only if status is ON_LEAVE and reason is provided
    if (dto.getStatus() == ServiceAdvisorStatusEnum.ON_LEAVE && dto.getReason() != null && dto.getReason().getId() != null) {
      ReasonEntity reason = reasonRepository.findById(dto.getReason().getId())
          .orElseThrow(() -> new RuntimeException("Reason not found with id: " + dto.getReason().getId()));
      entity.setReason(reason);
    } else {
      entity.setReason(null);
    }
    
    return toDto(repository.save(entity));
  }

  @Transactional
  public ServiceAdvisorDto update(Long id, ServiceAdvisorDto dto) {
    ServiceAdvisorEntity entity = repository.findById(id)
        .orElseThrow(() -> new RuntimeException("Service Advisor not found"));
    entity.setName(dto.getName());
    entity.setStatus(dto.getStatus());
    
    // If status is AVAILABLE, set reason to null
    if (dto.getStatus() == ServiceAdvisorStatusEnum.AVAILABLE) {
      entity.setReason(null);
    } 
    // If status is ON_LEAVE and reason is provided, set the reason
    else if (dto.getStatus() == ServiceAdvisorStatusEnum.ON_LEAVE && dto.getReason() != null && dto.getReason().getId() != null) {
      ReasonEntity reason = reasonRepository.findById(dto.getReason().getId())
          .orElseThrow(() -> new RuntimeException("Reason not found with id: " + dto.getReason().getId()));
      entity.setReason(reason);
    }
    // If status is ON_LEAVE but no reason provided, keep existing reason (or set to null if updating from AVAILABLE)
    else if (dto.getStatus() == ServiceAdvisorStatusEnum.ON_LEAVE && (dto.getReason() == null || dto.getReason().getId() == null)) {
      // Keep existing reason if it exists, otherwise null
      // This allows updating name/status without changing reason
    }
    
    return toDto(repository.save(entity));
  }

  public void delete(Long id) {
    repository.deleteById(id);
  }

  private ServiceAdvisorDto toDto(ServiceAdvisorEntity entity) {
    ReasonDto reasonDto = null;
    if (entity.getReason() != null) {
      reasonDto = ReasonDto.builder()
          .id(entity.getReason().getId())
          .reason(entity.getReason().getReason())
          .build();
    }
    
    return ServiceAdvisorDto.builder()
        .id(entity.getId())
        .name(entity.getName())
        .status(entity.getStatus())
        .reason(reasonDto)
        .build();
  }
}

