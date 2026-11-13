package com.payafrica.repository;
import com.payafrica.entity.AppSettings;
import org.springframework.data.jpa.repository.JpaRepository;
public interface AppSettingsRepository extends JpaRepository<AppSettings, Long> {}
