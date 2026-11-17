package com.myhomegym.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

/** Ajustes de avisos: uno por usuario. */
@Entity
@Table(name = "notification_settings")
public class NotificationSettings {

    @Id
    @JsonIgnore
    private Long ownerId;

    private Boolean streakWarningEnabled = true;

    @Min(0)
    @Max(23)
    private Integer streakWarningHour = 19;

    private Boolean restTimerNotificationEnabled = true;

    public Long getOwnerId() {
        return ownerId;
    }

    public void setOwnerId(Long ownerId) {
        this.ownerId = ownerId;
    }

    public Boolean getStreakWarningEnabled() {
        return streakWarningEnabled;
    }

    public void setStreakWarningEnabled(Boolean streakWarningEnabled) {
        this.streakWarningEnabled = streakWarningEnabled;
    }

    public Integer getStreakWarningHour() {
        return streakWarningHour;
    }

    public void setStreakWarningHour(Integer streakWarningHour) {
        this.streakWarningHour = streakWarningHour;
    }

    public Boolean getRestTimerNotificationEnabled() {
        return restTimerNotificationEnabled;
    }

    public void setRestTimerNotificationEnabled(Boolean restTimerNotificationEnabled) {
        this.restTimerNotificationEnabled = restTimerNotificationEnabled;
    }
}
