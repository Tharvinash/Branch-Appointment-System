package com.branch.appointment.backend.config;

import com.branch.appointment.backend.entity.ReasonEntity;
import com.branch.appointment.backend.repository.ReasonRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class ReasonSeeder implements CommandLineRunner {

  private final ReasonRepository reasonRepository;

  @Override
  public void run(String... args) {
    if (reasonRepository.count() == 0) {
      List<String> reasons = List.of(
          "Annual Leave",
          "Medical Leave",
          "Compassionate Leave",
          "Hospitalisation",
          "No Pay Hospitalisation Leave",
          "No Paid Leave",
          "Paternity Leave",
          "Training Leave",
          "Unpaid Medical Leave",
          "Umrah"
      );
      reasons.forEach(reason -> reasonRepository.save(new ReasonEntity(null, reason)));
    }
  }
}

