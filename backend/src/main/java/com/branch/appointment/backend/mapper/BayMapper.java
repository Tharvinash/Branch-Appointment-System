package com.branch.appointment.backend.mapper;

import com.branch.appointment.backend.dto.BayDto;
import com.branch.appointment.backend.dto.BayNameDto;
import com.branch.appointment.backend.dto.TechnicianDto;
import com.branch.appointment.backend.entity.BayEntity;
import com.branch.appointment.backend.entity.BayNameEntity;
import com.branch.appointment.backend.entity.TechnicianEntity;
import org.springframework.stereotype.Component;

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
            ? new TechnicianDto(entity.getTechnician().getId(), entity.getTechnician().getName(), entity.getTechnician().getStatus())
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

}


