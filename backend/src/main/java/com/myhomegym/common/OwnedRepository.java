package com.myhomegym.common;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.NoRepositoryBean;
import org.springframework.transaction.annotation.Transactional;

@NoRepositoryBean
public interface OwnedRepository<E extends OwnedEntity> extends JpaRepository<E, String> {

    List<E> findAllByOwnerId(Long ownerId);

    Optional<E> findByIdAndOwnerId(String id, Long ownerId);

    @Transactional
    void deleteAllByOwnerId(Long ownerId);
}
