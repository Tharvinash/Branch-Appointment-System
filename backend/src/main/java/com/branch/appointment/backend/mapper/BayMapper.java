package com.branch.appointment.backend.mapper;

import com.branch.appointment.backend.dto.BayDto;
import com.branch.appointment.backend.entity.BayEntity;
import org.springframework.stereotype.Component;

@Component
public class BayMapper {

  public BayDto toDto(BayEntity entity) {
    if (entity == null) {
      return null;
    }
    return BayDto.builder()
        .id(entity.getId())
        .name(entity.getBayName())
        .number(entity.getBayNumber())
        .status(entity.getStatus())
        .build();
  }

  public BayEntity toEntity(BayDto dto) {
    if (dto == null) {
      return null;
    }
    BayEntity entity = new BayEntity();
    entity.setId(dto.getId());
    entity.setBayName(dto.getName());
    entity.setBayNumber(dto.getNumber());
    entity.setStatus(dto.getStatus());
    return entity;
  }
}

