package com.branch.appointment.backend.service;

import com.branch.appointment.backend.dto.ServiceAdvisorDto;
import com.branch.appointment.backend.entity.ServiceAdvisorEntity;
import com.branch.appointment.backend.repository.ServiceAdvisorRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
public class ServiceAdvisorService {

  private final ServiceAdvisorRepository repository;

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
    return toDto(repository.save(entity));
  }

  public ServiceAdvisorDto update(Long id, ServiceAdvisorDto dto) {
    ServiceAdvisorEntity entity = repository.findById(id)
        .orElseThrow(() -> new RuntimeException("Service Advisor not found"));
    entity.setName(dto.getName());
    entity.setStatus(dto.getStatus());
    return toDto(repository.save(entity));
  }

  public void delete(Long id) {
    repository.deleteById(id);
  }

  private ServiceAdvisorDto toDto(ServiceAdvisorEntity entity) {
    return ServiceAdvisorDto.builder()
        .id(entity.getId())
        .name(entity.getName())
        .status(entity.getStatus())
        .build();
  }
}

