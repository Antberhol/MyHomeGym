package com.myhomegym.domain;

import java.util.List;

import com.myhomegym.common.OwnedRepository;

public interface PerformedSetRepository extends OwnedRepository<PerformedSet> {

    List<PerformedSet> findAllByOwnerIdAndEntrenamientoId(Long ownerId, String entrenamientoId);
}
