package com.branch.appointment.backend.mapper;

import com.branch.appointment.backend.dto.BayDto;
import com.branch.appointment.backend.dto.BayNameDto;
import com.branch.appointment.backend.dto.ReasonDto;
import com.branch.appointment.backend.dto.TechnicianDto;
import com.branch.appointment.backend.entity.BayEntity;
import com.branch.appointment.backend.entity.BayNameEntity;
import com.branch.appointment.backend.entity.TechnicianEntity;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class BayMapper {

  public BayDto toDto(BayEntity entity) {
    if (entity == null) {
      return null;
    }
    return BayDto.builder()
        .id(entity.getId())
        .name(entity.getBayName() != null
            ? new BayNameDto(entity.getBayName().getId(), entity.getBayName().getBayName())
            : null)
        .number(entity.getBayNumber())
        .status(entity.getStatus())
        .technician(entity.getTechnician() != null
            ? mapTechnicianToDto(entity.getTechnician())
            : null)
        .build();
  }


  public BayEntity toEntity(BayDto dto, BayNameEntity bayName, TechnicianEntity technician) {
    BayEntity entity = new BayEntity();
    entity.setId(dto.getId());
    entity.setBayName(bayName);
    entity.setBayNumber(dto.getNumber());
    entity.setStatus(dto.getStatus());
    entity.setTechnician(technician);
    return entity;
  }

  private TechnicianDto mapTechnicianToDto(TechnicianEntity entity) {
    if (entity == null) {
      return null;
    }
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


