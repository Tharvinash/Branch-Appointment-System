package com.branch.appointment.backend.config;

import com.branch.appointment.backend.entity.ReasonForStoppageEntity;
import com.branch.appointment.backend.repository.ReasonForStoppageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class ReasonForStoppageSeeder implements CommandLineRunner {

  private final ReasonForStoppageRepository repository;

  @Override
  public void run(String... args) {
    if (repository.count() == 0) {
      List<String> reasons = List.of(
          "Waiting for parts",
          "Waiting for supplementary approval",
          "Waiting for adjustor for supplementary",
          "ODI",
          "Cancel Claim",
          "Total Loss"
      );
      reasons.forEach(reason -> repository.save(new ReasonForStoppageEntity(null, reason)));
    }
  }
}
