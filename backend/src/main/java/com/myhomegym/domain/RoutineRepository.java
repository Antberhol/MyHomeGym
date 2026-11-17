package com.myhomegym.domain;

import java.util.List;

import com.myhomegym.common.OwnedRepository;

public interface RoutineRepository extends OwnedRepository<Routine> {

    List<Routine> findAllByOwnerIdAndFolderId(Long ownerId, String folderId);
}
