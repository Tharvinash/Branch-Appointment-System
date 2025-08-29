package com.branch.appointment.backend.repository;

import com.branch.appointment.backend.entity.BlockEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BlockTimeRepository extends JpaRepository<BlockEntity, Long> {
}
