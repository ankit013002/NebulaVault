package com.nebulavault.user_service.user;

import jakarta.persistence.*;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name="users")
public class User {

    @Id
    @GeneratedValue
    @org.hibernate.annotations.UuidGenerator
    private UUID id;

    @Column(name="auth_sub", nullable = false, unique = true)
    private String authSub;

    @Column(name = "email", nullable = false, unique = true)
    private String email;

    @Column(name="name")
    private String name;

    @Column(name="avatar_url")
    private String avatarUrl;

    @Column(name="plan", nullable = false)
    private String plan = "STARTER";

    @Column(name="quota_bytes", nullable = false)
    private long quotaBytes = 104_857_600L;

    @Column(name="used_bytes", nullable = false)
    private long usedBytes = 0L;

    @Column(name="created_at", nullable=false, updatable=false)
    private OffsetDateTime createdAt;

    @Column(name="updated_at", nullable=false)
    private OffsetDateTime updatedAt;

    @PrePersist
    public void onCreate() {
        var now = OffsetDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = OffsetDateTime.now();
    }

    public User() {
    }

    public User(String authSub, String email, String name) {
        this.authSub = authSub;
        this.email = email;
        this.name = name;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getAuthSub() {
        return authSub;
    }

    public void setAuthSub(String authSub) {
        this.authSub = authSub;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getAvatarUrl() {
        return avatarUrl;
    }

    public void setAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
    }

    public String getPlan() {
        return plan;
    }

    public void setPlan(String plan) {
        this.plan = plan;
    }

    public long getQuotaBytes() {
        return quotaBytes;
    }

    public void setQuotaBytes(long quotaBytes) {
        this.quotaBytes = quotaBytes;
    }

    public long getUsedBytes() {
        return usedBytes;
    }

    public void setUsedBytes(long usedBytes) {
        this.usedBytes = usedBytes;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(OffsetDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public OffsetDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(OffsetDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
